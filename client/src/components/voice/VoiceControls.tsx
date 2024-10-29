import { Mic, MicOff, Headphones, Volume2, Monitor, Settings } from 'lucide-react';

interface Props {
  isMuted: boolean;
  isDeafened: boolean;
  isScreenSharing: boolean;
  onToggleMute: () => void;
  onToggleDeafen: () => void;
  onToggleScreenShare: () => void;
  onOpenSettings: () => void;
}

export default function VoiceControls({
  isMuted,
  isDeafened,
  isScreenSharing,
  onToggleMute,
  onToggleDeafen,
  onToggleScreenShare,
  onOpenSettings,
}: Props) {
  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={onToggleMute}
        className={`p-2 rounded-lg transition-colors ${
          isMuted ? 'bg-red-500/10 text-red-500' : 'hover:bg-gray-700 text-gray-400'
        }`}
      >
        {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </button>

      <button
        onClick={onToggleDeafen}
        className={`p-2 rounded-lg transition-colors ${
          isDeafened ? 'bg-red-500/10 text-red-500' : 'hover:bg-gray-700 text-gray-400'
        }`}
      >
        <Headphones className={`w-5 h-5 ${isDeafened ? 'opacity-50' : ''}`} />
      </button>

      <button
        onClick={onToggleScreenShare}
        className={`p-2 rounded-lg transition-colors ${
          isScreenSharing ? 'bg-indigo-500/10 text-indigo-500' : 'hover:bg-gray-700 text-gray-400'
        }`}
      >
        <Monitor className="w-5 h-5" />
      </button>

      <button
        onClick={onOpenSettings}
        className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
      >
        <Settings className="w-5 h-5" />
      </button>
    </div>
  );
}