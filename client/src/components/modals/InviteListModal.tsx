import { useState, useEffect } from 'react';
import { X, Trash2, AlertCircle } from 'lucide-react';
import api from '../../config/api';

interface Invite {
  _id: string;
  code: string;
  uses: number;
  maxUses?: number;
  expiresAt?: string;
  createdAt: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  serverId: string;
}

export default function InviteListModal({ isOpen, onClose, serverId }: Props) {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchInvites();
    }
  }, [isOpen]);

  const fetchInvites = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data } = await api.get(`/api/invites/server/${serverId}`);
      setInvites(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch invites';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (inviteId: string) => {
    try {
      await api.delete(`/api/invites/${inviteId}`);
      setInvites(prev => prev.filter(invite => invite._id !== inviteId));
    } catch (error) {
      console.error('Failed to delete invite:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-2xl mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Server Invites</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center text-red-500">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : invites.length > 0 ? (
            <div className="space-y-3">
              {invites.map((invite) => (
                <div
                  key={invite._id}
                  className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
                >
                  <div>
                    <div className="text-white font-medium mb-1">
                      {`${window.location.origin}/invite/${invite.code}`}
                    </div>
                    <div className="text-sm text-gray-400">
                      {invite.maxUses ? (
                        <span>{invite.uses} / {invite.maxUses} uses</span>
                      ) : (
                        <span>{invite.uses} uses</span>
                      )}
                      {invite.expiresAt && (
                        <span className="ml-3">
                          Expires {new Date(invite.expiresAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(invite._id)}
                    className="p-2 hover:bg-gray-600 rounded-lg transition-colors text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              No invites found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}