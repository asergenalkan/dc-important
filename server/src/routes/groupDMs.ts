import express from 'express';
import { z } from 'zod';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import GroupDM from '../models/GroupDM';
import DirectMessage from '../models/DirectMessage';
import User from '../models/User';

const router = express.Router();

const GroupDMSchema = z.object({
  name: z.string().max(100).optional(),
  icon: z.string().url().optional(),
  participants: z.array(z.string()).min(3)
});

// Create group DM
router.post('/', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const data = GroupDMSchema.parse(req.body);
    
    // Check if all participants exist
    const users = await User.find({ clerkId: { $in: data.participants } });
    if (users.length !== data.participants.length) {
      return res.status(400).json({ error: 'One or more users not found' });
    }

    const groupDM = await GroupDM.create({
      ...data,
      participants: [...new Set([...data.participants, req.auth.userId])],
      createdBy: req.auth.userId
    });

    // Emit socket event to all participants
    const io = req.app.get('io');
    groupDM.participants.forEach(userId => {
      io.to(`user:${userId}`).emit('group_dm_created', groupDM);
    });

    res.status(201).json(groupDM);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error('Failed to create group DM:', error);
      res.status(500).json({ error: 'Failed to create group DM' });
    }
  }
});

// Get user's group DMs
router.get('/', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const groupDMs = await GroupDM.find({
      participants: req.auth.userId
    }).sort('-updatedAt');

    res.json(groupDMs);
  } catch (error) {
    console.error('Failed to fetch group DMs:', error);
    res.status(500).json({ error: 'Failed to fetch group DMs' });
  }
});

// Add participant to group DM
router.post('/:groupId/participants', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const { userId } = z.object({
      userId: z.string()
    }).parse(req.body);

    const groupDM = await GroupDM.findById(req.params.groupId);
    if (!groupDM) {
      return res.status(404).json({ error: 'Group DM not found' });
    }

    if (!groupDM.participants.includes(req.auth.userId)) {
      return res.status(403).json({ error: 'Not a member of this group' });
    }

    if (groupDM.participants.includes(userId)) {
      return res.status(400).json({ error: 'User is already a member' });
    }

    groupDM.participants.push(userId);
    await groupDM.save();

    // Emit socket event
    const io = req.app.get('io');
    groupDM.participants.forEach(participantId => {
      io.to(`user:${participantId}`).emit('group_dm_updated', groupDM);
    });

    res.json(groupDM);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error('Failed to add participant:', error);
      res.status(500).json({ error: 'Failed to add participant' });
    }
  }
});

// Leave group DM
router.delete('/:groupId/leave', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const groupDM = await GroupDM.findById(req.params.groupId);
    if (!groupDM) {
      return res.status(404).json({ error: 'Group DM not found' });
    }

    if (!groupDM.participants.includes(req.auth.userId)) {
      return res.status(403).json({ error: 'Not a member of this group' });
    }

    // Remove user from participants
    groupDM.participants = groupDM.participants.filter(id => id !== req.auth.userId);

    // If less than 3 participants remain, delete the group
    if (groupDM.participants.length < 3) {
      await groupDM.deleteOne();
      
      // Emit deletion event
      const io = req.app.get('io');
      [...groupDM.participants, req.auth.userId].forEach(userId => {
        io.to(`user:${userId}`).emit('group_dm_deleted', groupDM._id);
      });

      return res.json({ message: 'Group DM deleted' });
    }

    await groupDM.save();

    // Emit update event
    const io = req.app.get('io');
    groupDM.participants.forEach(userId => {
      io.to(`user:${userId}`).emit('group_dm_updated', groupDM);
    });

    res.json({ message: 'Left group DM' });
  } catch (error) {
    console.error('Failed to leave group DM:', error);
    res.status(500).json({ error: 'Failed to leave group DM' });
  }
});

export default router;