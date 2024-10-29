import { useState } from 'react';
import { Volume2 } from 'lucide-react';
import VoiceIndicator from './VoiceIndicator';

interface Props {
  username: string;
  imageUrl?: string;
  isSpeaking: boolean;
  isMuted: boolean;
  volume: number;
  onVolumeChange: (volume: number) => void;
}

export default function VoiceParticipant({
  username,
  imageUrl,
  isSpeaking,
  isMuted,
  volume,
  onVolumeChange,
}: Props) {
  const [showVolume, setShowVolume] = useState(false);

  return (
    <div 
      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-700 group"
      onMouseEnter={() => setShowVolume(true)}
      onMouseLeave={() => setShowVolume(false)}
    >
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={username}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-white font-medium">
                {username.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1">
            <VoiceIndicator isSpeaking={isSpeaking} isMuted={isMuted} size="sm" />
          </div>
        </div>
        <span className="text-white">{username}</span>
      </div>

      <div className={`flex items-center space-x-2 transition-opacity duration-200 ${
        showVolume ? 'opacity-100' : 'opacity-0'
      }`}>
        <Volume2 className="w-4 h-4 text-gray-400" />
        <input
          type="range"
          min="0"
          max="200"
          value={volume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          className="w-24"
        />
        <span className="text-xs text-gray-400 min-w-[2rem]">{volume}%</span>
      </div>
    </div>
  );
}