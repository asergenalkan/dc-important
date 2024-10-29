import express from 'express';
import { z } from 'zod';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import Role from '../models/Role';
import Server from '../models/Server';

const router = express.Router();

const RoleSchema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9A-F]{6}$/i),
  permissions: z.array(z.string()),
});

// Create a new role
router.post('/', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const { serverId, ...roleData } = req.body;
    const data = RoleSchema.parse(roleData);

    const server = await Server.findById(serverId);
    if (!server) {
      return res.status(404).json({ error: 'Server not found' });
    }

    if (server.ownerId !== req.auth.userId) {
      return res.status(403).json({ error: 'Only server owner can create roles' });
    }

    // Get highest position for new role
    const highestRole = await Role.findOne({ serverId })
      .sort('-position')
      .select('position');
    const position = (highestRole?.position || 0) + 1;

    const role = await Role.create({
      ...data,
      serverId,
      position,
    });

    res.status(201).json(role);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create role' });
    }
  }
});

// Get roles for a server
router.get('/server/:serverId', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const server = await Server.findById(req.params.serverId);
    if (!server?.members.includes(req.auth.userId)) {
      return res.status(403).json({ error: 'Not a member of this server' });
    }

    const roles = await Role.find({ serverId: req.params.serverId })
      .sort('position');
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// Update role
router.patch('/:id', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    const server = await Server.findById(role.serverId);
    if (server?.ownerId !== req.auth.userId) {
      return res.status(403).json({ error: 'Only server owner can update roles' });
    }

    const data = RoleSchema.partial().parse(req.body);
    const updatedRole = await Role.findByIdAndUpdate(
      req.params.id,
      { $set: data },
      { new: true }
    );

    res.json(updatedRole);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to update role' });
    }
  }
});

// Delete role
router.delete('/:id', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    const server = await Server.findById(role.serverId);
    if (server?.ownerId !== req.auth.userId) {
      return res.status(403).json({ error: 'Only server owner can delete roles' });
    }

    await role.deleteOne();
    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete role' });
  }
});

export default router;