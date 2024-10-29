import { useState, useEffect, useRef } from 'react';
import { useSocket } from './useSocket';

interface UseVoiceChannelResult {
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnected: boolean;
  error: string | null;
}

export function useVoiceChannel(channelId: string, serverId: string): UseVoiceChannelResult {
  const socket = useSocket();
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentChannelRef = useRef<{ channelId: string; serverId: string } | null>(null);

  const connect = async () => {
    try {
      // Check if already connected to another voice channel
      if (currentChannelRef.current && 
          (currentChannelRef.current.channelId !== channelId || 
           currentChannelRef.current.serverId !== serverId)) {
        
        const confirmed = window.confirm(
          'You are already connected to another voice channel. Would you like to switch?'
        );
        
        if (!confirmed) {
          setError('Cannot connect to multiple voice channels');
          return;
        }
        
        await disconnect();
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      socket?.emit('join_voice', { channelId, serverId });
      currentChannelRef.current = { channelId, serverId };
      setIsConnected(true);
      setError(null);
    } catch (error) {
      console.error('Failed to connect to voice channel:', error);
      setError('Failed to access microphone');
      setIsConnected(false);
    }
  };

  const disconnect = async () => {
    if (currentChannelRef.current) {
      socket?.emit('leave_voice', {
        channelId: currentChannelRef.current.channelId,
        serverId: currentChannelRef.current.serverId
      });
      currentChannelRef.current = null;
    }
    setIsConnected(false);
  };

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return {
    connect,
    disconnect,
    isConnected,
    error
  };
}