import { useState, useEffect } from 'react';
import { Save, X, Share2, Trash2, Eye, EyeOff } from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';
import type { IDocument } from '../../types';

interface Props {
  document?: IDocument;
  onSave: (data: Partial<IDocument>) => Promise<void>;
  onDelete?: () => Promise<void>;
  onClose?: () => void;
}

export default function DocumentEditor({
  document,
  onSave,
  onDelete,
  onClose,
}: Props) {
  const [title, setTitle] = useState(document?.title || '');
  const [content, setContent] = useState(document?.content || '');
  const [tags, setTags] = useState<string[]>(document?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState('');

  // Configure marked options
  useEffect(() => {
    marked.setOptions({
      breaks: true,
      gfm: true,
    });
  }, []);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await onSave({
        title: title.trim(),
        content,
        tags,
      });
    } catch (error) {
      setError('Failed to save document');
    } finally {
      setIsLoading(false);
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

  useEffect(() => {
    const updatePreview = async () => {
      if (isPreview) {
        const html = await marked(content);
        const sanitizedHtml = DOMPurify.sanitize(html);
        setPreviewContent(sanitizedHtml);
      }
    };
    updatePreview();
  }, [content, isPreview]);

  return (
    <div className="flex flex-col h-full bg-gray-800">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex-1">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Document title"
            className="w-full bg-transparent text-xl font-bold text-white border-none outline-none"
          />
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
            title={isPreview ? 'Edit' : 'Preview'}
          >
            {isPreview ? (
              <Eye className="w-5 h-5" />
            ) : (
              <EyeOff className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={() => {
              /* Share functionality */
            }}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
            title="Share"
          >
            <Share2 className="w-5 h-5" />
          </button>
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{isLoading ? 'Saving...' : 'Save'}</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border-b border-red-500/20 text-red-500 text-sm">
          {error}
        </div>
      )}

      {/* Editor/Preview */}
      <div className="flex-1 overflow-y-auto">
        {isPreview ? (
          <div
            className="prose prose-invert max-w-none p-6"
            dangerouslySetInnerHTML={{ __html: previewContent }}
          />
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing... (Markdown supported)"
            className="w-full h-full p-6 bg-transparent text-white font-mono resize-none focus:outline-none"
          />
        )}
      </div>

      {/* Tags */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex flex-wrap gap-2">
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
            className="px-2 py-1 bg-transparent text-sm text-gray-300 border-none outline-none"
          />
        </div>
      </div>
    </div>
  );
}
