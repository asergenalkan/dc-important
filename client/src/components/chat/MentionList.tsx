import { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import type { IUser } from '../../types';
import api from '../../config/api';

interface Props {
  query: string;
  onSelect: (user: IUser) => void;
  serverId?: string;
}

export default function MentionList({ query, onSelect, serverId }: Props) {
  const [users, setUsers] = useState<IUser[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (query) {
      fetchUsers();
    }
  }, [query]);

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      params.append('query', query);
      if (serverId) params.append('serverId', serverId);

      const { data } = await api.get(`/api/users/search?${params}`);
      setUsers(data);
      setSelectedIndex(0);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % users.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + users.length) % users.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (users[selectedIndex]) {
          onSelect(users[selectedIndex]);
        }
        break;
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [users, selectedIndex]);

  if (!users.length) return null;

  return (
    <div className="absolute bottom-full mb-2 bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="max-h-48 overflow-y-auto">
        {users.map((user, index) => (
          <button
            key={user.id}
            onClick={() => onSelect(user)}
            className={`w-full flex items-center px-4 py-2 hover:bg-gray-700 transition-colors ${
              index === selectedIndex ? 'bg-gray-700' : ''
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center mr-2">
              {user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <span className="text-white">{user.username}</span>
          </button>
        ))}
      </div>
    </div>
  );
}