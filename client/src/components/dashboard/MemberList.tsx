import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Crown, MoreVertical, Shield, UserPlus2, Ban, UserMinus } from 'lucide-react';
import type { IServer } from '../../types';
import MemberRolesModal from '../modals/MemberRolesModal';
import InviteModal from '../modals/CreateInviteModal';
import api from '../../config/api';

interface Props {
  serverId: string;
}

interface Member {
  id: string;
  username: string;
  imageUrl?: string;
  roles: string[];
  isOnline: boolean;
}

export default function MemberList({ serverId }: Props) {
  const { user } = useUser();
  const [server, setServer] = useState<IServer | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showRolesModal, setShowRolesModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showMemberMenu, setShowMemberMenu] = useState<string | null>(null);

  useEffect(() => {
    fetchServerDetails();
    fetchMembers();
  }, [serverId]);

  const fetchServerDetails = async () => {
    try {
      const { data } = await api.get(`/api/servers/${serverId}`);
      setServer(data);
    } catch (error) {
      console.error('Failed to fetch server details:', error);
    }
  };

  const fetchMembers = async () => {
    try {
      const { data } = await api.get(`/api/servers/${serverId}/members`);
      setMembers(data);
    } catch (error) {
      console.error('Failed to fetch members:', error);
    }
  };

  const handleKickMember = async (memberId: string) => {
    try {
      await api.post(`/api/servers/${serverId}/kick`, { userId: memberId });
      setMembers(prev => prev.filter(member => member.id !== memberId));
    } catch (error) {
      console.error('Failed to kick member:', error);
    }
  };

  const handleBanMember = async (memberId: string) => {
    try {
      await api.post(`/api/servers/${serverId}/ban`, { userId: memberId });
      setMembers(prev => prev.filter(member => member.id !== memberId));
    } catch (error) {
      console.error('Failed to ban member:', error);
    }
  };

  const isOwner = server?.ownerId === user?.id;

  return (
    <div className="w-60 bg-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase">
            Members — {members.length}
          </h3>
          {(isOwner || members.some(m => m.roles.includes('MANAGE_MEMBERS'))) && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <UserPlus2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1 p-2">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-700 group relative"
            >
              <div className="flex items-center">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                    {member.imageUrl ? (
                      <img
                        src={member.imageUrl}
                        alt={member.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-medium">
                        {member.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-800 
                    ${member.isOnline ? 'bg-green-500' : 'bg-gray-500'}`} />
                </div>
                <div className="ml-3">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-white">
                      {member.username}
                    </span>
                    {server?.ownerId === member.id && (
                      <Crown className="w-4 h-4 text-yellow-500 ml-1" />
                    )}
                    {member.roles.includes('ADMINISTRATOR') && (
                      <Shield className="w-4 h-4 text-red-500 ml-1" />
                    )}
                  </div>
                  {member.roles.length > 0 && (
                    <div className="text-xs text-gray-400">
                      {member.roles.join(', ')}
                    </div>
                  )}
                </div>
              </div>

              {isOwner && member.id !== user?.id && (
                <div className="relative">
                  <button
                    onClick={() => setShowMemberMenu(showMemberMenu === member.id ? null : member.id)}
                    className="p-1 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  {showMemberMenu === member.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-lg py-1 z-10">
                      <button
                        onClick={() => {
                          setSelectedMember(member);
                          setShowRolesModal(true);
                          setShowMemberMenu(null);
                        }}
                        className="w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 flex items-center"
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Manage Roles
                      </button>
                      <button
                        onClick={() => {
                          handleKickMember(member.id);
                          setShowMemberMenu(null);
                        }}
                        className="w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-800 flex items-center"
                      >
                        <UserMinus className="w-4 h-4 mr-2" />
                        Kick Member
                      </button>
                      <button
                        onClick={() => {
                          handleBanMember(member.id);
                          setShowMemberMenu(null);
                        }}
                        className="w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-800 flex items-center"
                      >
                        <Ban className="w-4 h-4 mr-2" />
                        Ban Member
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {selectedMember && (
        <MemberRolesModal
          isOpen={showRolesModal}
          onClose={() => {
            setShowRolesModal(false);
            setSelectedMember(null);
          }}
          serverId={serverId}
          userId={selectedMember.id}
          username={selectedMember.username}
        />
      )}

      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        serverId={serverId}
      />
    </div>
  );
}