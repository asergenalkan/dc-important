import { Volume2, Settings } from 'lucide-react';

interface Props {
  channelName: string;
  participantCount: number;
  onSettingsClick: () => void;
}

export default function VoiceChannelHeader({ channelName, participantCount, onSettingsClick }: Props) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-700">
      <div className="flex items-center space-x-2">
        <Volume2 className="w-5 h-5 text-gray-400" />
        <div>
          <h3 className="text-white font-medium">{channelName}</h3>
          <p className="text-sm text-gray-400">{participantCount} connected</p>
        </div>
      </div>
      <button
        onClick={onSettingsClick}
        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
      >
        <Settings className="w-5 h-5 text-gray-400" />
      </button>
    </div>
  );
}