import express from 'express';
import { z } from 'zod';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import ServerModel from '../models/Server';

const router = express.Router();

const ServerSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1024).optional(),
  icon: z.string().url().optional(),
  banner: z.string().url().optional(),
  welcomeMessage: z.string().max(2000).optional(),
  isPublic: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  theme: z.object({
    primaryColor: z.string(),
    accentColor: z.string()
  }).optional()
});

const EmojiSchema = z.object({
  name: z.string().min(1).max(32),
  url: z.string().url()
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
    console.error('Failed to fetch servers:', error);
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
      features: {
        customEmojis: true,
        welcomeMessage: true,
        banners: true
      }
    });

    res.status(201).json(server);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error('Failed to create server:', error);
      res.status(500).json({ error: 'Failed to create server' });
    }
  }
});

// Add custom emoji
router.post('/:serverId/emojis', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const { name, url } = EmojiSchema.parse(req.body);
    
    const server = await ServerModel.findById(req.params.serverId);
    if (!server) {
      return res.status(404).json({ error: 'Server not found' });
    }

    if (server.ownerId !== req.auth.userId) {
      return res.status(403).json({ error: 'Only server owner can add emojis' });
    }

    const emoji = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      url,
      createdBy: req.auth.userId
    };

    server.customEmojis = server.customEmojis || [];
    server.customEmojis.push(emoji);
    await server.save();

    res.json(emoji);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error('Failed to add emoji:', error);
      res.status(500).json({ error: 'Failed to add emoji' });
    }
  }
});

// Update server settings
router.patch('/:serverId/settings', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const data = ServerSchema.partial().parse(req.body);
    
    const server = await ServerModel.findById(req.params.serverId);
    if (!server) {
      return res.status(404).json({ error: 'Server not found' });
    }

    if (server.ownerId !== req.auth.userId) {
      return res.status(403).json({ error: 'Only server owner can update settings' });
    }

    Object.assign(server, data);
    await server.save();

    res.json(server);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error('Failed to update settings:', error);
      res.status(500).json({ error: 'Failed to update settings' });
    }
  }
});

export default router;