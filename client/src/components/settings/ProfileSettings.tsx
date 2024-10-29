import { useState } from 'react';
import { User, Mail, AtSign, FileText } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import api from '../../config/api';

export default function ProfileSettings() {
  const { user } = useUser();
  const [bio, setBio] = useState(user?.unsafeMetadata.bio as string || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateBio = async () => {
    try {
      setIsLoading(true);
      setError(null);

      await api.patch('/api/users/me', {
        bio
      });

      // Update Clerk metadata
      await user?.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          bio
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Profile Information</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user.username || ''}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-white font-medium">{user?.username}</span>
                <span className="text-sm text-gray-400">#{user?.id.slice(-4)}</span>
              </div>
              <div className="text-sm text-gray-400">{user?.emailAddresses[0].emailAddress}</div>
            </div>
          </div>

          <div className="p-4 bg-gray-700 rounded-lg space-y-4">
            <div className="flex items-center space-x-3">
              <AtSign className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-white font-medium">Username</div>
                <div className="text-sm text-gray-400">{user?.username}</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-white font-medium">Email</div>
                <div className="text-sm text-gray-400">{user?.emailAddresses[0].emailAddress}</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <div className="text-white font-medium">Bio</div>
              </div>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Tell us about yourself..."
                rows={4}
              />
              <button
                onClick={handleUpdateBio}
                disabled={isLoading}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Bio'}
              </button>
              {error && (
                <p className="text-sm text-red-400 mt-2">{error}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}