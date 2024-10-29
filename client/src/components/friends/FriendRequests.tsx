import { useState, useEffect } from 'react';
import { UserPlus2, UserMinus, Check } from 'lucide-react';
import api from '../../config/api';

interface FriendRequest {
  id: string;
  userId: string;
  username: string;
  imageUrl?: string;
  createdAt: string;
}

export default function FriendRequests() {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/api/friends/requests');
      setRequests(data);
    } catch (error) {
      console.error('Failed to fetch friend requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (userId: string) => {
    try {
      await api.patch(`/api/friends/request/${userId}`, {
        action: 'accept'
      });
      setRequests(prev => prev.filter(req => req.userId !== userId));
    } catch (error) {
      console.error('Failed to accept friend request:', error);
    }
  };

  const handleReject = async (userId: string) => {
    try {
      await api.patch(`/api/friends/request/${userId}`, {
        action: 'reject'
      });
      setRequests(prev => prev.filter(req => req.userId !== userId));
    } catch (error) {
      console.error('Failed to reject friend request:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-4">
          <UserPlus2 className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-medium text-white mb-2">
          No pending requests
        </h3>
        <p className="text-gray-400">
          When someone adds you as a friend, you'll see it here!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-4">
      {requests.map((request) => (
        <div
          key={request.id}
          className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
              {request.imageUrl ? (
                <img
                  src={request.imageUrl}
                  alt={request.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-medium">
                  {request.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <div className="font-medium text-white">{request.username}</div>
              <div className="text-sm text-gray-400">
                Incoming Friend Request
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleAccept(request.userId)}
              className="p-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors text-white"
              title="Accept"
            >
              <Check className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleReject(request.userId)}
              className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors text-white"
              title="Reject"
            >
              <UserMinus className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}