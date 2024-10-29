import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import api from '../../config/api';
import type { IServer } from '../../types';

interface Props {
  onServerJoin: (server: IServer) => void;
}

export default function ServerDiscoverySection({ onServerJoin }: Props) {
  const [featuredServers, setFeaturedServers] = useState<IServer[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchFeaturedServers();
  }, []);

  const fetchFeaturedServers = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/api/servers/featured');
      setFeaturedServers(data);
    } catch (error) {
      console.error('Failed to fetch featured servers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Featured Communities</h2>
        <button className="text-indigo-400 hover:text-indigo-300 flex items-center">
          See All
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {featuredServers.map((server) => (
          <div
            key={server._id}
            className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-colors"
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
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {server.description}
                </p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {server.memberCount} members
                </span>
                <button
                  onClick={() => onServerJoin(server)}
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors text-sm"
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}