import { useState, useRef, useCallback } from 'react';
import {
  Bold,
  Italic,
  List,
  Link,
  Image,
  Code,
  Quote,
  Save,
  Share2,
  Trash2,
  Tag,
  Palette,
  Pin,
  Bookmark,
} from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import type { INote } from '../../types';

interface Props {
  note?: INote;
  onSave: (data: Partial<INote>) => Promise<void>;
  onDelete?: () => Promise<void>;
  onClose?: () => void;
}

export default function NoteEditor({ note, onSave, onDelete, onClose }: Props) {
  const { user } = useUser();
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [color, setColor] = useState(note?.color || '#ffffff');
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [isPinned, setIsPinned] = useState(note?.isPinned || false);
  const [isBookmarked, setIsBookmarked] = useState(note?.isBookmarked || false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      await onSave({
        title: title.trim(),
        content,
        color,
        tags,
        isPinned,
        isBookmarked,
      });
    } catch (error) {
      setError('Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags((prev) => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const insertMarkdown = (prefix: string, suffix = prefix) => {
    const editor = editorRef.current;
    if (!editor) return;

    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const text = editor.value;
    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);

    setContent(`${before}${prefix}${selection}${suffix}${after}`);

    // Restore cursor position
    setTimeout(() => {
      editor.focus();
      editor.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const colors = [
    '#ffffff',
    '#ffcdd2',
    '#f8bbd0',
    '#e1bee7',
    '#d1c4e9',
    '#c5cae9',
    '#bbdefb',
    '#b3e5fc',
    '#b2ebf2',
    '#b2dfdb',
  ];

  return (
    <div className="flex flex-col h-full bg-gray-800">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => insertMarkdown('**')}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Bold"
          >
            <Bold className="w-5 h-5 text-gray-400" />
          </button>
          <button
            onClick={() => insertMarkdown('*')}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Italic"
          >
            <Italic className="w-5 h-5 text-gray-400" />
          </button>
          <button
            onClick={() => insertMarkdown('\n- ')}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="List"
          >
            <List className="w-5 h-5 text-gray-400" />
          </button>
          <button
            onClick={() => {
              const url = prompt('Enter URL:');
              if (url) insertMarkdown('[', `](${url})`);
            }}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Link"
          >
            <Link className="w-5 h-5 text-gray-400" />
          </button>
          <button
            onClick={() => {
              const url = prompt('Enter image URL:');
              if (url) insertMarkdown('![', `](${url})`);
            }}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Image"
          >
            <Image className="w-5 h-5 text-gray-400" />
          </button>
          <button
            onClick={() => insertMarkdown('`')}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Code"
          >
            <Code className="w-5 h-5 text-gray-400" />
          </button>
          <button
            onClick={() => insertMarkdown('\n> ')}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Quote"
          >
            <Quote className="w-5 h-5 text-gray-400" />
          </button>
          <div className="relative group">
            <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
              <Palette className="w-5 h-5 text-gray-400" />
            </button>
            <div className="absolute top-full left-0 mt-2 p-2 bg-gray-700 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="grid grid-cols-5 gap-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className="w-6 h-6 rounded-full border-2 border-gray-600"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPinned(!isPinned)}
            className={`p-2 rounded-lg transition-colors ${
              isPinned
                ? 'bg-yellow-500/20 text-yellow-500'
                : 'hover:bg-gray-700 text-gray-400'
            }`}
          >
            <Pin className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`p-2 rounded-lg transition-colors ${
              isBookmarked
                ? 'bg-indigo-500/20 text-indigo-500'
                : 'hover:bg-gray-700 text-gray-400'
            }`}
          >
            <Bookmark className="w-5 h-5" />
          </button>
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{isSaving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border-b border-red-500/20 text-red-500 text-sm">
          {error}
        </div>
      )}

      {/* Editor */}
      <div
        className="flex-1 overflow-y-auto p-6"
        style={{ backgroundColor: color }}
      >
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title"
          className="w-full text-2xl font-bold bg-transparent border-none outline-none mb-4"
        />
        <textarea
          ref={editorRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing... (Markdown supported)"
          className="w-full h-[calc(100%-4rem)] bg-transparent border-none outline-none resize-none font-mono"
        />
      </div>

      {/* Tags */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-2">
          <Tag className="w-4 h-4 text-gray-400" />
          <div className="flex-1 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-700 text-gray-300 rounded-lg text-sm flex items-center space-x-1"
              >
                <span>{tag}</span>
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="w-4 h-4 hover:text-red-500 transition-colors"
                >
                  ×
                </button>
              </span>
            ))}
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              placeholder="Add tag..."
              className="bg-transparent border-none outline-none text-sm text-gray-300 placeholder-gray-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
