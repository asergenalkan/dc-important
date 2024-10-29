import { useEffect, useState, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Send } from 'lucide-react';
import type { IMessage } from '../types';

interface Props {
  channelId: string;
}

export default function ChatArea({ channelId }: Props) {
  const { user } = useUser();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (channelId) {
      fetchMessages();
    }
  }, [channelId]);

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
    <div className="flex-1 bg-gray-700 flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message._id} className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
              <span className="text-white font-semibold">
                {message.userId.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="font-semibold text-white">
                  {message.userId === user?.id ? 'You' : 'User'}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(message.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-gray-100">{message.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-600">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="bg-indigo-500 text-white p-2 rounded-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}