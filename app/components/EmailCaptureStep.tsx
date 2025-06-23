'use client';

import { useState } from 'react';

interface EmailCaptureStepProps {
  teamName: string;
  plaqueStyle: string;
  onContinue: (email?: string) => void;
  onSkip: () => void;
}

export default function EmailCaptureStep({ 
  teamName, 
  plaqueStyle, 
  onContinue,
  onSkip 
}: EmailCaptureStepProps) {
  const [email, setEmail] = useState('');
  const [wantsEmail, setWantsEmail] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (wantsEmail && email) {
      // Save email to session
      localStorage.setItem('rosterframe_user_email', email);
      onContinue(email);
    } else {
      onContinue();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Want to Save Your Progress?
          </h2>
          <p className="text-lg text-gray-600">
            Get a preview link sent to your email as you build your {teamName} plaque
          </p>
        </div>

        <div className="bg-amber-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-amber-900 mb-2">What you'll get:</h3>
          <ul className="space-y-2 text-sm text-amber-800">
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Preview images of your plaque as you build
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Save your configuration to finish later
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Share with friends for feedback
            </li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {wantsEmail && (
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required={wantsEmail}
              />
              <p className="mt-1 text-xs text-gray-500">
                We'll only use this to send your preview. No spam, ever.
              </p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="wantsEmail"
              checked={wantsEmail}
              onChange={(e) => setWantsEmail(e.target.checked)}
              className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
            />
            <label htmlFor="wantsEmail" className="text-sm text-gray-700">
              Yes, email me preview updates as I build
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onSkip}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Skip for Now
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
            >
              {wantsEmail && email ? 'Continue & Get Updates' : 'Continue Without Email'}
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-gray-500 mt-4">
          You can always email yourself a preview later
        </p>
      </div>
    </div>
  );
}