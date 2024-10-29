import { useState, useEffect } from 'react';
import { useSocket } from './useSocket';
import api from '../config/api';

interface Settings {
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
    inputDevice?: string;
    outputDevice?: string;
    inputVolume: number;
    outputVolume: number;
    pushToTalk: boolean;
    pushToTalkKey?: string;
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
}

export function useSettings() {
  const socket = useSocket();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    fetchSettings();

    if (socket) {
      socket.on('settings_updated', (updatedSettings: Settings) => {
        setSettings(updatedSettings);
      });

      return () => {
        socket.off('settings_updated');
      };
    }
  }, [socket]);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/api/settings');
      setSettings(data);
      setError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch settings';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (
    type: keyof Settings,
    updates: Partial<Settings[keyof Settings]>
  ) => {
    try {
      setIsSyncing(true);
      setError(null);
      const { data } = await api.patch(`/api/settings/${type}`, updates);
      setSettings(prev => prev ? { ...prev, [type]: data[type] } : null);
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update settings';
      setError(message);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    settings,
    error,
    isLoading,
    isSyncing,
    updateSettings,
    refetch: fetchSettings,
  };
}