import { useState } from 'react';
import { Bell, MessageSquare, AtSign, Hash, Volume2 } from 'lucide-react';

export default function NotificationSettings() {
  const [settings, setSettings] = useState({
    enableAll: true,
    mentions: true,
    directMessages: true,
    serverMessages: true,
    voiceCalls: true,
    sounds: true,
    desktopNotifications: true,
    inAppNotifications: true,
  });

  const handleChange = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-8">
      {/* General Notifications */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">General Notifications</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-white font-medium">Enable All Notifications</div>
                <div className="text-sm text-gray-400">
                  Control all notification settings at once
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.enableAll}
              onChange={() => handleChange('enableAll')}
              className="rounded border-gray-600 text-indigo-500 focus:ring-indigo-500"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <AtSign className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-white font-medium">Mentions</div>
                <div className="text-sm text-gray-400">
                  When someone mentions you in a message
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.mentions}
              onChange={() => handleChange('mentions')}
              className="rounded border-gray-600 text-indigo-500 focus:ring-indigo-500"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-white font-medium">Direct Messages</div>
                <div className="text-sm text-gray-400">
                  When you receive a direct message
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.directMessages}
              onChange={() => handleChange('directMessages')}
              className="rounded border-gray-600 text-indigo-500 focus:ring-indigo-500"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <Hash className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-white font-medium">Server Messages</div>
                <div className="text-sm text-gray-400">
                  Messages in servers you're a member of
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.serverMessages}
              onChange={() => handleChange('serverMessages')}
              className="rounded border-gray-600 text-indigo-500 focus:ring-indigo-500"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <Volume2 className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-white font-medium">Voice Calls</div>
                <div className="text-sm text-gray-400">
                  When someone calls you
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.voiceCalls}
              onChange={() => handleChange('voiceCalls')}
              className="rounded border-gray-600 text-indigo-500 focus:ring-indigo-500"
            />
          </label>
        </div>
      </div>

      {/* Notification Methods */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Notification Methods</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div>
              <div className="text-white font-medium">Desktop Notifications</div>
              <div className="text-sm text-gray-400">
                Show notifications on your desktop
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.desktopNotifications}
              onChange={() => handleChange('desktopNotifications')}
              className="rounded border-gray-600 text-indigo-500 focus:ring-indigo-500"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div>
              <div className="text-white font-medium">In-App Notifications</div>
              <div className="text-sm text-gray-400">
                Show notifications within the app
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.inAppNotifications}
              onChange={() => handleChange('inAppNotifications')}
              className="rounded border-gray-600 text-indigo-500 focus:ring-indigo-500"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div>
              <div className="text-white font-medium">Notification Sounds</div>
              <div className="text-sm text-gray-400">
                Play sounds for notifications
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.sounds}
              onChange={() => handleChange('sounds')}
              className="rounded border-gray-600 text-indigo-500 focus:ring-indigo-500"
            />
          </label>
        </div>
      </div>
    </div>
  );
}