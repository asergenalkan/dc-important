import { useEffect, useState } from 'react';
import { Hash, Volume2, Plus, Settings, Users } from 'lucide-react';
import type { IChannel, IServer } from '../../types';
import CreateChannelModal from './modals/CreateChannelModal';

interface Props {
  serverId: string;
  onChannelSelect: (channelId: string) => void;
  selectedChannel?: string;
}

export default function ChannelList({ serverId, onChannelSelect, selectedChannel }: Props) {
  const [channels, setChannels] = useState<IChannel[]>([]);
  const [server, setServer] = useState<IServer | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (serverId) {
      fetchServerDetails();
      fetchChannels();
    }
  }, [serverId]);

  const fetchServerDetails = async () => {
    try {
      const response = await fetch(`/api/servers/${serverId}`);
      const data = await response.json();
      setServer(data);
    } catch (error) {
      console.error('Failed to fetch server details:', error);
    }
  };

  const fetchChannels = async () => {
    try {
      const response = await fetch(`/api/channels/server/${serverId}`);
      const data = await response.json();
      setChannels(data);
    } catch (error) {
      console.error('Failed to fetch channels:', error);
    }
  };

  const handleCreateChannel = async (data: { name: string; type: 'text' | 'voice' }) => {
    try {
      const response = await fetch('/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, serverId }),
      });
      
      if (response.ok) {
        fetchChannels();
        setIsCreateModalOpen(false);
      }
    } catch (error) {
      console.error('Failed to create channel:', error);
    }
  };

  return (
    <>
      <div className="w-60 bg-gray-800 flex flex-col">
        {/* Server Header */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white truncate">
            {server?.name || 'Loading...'}
          </h2>
          <div className="flex items-center space-x-2">
            <button className="p-1 hover:bg-gray-700 rounded-lg transition-colors">
              <Users className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
            <button className="p-1 hover:bg-gray-700 rounded-lg transition-colors">
              <Settings className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
          </div>
        </div>

        {/* Channel List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Text Channels */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-400 uppercase">Text Channels</span>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4 text-gray-400 hover:text-white" />
              </button>
            </div>
            {channels
              .filter(channel => channel.type === 'text')
              .map((channel) => (
                <div
                  key={channel._id}
                  onClick={() => onChannelSelect(channel._id)}
                  className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors
                    ${selectedChannel === channel._id 
                      ? 'bg-gray-700 text-white' 
                      : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
                >
                  <Hash className="w-5 h-5" />
                  <span className="truncate">{channel.name}</span>
                </div>
              ))}
          </div>

          {/* Voice Channels */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-400 uppercase">Voice Channels</span>
            </div>
            {channels
              .filter(channel => channel.type === 'voice')
              .map((channel) => (
                <div
                  key={channel._id}
                  className="flex items-center space-x-2 p-2 rounded-lg cursor-pointer text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                >
                  <Volume2 className="w-5 h-5" />
                  <span className="truncate">{channel.name}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      <CreateChannelModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateChannel}
      />
    </>
  );
}