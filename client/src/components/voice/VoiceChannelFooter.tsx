import VoiceControls from './VoiceControls';

interface Props {
  isMuted: boolean;
  isDeafened: boolean;
  isScreenSharing: boolean;
  onToggleMute: () => void;
  onToggleDeafen: () => void;
  onToggleScreenShare: () => void;
  onOpenSettings: () => void;
}

export default function VoiceChannelFooter(props: Props) {
  return (
    <div className="p-4 border-t border-gray-700 bg-gray-800">
      <VoiceControls {...props} />
    </div>
  );
}