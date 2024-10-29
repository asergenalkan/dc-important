import express from 'express';
import { z } from 'zod';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import Role from '../models/Role';
import Server from '../models/Server';
import ServerMember from '../models/ServerMember';
import { checkPermissions } from '../middleware/permissions';
import { Types } from 'mongoose';

const router = express.Router();

const RoleSchema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9A-F]{6}$/i),
  permissions: z.array(z.string()),
});

// Get roles for a server
router.get('/server/:serverId', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const server = await Server.findById(req.params.serverId);
    if (!server?.members.includes(req.auth.userId)) {
      return res.status(403).json({ error: 'Not a member of this server' });
    }

    const roles = await Role.find({ serverId: req.params.serverId }).sort(
      'position'
    );
    res.json(roles);
  } catch (error) {
    console.error('Failed to fetch roles:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// Create a new role
router.post(
  '/',
  ClerkExpressRequireAuth(),
  checkPermissions(['MANAGE_ROLES']),
  async (req, res) => {
    try {
      const { serverId, ...roleData } = req.body;
      const data = RoleSchema.parse(roleData);

      const server = await Server.findById(serverId);
      if (!server) {
        return res.status(404).json({ error: 'Server not found' });
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
        console.error('Failed to create role:', error);
        res.status(500).json({ error: 'Failed to create role' });
      }
    }
  }
);

// Update role
router.patch(
  '/:roleId',
  ClerkExpressRequireAuth(),
  checkPermissions(['MANAGE_ROLES']),
  async (req, res) => {
    try {
      const role = await Role.findById(req.params.roleId);
      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }

      const data = RoleSchema.partial().parse(req.body);
      const updatedRole = await Role.findByIdAndUpdate(
        req.params.roleId,
        { $set: data },
        { new: true }
      );

      res.json(updatedRole);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        console.error('Failed to update role:', error);
        res.status(500).json({ error: 'Failed to update role' });
      }
    }
  }
);

// Delete role
router.delete(
  '/:roleId',
  ClerkExpressRequireAuth(),
  checkPermissions(['MANAGE_ROLES']),
  async (req, res) => {
    try {
      const role = await Role.findById(req.params.roleId);
      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }

      // Remove role from all members
      await ServerMember.updateMany(
        { serverId: role.serverId },
        { $pull: { roles: role._id } }
      );

      await role.deleteOne();
      res.json({ message: 'Role deleted successfully' });
    } catch (error) {
      console.error('Failed to delete role:', error);
      res.status(500).json({ error: 'Failed to delete role' });
    }
  }
);

// Assign role to member
router.post(
  '/assign',
  ClerkExpressRequireAuth(),
  checkPermissions(['MANAGE_ROLES']),
  async (req, res) => {
    try {
      const { roleId, userId, serverId } = req.body;

      const member = await ServerMember.findOne({ userId, serverId });
      if (!member) {
        return res.status(404).json({ error: 'Member not found' });
      }

      const role = await Role.findById(roleId);
      if (!role || role.serverId.toString() !== serverId) {
        return res.status(404).json({ error: 'Role not found' });
      }

      if (
        !member.roles.includes(role._id as Types.ObjectId) &&
        role._id instanceof Types.ObjectId
      ) {
        member.roles.push(role._id as Types.ObjectId);
        await member.save();
      }

      res.json(member);
    } catch (error) {
      console.error('Failed to assign role:', error);
      res.status(500).json({ error: 'Failed to assign role' });
    }
  }
);

// Remove role from member
router.post(
  '/remove',
  ClerkExpressRequireAuth(),
  checkPermissions(['MANAGE_ROLES']),
  async (req, res) => {
    try {
      const { roleId, userId, serverId } = req.body;

      const member = await ServerMember.findOne({ userId, serverId });
      if (!member) {
        return res.status(404).json({ error: 'Member not found' });
      }

      member.roles = member.roles.filter((id) => id.toString() !== roleId);
      await member.save();

      res.json(member);
    } catch (error) {
      console.error('Failed to remove role:', error);
      res.status(500).json({ error: 'Failed to remove role' });
    }
  }
);

export default router;
