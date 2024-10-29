import express from 'express';
import { z } from 'zod';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import UserVoiceSettings from '../models/UserVoiceSettings';
import Server from '../models/Server';

const router = express.Router();

const VoiceSettingsSchema = z.object({
  targetUserId: z.string(),
  serverId: z.string(),
  volume: z.number().min(0).max(200),
});

// Get voice settings for all users in a server
router.get('/server/:serverId', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const server = await Server.findById(req.params.serverId);
    if (!server?.members.includes(req.auth.userId)) {
      return res.status(403).json({ error: 'Not a member of this server' });
    }

    const settings = await UserVoiceSettings.find({
      userId: req.auth.userId,
      serverId: req.params.serverId,
    });

    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch voice settings' });
  }
});

// Update or create voice settings for a user
router.put('/', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const data = VoiceSettingsSchema.parse(req.body);
    
    const server = await Server.findById(data.serverId);
    if (!server?.members.includes(req.auth.userId)) {
      return res.status(403).json({ error: 'Not a member of this server' });
    }

    const settings = await UserVoiceSettings.findOneAndUpdate(
      {
        userId: req.auth.userId,
        targetUserId: data.targetUserId,
        serverId: data.serverId,
      },
      { volume: data.volume },
      { upsert: true, new: true }
    );

    res.json(settings);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to update voice settings' });
    }
  }
});

export default router;