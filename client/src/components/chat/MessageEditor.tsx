import { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Link as LinkIcon,
  Code,
  Quote,
  Smile,
  AtSign,
  Image,
} from 'lucide-react';
import EmojiPicker from './EmojiPicker';
import MentionList from './MentionList';
import FileUpload from './FileUpload';
import { IUser } from '../../types/'; // IUser arayüzünü içe aktarın

interface Props {
  initialContent?: string;
  placeholder?: string;
  onSubmit: (content: string, attachments?: File[]) => Promise<void>;
  onCancel?: () => void;
}

export default function MessageEditor({
  initialContent = '',
  placeholder = 'Type a message...',
  onSubmit,
  onCancel,
}: Props) {
  const [content, setContent] = useState(initialContent);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMentionList, setShowMentionList] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editorRef.current && cursorPosition !== null) {
      editorRef.current.focus();
      editorRef.current.setSelectionRange(cursorPosition, cursorPosition);
    }
  }, [cursorPosition]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);

    // Check for mention trigger
    const currentPosition = e.target.selectionStart || 0;
    const textBeforeCursor = value.slice(0, currentPosition);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setShowMentionList(true);
      setShowEmojiPicker(false);
    } else {
      setShowMentionList(false);
    }
  };

  const insertText = (before: string, after = '') => {
    const editor = editorRef.current;
    if (!editor) return;

    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const text = editor.value;
    const beforeText = text.substring(0, start);
    const selectedText = text.substring(start, end);
    const afterText = text.substring(end);

    const newContent = `${beforeText}${before}${selectedText}${after}${afterText}`;
    setContent(newContent);

    const newPosition = start + before.length + selectedText.length;
    setCursorPosition(newPosition);
  };

  const handleToolbarAction = (action: string) => {
    switch (action) {
      case 'bold':
        insertText('**', '**');
        break;
      case 'italic':
        insertText('*', '*');
        break;
      case 'link':
        insertText('[', '](url)');
        break;
      case 'code':
        insertText('`', '`');
        break;
      case 'quote':
        insertText('> ');
        break;
      case 'mention':
        insertText('@');
        break;
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    insertText(emoji + ' ');
    setShowEmojiPicker(false);
  };

  const handleMentionSelect = (user: IUser) => {
    const editor = editorRef.current;
    if (!editor) return;

    const text = editor.value;
    const position = editor.selectionStart;
    const beforeText = text.substring(0, position);
    const afterText = text.substring(position);
    const mentionRegex = /@\w*$/;

    const newContent =
      beforeText.replace(mentionRegex, `@${user.username} `) + afterText;
    setContent(newContent);
    setShowMentionList(false);
  };

  const handleFileSelect = (files: File[]) => {
    setSelectedFiles((prev) => [...prev, ...files]);
    setShowFileUpload(false);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && selectedFiles.length === 0) return;

    try {
      await onSubmit(content, selectedFiles);
      setContent('');
      setSelectedFiles([]);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center space-x-2 mb-2">
        <button
          onClick={() => handleToolbarAction('bold')}
          className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleToolbarAction('italic')}
          className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleToolbarAction('link')}
          className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
          title="Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleToolbarAction('code')}
          className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
          title="Code"
        >
          <Code className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleToolbarAction('quote')}
          className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </button>
        <div className="relative">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
            title="Emoji"
          >
            <Smile className="w-4 h-4" />
          </button>
          {showEmojiPicker && (
            <div className="absolute bottom-full right-0 mb-2">
              <EmojiPicker onSelect={handleEmojiSelect} />
            </div>
          )}
        </div>
        <button
          onClick={() => handleToolbarAction('mention')}
          className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
          title="Mention"
        >
          <AtSign className="w-4 h-4" />
        </button>
        <button
          onClick={() => setShowFileUpload(!showFileUpload)}
          className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
          title="Upload File"
        >
          <Image className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          ref={editorRef}
          value={content}
          onChange={handleInput}
          placeholder={placeholder}
          className="w-full min-h-[100px] px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />

        {selectedFiles.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 px-2 py-1 bg-gray-700 rounded-lg"
              >
                <span className="text-sm text-gray-300 truncate max-w-[200px]">
                  {file.name}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(index)}
                  className="text-gray-400 hover:text-red-500"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end mt-2 space-x-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={!content.trim() && selectedFiles.length === 0}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>

      {showMentionList && (
        <div className="absolute bottom-full left-0 mb-2">
          <MentionList query={mentionQuery} onSelect={handleMentionSelect} />
        </div>
      )}

      {showFileUpload && (
        <div className="absolute bottom-full right-0 mb-2 w-80">
          <FileUpload
            onUpload={handleFileSelect}
            maxSize={10}
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
          />
        </div>
      )}
    </div>
  );
}
