import express from 'express';
import { z } from 'zod';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import Server from '../models/Server';

const router = express.Router();

// Input validation schema
const ServerSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  icon: z.string().url().optional(),
});

// Get all servers for the authenticated user
router.get('/', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const servers = await Server.find({ 
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
    const server = await Server.create({
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

// Get server by ID with channels
router.get('/:id', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const server = await Server.findById(req.params.id)
      .populate('channels');
    
    if (!server) {
      return res.status(404).json({ error: 'Server not found' });
    }

    if (!server.members.includes(req.auth.userId)) {
      return res.status(403).json({ error: 'Not a member of this server' });
    }

    res.json(server);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch server' });
  }
});

// Update server
router.patch('/:id', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const server = await Server.findById(req.params.id);
    
    if (!server) {
      return res.status(404).json({ error: 'Server not found' });
    }

    if (server.ownerId !== req.auth.userId) {
      return res.status(403).json({ error: 'Only server owner can update server' });
    }

    const data = ServerSchema.partial().parse(req.body);
    const updatedServer = await Server.findByIdAndUpdate(
      req.params.id,
      { $set: data },
      { new: true }
    );

    res.json(updatedServer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to update server' });
    }
  }
});

export default router;