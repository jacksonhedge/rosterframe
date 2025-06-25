'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  senderName?: string;
  senderEmail?: string;
  teamName?: string;
  previewUrl?: string;
}

export default function ReferralModal({
  isOpen,
  onClose,
  senderName = '',
  senderEmail = '',
  teamName,
  previewUrl
}: ReferralModalProps) {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');
  const [referrerName, setReferrerName] = useState(senderName);
  const [referrerEmail, setReferrerEmail] = useState(senderEmail);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);

    try {
      const response = await fetch('/api/referral', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientEmail,
          recipientName,
          senderName: referrerName,
          senderEmail: referrerEmail,
          teamName,
          message,
          previewUrl,
          discountAmount: 10,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send referral');
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        // Reset form
        setRecipientEmail('');
        setRecipientName('');
        setMessage('');
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send referral');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Refer a Friend</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {success ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-bold text-green-600 mb-2">Referral Sent!</h3>
              <p className="text-gray-600">Your friend will receive their invitation shortly.</p>
            </div>
          ) : (
            <>
              <div>
                <p className="text-gray-600 mb-4">
                  Share RosterFrame with a friend and they'll get $10 off their first plaque!
                </p>
              </div>

              {/* Your Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Your Information</h3>
                
                <div>
                  <label htmlFor="referrerName" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="referrerName"
                    value={referrerName}
                    onChange={(e) => setReferrerName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                    placeholder="John Smith"
                  />
                </div>

                <div>
                  <label htmlFor="referrerEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Email (optional)
                  </label>
                  <input
                    type="email"
                    id="referrerEmail"
                    value={referrerEmail}
                    onChange={(e) => setReferrerEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              {/* Friend's Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Friend's Information</h3>
                
                <div>
                  <label htmlFor="recipientName" className="block text-sm font-medium text-gray-700 mb-1">
                    Friend's Name
                  </label>
                  <input
                    type="text"
                    id="recipientName"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                    placeholder="Jane Doe"
                  />
                </div>

                <div>
                  <label htmlFor="recipientEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Friend's Email
                  </label>
                  <input
                    type="email"
                    id="recipientEmail"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                    placeholder="friend@email.com"
                  />
                </div>
              </div>

              {/* Personal Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Personal Message (optional)
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Check out this awesome way to display our fantasy championship!"
                />
              </div>

              {/* What they'll receive */}
              <div className="bg-amber-50 rounded-lg p-4">
                <h4 className="font-semibold text-amber-900 mb-2">What your friend will receive:</h4>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>• $10 off their first plaque</li>
                  <li>• A preview of your plaque (if available)</li>
                  <li>• Easy instructions to create their own</li>
                </ul>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="flex-1 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {sending ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}