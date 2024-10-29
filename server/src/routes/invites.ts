import express from 'express';
import { z } from 'zod';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import { nanoid } from 'nanoid';
import Invite from '../models/Invite';
import Server from '../models/Server';
import { checkPermissions } from '../middleware/permissions';

const router = express.Router();

const CreateInviteSchema = z.object({
  serverId: z.string(),
  maxUses: z.number().min(1).optional(),
  expiresIn: z.number().min(300).optional(), // minimum 5 minutes in seconds
});

// Create invite
router.post('/', ClerkExpressRequireAuth(), checkPermissions(['CREATE_INVITE']), async (req, res) => {
  try {
    const data = CreateInviteSchema.parse(req.body);
    
    const server = await Server.findById(data.serverId);
    if (!server) {
      return res.status(404).json({ error: 'Server not found' });
    }

    const code = nanoid(10);
    const invite = await Invite.create({
      code,
      serverId: data.serverId,
      creatorId: req.auth.userId,
      maxUses: data.maxUses,
      expiresAt: data.expiresIn ? new Date(Date.now() + data.expiresIn * 1000) : undefined,
    });

    res.status(201).json(invite);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error('Failed to create invite:', error);
      res.status(500).json({ error: 'Failed to create invite' });
    }
  }
});

// Get server invites
router.get('/server/:serverId', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const server = await Server.findById(req.params.serverId);
    if (!server?.members.includes(req.auth.userId)) {
      return res.status(403).json({ error: 'Not a member of this server' });
    }

    const invites = await Invite.find({ serverId: req.params.serverId })
      .sort('-createdAt');
    
    res.json(invites);
  } catch (error) {
    console.error('Failed to fetch invites:', error);
    res.status(500).json({ error: 'Failed to fetch invites' });
  }
});

// Join server with invite
router.post('/:code/join', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const invite = await Invite.findOne({ code: req.params.code });
    
    if (!invite) {
      return res.status(404).json({ error: 'Invalid invite code' });
    }

    if (invite.expiresAt && invite.expiresAt < new Date()) {
      return res.status(410).json({ error: 'Invite has expired' });
    }

    if (invite.maxUses && invite.uses >= invite.maxUses) {
      return res.status(410).json({ error: 'Invite has reached maximum uses' });
    }

    const server = await Server.findById(invite.serverId);
    if (!server) {
      return res.status(404).json({ error: 'Server not found' });
    }

    if (server.members.includes(req.auth.userId)) {
      return res.status(400).json({ error: 'Already a member of this server' });
    }

    // Add member to server
    server.members.push(req.auth.userId);
    await server.save();

    // Increment invite uses
    invite.uses += 1;
    await invite.save();

    const populatedServer = await Server.findById(server._id).populate('channels');
    res.json(populatedServer);
  } catch (error) {
    console.error('Failed to join server:', error);
    res.status(500).json({ error: 'Failed to join server' });
  }
});

// Delete invite
router.delete('/:inviteId', ClerkExpressRequireAuth(), checkPermissions(['CREATE_INVITE']), async (req, res) => {
  try {
    const invite = await Invite.findById(req.params.inviteId);
    if (!invite) {
      return res.status(404).json({ error: 'Invite not found' });
    }

    await invite.deleteOne();
    res.json({ message: 'Invite deleted successfully' });
  } catch (error) {
    console.error('Failed to delete invite:', error);
    res.status(500).json({ error: 'Failed to delete invite' });
  }
});

export default router;