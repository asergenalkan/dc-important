import { useEffect, useState, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Send, ArrowDown, Loader2, Gift, PlusCircle, Smile } from 'lucide-react';
import api from '../../config/api';
import type { IMessage } from '../../types';

interface Props {
  channelId: string;
}

export default function ChatArea({ channelId }: Props) {
  const { user } = useUser();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [lastReadMessageId, setLastReadMessageId] = useState<string | null>(null);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (channelId) {
      fetchMessages();
    }
    return () => {
      setMessages([]);
      setLastReadMessageId(null);
      setHasUnreadMessages(false);
    };
  }, [channelId]);

  const fetchMessages = async () => {
    if (!channelId) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get(`/api/messages/channel/${channelId}`);
      
      let messageList: IMessage[] = [];
      if (response.data) {
        if (response.data.messages) {
          messageList = Array.isArray(response.data.messages) ? response.data.messages : [];
        } else if (Array.isArray(response.data)) {
          messageList = response.data;
        }
      }

      // Sort messages by creation date (oldest to newest)
      messageList.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      setMessages(messageList);

      if (response.data?.lastReadMessageId) {
        setLastReadMessageId(response.data.lastReadMessageId);
        const lastReadIndex = messageList.findIndex(m => m._id === response.data.lastReadMessageId);
        setHasUnreadMessages(lastReadIndex < messageList.length - 1);
      }

      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setError('Failed to load messages');
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const markMessagesAsRead = async () => {
    if (!messages.length || !channelId) return;
    
    try {
      await api.post(`/api/messages/read/${channelId}`, {
        messageId: messages[messages.length - 1]._id
      });
      setLastReadMessageId(messages[messages.length - 1]._id);
      setHasUnreadMessages(false);
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !channelId) return;

    try {
      const response = await api.post('/api/messages', {
        content: newMessage,
        channelId,
      });

      if (response.data) {
        setMessages(prev => [...prev, response.data]);
        setNewMessage('');
        scrollToBottom();
        markMessagesAsRead();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const renderMessages = () => {
    if (error) {
      return (
        <div className="text-center py-4 text-red-400">
          {error}
        </div>
      );
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return (
        <div className="text-center py-4 text-gray-400">
          No messages yet
        </div>
      );
    }

    return messages.map((message, index) => {
      if (!message || typeof message !== 'object') return null;

      const isFirstUnread = message._id === lastReadMessageId;
      const prevMessage = index > 0 ? messages[index - 1] : null;
      const isNewGroup = !prevMessage || 
        new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime() > 300000 ||
        message.userId !== prevMessage.userId;
      
      return (
        <div key={message._id}>
          {isFirstUnread && (
            <div className="flex items-center my-4 px-4">
              <div className="flex-1 h-0.5 bg-red-500/20"></div>
              <div className="px-4 py-1 bg-red-500/10 rounded-full border border-red-500/20">
                <span className="text-xs font-medium text-red-400">New Messages</span>
              </div>
              <div className="flex-1 h-0.5 bg-red-500/20"></div>
            </div>
          )}
          <div className={`hover:bg-gray-700/30 px-4 ${isNewGroup ? 'mt-4' : 'mt-0.5'}`}>
            {isNewGroup && (
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {message.userId?.charAt(0).toUpperCase() || '?'}
                  </span>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="font-medium text-white">
                    {message.userId === user?.id ? 'You' : 'User'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(message.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
            <div className={`pl-12 ${isNewGroup ? '' : 'hover:bg-gray-700/30'}`}>
              <p className="text-gray-100">{message.content}</p>
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="flex-1 bg-gray-700 flex flex-col">
      <div 
        ref={messageContainerRef}
        className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
      >
        <div className="py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
            </div>
          ) : (
            renderMessages()
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {hasUnreadMessages && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-20 right-8 px-4 py-2 bg-indigo-500 text-white rounded-full shadow-lg hover:bg-indigo-600 transition-colors flex items-center space-x-2"
        >
          <ArrowDown className="w-4 h-4" />
          <span>New Messages</span>
        </button>
      )}

      <div className="px-4 pb-6">
        <form onSubmit={handleSendMessage} className="relative">
          <div className="absolute left-4 bottom-3 flex items-center space-x-2">
            <button
              type="button"
              className="p-2 hover:bg-gray-600/50 rounded-full transition-colors text-gray-400 hover:text-gray-300"
            >
              <PlusCircle className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="p-2 hover:bg-gray-600/50 rounded-full transition-colors text-gray-400 hover:text-gray-300"
            >
              <Gift className="w-5 h-5" />
            </button>
          </div>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Send a message..."
            className="w-full bg-gray-600/50 text-white rounded-lg pl-24 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="absolute right-4 bottom-3">
            <button
              type="button"
              className="p-2 hover:bg-gray-600/50 rounded-full transition-colors text-gray-400 hover:text-gray-300"
            >
              <Smile className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}