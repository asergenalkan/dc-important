import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { MessageSquare, Mic, Gamepad, UserPlus, Server } from 'lucide-react';
import api from '../../config/api';
import type { IActivity } from '../../types';

export default function ActivityFeed() {
  const { user } = useUser();
  const [activities, setActivities] = useState<IActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get<IActivity[]>('/api/activity/feed');
      setActivities(data);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderActivityIcon = (type: IActivity['type']) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="w-5 h-5 text-blue-400" />;
      case 'voice':
        return <Mic className="w-5 h-5 text-green-400" />;
      case 'game':
        return <Gamepad className="w-5 h-5 text-purple-400" />;
      case 'friend':
        return <UserPlus className="w-5 h-5 text-pink-400" />;
      case 'server_join':
        return <Server className="w-5 h-5 text-yellow-400" />;
      default:
        return null;
    }
  };

  const renderActivityContent = (activity: IActivity): string => {
    switch (activity.type) {
      case 'message':
        return `sent a message in ${activity.data.serverId?.name || 'Unknown Server'}`;
      case 'voice':
        return `joined voice chat in ${activity.data.serverId?.name || 'Unknown Server'}`;
      case 'game':
        return `started playing ${activity.data.game?.name || 'Unknown Game'}`;
      case 'friend':
        return `became friends with ${activity.data.friendId || 'Unknown User'}`;
      case 'server_join':
        return `joined ${activity.data.serverId?.name || 'Unknown Server'}`;
      default:
        return 'performed an unknown action';
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ago`;
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else if (minutes > 0) {
      return `${minutes}m ago`;
    } else {
      return 'just now';
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
    <div className="space-y-4 p-4">
      {activities.map((activity) => (
        <div
          key={activity._id}
          className="flex items-start space-x-3 p-3 bg-gray-800 rounded-lg"
        >
          <div className="p-2 bg-gray-700 rounded-lg">
            {renderActivityIcon(activity.type)}
          </div>
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="font-medium text-white">
                {activity.userId === user?.id ? 'You' : 'A friend'}
              </span>
              <span className="text-gray-400">
                {renderActivityContent(activity)}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              {formatTimestamp(activity.createdAt)}
            </span>
          </div>
        </div>
      ))}

      {activities.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">
            No activity yet
          </h3>
          <p className="text-gray-400">
            Start chatting, joining voice channels, or playing games to see activity here!
          </p>
        </div>
      )}
    </div>
  );
}