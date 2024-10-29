import { useState } from 'react';
import { X, Copy, AlertCircle } from 'lucide-react';
import api from '../../config/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  serverId: string;
}

export default function CreateInviteModal({ isOpen, onClose, serverId }: Props) {
  const [maxUses, setMaxUses] = useState<number | undefined>();
  const [expiresIn, setExpiresIn] = useState<number | undefined>();
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError(null);

      const { data } = await api.post('/api/invites', {
        serverId,
        maxUses,
        expiresIn: expiresIn ? expiresIn * 3600 : undefined, // Convert hours to seconds
      });

      setInviteCode(data.code);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create invite';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!inviteCode) return;
    
    try {
      const inviteUrl = `${window.location.origin}/invite/${inviteCode}`;
      await navigator.clipboard.writeText(inviteUrl);
    } catch (error) {
      console.error('Failed to copy invite link:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Create Invite</h2>
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

          {inviteCode ? (
            <div className="space-y-4">
              <div className="p-3 bg-gray-700 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Invite Link</div>
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">
                    {`${window.location.origin}/invite/${inviteCode}`}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <Copy className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Uses
                </label>
                <input
                  type="number"
                  min="1"
                  value={maxUses || ''}
                  onChange={(e) => setMaxUses(e.target.valueAsNumber)}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="No limit"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Expires After (hours)
                </label>
                <input
                  type="number"
                  min="1"
                  value={expiresIn || ''}
                  onChange={(e) => setExpiresIn(e.target.valueAsNumber)}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Never expires"
                />
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Invite'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}