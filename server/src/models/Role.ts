import mongoose, { Schema, Document } from 'mongoose';

export interface IRole extends Document {
  name: string;
  color: string;
  permissions: string[];
  serverId: mongoose.Types.ObjectId;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema({
  name: { type: String, required: true },
  color: { type: String, default: '#99AAB5' },
  permissions: [{
    type: String,
    enum: [
      'ADMINISTRATOR',
      'MANAGE_SERVER',
      'MANAGE_ROLES',
      'MANAGE_CHANNELS',
      'KICK_MEMBERS',
      'BAN_MEMBERS',
      'CREATE_INVITE',
      'MANAGE_MESSAGES',
      'MENTION_EVERYONE',
      'MUTE_MEMBERS',
      'DEAFEN_MEMBERS',
      'MOVE_MEMBERS',
      'VIEW_AUDIT_LOG',
      'SHARE_SCREEN',           // New permission
      'MANAGE_SCREEN_SHARE'     // New permission
    ]
  }],
  serverId: { type: Schema.Types.ObjectId, ref: 'Server', required: true },
  position: { type: Number, default: 0 },
}, { timestamps: true });

// Ensure roles have unique positions within a server
RoleSchema.index({ serverId: 1, position: 1 }, { unique: true });

export default mongoose.model<IRole>('Role', RoleSchema);