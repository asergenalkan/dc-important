import { useState } from 'react';
import { useUser, SignOutButton } from '@clerk/clerk-react';
import { Settings, LogOut, Mic, MicOff, Headphones, VolumeX, User } from 'lucide-react';
import UserSettingsModal from '../modals/UserSettingsModal';

export default function UserPanel() {
  const { user } = useUser();
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleToggleMute = () => {
    // Toggle microphone state
    setIsMuted(!isMuted);
    // Get audio tracks from any active media streams
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        stream.getAudioTracks().forEach(track => {
          track.enabled = isMuted; // Enable if currently muted, disable if currently unmuted
        });
      })
      .catch(err => console.error('Error accessing microphone:', err));
  };

  const handleToggleDeafen = () => {
    // Toggle deafen state
    setIsDeafened(!isDeafened);
    // Mute all audio elements on the page
    document.querySelectorAll('audio').forEach(audio => {
      audio.muted = !isDeafened;
    });
  };

  return (
    <div className="flex items-center justify-between px-4 py-2">
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

      <div className="flex items-center space-x-1">
        <button 
          onClick={handleToggleMute}
          className={`p-2 rounded-md transition-colors ${
            isMuted 
              ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
              : 'hover:bg-[#35373C] text-gray-400 hover:text-white'
          }`}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <button 
          onClick={handleToggleDeafen}
          className={`p-2 rounded-md transition-colors ${
            isDeafened 
              ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
              : 'hover:bg-[#35373C] text-gray-400 hover:text-white'
          }`}
          title={isDeafened ? 'Undeafen' : 'Deafen'}
        >
          {isDeafened ? <VolumeX className="w-4 h-4" /> : <Headphones className="w-4 h-4" />}
        </button>

        <button 
          onClick={() => setShowSettings(true)}
          className="p-2 hover:bg-[#35373C] rounded-md transition-colors text-gray-400 hover:text-white"
          title="User Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        <SignOutButton>
          <button 
            className="p-2 hover:bg-[#35373C] rounded-md transition-colors text-gray-400 hover:text-white"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </SignOutButton>
      </div>

      {showSettings && (
        <UserSettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}