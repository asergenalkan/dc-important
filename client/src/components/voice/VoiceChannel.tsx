import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Mic, MicOff, Headphones, VolumeX, X } from 'lucide-react';
import { useVoiceChannel } from '../../hooks/useVoiceChannel';

interface Props {
  channelId: string;
  serverId: string;
  onClose?: () => void;
}

export default function VoiceChannel({ channelId, serverId, onClose }: Props) {
  const { user } = useUser();
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [participants, setParticipants] = useState<string[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const {
    connect,
    disconnect,
    isConnected,
    error
  } = useVoiceChannel(channelId, serverId);

  useEffect(() => {
    if (!isConnected) {
      connect();
    }

    return () => {
      if (isConnected) {
        disconnect();
      }
    };
  }, [channelId]);

  const toggleMute = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleDeafen = () => {
    if (audioContextRef.current) {
      if (isDeafened) {
        audioContextRef.current.resume();
      } else {
        audioContextRef.current.suspend();
      }
      setIsDeafened(!isDeafened);
    }
  };

  const handleClose = () => {
    disconnect();
    onClose?.();
  };

  if (error) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <span className="text-red-400">Failed to connect: {error}</span>
          {onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg min-w-[300px]">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-medium">Voice Connected</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleMute}
              className={`p-2 rounded-lg transition-colors ${
                isMuted ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-400 hover:text-white'
              }`}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <button
              onClick={toggleDeafen}
              className={`p-2 rounded-lg transition-colors ${
                isDeafened ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-400 hover:text-white'
              }`}
            >
              {isDeafened ? <VolumeX className="w-5 h-5" /> : <Headphones className="w-5 h-5" />}
            </button>
            {onClose && (
              <button
                onClick={handleClose}
                className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {participants.map(participantId => (
            <div
              key={participantId}
              className="flex items-center space-x-2 p-2 rounded-lg bg-gray-700"
            >
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                <span className="text-white text-sm">
                  {participantId === user?.id ? 'You' : 'U'}
                </span>
              </div>
              <span className="text-white">
                {participantId === user?.id ? 'You' : 'User'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}