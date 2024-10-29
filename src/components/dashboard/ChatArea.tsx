import { useEffect, useState, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Send, Plus, Smile, Hash } from 'lucide-react';
import type { IMessage, IChannel } from '../../types';
import MemberList from './MemberList';

interface Props {
  channelId: string;
}

export default function ChatArea({ channelId }: Props) {
  const { user } = useUser();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [channel, setChannel] = useState<IChannel | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showMembers, setShowMembers] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (channelId) {
      fetchChannelDetails();
      fetchMessages();
    }
  }, [channelId]);

  const fetchChannelDetails = async () => {
    try {
      const response = await fetch(`/api/channels/${channelId}`);
      const data = await response.json();
      setChannel(data);
    } catch (error) {
      console.error('Failed to fetch channel details:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/messages/channel/${channelId}`);
      const data = await response.json();
      setMessages(data);
      scrollToBottom();
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newMessage,
          channelId,
        }),
      });

      if (response.ok) {
        setNewMessage('');
        fetchMessages();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="flex-1 flex">
      <div className="flex-1 flex flex-col bg-gray-700">
        {/* Channel Header */}
        <div className="h-12 bg-gray-800 flex items-center justify-between px-4 border-b border-gray-900">
          <div className="flex items-center space-x-2">
            <Hash className="w-5 h-5 text-gray-400" />
            <h2 className="text-white font-medium">{channel?.name}</h2>
          </div>
          <button
            onClick={() => setShowMembers(!showMembers)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {showMembers ? 'Hide Members' : 'Show Members'}
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message._id} className="flex items-start space-x-3 hover:bg-gray-600/30 p-2 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold">
                  {message.userId.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline space-x-2">
                  <span className="font-semibold text-white">
                    {message.userId === user?.id ? 'You' : 'User'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(message.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-100 break-words">{message.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="p-4 bg-gray-800">
          <div className="flex items-center space-x-2 bg-gray-700 rounded-lg p-2">
            <button
              type="button"
              className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5 text-gray-400" />
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Message #${channel?.name || 'loading'}`}
              className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none"
            />
            <button
              type="button"
              className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <Smile className="w-5 h-5 text-gray-400" />
            </button>
            <button
              type="submit"
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

      {/* Member List */}
      {showMembers && channel && <MemberList serverId={channel.serverId} />}
    </div>
  );
}