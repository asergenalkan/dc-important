import { useEffect, useState, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { ArrowDown, Loader2 } from 'lucide-react';
import Message from './Message';
import MessageEditor from './MessageEditor';
import api from '../../config/api';
import type { IMessage } from '../../types';

interface Props {
  channelId: string;
}

export default function ChatArea({ channelId }: Props) {
  const { user } = useUser();
  const [messages, setMessages] = useState<IMessage[]>([]);
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

      const { data } = await api.get(`/api/messages/channel/${channelId}`);
      
      let messageList: IMessage[] = [];
      if (data) {
        if (data.messages) {
          messageList = Array.isArray(data.messages) ? data.messages : [];
        } else if (Array.isArray(data)) {
          messageList = data;
        }
      }

      messageList.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      setMessages(messageList);

      if (data?.lastReadMessageId) {
        setLastReadMessageId(data.lastReadMessageId);
        const lastReadIndex = messageList.findIndex(m => m._id === data.lastReadMessageId);
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

  const handleSendMessage = async (content: string, attachments?: File[]) => {
    try {
      let uploadedFiles: string[] = [];

      if (attachments?.length) {
        const formData = new FormData();
        attachments.forEach(file => formData.append('files', file));
        
        const uploadResponse = await api.post('/api/uploads', formData);
        uploadedFiles = uploadResponse.data.urls;
      }

      const response = await api.post('/api/messages', {
        content,
        channelId,
        attachments: uploadedFiles
      });

      if (response.data) {
        setMessages(prev => [...prev, response.data]);
        scrollToBottom();
        markMessagesAsRead();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleEditMessage = async (messageId: string, content: string) => {
    try {
      const response = await api.patch(`/api/messages/${messageId}`, { content });
      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? response.data : msg
      ));
    } catch (error) {
      console.error('Failed to edit message:', error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await api.delete(`/api/messages/${messageId}`);
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const handleReactToMessage = async (messageId: string, emoji: string) => {
    try {
      const response = await api.post(`/api/messages/${messageId}/reactions`, {
        emoji
      });
      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? response.data : msg
      ));
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-900 flex flex-col">
      <div 
        ref={messageContainerRef}
        className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
      >
        <div className="py-4">
          {error ? (
            <div className="text-center py-4 text-red-400">
              {error}
            </div>
          ) : messages.length > 0 ? (
            messages.map((message, index) => {
              const isFirstUnread = message._id === lastReadMessageId;
              
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
                  <Message
                    message={message}
                    onEdit={handleEditMessage}
                    onDelete={handleDeleteMessage}
                    onReact={handleReactToMessage}
                  />
                </div>
              );
            })
          ) : (
            <div className="text-center py-4 text-gray-400">
              No messages yet
            </div>
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

      <div className="p-4 border-t border-gray-800">
        <MessageEditor
          placeholder="Type a message..."
          onSubmit={handleSendMessage}
        />
      </div>
    </div>
  );
}