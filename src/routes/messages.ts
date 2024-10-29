import express from 'express';
import { z } from 'zod';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import ChannelModel from '../models/Channel';
import ServerModel from '../models/Server';
import UserModel from '../models/User';
import MessageModel from '../models/Message';

const router = express.Router();

const MessageSchema = z.object({
  content: z.string().min(1),
  channelId: z.string(),
  attachments: z.array(z.string().url()).optional(),
});

// Get messages for a channel
router.get('/channel/:channelId', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const channel = await ChannelModel.findById(req.params.channelId);
    
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    const server = await ServerModel.findById(channel.serverId);
    
    if (!server?.members.includes(req.auth.userId)) {
      return res.status(403).json({ error: 'Not a member of this server' });
    }

    const messages = await MessageModel.find({ channelId: req.params.channelId })
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
    
    const channel = await ChannelModel.findById(data.channelId);
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    const server = await ServerModel.findById(channel.serverId);
    if (!server?.members.includes(req.auth.userId)) {
      return res.status(403).json({ error: 'Not a member of this server' });
    }

    // Extract mentions from content
    const mentionRegex = /@(\w+)/g;
    const mentions = [...new Set(data.content.match(mentionRegex) || [])] as string[];
    const mentionedUsers = await UserModel.find({
      username: { $in: mentions.map(m => m.substring(1)) }
    });

    const message = await MessageModel.create({
      ...data,
      userId: req.auth.userId,
      mentions: mentionedUsers.map(u => u.id)
    });

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    io.to(data.channelId).emit('new_message', message);

    // Send notifications to mentioned users
    mentionedUsers.forEach(user => {
      io.to(user.id).emit('mention', {
        messageId: message._id,
        channelId: channel._id,
        serverId: server._id,
        mentionedBy: req.auth.userId,
      });
    });

    res.status(201).json(message);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create message' });
    }
  }
});

export default router;