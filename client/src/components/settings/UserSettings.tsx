import { useState } from 'react';
import { X, User, Bell, Palette, Gamepad, Volume2, Shield } from 'lucide-react';
import NotificationSettings from './NotificationSettings';
import AppearanceSettings from './AppearanceSettings';
import GameActivitySettings from './GameActivitySettings';
import PrivacySettings from './PrivacySettings';

type SettingsTab = 'profile' | 'notifications' | 'appearance' | 'games' | 'voice' | 'privacy';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserSettings({ isOpen, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  if (!isOpen) return null;

  const tabs = [
    { id: 'profile' as const, label: 'My Profile', icon: User },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'appearance' as const, label: 'Appearance', icon: Palette },
    { id: 'games' as const, label: 'Game Activity', icon: Gamepad },
    { id: 'voice' as const, label: 'Voice & Video', icon: Volume2 },
    { id: 'privacy' as const, label: 'Privacy & Safety', icon: Shield },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-4xl h-[80vh] flex">
        {/* Sidebar */}
        <div className="w-60 bg-gray-900 p-4">
          <div className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-3" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">
              {tabs.find(tab => tab.id === activeTab)?.label}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'notifications' && <NotificationSettings />}
            {activeTab === 'appearance' && <AppearanceSettings />}
            {activeTab === 'games' && <GameActivitySettings />}
            {activeTab === 'privacy' && <PrivacySettings />}
          </div>
        </div>
      </div>
    </div>
  );
}