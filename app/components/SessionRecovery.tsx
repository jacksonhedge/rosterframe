'use client';

import { useState, useEffect } from 'react';
import { sessionManager, type BuildSession } from '@/app/lib/session-manager';

interface SessionRecoveryProps {
  onRestore: (session: BuildSession) => void;
  onDismiss: () => void;
}

export default function SessionRecovery({ onRestore, onDismiss }: SessionRecoveryProps) {
  const [savedSession, setSavedSession] = useState<BuildSession | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const session = sessionManager.getSession();
    if (session && session.currentStep !== 'done') {
      setSavedSession(session);
      setIsVisible(true);
    }
  }, []);

  const handleRestore = () => {
    if (savedSession) {
      onRestore(savedSession);
      setIsVisible(false);
    }
  };

  const handleStartFresh = () => {
    sessionManager.clearSession();
    onDismiss();
    setIsVisible(false);
  };

  if (!isVisible || !savedSession) return null;

  const timeSinceUpdate = savedSession.lastUpdated 
    ? new Date().getTime() - new Date(savedSession.lastUpdated).getTime()
    : 0;
  const minutesAgo = Math.floor(timeSinceUpdate / (1000 * 60));
  const hoursAgo = Math.floor(timeSinceUpdate / (1000 * 60 * 60));
  const daysAgo = Math.floor(timeSinceUpdate / (1000 * 60 * 60 * 24));

  let timeAgoText = 'just now';
  if (daysAgo > 0) {
    timeAgoText = `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
  } else if (hoursAgo > 0) {
    timeAgoText = `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
  } else if (minutesAgo > 0) {
    timeAgoText = `${minutesAgo} minute${minutesAgo > 1 ? 's' : ''} ago`;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full animate-in slide-in-from-bottom duration-300">
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
          <p className="text-gray-600">
            We found a saved plaque configuration from {timeAgoText}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">Saved Progress:</h3>
          <ul className="space-y-1 text-sm text-gray-700">
            {savedSession.teamName && (
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Team: {savedSession.teamName}
              </li>
            )}
            {savedSession.selectedPlaque && (
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Plaque: {savedSession.selectedPlaque.name}
              </li>
            )}
            {savedSession.rosterPositions && savedSession.rosterPositions.length > 0 && (
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Roster: {savedSession.rosterPositions.filter(p => p.playerName).length} players added
              </li>
            )}
            {savedSession.selectedCards && Object.keys(savedSession.selectedCards).length > 0 && (
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Cards: {Object.keys(savedSession.selectedCards).length} selected
              </li>
            )}
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleRestore}
            className="flex-1 bg-amber-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
          >
            Continue Where I Left Off
          </button>
          <button
            onClick={handleStartFresh}
            className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Start Fresh
          </button>
        </div>
      </div>
    </div>
  );
}