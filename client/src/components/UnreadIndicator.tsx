import { useEffect, useState } from 'react';
import api from '../config/api';

interface Props {
  channelId: string;
  serverId: string;
}

export default function UnreadIndicator({ channelId, serverId }: Props) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasMention, setHasMention] = useState(false);

  useEffect(() => {
    fetchUnreadState();
  }, [channelId]);

  const fetchUnreadState = async () => {
    try {
      const { data } = await api.get(`/api/notifications/unread/server/${serverId}`);
      const channelState = data.find((state: any) => state.channelId === channelId);
      
      if (channelState) {
        setUnreadCount(channelState.unreadCount);
        setHasMention(channelState.mentionCount > 0);
      }
    } catch (error) {
      console.error('Failed to fetch unread state:', error);
    }
  };

  if (unreadCount === 0 && !hasMention) return null;

  return (
    <div className="flex items-center space-x-2">
      <div className="w-2 h-2 rounded-full bg-white"></div>
      {hasMention && (
        <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
          @
        </span>
      )}
    </div>
  );
}