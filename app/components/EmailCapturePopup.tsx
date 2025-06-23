'use client';

import { useState } from 'react';

interface EmailCapturePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (email?: string) => void;
  teamName: string;
  plaqueInfo: {
    style: string;
    type: string;
    price: number;
  };
}

export default function EmailCapturePopup({ 
  isOpen, 
  onClose, 
  onContinue,
  teamName,
  plaqueInfo
}: EmailCapturePopupProps) {
  const [email, setEmail] = useState('');
  const [wantsEmail, setWantsEmail] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (wantsEmail && email) {
      // Save email for auto-updates
      localStorage.setItem('rosterframe_user_email', email);
      localStorage.setItem('rosterframe_email_updates', 'true');
      onContinue(email);
    } else {
      onContinue();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('rosterframe_email_updates', 'false');
    onContinue();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full animate-in slide-in-from-bottom duration-300">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Want a Preview Emailed Now?
          </h2>
          <p className="text-gray-600">
            We'll send you a preview of your {teamName} {plaqueInfo.style} plaque as you build it
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {wantsEmail ? (
            <>
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-center"
                  required
                  autoFocus
                />
              </div>
              
              <div className="bg-amber-50 rounded-lg p-3 text-sm text-amber-800">
                <p className="font-medium mb-1">You'll receive:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Preview after adding players</li>
                  <li>• Updated preview when selecting cards</li>
                  <li>• Final preview before checkout</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setWantsEmail(false)}
                  className="flex-1 py-2.5 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  No Thanks
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
                >
                  Send Preview
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-center text-gray-600 py-4">
                No problem! You can always email yourself a preview later.
              </p>
              <button
                type="button"
                onClick={handleSkip}
                className="w-full py-2.5 px-4 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
              >
                Continue Without Email
              </button>
            </>
          )}
        </form>

        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}