
import express from 'express';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import Activity from '../models/Activity';
import Friend from '../models/Friend';
import Server from '../models/Server';

const router = express.Router();

// Get activity feed for the authenticated user
router.get('/feed', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    // Get user's friends
    const friends = await Friend.find({
      $or: [
        { userId: req.auth.userId, status: 'accepted' },
        { friendId: req.auth.userId, status: 'accepted' }
      ]
    });

    const friendIds = friends.map(f => 
      f.userId === req.auth.userId ? f.friendId : f.userId
    );

    // Get user's servers
    const servers = await Server.find({
      $or: [
        { ownerId: req.auth.userId },
        { members: req.auth.userId }
      ]
    });

    const serverIds = servers.map(s => s._id);

    // Get activities from friends and shared servers
    const activities = await Activity.find({
      $or: [
        { userId: { $in: [...friendIds, req.auth.userId] } },
        { 'data.serverId': { $in: serverIds } }
      ]
    })
    .sort('-createdAt')
    .limit(50)
    .populate('data.serverId')
    .populate('data.channelId');

    res.json(activities);
  } catch (error) {
    console.error('Failed to fetch activity feed:', error);
    res.status(500).json({ error: 'Failed to fetch activity feed' });
  }
});

// Get user's activity history
router.get('/history/:userId', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const activities = await Activity.find({
      userId: req.params.userId,
      type: { $in: ['message', 'voice', 'game'] }
    })
    .sort('-createdAt')
    .limit(20);

    res.json(activities);
  } catch (error) {
    console.error('Failed to fetch activity history:', error);
    res.status(500).json({ error: 'Failed to fetch activity history' });
  }
});

export default router;
