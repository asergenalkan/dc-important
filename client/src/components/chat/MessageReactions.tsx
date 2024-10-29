import { useState } from 'react';
import { Smile } from 'lucide-react';
import EmojiPicker from './EmojiPicker';

interface Props {
  reactions: {
    emoji: string;
    users: string[];
  }[];
  userId: string;
  onReact: (emoji: string) => void;
}

export default function MessageReactions({ reactions, userId, onReact }: Props) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  return (
    <div className="flex items-center gap-2 mt-2">
      {reactions.map(({ emoji, users }) => (
        <button
          key={emoji}
          onClick={() => onReact(emoji)}
          className={`px-2 py-1 rounded-full text-sm flex items-center gap-1 transition-colors ${
            users.includes(userId)
              ? 'bg-indigo-500/20 text-indigo-300'
              : 'bg-gray-600/50 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <span>{emoji}</span>
          <span>{users.length}</span>
        </button>
      ))}
      
      <div className="relative">
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-1 hover:bg-gray-600/50 rounded-full transition-colors"
        >
          <Smile className="w-4 h-4 text-gray-400" />
        </button>
        
        {showEmojiPicker && (
          <div className="absolute bottom-full right-0 mb-2">
            <EmojiPicker
              onSelect={(emoji) => {
                onReact(emoji);
                setShowEmojiPicker(false);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}