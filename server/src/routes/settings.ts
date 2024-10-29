import express from 'express';
import { z } from 'zod';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import UserSettings from '../models/UserSettings';

const router = express.Router();

// Validation schemas
const NotificationSettingsSchema = z.object({
  enableAll: z.boolean(),
  mentions: z.boolean(),
  directMessages: z.boolean(),
  serverMessages: z.boolean(),
  voiceCalls: z.boolean(),
  sounds: z.boolean(),
  desktopNotifications: z.boolean(),
  inAppNotifications: z.boolean(),
});

const PrivacySettingsSchema = z.object({
  directMessages: z.enum(['everyone', 'friends', 'none']),
  friendRequests: z.enum(['everyone', 'mutual', 'none']),
  serverInvites: z.enum(['everyone', 'friends', 'none']),
  readReceipts: z.boolean(),
  onlineStatus: z.boolean(),
  gameActivity: z.boolean(),
  dataCollection: z.boolean(),
});

const AppearanceSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  fontSize: z.number().min(12).max(20),
  showInlineMedia: z.boolean(),
  showLinkPreviews: z.boolean(),
  showEmojiReactions: z.boolean(),
});

const VoiceSettingsSchema = z.object({
  inputDevice: z.string().optional(),
  outputDevice: z.string().optional(),
  inputVolume: z.number().min(0).max(200),
  outputVolume: z.number().min(0).max(200),
  pushToTalk: z.boolean(),
  pushToTalkKey: z.string().optional(),
  automaticGainControl: z.boolean(),
  echoCancellation: z.boolean(),
  noiseSuppression: z.boolean(),
  qosEnabled: z.boolean(),
});

// Get all settings
router.get('/', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    let settings = await UserSettings.findOne({ userId: req.auth.userId });
    
    if (!settings) {
      settings = await UserSettings.create({ userId: req.auth.userId });
    }

    res.json(settings);
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update notification settings
router.patch('/notifications', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const data = NotificationSettingsSchema.parse(req.body);
    
    const settings = await UserSettings.findOneAndUpdate(
      { userId: req.auth.userId },
      { $set: { notifications: data } },
      { new: true, upsert: true }
    );

    res.json(settings);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error('Failed to update notification settings:', error);
      res.status(500).json({ error: 'Failed to update settings' });
    }
  }
});

// Update privacy settings
router.patch('/privacy', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const data = PrivacySettingsSchema.parse(req.body);
    
    const settings = await UserSettings.findOneAndUpdate(
      { userId: req.auth.userId },
      { $set: { privacy: data } },
      { new: true, upsert: true }
    );

    res.json(settings);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error('Failed to update privacy settings:', error);
      res.status(500).json({ error: 'Failed to update settings' });
    }
  }
});

// Update appearance settings
router.patch('/appearance', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const data = AppearanceSettingsSchema.parse(req.body);
    
    const settings = await UserSettings.findOneAndUpdate(
      { userId: req.auth.userId },
      { $set: { appearance: data } },
      { new: true, upsert: true }
    );

    res.json(settings);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error('Failed to update appearance settings:', error);
      res.status(500).json({ error: 'Failed to update settings' });
    }
  }
});

// Update voice settings
router.patch('/voice', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const data = VoiceSettingsSchema.parse(req.body);
    
    const settings = await UserSettings.findOneAndUpdate(
      { userId: req.auth.userId },
      { $set: { voice: data } },
      { new: true, upsert: true }
    );

    res.json(settings);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error('Failed to update voice settings:', error);
      res.status(500).json({ error: 'Failed to update settings' });
    }
  }
});

export default router;