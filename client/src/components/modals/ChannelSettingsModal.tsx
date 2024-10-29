import { useState } from 'react';
import { X, AlertCircle, Hash, Volume2, Radio, Lock } from 'lucide-react';
import type { IChannel } from '../../types';
import api from '../../config/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  channel: IChannel;
  onUpdate: () => void;
}

export default function ChannelSettingsModal({ isOpen, onClose, channel, onUpdate }: Props) {
  const [name, setName] = useState(channel.name);
  const [description, setDescription] = useState(channel.description || '');
  const [isNsfw, setIsNsfw] = useState(channel.isNsfw);
  const [slowMode, setSlowMode] = useState(channel.slowMode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError(null);

      await api.patch(`/api/channels/${channel._id}`, {
        name,
        description,
        isNsfw,
        slowMode
      });

      onUpdate();
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update channel';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const getChannelIcon = () => {
    switch (channel.type) {
      case 'text':
        return <Hash className="w-6 h-6 text-gray-400" />;
      case 'voice':
        return <Volume2 className="w-6 h-6 text-gray-400" />;
      case 'announcement':
        return <Radio className="w-6 h-6 text-gray-400" />;
      default:
        return <Hash className="w-6 h-6 text-gray-400" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              {getChannelIcon()}
              <h2 className="text-2xl font-bold text-white">Channel Settings</h2>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center text-red-500">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Channel Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter channel name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter channel description"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-2">
                <Lock className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-white font-medium">Slow Mode</div>
                  <div className="text-sm text-gray-400">
                    Set a cooldown between messages
                  </div>
                </div>
              </div>
              <select
                value={slowMode}
                onChange={(e) => setSlowMode(Number(e.target.value))}
                className="bg-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="0">Off</option>
                <option value="5">5 seconds</option>
                <option value="10">10 seconds</option>
                <option value="30">30 seconds</option>
                <option value="60">1 minute</option>
                <option value="300">5 minutes</option>
                <option value="3600">1 hour</option>
              </select>
            </div>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isNsfw}
                onChange={(e) => setIsNsfw(e.target.checked)}
                className="rounded border-gray-600 text-indigo-500 focus:ring-indigo-500"
              />
              <span className="text-gray-300">Age-restricted channel (NSFW)</span>
            </label>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}