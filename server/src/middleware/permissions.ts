import { Request, Response, NextFunction } from 'express';
import Role from '../models/Role';
import ServerMember from '../models/ServerMember';

// Request tipini genişlet
declare global {
  namespace Express {
    interface Request {
      memberPermissions?: string[];
    }
  }
}

export const checkPermissions = (requiredPermissions: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const serverId = req.body.serverId || req.params.serverId;
      if (!serverId) {
        return res.status(400).json({ error: 'Server ID is required' });
      }

      const member = await ServerMember.findOne({
        userId: req.auth?.userId,
        serverId,
      }).populate('roles');

      if (!member) {
        return res.status(403).json({ error: 'Not a member of this server' });
      }

      // Check if member has administrator permission
      const hasAdmin = member.roles.some((role: any) =>
        role.permissions.includes('ADMINISTRATOR')
      );

      if (hasAdmin) {
        return next();
      }

      // Check if member has all required permissions
      const hasPermissions = requiredPermissions.every((permission) =>
        member.roles.some((role: any) => role.permissions.includes(permission))
      );

      if (!hasPermissions) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      // Add member's permissions to request for later use
      req.memberPermissions = member.roles.reduce(
        (acc: string[], role: any) => {
          return [...acc, ...role.permissions];
        },
        []
      );

      next();
    } catch (error) {
      console.error('Permission check failed:', error);
      res.status(500).json({ error: 'Failed to check permissions' });
    }
  };
};
