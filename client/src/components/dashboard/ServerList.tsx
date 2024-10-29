import { useState, useEffect } from 'react';
import { Plus, MessageSquare } from 'lucide-react';
import type { IServer } from '../../types';
import CreateServerModal from '../modals/CreateServerModal';
import api from '../../config/api';

interface Props {
  onServerSelect: (serverId: string) => void;
  selectedServer?: string;
}

export default function ServerList({ onServerSelect, selectedServer }: Props) {
  const [servers, setServers] = useState<IServer[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchServers();
  }, []);

  const fetchServers = async () => {
    try {
      setError(null);
      const { data } = await api.get('/api/servers');
      setServers(data);
    } catch (error) {
      console.error('Failed to fetch servers:', error);
      setError('Failed to load servers');
    }
  };

  const handleCreateServer = async (data: { name: string; icon?: string }) => {
    try {
      setError(null);
      const response = await api.post('/api/servers', data);
      
      if (response.status === 201) {
        await fetchServers();
        setIsCreateModalOpen(false);
      }
    } catch (error: any) {
      console.error('Failed to create server:', error);
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Failed to create server');
      }
    }
  };

  return (
    <>
      <div className="w-20 bg-gray-900 p-3 flex flex-col items-center space-y-4">
        {/* Home Button */}
        <div 
          onClick={() => onServerSelect('')}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-200
            ${!selectedServer ? 'bg-indigo-500' : 'bg-gray-800 hover:bg-indigo-500'}`}
        >
          <MessageSquare className="w-6 h-6 text-white" />
        </div>

        <div className="w-12 h-0.5 bg-gray-800 rounded-full" />

        {/* Server List */}
        <div className="flex-1 w-full flex flex-col items-center space-y-4 overflow-y-auto">
          {error ? (
            <div className="text-red-400 text-xs text-center px-2">
              {error}
            </div>
          ) : (
            servers.map((server) => (
              <div
                key={server._id}
                onClick={() => onServerSelect(server._id)}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-200 group relative
                  ${selectedServer === server._id 
                    ? 'bg-indigo-500' 
                    : 'bg-gray-800 hover:bg-indigo-500'}`}
              >
                {server.icon ? (
                  <img
                    src={server.icon}
                    alt={server.name}
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                ) : (
                  <span className="text-white font-semibold">
                    {server.name.charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="absolute left-0 -translate-x-full top-1/2 -translate-y-1/2 px-2 py-1 bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                  <span className="text-white text-sm whitespace-nowrap">{server.name}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Server Button */}
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="w-12 h-12 rounded-2xl bg-gray-800 flex items-center justify-center hover:bg-green-500 transition-colors group relative"
        >
          <Plus className="w-6 h-6 text-green-500 group-hover:text-white" />
          <div className="absolute left-0 -translate-x-full top-1/2 -translate-y-1/2 px-2 py-1 bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity ml-4">
            <span className="text-white text-sm whitespace-nowrap">Add a Server</span>
          </div>
        </button>
      </div>

      <CreateServerModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateServer}
      />
    </>
  );
}