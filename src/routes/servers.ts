import express from 'express';
import { z } from 'zod';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import ServerModel from '../models/Server';

const router = express.Router();

const ServerSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  icon: z.string().url().optional(),
});

// Get all servers for the authenticated user
router.get('/', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const servers = await ServerModel.find({ 
      $or: [
        { ownerId: req.auth.userId },
        { members: req.auth.userId }
      ]
    });
    res.json(servers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch servers' });
  }
});

// Create a new server
router.post('/', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const data = ServerSchema.parse(req.body);
    const server = await ServerModel.create({
      ...data,
      ownerId: req.auth.userId,
      members: [req.auth.userId],
    });
    res.status(201).json(server);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create server' });
    }
  }
});

export default router;