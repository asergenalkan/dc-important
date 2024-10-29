import express from 'express';
import { z } from 'zod';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import Message from '../models/Message';
import Channel from '../models/Channel';
import Server from '../models/Server';

const router = express.Router();

const MessageSchema = z.object({
  content: z.string().min(1),
  channelId: z.string(),
  attachments: z.array(z.string().url()).optional(),
});

// Get messages for a channel
router.get('/channel/:channelId', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.channelId);
    
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    const server = await Server.findById(channel.serverId);
    
    if (!server?.members.includes(req.auth.userId)) {
      return res.status(403).json({ error: 'Not a member of this server' });
    }

    const messages = await Message.find({ channelId: req.params.channelId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Create a new message
router.post('/', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const data = MessageSchema.parse(req.body);
    
    const channel = await Channel.findById(data.channelId);
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    const server = await Server.findById(channel.serverId);
    if (!server?.members.includes(req.auth.userId)) {
      return res.status(403).json({ error: 'Not a member of this server' });
    }

    const message = await Message.create({
      ...data,
      userId: req.auth.userId,
    });

    // Emit socket event for real-time updates
    req.app.get('io').to(data.channelId).emit('new_message', message);

    res.status(201).json(message);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create message' });
    }
  }
});

// Delete a message
router.delete('/:id', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.userId !== req.auth.userId) {
      return res.status(403).json({ error: 'Can only delete your own messages' });
    }

    await message.deleteOne();
    
    // Emit socket event for real-time updates
    req.app.get('io').to(message.channelId).emit('message_deleted', message._id);

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

export default router;