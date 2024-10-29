import express, { Request, Response } from 'express';
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
router.get('/channel/:channelId', ClerkExpressRequireAuth(), async (req: Request, res: Response) => {
  try {
    const channel = await Channel.findById(req.params.channelId);
    
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    const server = await Server.findById(channel.serverId);
    
    if (!server?.members.includes(req.auth?.userId)) {
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
router.post('/', ClerkExpressRequireAuth(), async (req: Request, res: Response) => {
  try {
    const data = MessageSchema.parse(req.body);
    
    const channel = await Channel.findById(data.channelId);
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    const server = await Server.findById(channel.serverId);
    if (!server?.members.includes(req.auth?.userId)) {
      return res.status(403).json({ error: 'Not a member of this server' });
    }

    const message = await Message.create({
      ...data,
      userId: req.auth?.userId,
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