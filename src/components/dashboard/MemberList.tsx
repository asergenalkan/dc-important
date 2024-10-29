import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Crown } from 'lucide-react';
import type { IServer } from '../../types';

interface Props {
  serverId: string;
}

export default function MemberList({ serverId }: Props) {
  const { user } = useUser();
  const [server, setServer] = useState<IServer | null>(null);
  const [onlineUsers] = useState<string[]>([]); // In a real app, this would be managed by Socket.IO

  useEffect(() => {
    fetchServerDetails();
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

  const isOnline = (userId: string) => onlineUsers.includes(userId);
  const isOwner = (userId: string) => server?.ownerId === userId;

  return (
    <div className="w-60 bg-gray-800 p-4">
      <h3 className="text-xs font-semibold text-gray-400 uppercase mb-4">
        Members — {server?.members.length || 0}
      </h3>

      <div className="space-y-2">
        {server?.members.map((memberId) => (
          <div
            key={memberId}
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                <span className="text-white font-medium">
                  {memberId === user?.id ? user.username?.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-800 
                ${isOnline(memberId) ? 'bg-green-500' : 'bg-gray-500'}`}>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-white truncate">
                  {memberId === user?.id ? user.username : 'User'}
                </span>
                {isOwner(memberId) && (
                  <Crown className="w-4 h-4 text-yellow-500" />
                )}
              </div>
              <span className="text-xs text-gray-400">
                {isOnline(memberId) ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}