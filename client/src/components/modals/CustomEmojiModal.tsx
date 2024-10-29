import { useState } from 'react';
import { X, Upload, AlertCircle } from 'lucide-react';
import api from '../../config/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  serverId: string;
  onEmojiAdded: () => void;
}

export default function CustomEmojiModal({ isOpen, onClose, serverId, onEmojiAdded }: Props) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) {
      setError('Name and URL are required');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await api.post(`/api/servers/${serverId}/emojis`, {
        name: name.trim(),
        url: url.trim()
      });
      onEmojiAdded();
      onClose();
    } catch (error) {
      setError('Failed to add emoji');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-md mx-4">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Add Custom Emoji</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center text-red-500 text-sm">
              <AlertCircle className="w-4 h-4 mr-2" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Emoji Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter emoji name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Emoji URL
              </label>
              <div className="relative">
                <Upload className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter emoji URL"
                />
              </div>
            </div>

            {url && (
              <div className="flex items-center justify-center p-4 bg-gray-700 rounded-lg">
                <img
                  src={url}
                  alt="Emoji preview"
                  className="max-w-[64px] max-h-[64px] object-contain"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/64';
                  }}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Adding...' : 'Add Emoji'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}