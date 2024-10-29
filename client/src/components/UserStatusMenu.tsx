import { useState } from 'react';
import { Circle, Clock, MinusCircle, Moon } from 'lucide-react';
import type { UserStatus } from '../hooks/useUserStatus';

interface Props {
  currentStatus: UserStatus;
  customStatus?: string;
  onStatusChange: (status: UserStatus) => void;
  onCustomStatusChange: (status: string) => void;
}

export default function UserStatusMenu({ 
  currentStatus, 
  customStatus, 
  onStatusChange,
  onCustomStatusChange 
}: Props) {
  const [showCustomStatus, setShowCustomStatus] = useState(false);

  const statusOptions = [
    { id: 'online', label: 'Online', icon: Circle, color: 'text-green-500' },
    { id: 'idle', label: 'Idle', icon: Clock, color: 'text-yellow-500' },
    { id: 'dnd', label: 'Do Not Disturb', icon: MinusCircle, color: 'text-red-500' },
    { id: 'offline', label: 'Invisible', icon: Moon, color: 'text-gray-500' },
  ] as const;

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-2 w-64">
      {/* Status Options */}
      <div className="space-y-1">
        {statusOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => onStatusChange(option.id)}
            className={`w-full flex items-center px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors ${
              currentStatus === option.id ? 'bg-gray-700' : ''
            }`}
          >
            <option.icon className={`w-4 h-4 ${option.color} mr-3`} />
            <span className="text-white">{option.label}</span>
          </button>
        ))}
      </div>

      {/* Custom Status Input */}
      <div className="mt-2 pt-2 border-t border-gray-700">
        {showCustomStatus ? (
          <div className="px-3 py-2">
            <input
              type="text"
              value={customStatus || ''}
              onChange={(e) => onCustomStatusChange(e.target.value)}
              placeholder="What's on your mind?"
              maxLength={128}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        ) : (
          <button
            onClick={() => setShowCustomStatus(true)}
            className="w-full text-left px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            Set a custom status
          </button>
        )}
      </div>
    </div>
  );
}