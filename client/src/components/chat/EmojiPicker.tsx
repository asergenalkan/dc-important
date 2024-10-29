import { useState } from 'react';
import { Search } from 'lucide-react';

interface Props {
  onSelect: (emoji: string) => void;
}

// Common emoji categories with frequently used emojis
const EMOJI_CATEGORIES = {
  'Smileys & People': ['😀', '😂', '🥰', '😊', '😎', '🤔', '😴', '😭', '🤯', '🥳'],
  'Animals & Nature': ['🐶', '🐱', '🦊', '🦁', '🐼', '🌸', '🌳', '⭐', '🌙', '⚡'],
  'Food & Drink': ['🍎', '🍕', '🍔', '🌮', '🍣', '🍜', '🍪', '🍩', '☕', '🍷'],
  'Activities': ['⚽', '🎮', '🎨', '🎭', '🎪', '🎯', '🎲', '🎸', '🎧', '🎉'],
  'Objects': ['💻', '📱', '💡', '🔑', '🎁', '📚', '✏️', '📷', '⏰', '💎'],
  'Symbols': ['❤️', '✨', '💯', '✅', '❌', '💬', '➡️', '🔄', '🔍', '📌'],
};

export default function EmojiPicker({ onSelect }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Smileys & People');

  // Filter emojis based on search query
  const filteredEmojis = searchQuery
    ? Object.values(EMOJI_CATEGORIES)
        .flat()
        .filter(emoji => emoji.includes(searchQuery))
    : EMOJI_CATEGORIES[selectedCategory as keyof typeof EMOJI_CATEGORIES];

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg w-72 overflow-hidden">
      {/* Search Bar */}
      <div className="p-2 border-b border-gray-700">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search emoji..."
            className="w-full pl-8 pr-4 py-1.5 bg-gray-700 text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Category Tabs */}
      {!searchQuery && (
        <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-700">
          {Object.keys(EMOJI_CATEGORIES).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-2 text-sm whitespace-nowrap transition-colors
                ${selectedCategory === category 
                  ? 'text-white border-b-2 border-indigo-500' 
                  : 'text-gray-400 hover:text-white'}`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {/* Emoji Grid */}
      <div className="p-2 grid grid-cols-8 gap-1 max-h-60 overflow-y-auto">
        {filteredEmojis.map((emoji, index) => (
          <button
            key={index}
            onClick={() => onSelect(emoji)}
            className="w-8 h-8 flex items-center justify-center text-xl hover:bg-gray-700 rounded transition-colors"
          >
            {emoji}
          </button>
        ))}
        {filteredEmojis.length === 0 && (
          <div className="col-span-8 py-8 text-center text-gray-400">
            No emojis found
          </div>
        )}
      </div>
    </div>
  );
}