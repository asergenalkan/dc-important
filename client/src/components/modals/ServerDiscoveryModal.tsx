import { useState, useEffect } from 'react';
import { X, Search, Users, Globe, AlertCircle } from 'lucide-react';
import api from '../../config/api';
import type { IServer } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onServerJoin: (server: IServer) => void;
}

const CATEGORIES = [
  { id: 'gaming', name: 'Gaming', icon: '🎮' },
  { id: 'music', name: 'Music', icon: '🎵' },
  { id: 'education', name: 'Education', icon: '📚' },
  { id: 'technology', name: 'Technology', icon: '💻' },
  { id: 'art', name: 'Art & Design', icon: '🎨' },
  { id: 'science', name: 'Science', icon: '🔬' },
  { id: 'sports', name: 'Sports', icon: '⚽' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬' },
];

export default function ServerDiscoveryModal({ isOpen, onClose, onServerJoin }: Props) {
  const [servers, setServers] = useState<IServer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchServers();
    }
  }, [isOpen, searchQuery, selectedCategory]);

  const fetchServers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (searchQuery) params.append('query', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);

      const { data } = await api.get(`/api/servers/discover?${params}`);
      setServers(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch servers';
      setError(message);
      setServers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinServer = async (serverId: string) => {
    try {
      setError(null);
      const { data } = await api.post(`/api/servers/${serverId}/join`);
      onServerJoin(data);
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to join server';
      setError(message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              <Globe className="w-6 h-6 text-indigo-400" />
              <h2 className="text-2xl font-bold text-white">Discover Servers</h2>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search servers..."
                className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center text-red-500">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : servers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {servers.map((server) => (
                <div
                  key={server._id}
                  className="bg-gray-700 rounded-lg overflow-hidden hover:bg-gray-600 transition-colors"
                >
                  {server.icon && (
                    <img
                      src={server.icon}
                      alt={server.name}
                      className="w-full h-32 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {server.name}
                    </h3>
                    {server.description && (
                      <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                        {server.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-400 text-sm">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{server.members.length} members</span>
                      </div>
                      <button
                        onClick={() => handleJoinServer(server._id)}
                        className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors text-sm"
                      >
                        Join Server
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Globe className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">
                {searchQuery || selectedCategory
                  ? 'No servers found matching your criteria'
                  : 'No public servers available'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}