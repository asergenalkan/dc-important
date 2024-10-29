import { useState, useEffect } from 'react';
import api from '../config/api';

interface GameActivity {
  name: string;
  details?: string;
  startedAt: Date;
}

export function useGameActivity() {
  const [gameActivity, setGameActivity] = useState<GameActivity | null>(null);

  useEffect(() => {
    const detectGameActivity = async () => {
      try {
        // Check for running games using the Windows Game Bar API
        if ('getGameList' in navigator) {
          const games = await (navigator as any).getGameList();
          if (games.length > 0) {
            const activeGame = games[0];
            setGameActivity({
              name: activeGame.name,
              details: activeGame.details,
              startedAt: new Date(),
            });
            
            // Update user status with game activity
            await api.patch('/api/users/me', {
              gameActivity: {
                name: activeGame.name,
                details: activeGame.details,
                startedAt: new Date(),
              },
            });
          } else {
            setGameActivity(null);
            await api.patch('/api/users/me', { gameActivity: null });
          }
        }
      } catch (error) {
        console.error('Failed to detect game activity:', error);
      }
    };

    // Check for game activity every 30 seconds
    const interval = setInterval(detectGameActivity, 30000);
    detectGameActivity();

    return () => clearInterval(interval);
  }, []);

  return gameActivity;
}