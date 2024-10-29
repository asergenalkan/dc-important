import VoiceParticipant from './VoiceParticipant';

interface Props {
  participants: {
    id: string;
    username: string;
    imageUrl?: string;
    isSpeaking: boolean;
    isMuted: boolean;
    volume: number;
  }[];
  onVolumeChange: (participantId: string, volume: number) => void;
}

export default function VoiceParticipantList({ participants, onVolumeChange }: Props) {
  return (
    <div className="space-y-2">
      {participants.map((participant) => (
        <VoiceParticipant
          key={participant.id}
          username={participant.username}
          imageUrl={participant.imageUrl}
          isSpeaking={participant.isSpeaking}
          isMuted={participant.isMuted}
          volume={participant.volume}
          onVolumeChange={(volume) => onVolumeChange(participant.id, volume)}
        />
      ))}
    </div>
  );
}