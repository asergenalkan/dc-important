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

// Get direct messages between two users
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
    const roomId = [req.auth.userId, data.receiverId].sort().join('-');
    req.app.get('io').to(roomId).emit('new_direct_message', message);

    res.status(201).json(message);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to send message' });
    }
  }
});

// Delete a direct message
router.delete('/:id', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const message = await DirectMessage.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.senderId !== req.auth.userId) {
      return res.status(403).json({ error: 'Can only delete your own messages' });
    }

    await message.deleteOne();
    
    // Emit socket event for real-time updates
    const roomId = [message.senderId, message.receiverId].sort().join('-');
    req.app.get('io').to(roomId).emit('direct_message_deleted', message._id);

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

export default router;