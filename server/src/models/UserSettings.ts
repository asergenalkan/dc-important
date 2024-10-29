import mongoose, { Schema, Document } from 'mongoose';

export interface IUserSettings extends Document {
  userId: string;
  notifications: {
    enableAll: boolean;
    mentions: boolean;
    directMessages: boolean;
    serverMessages: boolean;
    voiceCalls: boolean;
    sounds: boolean;
    desktopNotifications: boolean;
    inAppNotifications: boolean;
  };
  privacy: {
    directMessages: 'everyone' | 'friends' | 'none';
    friendRequests: 'everyone' | 'mutual' | 'none';
    serverInvites: 'everyone' | 'friends' | 'none';
    readReceipts: boolean;
    onlineStatus: boolean;
    gameActivity: boolean;
    dataCollection: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    fontSize: number;
    showInlineMedia: boolean;
    showLinkPreviews: boolean;
    showEmojiReactions: boolean;
  };
  voice: {
    inputDevice: string;
    outputDevice: string;
    inputVolume: number;
    outputVolume: number;
    pushToTalk: boolean;
    pushToTalkKey: string;
    automaticGainControl: boolean;
    echoCancellation: boolean;
    noiseSuppression: boolean;
    qosEnabled: boolean;
  };
  accessibility: {
    highContrast: boolean;
    reducedMotion: boolean;
    fontSize: 'small' | 'medium' | 'large';
    screenReader: boolean;
  };
  keyboard: {
    enabled: boolean;
    shortcuts: Record<string, string>;
  };
  language: {
    preferred: string;
    spellcheck: boolean;
    autoCorrect: boolean;
  };
  storage: {
    autoDownload: boolean;
    compressionEnabled: boolean;
    maxCacheSize: number;
  };
  sync: {
    lastSynced: Date;
    version: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSettingsSchema = new Schema({
  userId: { type: String, required: true, unique: true },
  notifications: {
    enableAll: { type: Boolean, default: true },
    mentions: { type: Boolean, default: true },
    directMessages: { type: Boolean, default: true },
    serverMessages: { type: Boolean, default: true },
    voiceCalls: { type: Boolean, default: true },
    sounds: { type: Boolean, default: true },
    desktopNotifications: { type: Boolean, default: true },
    inAppNotifications: { type: Boolean, default: true },
  },
  privacy: {
    directMessages: { type: String, enum: ['everyone', 'friends', 'none'], default: 'friends' },
    friendRequests: { type: String, enum: ['everyone', 'mutual', 'none'], default: 'everyone' },
    serverInvites: { type: String, enum: ['everyone', 'friends', 'none'], default: 'everyone' },
    readReceipts: { type: Boolean, default: true },
    onlineStatus: { type: Boolean, default: true },
    gameActivity: { type: Boolean, default: true },
    dataCollection: { type: Boolean, default: false },
  },
  appearance: {
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'dark' },
    fontSize: { type: Number, default: 14 },
    showInlineMedia: { type: Boolean, default: true },
    showLinkPreviews: { type: Boolean, default: true },
    showEmojiReactions: { type: Boolean, default: true },
  },
  voice: {
    inputDevice: { type: String },
    outputDevice: { type: String },
    inputVolume: { type: Number, default: 100 },
    outputVolume: { type: Number, default: 100 },
    pushToTalk: { type: Boolean, default: false },
    pushToTalkKey: { type: String },
    automaticGainControl: { type: Boolean, default: true },
    echoCancellation: { type: Boolean, default: true },
    noiseSuppression: { type: Boolean, default: true },
    qosEnabled: { type: Boolean, default: true },
  },
  accessibility: {
    highContrast: { type: Boolean, default: false },
    reducedMotion: { type: Boolean, default: false },
    fontSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
    screenReader: { type: Boolean, default: false },
  },
  keyboard: {
    enabled: { type: Boolean, default: true },
    shortcuts: { type: Map, of: String, default: {} },
  },
  language: {
    preferred: { type: String, default: 'en' },
    spellcheck: { type: Boolean, default: true },
    autoCorrect: { type: Boolean, default: true },
  },
  storage: {
    autoDownload: { type: Boolean, default: true },
    compressionEnabled: { type: Boolean, default: true },
    maxCacheSize: { type: Number, default: 1024 }, // MB
  },
  sync: {
    lastSynced: { type: Date },
    version: { type: Number, default: 1 },
  },
}, { 
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Add middleware to handle settings sync
UserSettingsSchema.post('save', function(doc) {
  const io = require('../socket').getIO();
  io.to(`user:${doc.userId}`).emit('settings_updated', doc.toJSON());
});

export default mongoose.model<IUserSettings>('UserSettings', UserSettingsSchema);