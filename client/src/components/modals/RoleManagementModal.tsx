import { useState, useEffect } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import type { IRole } from '../../types';
import api from '../../config/api';
import RoleSettingsModal from './RoleSettingsModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  serverId: string;
}

export default function RoleManagementModal({ isOpen, onClose, serverId }: Props) {
  const [roles, setRoles] = useState<IRole[]>([]);
  const [selectedRole, setSelectedRole] = useState<IRole | undefined>();
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchRoles();
    }
  }, [isOpen]);

  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data } = await api.get(`/api/roles/server/${serverId}`);
      setRoles(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch roles';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleUpdate = () => {
    fetchRoles();
    setSelectedRole(undefined);
    setIsRoleModalOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-2xl mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Role Management</h2>
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

          <div className="mb-4">
            <button
              onClick={() => {
                setSelectedRole(undefined);
                setIsRoleModalOpen(true);
              }}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Role
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : roles.length > 0 ? (
            <div className="space-y-3">
              {roles.map((role) => (
                <div
                  key={role._id}
                  className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: role.color }}
                    />
                    <span className="text-white font-medium">{role.name}</span>
                    <span className="text-sm text-gray-400">
                      {role.permissions.length} permissions
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedRole(role);
                      setIsRoleModalOpen(true);
                    }}
                    className="px-4 py-2 hover:bg-gray-600 rounded-lg transition-colors text-gray-400 hover:text-white"
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              No roles created yet
            </div>
          )}
        </div>
      </div>

      <RoleSettingsModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        serverId={serverId}
        role={selectedRole}
        onRoleUpdate={handleRoleUpdate}
      />
    </div>
  );
}