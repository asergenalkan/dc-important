import mongoose from 'mongoose';
import AuditLogModel from '../models/AuditLog';
import type { IAuditLog } from '../models/AuditLog';

export const logScreenShareAction = async (
  serverId: string,
  channelId: string,
  userId: string,
  action: 'START' | 'STOP' | 'QUALITY_CHANGE',
  details: Record<string, any> = {}
): Promise<void> => {
  try {
    await AuditLogModel.create({
      serverId: new mongoose.Types.ObjectId(serverId),
      channelId: new mongoose.Types.ObjectId(channelId),
      userId,
      action: `SCREEN_SHARE_${action}`,
      details,
    } as IAuditLog);
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};

export default {
  logScreenShareAction,
};