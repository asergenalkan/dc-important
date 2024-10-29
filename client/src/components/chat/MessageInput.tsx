import { useState, useRef } from 'react';
import type { IUser } from '../../types';

interface Props {
  onSend: (content: string) => void;
  placeholder?: string;
}

export default function MessageInput({ onSend, placeholder = 'Type a message...' }: Props) {
  const [content, setContent] = useState('');
  const [mentionQuery, setMentionQuery] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);

    // Check for mention trigger
    const cursorPosition = e.target.selectionStart || 0;
    const textBeforeCursor = value.slice(0, cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      const query = mentionMatch[1];
      setMentionQuery(query);
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  };

  const handleMentionSelect = (user: IUser) => {
    const input = inputRef.current;
    if (!input) return;

    const cursorPosition = input.selectionStart || 0;
    const textBeforeMention = content.slice(0, cursorPosition).replace(/@\w*$/, '');
    const textAfterMention = content.slice(cursorPosition);
    
    const newContent = `${textBeforeMention}@${user.username} ${textAfterMention}`;
    setContent(newContent);
    setShowMentions(false);

    // Set cursor position after the mention
    setTimeout(() => {
      const newPosition = textBeforeMention.length + user.username.length + 2;
      input.setSelectionRange(newPosition, newPosition);
      input.focus();
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSend(content);
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        ref={inputRef}
        value={content}
        onChange={handleInput}
        placeholder={placeholder}
        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
        rows={1}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
      />
    </form>
  );
}