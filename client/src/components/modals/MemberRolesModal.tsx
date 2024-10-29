import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import api from '../../config/api';

interface Role {
  _id: string;
  name: string;
  color: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  serverId: string;
  userId: string;
  username: string;
}

export default function MemberRolesModal({ isOpen, onClose, serverId, userId, username }: Props) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [memberRoles, setMemberRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchRoles();
      fetchMemberRoles();
    }
  }, [isOpen]);

  const fetchRoles = async () => {
    try {
      const { data } = await api.get(`/api/roles/server/${serverId}`);
      setRoles(data);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    }
  };

  const fetchMemberRoles = async () => {
    try {
      const { data } = await api.get(`/api/servers/${serverId}/members/${userId}/roles`);
      setMemberRoles(data.map((role: Role) => role._id));
    } catch (error) {
      console.error('Failed to fetch member roles:', error);
    }
  };

  const toggleRole = async (roleId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      if (memberRoles.includes(roleId)) {
        await api.post('/api/roles/remove', {
          roleId,
          userId,
          serverId,
        });
        setMemberRoles(prev => prev.filter(id => id !== roleId));
      } else {
        await api.post('/api/roles/assign', {
          roleId,
          userId,
          serverId,
        });
        setMemberRoles(prev => [...prev, roleId]);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update roles';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Manage Roles</h2>
              <p className="text-gray-400 text-sm">for {username}</p>
            </div>
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

          <div className="space-y-3">
            {roles.map((role) => (
              <label
                key={role._id}
                className="flex items-center p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={memberRoles.includes(role._id)}
                  onChange={() => toggleRole(role._id)}
                  disabled={isLoading}
                  className="rounded border-gray-600 text-indigo-500 focus:ring-indigo-500"
                />
                <div className="ml-3 flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: role.color }}
                  />
                  <span className="text-white">{role.name}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}