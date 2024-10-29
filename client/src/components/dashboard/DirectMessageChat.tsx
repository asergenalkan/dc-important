import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Send } from 'lucide-react';
import api from '../../config/api';
import { useSocket } from '../../hooks/useSocket';
import type { IDirectMessage, IUser } from '../../types';

interface Props {
  userId: string;
}

export default function DirectMessageChat({ userId }: Props) {
  const { user } = useUser();
  const socket = useSocket();
  const [messages, setMessages] = useState<IDirectMessage[]>([]);
  const [recipient, setRecipient] = useState<IUser | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    fetchRecipientDetails();
    markMessagesAsRead();

    if (socket) {
      const roomId = [user?.id, userId].sort().join('-');
      socket.emit('join_room', roomId);

      socket.on('new_direct_message', (message: IDirectMessage) => {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
        if (message.senderId === userId) {
          markMessagesAsRead();
        }
      });

      return () => {
        socket.emit('leave_room', roomId);
        socket.off('new_direct_message');
      };
    }
  }, [userId, socket]);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get(`/api/direct-messages/conversation/${userId}`);
      setMessages(data);
      scrollToBottom();
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecipientDetails = async () => {
    try {
      const { data } = await api.get(`/api/users/${userId}`);
      setRecipient(data);
    } catch (error) {
      console.error('Failed to fetch recipient details:', error);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      await api.patch(`/api/direct-messages/read/${userId}`);
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await api.post('/api/direct-messages', {
        content: newMessage,
        receiverId: userId,
      });
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex-1 bg-[#313338] flex flex-col">
      {/* Header */}
      <div className="h-12 px-4 border-b border-[#1E1F22] flex items-center">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-[#1E1F22] flex items-center justify-center">
            {recipient?.imageUrl ? (
              <img
                src={recipient.imageUrl}
                alt={recipient.username}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-white text-sm font-medium">
                {recipient?.username.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <span className="ml-2 font-medium text-white">
            {recipient?.username}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : messages.length > 0 ? (
          messages.map((message) => (
            <div
              key={message._id}
              className={`flex items-start space-x-3 ${
                message.senderId === user?.id ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-[#1E1F22] flex-shrink-0 flex items-center justify-center">
                {message.senderId === user?.id ? (
                  user.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt={user.username || ''}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-sm font-medium">
                      {user.username?.charAt(0).toUpperCase()}
                    </span>
                  )
                ) : recipient?.imageUrl ? (
                  <img
                    src={recipient.imageUrl}
                    alt={recipient.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white text-sm font-medium">
                    {recipient?.username.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className={`flex flex-col ${message.senderId === user?.id ? 'items-end' : ''}`}>
                <div className="flex items-baseline space-x-2">
                  <span className="font-medium text-white">
                    {message.senderId === user?.id ? 'You' : recipient?.username}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(message.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className={`mt-1 px-4 py-2 rounded-lg ${
                  message.senderId === user?.id
                    ? 'bg-indigo-500 text-white'
                    : 'bg-[#2B2D31] text-gray-100'
                }`}>
                  {message.content}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">
              No messages yet. Start the conversation!
            </p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-[#1E1F22]">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message @${recipient?.username}`}
            className="flex-1 bg-[#383A40] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
            disabled={!newMessage.trim()}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}