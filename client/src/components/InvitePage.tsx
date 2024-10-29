import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Loader2 } from 'lucide-react';
import api from '../config/api';

export default function InvitePage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      // Store invite code in localStorage to use after sign in
      if (code) {
        localStorage.setItem('pendingInvite', code);
      }
      navigate('/');
      return;
    }

    if (isSignedIn && code) {
      joinServer();
    }
  }, [isSignedIn, isLoaded, code]);

  const joinServer = async () => {
    try {
      const { data } = await api.post(`/api/invites/${code}/join`);
      navigate(`/channels/${data._id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid or expired invite';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Invalid Invite</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return null;
}