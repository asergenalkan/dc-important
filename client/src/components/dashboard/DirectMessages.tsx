import { useState } from 'react';
import { 
  Search, MessageSquare, Calendar, FileText, CheckSquare, 
  MessageCircle, Film, PieChart, Globe, Plus, Users
} from 'lucide-react';
import { useUser } from '@clerk/clerk-react';

interface Props {
  selectedUserId?: string;
  onUserSelect: (userId: string) => void;
}

export default function DirectMessages({ selectedUserId, onUserSelect }: Props) {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');

  const quickActions = [
    { id: 'messages', icon: MessageSquare, label: 'Messages', desc: 'Direct messages and chats' },
    { id: 'friends', icon: Users, label: 'Friends', desc: 'Manage your friends' },
    { id: 'discover', icon: Globe, label: 'Discover', desc: 'Find new servers' },
    { id: 'create', icon: Plus, label: 'Create Server', desc: 'Start your own community' },
  ];

  const features = [
    { id: 'calendar', icon: Calendar, label: 'Calendar', desc: 'Schedule events and meetings' },
    { id: 'wiki', icon: FileText, label: 'Wiki', desc: 'Knowledge base and documentation' },
    { id: 'tasks', icon: CheckSquare, label: 'Tasks', desc: 'Task management and tracking' },
    { id: 'forum', icon: MessageCircle, label: 'Forum', desc: 'Community discussions' },
    { id: 'media', icon: Film, label: 'Media', desc: 'Media gallery and sharing' },
    { id: 'stats', icon: PieChart, label: 'Stats', desc: 'Server statistics and analytics' },
  ];

  return (
    <div className="flex-1 bg-[#2B2D31] p-6">
      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search anything..."
          className="w-full pl-12 pr-4 py-3 bg-[#1E1F22] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Welcome Message */}
      <div className="mb-8 p-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
        <h1 className="text-2xl font-bold text-white mb-2">
          Welcome back, {user?.username}!
        </h1>
        <p className="text-blue-100">
          Your digital workspace is ready. What would you like to do today?
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.id}
              className="p-4 bg-[#1E1F22] rounded-lg hover:bg-[#35373C] transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <action.icon className="w-6 h-6 text-gray-400 group-hover:text-white" />
                <div className="text-left">
                  <div className="text-white font-medium">{action.label}</div>
                  <div className="text-sm text-gray-400">{action.desc}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Features */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature) => (
            <button
              key={feature.id}
              className="p-4 bg-[#1E1F22] rounded-lg hover:bg-[#35373C] transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <feature.icon className="w-6 h-6 text-gray-400 group-hover:text-white" />
                <div className="text-left">
                  <div className="text-white font-medium">{feature.label}</div>
                  <div className="text-sm text-gray-400">{feature.desc}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}