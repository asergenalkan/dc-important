import mongoose, { Schema, Document } from 'mongoose';

export interface IUserVoiceSettings extends Document {
  userId: string;
  targetUserId: string;
  serverId: mongoose.Types.ObjectId;
  volume: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserVoiceSettingsSchema = new Schema({
  userId: { type: String, required: true },
  targetUserId: { type: String, required: true },
  serverId: { type: Schema.Types.ObjectId, ref: 'Server', required: true },
  volume: { type: Number, required: true, min: 0, max: 200, default: 100 },
}, { timestamps: true });

// Compound index to ensure unique settings per user combination
UserVoiceSettingsSchema.index({ userId: 1, targetUserId: 1, serverId: 1 }, { unique: true });

export default mongoose.model<IUserVoiceSettings>('UserVoiceSettings', UserVoiceSettingsSchema);