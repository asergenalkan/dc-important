import express from 'express';
import { z } from 'zod';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import DirectMessage from '../models/DirectMessage';

const router = express.Router();

const MessageSchema = z.object({
  content: z.string().min(1),
  receiverId: z.string(),
  attachments: z.array(z.string().url()).optional(),
});

// Get conversation between two users
router.get('/conversation/:userId', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const messages = await DirectMessage.find({
      $or: [
        { senderId: req.auth.userId, receiverId: req.params.userId },
        { senderId: req.params.userId, receiverId: req.auth.userId }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(50);

    res.json(messages);
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a direct message
router.post('/', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const data = MessageSchema.parse(req.body);
    
    const message = await DirectMessage.create({
      ...data,
      senderId: req.auth.userId,
    });

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    const roomId = [req.auth.userId, data.receiverId].sort().join('-');
    io.to(roomId).emit('new_direct_message', message);

    res.status(201).json(message);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error('Failed to send message:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  }
});

// Mark messages as read
router.patch('/read/:userId', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    await DirectMessage.updateMany(
      {
        senderId: req.params.userId,
        receiverId: req.auth.userId,
        read: false
      },
      { read: true }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Failed to mark messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

export default router;