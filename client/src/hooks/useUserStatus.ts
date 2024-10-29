import { useState, useEffect } from 'react';
import { useSocket } from './useSocket';
import api from '../config/api';

export type UserStatus = 'online' | 'idle' | 'dnd' | 'offline';

interface UserStatusData {
  status: UserStatus;
  customStatus?: string;
  gameActivity?: {
    name: string;
    details?: string;
    startedAt: Date;
  };
  lastSeen: Date;
}

export function useUserStatus(userId: string) {
  const socket = useSocket();
  const [statusData, setStatusData] = useState<UserStatusData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatus();

    if (socket) {
      socket.on('user_updated', (data: { userId: string; updates: Partial<UserStatusData> }) => {
        if (data.userId === userId) {
          setStatusData(prev => prev ? { ...prev, ...data.updates } : null);
        }
      });

      return () => {
        socket.off('user_updated');
      };
    }
  }, [userId, socket]);

  const fetchStatus = async () => {
    try {
      const { data } = await api.get(`/api/users/${userId}/status`);
      setStatusData(data);
      setError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch user status';
      setError(message);
    }
  };

  const updateStatus = async (updates: Partial<UserStatusData>) => {
    try {
      const { data } = await api.patch('/api/users/me', updates);
      setStatusData(data);
      setError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update status';
      setError(message);
      throw error;
    }
  };

  return {
    statusData,
    error,
    updateStatus,
    refetch: fetchStatus
  };
}