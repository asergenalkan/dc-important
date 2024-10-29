import { useState, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Image, Upload, Trash2, Save, AlertCircle } from 'lucide-react';
import type { IServer } from '../../types';
import api from '../../config/api';

interface Props {
  server: IServer;
  onUpdate: (server: IServer) => void;
}

export default function ServerSettings({ server, onUpdate }: Props) {
  const { user } = useUser();
  const [name, setName] = useState(server.name);
  const [description, setDescription] = useState(server.description || '');
  const [icon, setIcon] = useState(server.icon || '');
  const [banner, setBanner] = useState(server.banner || '');
  const [welcomeMessage, setWelcomeMessage] = useState(server.welcomeMessage || '');
  const [isPublic, setIsPublic] = useState(server.isPublic || false);
  const [tags, setTags] = useState<string[]>(server.tags || []);
  const [newTag, setNewTag] = useState('');
  const [theme, setTheme] = useState(server.theme || {
    primaryColor: '#7289DA',
    accentColor: '#5865F2'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOwner = server.ownerId === user?.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) return;

    try {
      setIsLoading(true);
      setError(null);

      const { data } = await api.patch(`/api/servers/${server._id}/settings`, {
        name: name.trim(),
        description: description.trim(),
        icon,
        banner,
        welcomeMessage: welcomeMessage.trim(),
        isPublic,
        tags,
        theme
      });

      onUpdate(data);
    } catch (error) {
      setError('Failed to update server settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center text-red-500">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      <div>
        <h3 className="text-lg font-medium text-white mb-4">Server Overview</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Server Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter server name"
              disabled={!isOwner}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Tell us about your server"
              rows={3}
              disabled={!isOwner}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-4">Server Identity</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Server Icon
            </label>
            <div className="relative">
              <Image className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="url"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter icon URL"
                disabled={!isOwner}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Server Banner
            </label>
            <div className="relative">
              <Image className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="url"
                value={banner}
                onChange={(e) => setBanner(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter banner URL"
                disabled={!isOwner}
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-4">Discovery Settings</h3>
        <div className="space-y-4">
          {isOwner && (
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="rounded border-gray-600 text-indigo-500 focus:ring-indigo-500"
              />
              <span className="text-gray-300">Make server public</span>
            </label>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Server Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-700 text-gray-300 rounded-lg text-sm flex items-center space-x-1"
                >
                  <span>{tag}</span>
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="w-4 h-4 hover:text-red-500 transition-colors"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>
            {isOwner && (
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Add tag"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Add
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-4">Welcome Message</h3>
        <textarea
          value={welcomeMessage}
          onChange={(e) => setWelcomeMessage(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Welcome message for new members..."
          rows={4}
          disabled={!isOwner}
        />
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-4">Theme Settings</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Primary Color
            </label>
            <input
              type="color"
              value={theme.primaryColor}
              onChange={(e) => setTheme(prev => ({
                ...prev,
                primaryColor: e.target.value
              }))}
              className="w-full h-10 rounded-lg cursor-pointer"
              disabled={!isOwner}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Accent Color
            </label>
            <input
              type="color"
              value={theme.accentColor}
              onChange={(e) => setTheme(prev => ({
                ...prev,
                accentColor: e.target.value
              }))}
              className="w-full h-10 rounded-lg cursor-pointer"
              disabled={!isOwner}
            />
          </div>
        </div>
      </div>

      {isOwner && (
        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      )}
    </form>
  );
}