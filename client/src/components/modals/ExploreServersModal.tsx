import { useState, useEffect } from 'react';
import { X, Search, Users } from 'lucide-react';
import api from '../../config/api';
import type { IServer } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onServerJoin: (server: IServer) => void;
}

export default function ExploreServersModal({ isOpen, onClose, onServerJoin }: Props) {
  const [servers, setServers] = useState<IServer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchPublicServers();
    }
  }, [isOpen]);

  const fetchPublicServers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data } = await api.get('/api/servers/public');
      setServers(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch servers';
      setError(errorMessage);
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
      const errorMessage = error instanceof Error ? error.message : 'Failed to join server';
      setError(errorMessage);
    }
  };

  const filteredServers = servers.filter(server => 
    server.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-2xl mx-4">
        <div className="p-4 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Explore Public Servers</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search servers..."
              className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-400">
              {error}
            </div>
          ) : filteredServers.length > 0 ? (
            <div className="grid gap-4">
              {filteredServers.map((server) => (
                <div 
                  key={server._id}
                  className="flex items-center p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center">
                    {server.icon ? (
                      <img 
                        src={server.icon} 
                        alt={server.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-bold text-white">
                        {server.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  
                  <div className="ml-4 flex-1">
                    <h3 className="text-white font-medium">{server.name}</h3>
                    {server.description && (
                      <p className="text-sm text-gray-400">{server.description}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-gray-400">
                      <Users className="w-4 h-4 mr-1" />
                      <span>{server.members.length}</span>
                    </div>
                    <button
                      onClick={() => handleJoinServer(server._id)}
                      className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md transition-colors"
                    >
                      Join
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              No servers found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}