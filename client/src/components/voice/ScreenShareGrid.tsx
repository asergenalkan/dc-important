import { Grid2X2, Maximize2 } from 'lucide-react';
import ScreenShareView from './ScreenShareView';

interface Screen {
  id: string;
  stream: MediaStream;
  userId: string;
  username: string;
}

interface Props {
  screens: Screen[];
  activeScreenId: string | null;
  onScreenSelect: (screenId: string | null) => void;
  onScreenClose: (screenId: string) => void;
}

export default function ScreenShareGrid({ 
  screens, 
  activeScreenId, 
  onScreenSelect,
  onScreenClose,
}: Props) {
  if (screens.length === 0) return null;

  // If there's an active screen, show it in full view
  if (activeScreenId) {
    const activeScreen = screens.find(s => s.id === activeScreenId);
    if (!activeScreen) return null;

    return (
      <div className="relative flex-1">
        <ScreenShareView
          stream={activeScreen.stream}
          username={activeScreen.username}
          onClose={() => onScreenClose(activeScreen.id)}
        />
        {screens.length > 1 && (
          <button
            onClick={() => onScreenSelect(null)}
            className="absolute bottom-4 right-4 p-2 bg-gray-800/80 hover:bg-gray-700/80 rounded-lg transition-colors text-white"
          >
            <Grid2X2 className="w-5 h-5" />
          </button>
        )}
      </div>
    );
  }

  // Otherwise, show grid view
  return (
    <div className="flex-1 grid grid-cols-2 gap-4 p-4">
      {screens.map((screen) => (
        <div key={screen.id} className="relative">
          <ScreenShareView
            stream={screen.stream}
            username={screen.username}
            onClose={() => onScreenClose(screen.id)}
          />
          <button
            onClick={() => onScreenSelect(screen.id)}
            className="absolute bottom-4 right-4 p-2 bg-gray-800/80 hover:bg-gray-700/80 rounded-lg transition-colors text-white"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  );
}