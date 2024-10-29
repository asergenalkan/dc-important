import express, { Request, Response } from 'express';
import { z } from 'zod';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import mongoose from 'mongoose';
import Channel from '../models/Channel';
import Server from '../models/Server';

const router = express.Router();

const ChannelSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['text', 'voice']),
  serverId: z.string(),
  categoryId: z.string().optional(),
});

// Get channels for a server
router.get('/server/:serverId', ClerkExpressRequireAuth(), async (req: Request, res: Response) => {
  try {
    const server = await Server.findById(req.params.serverId);
    
    if (!server) {
      return res.status(404).json({ error: 'Server not found' });
    }

    if (!server.members.includes(req.auth?.userId)) {
      return res.status(403).json({ error: 'Not a member of this server' });
    }

    const channels = await Channel.find({ serverId: req.params.serverId });
    res.json(channels);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch channels' });
  }
});

// Create a new channel
router.post('/', ClerkExpressRequireAuth(), async (req: Request, res: Response) => {
  try {
    const data = ChannelSchema.parse(req.body);
    const server = await Server.findById(data.serverId);
    
    if (!server) {
      return res.status(404).json({ error: 'Server not found' });
    }

    if (server.ownerId !== req.auth?.userId) {
      return res.status(403).json({ error: 'Only server owner can create channels' });
    }

    const channel = await Channel.create(data);
    
    // Add channel to server's channels array
    await Server.findByIdAndUpdate(data.serverId, {
      $push: { channels: channel._id }
    });

    res.status(201).json(channel);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create channel' });
    }
  }
});

export default router;