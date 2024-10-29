import { useEffect, useState } from 'react';
import { Hash, Volume2 } from 'lucide-react';
import type { IChannel } from '../types';

interface Props {
  serverId: string;
}

export default function ChannelList({ serverId }: Props) {
  const [channels, setChannels] = useState<IChannel[]>([]);

  useEffect(() => {
    if (serverId) {
      fetchChannels();
    }
  }, [serverId]);

  const fetchChannels = async () => {
    try {
      const response = await fetch(`/api/channels/server/${serverId}`);
      const data = await response.json();
      setChannels(data);
    } catch (error) {
      console.error('Failed to fetch channels:', error);
    }
  };

  return (
    <div className="w-60 bg-gray-800 p-4">
      <h2 className="text-lg font-semibold mb-4 text-white">Channels</h2>
      <div className="space-y-2">
        {channels.map((channel) => (
          <div
            key={channel._id}
            className="flex items-center space-x-2 text-gray-300 hover:text-white hover:bg-gray-700 px-2 py-1 rounded cursor-pointer"
          >
            {channel.type === 'text' ? (
              <Hash className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
            <span>{channel.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}