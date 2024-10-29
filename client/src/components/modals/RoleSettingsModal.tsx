import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { ChromePicker } from 'react-color';
import type { IRole } from '../../types';
import api from '../../config/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  serverId: string;
  role?: IRole;
  onRoleUpdate?: () => void;
}

export default function RoleSettingsModal({ isOpen, onClose, serverId, role, onRoleUpdate }: Props) {
  const [name, setName] = useState(role?.name || '');
  const [color, setColor] = useState(role?.color || '#99AAB5');
  const [permissions, setPermissions] = useState<string[]>(role?.permissions || []);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError(null);

      const data = {
        name,
        color,
        permissions,
        serverId
      };

      if (role) {
        await api.patch(`/api/roles/${role._id}`, data);
      } else {
        await api.post('/api/roles', data);
      }

      onRoleUpdate?.();
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save role';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePermission = (permissionId: string) => {
    setPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(p => p !== permissionId);
      }
      return [...prev, permissionId];
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              {role ? 'Edit Role' : 'Create Role'}
            </h2>
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Role Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter role name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Role Color
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center"
                >
                  <div 
                    className="w-6 h-6 rounded mr-2"
                    style={{ backgroundColor: color }}
                  />
                  {color}
                </button>
                {showColorPicker && (
                  <div className="absolute z-10 mt-2">
                    <div 
                      className="fixed inset-0"
                      onClick={() => setShowColorPicker(false)}
                    />
                    <ChromePicker
                      color={color}
                      onChange={(colorResult) => setColor(colorResult.hex)}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : role ? 'Save Changes' : 'Create Role'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}