import { useState, useEffect } from 'react';
import { useSocket } from './useSocket';
import api from '../config/api';

interface NotificationSettings {
  globalSettings: {
    desktopNotifications: boolean;
    soundEnabled: boolean;
    mentionSoundEnabled: boolean;
    pushNotifications: boolean;
    emailNotifications: boolean;
  };
  serverSettings: {
    serverId: string;
    muted: boolean;
    suppressEveryone: boolean;
    suppressRoles: boolean;
    channelOverrides: {
      channelId: string;
      muted: boolean;
    }[];
  }[];
}

export function useNotifications() {
  const socket = useSocket();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();

    if (socket) {
      socket.on('notification', handleNotification);
      socket.on('mention', handleMention);

      return () => {
        socket.off('notification');
        socket.off('mention');
      };
    }
  }, [socket]);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/api/notifications/settings');
      setSettings(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch notification settings';
      setError(message);
    }
  };

  const updateGlobalSettings = async (updates: Partial<NotificationSettings['globalSettings']>) => {
    try {
      const { data } = await api.patch('/api/notifications/settings/global', updates);
      setSettings(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update notification settings';
      setError(message);
      throw error;
    }
  };

  const updateServerSettings = async (serverId: string, updates: {
    muted?: boolean;
    suppressEveryone?: boolean;
    suppressRoles?: boolean;
  }) => {
    try {
      const { data } = await api.patch(`/api/notifications/settings/server/${serverId}`, updates);
      setSettings(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update server settings';
      setError(message);
      throw error;
    }
  };

  const updateChannelSettings = async (channelId: string, muted: boolean) => {
    try {
      const { data } = await api.patch(`/api/notifications/settings/channel/${channelId}`, {
        muted
      });
      setSettings(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update channel settings';
      setError(message);
      throw error;
    }
  };

  const handleNotification = async (notification: {
    title: string;
    body: string;
    icon?: string;
  }) => {
    if (!settings?.globalSettings.desktopNotifications) return;

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.body,
        icon: notification.icon
      });
    }

    if (settings?.globalSettings.soundEnabled) {
      // Play notification sound
      const audio = new Audio('/notification.mp3');
      audio.play();
    }
  };

  const handleMention = async (mention: {
    messageId: string;
    channelId: string;
    serverId: string;
    mentionedBy: string;
  }) => {
    if (!settings?.globalSettings.desktopNotifications) return;

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('New Mention', {
        body: `You were mentioned by ${mention.mentionedBy}`,
        icon: '/mention.png'
      });
    }

    if (settings?.globalSettings.mentionSoundEnabled) {
      // Play mention sound
      const audio = new Audio('/mention.mp3');
      audio.play();
    }
  };

  return {
    settings,
    error,
    updateGlobalSettings,
    updateServerSettings,
    updateChannelSettings,
    refetch: fetchSettings
  };
}