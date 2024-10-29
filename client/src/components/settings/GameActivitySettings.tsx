import { useState } from 'react';
import { useGameActivity } from '../../hooks/useGameActivity';
import { Gamepad, Eye, EyeOff } from 'lucide-react';
import api from '../../config/api';

export default function GameActivitySettings() {
  const gameActivity = useGameActivity();
  const [showGameActivity, setShowGameActivity] = useState(true);

  const handleToggleGameActivity = async () => {
    try {
      await api.patch('/api/users/me', {
        settings: { showGameActivity: !showGameActivity }
      });
      setShowGameActivity(!showGameActivity);
    } catch (error) {
      console.error('Failed to update game activity settings:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Game Activity</h3>
        <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
          <div className="flex items-center space-x-3">
            <Gamepad className="w-5 h-5 text-gray-400" />
            <div>
              <div className="text-white font-medium">Display Game Activity</div>
              <div className="text-sm text-gray-400">
                Show others what game you're currently playing
              </div>
            </div>
          </div>
          <button
            onClick={handleToggleGameActivity}
            className={`p-2 rounded-lg transition-colors ${
              showGameActivity
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-600 text-gray-400'
            }`}
          >
            {showGameActivity ? (
              <Eye className="w-5 h-5" />
            ) : (
              <EyeOff className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {gameActivity && showGameActivity && (
        <div>
          <h3 className="text-lg font-medium text-white mb-4">Current Activity</h3>
          <div className="p-4 bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <Gamepad className="w-10 h-10 text-indigo-400" />
              <div>
                <div className="text-white font-medium">{gameActivity.name}</div>
                {gameActivity.details && (
                  <div className="text-sm text-gray-400">{gameActivity.details}</div>
                )}
                <div className="text-xs text-gray-500">
                  Playing for {formatDuration(gameActivity.startedAt)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="text-sm text-gray-400">
        Note: Game activity detection requires the Windows Game Bar API and may not work
        with all games.
      </div>
    </div>
  );
}

function formatDuration(startDate: Date): string {
  const diff = Date.now() - startDate.getTime();
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}