import express from 'express';
import { z } from 'zod';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import UserNotificationSettings from '../models/UserNotificationSettings';
import UnreadMessage from '../models/UnreadMessage';

const router = express.Router();

const GlobalSettingsSchema = z.object({
  desktopNotifications: z.boolean(),
  soundEnabled: z.boolean(),
  mentionSoundEnabled: z.boolean(),
  pushNotifications: z.boolean(),
  emailNotifications: z.boolean()
});

const ServerSettingsSchema = z.object({
  serverId: z.string(),
  muted: z.boolean(),
  suppressEveryone: z.boolean(),
  suppressRoles: z.boolean()
});

const ChannelOverrideSchema = z.object({
  channelId: z.string(),
  muted: z.boolean()
});

// Get user notification settings
router.get('/settings', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    let settings = await UserNotificationSettings.findOne({ userId: req.auth.userId });
    
    if (!settings) {
      settings = await UserNotificationSettings.create({
        userId: req.auth.userId,
        globalSettings: {
          desktopNotifications: true,
          soundEnabled: true,
          mentionSoundEnabled: true,
          pushNotifications: true,
          emailNotifications: true
        }
      });
    }

    res.json(settings);
  } catch (error) {
    console.error('Failed to fetch notification settings:', error);
    res.status(500).json({ error: 'Failed to fetch notification settings' });
  }
});

// Update global notification settings
router.patch('/settings/global', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const data = GlobalSettingsSchema.parse(req.body);
    
    const settings = await UserNotificationSettings.findOneAndUpdate(
      { userId: req.auth.userId },
      { $set: { globalSettings: data } },
      { new: true, upsert: true }
    );

    res.json(settings);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error('Failed to update notification settings:', error);
      res.status(500).json({ error: 'Failed to update notification settings' });
    }
  }
});

// Update server notification settings
router.patch('/settings/server/:serverId', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const data = ServerSettingsSchema.parse(req.body);
    
    const settings = await UserNotificationSettings.findOneAndUpdate(
      { 
        userId: req.auth.userId,
        'serverSettings.serverId': req.params.serverId 
      },
      {
        $set: {
          'serverSettings.$': data
        }
      },
      { new: true }
    );

    if (!settings) {
      // If server settings don't exist, add them
      const settings = await UserNotificationSettings.findOneAndUpdate(
        { userId: req.auth.userId },
        {
          $push: { serverSettings: data }
        },
        { new: true, upsert: true }
      );
      res.json(settings);
    } else {
      res.json(settings);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error('Failed to update server notification settings:', error);
      res.status(500).json({ error: 'Failed to update server notification settings' });
    }
  }
});

// Update channel notification override
router.patch('/settings/channel/:channelId', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const data = ChannelOverrideSchema.parse(req.body);
    
    const settings = await UserNotificationSettings.findOneAndUpdate(
      { 
        userId: req.auth.userId,
        'serverSettings.channelOverrides.channelId': req.params.channelId 
      },
      {
        $set: {
          'serverSettings.$.channelOverrides.$[channel]': data
        }
      },
      {
        arrayFilters: [{ 'channel.channelId': req.params.channelId }],
        new: true
      }
    );

    res.json(settings);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error('Failed to update channel notification settings:', error);
      res.status(500).json({ error: 'Failed to update channel notification settings' });
    }
  }
});

// Mark channel as read
router.post('/read/:channelId', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const { messageId } = req.body;

    await UnreadMessage.findOneAndUpdate(
      {
        userId: req.auth.userId,
        channelId: req.params.channelId
      },
      {
        lastReadMessageId: messageId,
        mentionCount: 0,
        lastMentionId: null
      },
      { new: true, upsert: true }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to mark channel as read:', error);
    res.status(500).json({ error: 'Failed to mark channel as read' });
  }
});

// Get unread state for all channels in a server
router.get('/unread/server/:serverId', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const unreadStates = await UnreadMessage.find({
      userId: req.auth.userId,
      serverId: req.params.serverId
    });

    res.json(unreadStates);
  } catch (error) {
    console.error('Failed to fetch unread states:', error);
    res.status(500).json({ error: 'Failed to fetch unread states' });
  }
});

export default router;