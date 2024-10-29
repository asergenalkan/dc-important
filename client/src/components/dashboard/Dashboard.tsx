import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate, useParams } from 'react-router-dom';
import ServerList from './ServerList';
import ChannelList from './ChannelList';
import ChatArea from './ChatArea';
import DirectMessages from './DirectMessages';
import UserPanel from './UserPanel';
import VoiceChannel from '../voice/VoiceChannel';
import type { IServer } from '../../types';

export default function Dashboard() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { serverId, channelId, userId } = useParams();
  const [error, setError] = useState<string | null>(null);
  const [activeVoiceChannel, setActiveVoiceChannel] = useState<{id: string; serverId: string} | null>(null);

  const handleServerSelect = (id: string) => {
    if (id) {
      navigate(`/channels/${id}`);
    } else {
      navigate('/channels/@me');
    }
  };

  const handleUserSelect = (userId: string) => {
    navigate(`/channels/@me/${userId}`);
  };

  const handleChannelSelect = (channelId: string, type: 'text' | 'voice', serverId: string) => {
    if (type === 'voice') {
      setActiveVoiceChannel({ id: channelId, serverId });
    } else {
      navigate(`/channels/${serverId}/${channelId}`);
    }
  };

  const handleVoiceChannelClose = () => {
    setActiveVoiceChannel(null);
  };

  return (
    <div className="flex h-screen bg-[#1E1F22] overflow-hidden">
      {/* Server List - Always visible */}
      <ServerList 
        onServerSelect={handleServerSelect}
        selectedServer={serverId}
      />
      
      {/* Main Content Area */}
      <div className="flex flex-1 min-w-0">
        {serverId === '@me' ? (
          /* Direct Messages Layout */
          <DirectMessages 
            selectedUserId={userId}
            onUserSelect={handleUserSelect}
          />
        ) : serverId ? (
          /* Server Channel Layout */
          <>
            <ChannelList
              serverId={serverId}
              onChannelSelect={(id, type) => handleChannelSelect(id, type, serverId)}
              selectedChannel={channelId}
            />
            {channelId && <ChatArea channelId={channelId} />}
          </>
        ) : null}
      </div>

      {/* Active Voice Channel Overlay */}
      {activeVoiceChannel && (
        <div className="fixed bottom-16 right-4 z-50">
          <VoiceChannel 
            channelId={activeVoiceChannel.id} 
            serverId={activeVoiceChannel.serverId}
            onClose={handleVoiceChannelClose}
          />
        </div>
      )}

      {/* User Panel - Always visible at the bottom */}
      <div className="absolute bottom-0 left-20 right-0 bg-[#232428]">
        <UserPanel />
      </div>

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}