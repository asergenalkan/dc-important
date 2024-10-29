import express from 'express';
import { z } from 'zod';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import UserModel from '../models/User';

const router = express.Router();

const UserUpdateSchema = z.object({
  status: z.enum(['online', 'idle', 'dnd', 'offline']).optional(),
  customStatus: z.string().max(128).optional(),
  gameActivity: z.object({
    name: z.string(),
    details: z.string().optional(),
    startedAt: z.date()
  }).optional().nullable(),
});

// Get user's online status
router.get('/:userId/status', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const user = await UserModel.findOne(
      { clerkId: req.params.userId },
      'status customStatus gameActivity lastSeen'
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      status: user.status,
      customStatus: user.customStatus,
      gameActivity: user.gameActivity,
      lastSeen: user.lastSeen
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user status' });
  }
});

// Update user status
router.patch('/status', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const data = UserUpdateSchema.parse(req.body);
    const user = await UserModel.findOneAndUpdate(
      { clerkId: req.auth.userId },
      { $set: data },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    io.emit('user_status_update', {
      userId: user.clerkId,
      status: user.status,
      customStatus: user.customStatus,
      gameActivity: user.gameActivity
    });

    res.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to update status' });
    }
  }
});

export default router;