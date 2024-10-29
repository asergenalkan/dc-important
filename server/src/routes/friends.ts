import express from 'express';
import { z } from 'zod';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import Friend from '../models/Friend';
import User from '../models/User';

const router = express.Router();

// Get friend list
router.get('/', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const friends = await Friend.find({
      $or: [
        { userId: req.auth.userId, status: 'accepted' },
        { friendId: req.auth.userId, status: 'accepted' }
      ]
    });

    const friendIds = friends.map(f => 
      f.userId === req.auth.userId ? f.friendId : f.userId
    );

    const users = await User.find({ clerkId: { $in: friendIds } });
    res.json(users);
  } catch (error) {
    console.error('Failed to fetch friends:', error);
    res.status(500).json({ error: 'Failed to fetch friends' });
  }
});

// Send friend request
router.post('/request', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const { friendId } = z.object({
      friendId: z.string()
    }).parse(req.body);

    // Check if friend exists
    const friend = await User.findOne({ clerkId: friendId });
    if (!friend) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if request already exists
    const existingRequest = await Friend.findOne({
      $or: [
        { userId: req.auth.userId, friendId },
        { userId: friendId, friendId: req.auth.userId }
      ]
    });

    if (existingRequest) {
      return res.status(400).json({ error: 'Friend request already exists' });
    }

    const friendRequest = await Friend.create({
      userId: req.auth.userId,
      friendId,
      status: 'pending'
    });

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    io.to(`user:${friendId}`).emit('friend_request', {
      userId: req.auth.userId
    });

    res.status(201).json(friendRequest);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error('Failed to send friend request:', error);
      res.status(500).json({ error: 'Failed to send friend request' });
    }
  }
});

// Accept/reject friend request
router.patch('/request/:userId', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const { action } = z.object({
      action: z.enum(['accept', 'reject'])
    }).parse(req.body);

    const request = await Friend.findOne({
      userId: req.params.userId,
      friendId: req.auth.userId,
      status: 'pending'
    });

    if (!request) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    if (action === 'accept') {
      request.status = 'accepted';
      await request.save();

      // Emit socket event
      const io = req.app.get('io');
      io.to(`user:${req.params.userId}`).emit('friend_request_accepted', {
        userId: req.auth.userId
      });
    } else {
      await request.deleteOne();
    }

    res.json({ message: `Friend request ${action}ed` });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error('Failed to handle friend request:', error);
      res.status(500).json({ error: 'Failed to handle friend request' });
    }
  }
});

// Remove friend
router.delete('/:userId', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    await Friend.deleteOne({
      $or: [
        { userId: req.auth.userId, friendId: req.params.userId },
        { userId: req.params.userId, friendId: req.auth.userId }
      ],
      status: 'accepted'
    });

    res.json({ message: 'Friend removed' });
  } catch (error) {
    console.error('Failed to remove friend:', error);
    res.status(500).json({ error: 'Failed to remove friend' });
  }
});

export default router;