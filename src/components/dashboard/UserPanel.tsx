import { useUser, SignOutButton } from '@clerk/clerk-react';
import { Settings, LogOut, Mic, Headphones, User } from 'lucide-react';

export default function UserPanel() {
  const { user } = useUser();

  return (
    <div className="bg-gray-900 p-2 border-t border-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
            {user?.imageUrl ? (
              <img 
                src={user.imageUrl} 
                alt={user.username || 'User'} 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-4 h-4 text-gray-400" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">
              {user?.username || 'User'}
            </span>
            <span className="text-xs text-gray-400">Online</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-1 hover:bg-gray-700 rounded-md transition-colors">
            <Mic className="w-4 h-4 text-gray-400" />
          </button>
          <button className="p-1 hover:bg-gray-700 rounded-md transition-colors">
            <Headphones className="w-4 h-4 text-gray-400" />
          </button>
          <button className="p-1 hover:bg-gray-700 rounded-md transition-colors">
            <Settings className="w-4 h-4 text-gray-400" />
          </button>
          <SignOutButton>
            <button className="p-1 hover:bg-gray-700 rounded-md transition-colors">
              <LogOut className="w-4 h-4 text-gray-400" />
            </button>
          </SignOutButton>
        </div>
      </div>
    </div>
  );
}