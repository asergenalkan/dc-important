import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { UserPlus2, Search, MessageSquare, MoreVertical, UserMinus } from 'lucide-react';
import api from '../../config/api';
import type { IUser } from '../../types';

export default function FriendList() {
  const { user } = useUser();
  const [friends, setFriends] = useState<IUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/api/friends');
      setFriends(data);
    } catch (error) {
      console.error('Failed to fetch friends:', error);
      setError('Failed to load friends');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    try {
      await api.delete(`/api/friends/${friendId}`);
      setFriends(prev => prev.filter(friend => friend.id !== friendId));
    } catch (error) {
      console.error('Failed to remove friend:', error);
    }
  };

  const filteredFriends = friends.filter(friend =>
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 bg-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Friends</h2>
          <button className="p-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors text-white flex items-center space-x-2">
            <UserPlus2 className="w-5 h-5" />
            <span>Add Friend</span>
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search friends..."
            className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Friend List */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-400">{error}</div>
        ) : filteredFriends.length > 0 ? (
          <div className="space-y-2">
            {filteredFriends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-700 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                      {friend.imageUrl ? (
                        <img
                          src={friend.imageUrl}
                          alt={friend.username}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-medium">
                          {friend.username.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-800 ${
                      friend.status === 'online' ? 'bg-green-500' :
                      friend.status === 'idle' ? 'bg-yellow-500' :
                      friend.status === 'dnd' ? 'bg-red-500' :
                      'bg-gray-500'
                    }`} />
                  </div>
                  <div>
                    <div className="font-medium text-white">{friend.username}</div>
                    <div className="text-sm text-gray-400">
                      {friend.status === 'online' ? 'Online' :
                       friend.status === 'idle' ? 'Idle' :
                       friend.status === 'dnd' ? 'Do Not Disturb' :
                       'Offline'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 hover:bg-gray-600 rounded-lg transition-colors text-gray-400 hover:text-white">
                    <MessageSquare className="w-5 h-5" />
                  </button>
                  <div className="relative group/menu">
                    <button className="p-2 hover:bg-gray-600 rounded-lg transition-colors text-gray-400 hover:text-white">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    <div className="absolute right-0 mt-2 w-48 py-2 bg-gray-900 rounded-lg shadow-lg opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all">
                      <button
                        onClick={() => handleRemoveFriend(friend.id)}
                        className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-800 flex items-center space-x-2"
                      >
                        <UserMinus className="w-4 h-4" />
                        <span>Remove Friend</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-4">
              <UserPlus2 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">
              No friends found
            </h3>
            <p className="text-gray-400">
              Add some friends to get started!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}