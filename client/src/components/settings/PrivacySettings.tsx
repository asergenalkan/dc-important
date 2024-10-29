import { useState } from 'react';
import { Shield, Users, MessageSquare, Globe, UserPlus } from 'lucide-react';

export default function PrivacySettings() {
  const [settings, setSettings] = useState({
    directMessages: 'friends',
    friendRequests: 'everyone',
    serverInvites: 'everyone',
    readReceipts: true,
    onlineStatus: true,
    gameActivity: true,
    dataCollection: false,
  });

  const handleSelectChange = (key: keyof typeof settings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-8">
      {/* Privacy Controls */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Privacy Controls</h3>
        <div className="space-y-4">
          <div className="p-4 bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <MessageSquare className="w-5 h-5 text-gray-400" />
              <div className="text-white font-medium">Direct Messages</div>
            </div>
            <select
              value={settings.directMessages}
              onChange={(e) => handleSelectChange('directMessages', e.target.value)}
              className="w-full bg-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="everyone">Everyone</option>
              <option value="friends">Friends Only</option>
              <option value="none">No One</option>
            </select>
          </div>

          <div className="p-4 bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <UserPlus className="w-5 h-5 text-gray-400" />
              <div className="text-white font-medium">Friend Requests</div>
            </div>
            <select
              value={settings.friendRequests}
              onChange={(e) => handleSelectChange('friendRequests', e.target.value)}
              className="w-full bg-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="everyone">Everyone</option>
              <option value="mutual">Friends of Friends</option>
              <option value="none">No One</option>
            </select>
          </div>

          <div className="p-4 bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <Users className="w-5 h-5 text-gray-400" />
              <div className="text-white font-medium">Server Invites</div>
            </div>
            <select
              value={settings.serverInvites}
              onChange={(e) => handleSelectChange('serverInvites', e.target.value)}
              className="w-full bg-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="everyone">Everyone</option>
              <option value="friends">Friends Only</option>
              <option value="none">No One</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activity Settings */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Activity Settings</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <Globe className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-white font-medium">Online Status</div>
                <div className="text-sm text-gray-400">
                  Show when you're online
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.onlineStatus}
              onChange={() => handleToggle('onlineStatus')}
              className="rounded border-gray-600 text-indigo-500 focus:ring-indigo-500"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div>
              <div className="text-white font-medium">Read Receipts</div>
              <div className="text-sm text-gray-400">
                Show when you've read messages
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.readReceipts}
              onChange={() => handleToggle('readReceipts')}
              className="rounded border-gray-600 text-indigo-500 focus:ring-indigo-500"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div>
              <div className="text-white font-medium">Game Activity</div>
              <div className="text-sm text-gray-400">
                Share what games you're playing
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.gameActivity}
              onChange={() => handleToggle('gameActivity')}
              className="rounded border-gray-600 text-indigo-500 focus:ring-indigo-500"
            />
          </label>
        </div>
      </div>

      {/* Data Collection */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Data & Privacy</h3>
        <label className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-gray-400" />
            <div>
              <div className="text-white font-medium">Data Collection</div>
              <div className="text-sm text-gray-400">
                Help improve the app by sharing usage data
              </div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.dataCollection}
            onChange={() => handleToggle('dataCollection')}
            className="rounded border-gray-600 text-indigo-500 focus:ring-indigo-500"
          />
        </label>
      </div>
    </div>
  );
}