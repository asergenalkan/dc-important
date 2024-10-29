import { useState, useEffect } from 'react';
import { Hash, Volume2, Plus, Settings, Loader2 } from 'lucide-react';
import type { IChannel } from '../../types';
import CreateChannelModal from '../modals/CreateChannelModal';
import api from '../../config/api';

interface Props {
  serverId: string;
  onChannelSelect: (channelId: string, type: 'text' | 'voice') => void;
  selectedChannel?: string;
}

export default function ChannelList({
  serverId,
  onChannelSelect,
  selectedChannel,
}: Props) {
  const [channels, setChannels] = useState<IChannel[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (serverId) {
      fetchChannels();
    }
  }, [serverId]);

  const fetchChannels = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data } = await api.get(`/api/channels/server/${serverId}`);
      setChannels(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch channels:', error);
      setError('Failed to load channels');
      setChannels([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateChannel = async (data: {
    name: string;
    type: 'text' | 'voice' | 'docs' | 'calendar' | 'tasks' | 'polls';
    metadata?: any;
  }) => {
    try {
      setError(null);
      await api.post('/api/channels', {
        ...data,
        serverId,
      });
      fetchChannels();
      setIsCreateModalOpen(false);
    } catch (error: any) {
      console.error('Failed to create channel:', error);
      setError(error.response?.data?.error || 'Failed to create channel');
    }
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'voice':
        return <Volume2 className="w-5 h-5" />;
      case 'text':
      default:
        return <Hash className="w-5 h-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="w-60 bg-[#2B2D31] p-4 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-60 bg-[#2B2D31] flex flex-col">
      <div className="p-4 border-b border-[#1E1F22]">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Channels</h2>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="p-1 hover:bg-[#35373C] rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5 text-gray-400 hover:text-white" />
          </button>
        </div>

        {error && (
          <div className="mt-2 p-2 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {channels.length > 0 ? (
          <div className="space-y-1">
            {/* Text Channels */}
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase px-2 mb-2">
                Text Channels
              </h3>
              {channels
                .filter((channel) => channel.type === 'text')
                .map((channel) => (
                  <div
                    key={channel._id}
                    onClick={() => onChannelSelect(channel._id, 'text')}
                    className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedChannel === channel._id
                        ? 'bg-[#35373C] text-white'
                        : 'text-gray-400 hover:bg-[#35373C] hover:text-white'
                    }`}
                  >
                    <Hash className="w-5 h-5" />
                    <span className="truncate">{channel.name}</span>
                  </div>
                ))}
            </div>

            {/* Voice Channels */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase px-2 mb-2">
                Voice Channels
              </h3>
              {channels
                .filter((channel) => channel.type === 'voice')
                .map((channel) => (
                  <div
                    key={channel._id}
                    onClick={() => onChannelSelect(channel._id, 'voice')}
                    className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedChannel === channel._id
                        ? 'bg-[#35373C] text-white'
                        : 'text-gray-400 hover:bg-[#35373C] hover:text-white'
                    }`}
                  >
                    <Volume2 className="w-5 h-5" />
                    <span className="truncate">{channel.name}</span>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-400">
            {error ? 'Failed to load channels' : 'No channels yet'}
          </div>
        )}
      </div>

      <CreateChannelModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={(data: {
          name: string;
          type: 'text' | 'voice' | 'docs' | 'calendar' | 'tasks' | 'polls';
          metadata?: any;
        }) => handleCreateChannel(data)}
      />
    </div>
  );
}
