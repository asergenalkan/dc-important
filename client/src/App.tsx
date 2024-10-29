import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/dashboard/Dashboard';
import LandingPage from './components/landing/LandingPage';
import InvitePage from './components/InvitePage';

export default function App() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={isSignedIn ? <Navigate to="/channels/@me" replace /> : <LandingPage />} />
        <Route path="/channels/@me" element={isSignedIn ? <Dashboard /> : <Navigate to="/" replace />} />
        <Route path="/channels/@me/:userId" element={isSignedIn ? <Dashboard /> : <Navigate to="/" replace />} />
        <Route path="/channels/:serverId" element={isSignedIn ? <Dashboard /> : <Navigate to="/" replace />} />
        <Route path="/channels/:serverId/:channelId" element={isSignedIn ? <Dashboard /> : <Navigate to="/" replace />} />
        <Route path="/invite/:code" element={<InvitePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}