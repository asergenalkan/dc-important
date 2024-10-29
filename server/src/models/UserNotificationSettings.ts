import mongoose, { Schema, Document } from 'mongoose';

export interface IUserNotificationSettings extends Document {
  userId: string;
  serverSettings: {
    serverId: mongoose.Types.ObjectId;
    muted: boolean;
    suppressEveryone: boolean;
    suppressRoles: boolean;
    channelOverrides: {
      channelId: mongoose.Types.ObjectId;
      muted: boolean;
    }[];
  }[];
  globalSettings: {
    desktopNotifications: boolean;
    soundEnabled: boolean;
    mentionSoundEnabled: boolean;
    pushNotifications: boolean;
    emailNotifications: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserNotificationSettingsSchema = new Schema({
  userId: { type: String, required: true, unique: true },
  serverSettings: [{
    serverId: { type: Schema.Types.ObjectId, ref: 'Server' },
    muted: { type: Boolean, default: false },
    suppressEveryone: { type: Boolean, default: false },
    suppressRoles: { type: Boolean, default: false },
    channelOverrides: [{
      channelId: { type: Schema.Types.ObjectId, ref: 'Channel' },
      muted: { type: Boolean, default: false }
    }]
  }],
  globalSettings: {
    desktopNotifications: { type: Boolean, default: true },
    soundEnabled: { type: Boolean, default: true },
    mentionSoundEnabled: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true }
  }
}, { timestamps: true });

export default mongoose.model<IUserNotificationSettings>('UserNotificationSettings', UserNotificationSettingsSchema);