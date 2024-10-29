import { useState, useEffect, useRef } from 'react';
import { useSocket } from './useSocket';
import api from '../config/api';
import { screenQualityPresets, type ScreenQuality } from '../config/screenShare';

interface ScreenShareState {
  isSharing: boolean;
  stream: MediaStream | null;
  error: string | null;
  quality: ScreenQuality;
}

export function useScreenShare(channelId: string) {
  const socket = useSocket();
  const [state, setState] = useState<ScreenShareState>({
    isSharing: false,
    stream: null,
    error: null,
    quality: 'medium'
  });

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: screenQualityPresets[state.quality] as MediaTrackConstraints,
        audio: true
      });

      setState(prev => ({
        ...prev,
        isSharing: true,
        stream,
        error: null
      }));

      // Notify server about screen share start
      socket?.emit('screen_share_start', { channelId });

      // Handle stream end
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start screen share';
      setState(prev => ({ ...prev, error: message }));
    }
  };

  const stopScreenShare = () => {
    state.stream?.getTracks().forEach(track => track.stop());
    setState(prev => ({
      ...prev,
      isSharing: false,
      stream: null
    }));
    socket?.emit('screen_share_stop', { channelId });
  };

  const updateQuality = async (quality: ScreenQuality) => {
    if (!state.stream) return;

    try {
      const videoTrack = state.stream.getVideoTracks()[0];
      await videoTrack.applyConstraints(
        screenQualityPresets[quality] as MediaTrackConstraints
      );

      setState(prev => ({ ...prev, quality }));
      socket?.emit('screen_share_quality_change', { channelId, quality });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update quality';
      setState(prev => ({ ...prev, error: message }));
    }
  };

  useEffect(() => {
    return () => {
      if (state.isSharing) {
        stopScreenShare();
      }
    };
  }, []);

  return {
    ...state,
    startScreenShare,
    stopScreenShare,
    updateQuality
  };
}