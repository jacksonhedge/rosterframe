'use client';

import { useState } from 'react';

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  previewData: {
    imageUrl: string;
    teamName: string;
    plaqueType: string;
    plaqueStyle: string;
  };
}

export default function EmailPreviewModal({ 
  isOpen, 
  onClose, 
  previewData 
}: EmailPreviewModalProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [senderName, setSenderName] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSend = async () => {
    setSending(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      // Ensure we have a full URL for the preview
      const fullPreviewUrl = previewData.imageUrl.startsWith('http') 
        ? previewData.imageUrl 
        : `${window.location.origin}${previewData.imageUrl}`;

      const response = await fetch('/api/email-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: email,
          recipientName: name,
          teamName: previewData.teamName,
          previewUrl: fullPreviewUrl,
          plaqueType: previewData.plaqueType,
          plaqueStyle: previewData.plaqueStyle,
          senderName: senderName || undefined,
          message: message || undefined
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setTimeout(() => {
          onClose();
          // Reset form
          setEmail('');
          setName('');
          setMessage('');
          setSenderName('');
          setStatus('idle');
        }, 2000);
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Failed to send email');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('Network error. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-slate-800">📧 Email Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Preview thumbnail */}
          <div className="bg-gray-100 rounded-lg p-3 flex items-center gap-3">
            <img 
              src={previewData.imageUrl} 
              alt="Preview thumbnail" 
              className="w-20 h-16 object-cover rounded"
            />
            <div className="flex-1">
              <p className="font-semibold text-sm">{previewData.teamName}</p>
              <p className="text-xs text-gray-600">
                {previewData.plaqueType} cards • {previewData.plaqueStyle}
              </p>
            </div>
          </div>

          {/* Form fields */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Recipient Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="customer@example.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Recipient Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Your Name (optional)
            </label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your name (defaults to RosterFrame Team)"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Personal Message (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Here's the preview we discussed for your championship team..."
            />
          </div>
          
          {/* Status messages */}
          {status === 'success' && (
            <div className="bg-green-50 text-green-700 p-3 rounded-lg flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Email sent successfully!
            </div>
          )}
          
          {status === 'error' && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Failed to send email
              </div>
              {errorMessage && (
                <p className="text-sm mt-1">{errorMessage}</p>
              )}
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex gap-3 justify-end pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={sending}
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={!email || !name || sending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {sending ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send Email
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}