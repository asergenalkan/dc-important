import { useState } from 'react';
import { X, Trash2, AlertCircle } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import api from '../../config/api';
import type { IServer } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  server: IServer;
  onServerUpdate: (server: IServer) => void;
  onServerDelete: () => void;
}

export default function ServerSettingsModal({ 
  isOpen, 
  onClose, 
  server, 
  onServerUpdate,
  onServerDelete 
}: Props) {
  const { user } = useUser();
  const [name, setName] = useState(server.name);
  const [description, setDescription] = useState(server.description || '');
  const [icon, setIcon] = useState(server.icon || '');
  const [isPublic, setIsPublic] = useState(server.isPublic || false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isOwner = server.ownerId === user?.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) return;

    try {
      setIsLoading(true);
      setError(null);

      const { data } = await api.patch(`/api/servers/${server._id}`, {
        name,
        description,
        icon,
        isPublic
      });

      onServerUpdate(data);
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update server';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isOwner) return;

    try {
      setIsLoading(true);
      setError(null);

      await api.delete(`/api/servers/${server._id}`);
      onServerDelete();
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete server';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Server Settings</h2>
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
                Server Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter server name"
                required
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
                placeholder="Enter server description"
                rows={3}
                disabled={!isOwner}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Server Icon URL
              </label>
              <input
                type="url"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter icon URL"
                disabled={!isOwner}
              />
            </div>

            {isOwner && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="rounded border-gray-600 text-indigo-500 focus:ring-indigo-500"
                />
                <label htmlFor="isPublic" className="ml-2 text-sm text-gray-300">
                  Make server public
                </label>
              </div>
            )}

            {isOwner ? (
              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center"
                  disabled={isLoading}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Server
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            )}
          </form>
        </div>

        {showDeleteConfirm && (
          <div className="p-6 border-t border-gray-700">
            <h3 className="text-lg font-medium text-white mb-4">Delete Server</h3>
            <p className="text-gray-300 mb-4">
              Are you sure you want to delete this server? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : 'Delete Server'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}