import express from 'express';
import { z } from 'zod';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import MessageModel from '../models/Message';
import ChannelModel from '../models/Channel';
import ServerModel from '../models/Server';
import LastReadMessageModel from '../models/LastReadMessage';

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

    // Get messages sorted by creation date (ascending)
    const messages = await MessageModel.find({ channelId: req.params.channelId })
      .sort({ createdAt: 1 })
      .limit(50);

    // Get last read message
    const lastRead = await LastReadMessageModel.findOne({
      userId: req.auth.userId,
      channelId: channel._id
    });

    // Return both messages and last read info
    res.json({
      messages: messages || [],
      lastReadMessageId: lastRead?.messageId || null
    });
  } catch (error) {
    console.error('Failed to fetch messages:', error);
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

    const message = await MessageModel.create({
      ...data,
      userId: req.auth.userId,
    });

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    io.to(data.channelId).emit('new_message', message);

    res.status(201).json(message);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error('Failed to create message:', error);
      res.status(500).json({ error: 'Failed to create message' });
    }
  }
});

// Mark messages as read
router.post('/read/:channelId', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const { messageId } = req.body;

    await LastReadMessageModel.findOneAndUpdate(
      {
        userId: req.auth.userId,
        channelId: req.params.channelId
      },
      {
        messageId,
        lastReadAt: new Date()
      },
      { upsert: true }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to mark messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

export default router;