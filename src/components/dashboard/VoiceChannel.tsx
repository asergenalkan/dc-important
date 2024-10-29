import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Settings } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import VolumeSlider from './VolumeSlider';

interface Props {
  channelId: string;
  serverId: string;
}

interface VoiceSettings {
  targetUserId: string;
  volume: number;
}

export default function VoiceChannel({ channelId, serverId }: Props) {
  const { user } = useUser();
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings[]>([]);
  const [showVolumeControls, setShowVolumeControls] = useState(false);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Record<string, RTCPeerConnection>>({});
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodesRef = useRef<Record<string, GainNode>>({});

  useEffect(() => {
    fetchVoiceSettings();
    initializeAudioContext();
    initializeVoiceChat();

    return () => {
      cleanup();
    };
  }, [channelId, serverId]);

  const initializeAudioContext = () => {
    audioContextRef.current = new AudioContext();
  };

  const fetchVoiceSettings = async () => {
    try {
      const response = await fetch(`/api/voice-settings/server/${serverId}`);
      const settings = await response.json();
      setVoiceSettings(settings);
    } catch (error) {
      console.error('Failed to fetch voice settings:', error);
    }
  };

  const handleUserLeft = (userId: string) => {
    const peerConnection = peerConnectionsRef.current[userId];
    if (peerConnection) {
      peerConnection.close();
      delete peerConnectionsRef.current[userId];
    }
    setConnectedUsers(prev => prev.filter(id => id !== userId));
  };

  const handleOffer = async (offer: RTCSessionDescriptionInit, userId: string) => {
    const peerConnection = peerConnectionsRef.current[userId];
    if (peerConnection) {
      await peerConnection.setRemoteDescription(offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      // Send answer back to peer
    }
  };

  const handleAnswer = async (answer: RTCSessionDescriptionInit, userId: string) => {
    const peerConnection = peerConnectionsRef.current[userId];
    if (peerConnection) {
      await peerConnection.setRemoteDescription(answer);
    }
  };

  const handleIceCandidate = async (candidate: RTCIceCandidateInit, userId: string) => {
    const peerConnection = peerConnectionsRef.current[userId];
    if (peerConnection) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
  };

  const initializeVoiceChat = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      
      const socket = new WebSocket(process.env.WEBSOCKET_URL || 'ws://localhost:3000');
      
      socket.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'user-joined':
            handleUserJoined(data.userId);
            break;
          case 'user-left':
            handleUserLeft(data.userId);
            break;
          case 'offer':
            handleOffer(data.offer, data.userId);
            break;
          case 'answer':
            handleAnswer(data.answer, data.userId);
            break;
          case 'ice-candidate':
            handleIceCandidate(data.candidate, data.userId);
            break;
        }
      };
    } catch (error) {
      console.error('Failed to initialize voice chat:', error);
    }
  };

  const handleUserJoined = async (userId: string) => {
    if (userId === user?.id) return;

    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    peerConnectionsRef.current[userId] = peerConnection;

    // Add local stream
    localStreamRef.current?.getTracks().forEach(track => {
      if (localStreamRef.current) {
        peerConnection.addTrack(track, localStreamRef.current);
      }
    });

    // Handle incoming audio with gain control
    peerConnection.ontrack = (event) => {
      const audioContext = audioContextRef.current;
      if (!audioContext) return;

      const source = audioContext.createMediaStreamSource(event.streams[0]);
      const gainNode = audioContext.createGain();
      gainNodesRef.current[userId] = gainNode;

      // Set initial volume from settings
      const userSettings = voiceSettings.find(s => s.targetUserId === userId);
      if (userSettings) {
        gainNode.gain.value = userSettings.volume / 100;
      }

      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    setConnectedUsers(prev => [...prev, userId]);
  };

  const handleVolumeChange = async (userId: string, volume: number) => {
    try {
      // Update gain node
      if (gainNodesRef.current[userId]) {
        gainNodesRef.current[userId].gain.value = volume / 100;
      }

      // Save to backend
      const response = await fetch('/api/voice-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: userId,
          serverId,
          volume,
        }),
      });

      if (response.ok) {
        setVoiceSettings(prev => 
          prev.map(s => 
            s.targetUserId === userId ? { ...s, volume } : s
          )
        );
      }
    } catch (error) {
      console.error('Failed to update volume:', error);
    }
  };

  const cleanup = () => {
    localStreamRef.current?.getTracks().forEach(track => track.stop());
    Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
    Object.values(gainNodesRef.current).forEach(node => node.disconnect());
    audioContextRef.current?.close();
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-medium">Voice Connected</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowVolumeControls(!showVolumeControls)}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            <Settings className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2 rounded-lg transition-colors ${
              isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {isMuted ? (
              <MicOff className="w-5 h-5 text-white" />
            ) : (
              <Mic className="w-5 h-5 text-white" />
            )}
          </button>
          <button
            onClick={() => setIsDeafened(!isDeafened)}
            className={`p-2 rounded-lg transition-colors ${
              isDeafened ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {isDeafened ? (
              <VolumeX className="w-5 h-5 text-white" />
            ) : (
              <Volume2 className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {connectedUsers.map((userId) => (
          <div key={userId} className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
              <span className="text-white font-medium">
                {userId.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-white">
                  {userId === user?.id ? 'You' : 'User'}
                </span>
                {showVolumeControls && userId !== user?.id && (
                  <VolumeSlider
                    value={voiceSettings.find(s => s.targetUserId === userId)?.volume ?? 100}
                    onChange={(volume) => handleVolumeChange(userId, volume)}
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}