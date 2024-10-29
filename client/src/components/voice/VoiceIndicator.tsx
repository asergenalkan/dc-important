import { Mic, MicOff } from 'lucide-react';

interface Props {
  isSpeaking: boolean;
  isMuted: boolean;
  size?: 'sm' | 'md';
}

export default function VoiceIndicator({ isSpeaking, isMuted, size = 'md' }: Props) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4'
  };

  if (isMuted) {
    return <MicOff className={`text-red-500 ${sizeClasses[size]}`} />;
  }

  return (
    <div className="relative">
      <Mic className={`${sizeClasses[size]} ${isSpeaking ? 'text-green-500' : 'text-gray-400'}`} />
      {isSpeaking && (
        <div className="absolute inset-0 animate-ping">
          <Mic className={`${sizeClasses[size]} text-green-500`} />
        </div>
      )}
    </div>
  );
}