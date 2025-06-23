'use client';

import { useState } from 'react';
import EmailPreviewModal from '../components/EmailPreviewModal';

export default function TestEmail() {
  const [showModal, setShowModal] = useState(false);
  const [status, setStatus] = useState<string>('');

  // Test data
  const testPreviewData = {
    imageUrl: '/uploads/previews/fb2bffa3-0636-4f1c-b570-8b2918b1442a.png',
    teamName: 'Jackson\'s Champions',
    plaqueType: '10',
    plaqueStyle: 'dark-maple-wood',
  };

  const sendDirectTest = async () => {
    setStatus('Sending...');
    
    try {
      const response = await fetch('/api/email-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: 'jacksonfitzgerald25@gmail.com',
          recipientName: 'Jackson',
          teamName: testPreviewData.teamName,
          previewUrl: `${window.location.origin}${testPreviewData.imageUrl}`,
          plaqueType: testPreviewData.plaqueType,
          plaqueStyle: testPreviewData.plaqueStyle,
          message: 'This is a test email from your RosterFrame email system. If you receive this, everything is working perfectly!',
          senderName: 'RosterFrame Test'
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setStatus('✅ Email sent successfully! Check your inbox.');
      } else {
        setStatus(`❌ Error: ${data.error || 'Failed to send'}`);
      }
    } catch (error) {
      setStatus(`❌ Network error: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Email System Test</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Test Preview Data</h2>
            <div className="bg-gray-50 rounded p-4 space-y-2 text-sm">
              <p><strong>Team:</strong> {testPreviewData.teamName}</p>
              <p><strong>Plaque:</strong> {testPreviewData.plaqueType} cards - {testPreviewData.plaqueStyle}</p>
              <p><strong>Preview Image:</strong> {testPreviewData.imageUrl}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Send Test Email</h2>
            
            <button
              onClick={sendDirectTest}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Send Test Email to jacksonfitzgerald25@gmail.com
            </button>

            <button
              onClick={() => setShowModal(true)}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Open Email Modal (Interactive Test)
            </button>
          </div>

          {status && (
            <div className={`p-4 rounded-lg ${
              status.includes('✅') ? 'bg-green-100 text-green-800' : 
              status.includes('❌') ? 'bg-red-100 text-red-800' : 
              'bg-blue-100 text-blue-800'
            }`}>
              {status}
            </div>
          )}

          <div className="text-sm text-gray-600 space-y-1">
            <p>• Using Resend API</p>
            <p>• From: onboarding@resend.dev (test mode)</p>
            <p>• Check spam folder if not in inbox</p>
          </div>
        </div>

        {/* Preview of what will be sent */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Preview Image That Will Be Sent:</h3>
          <img 
            src={testPreviewData.imageUrl} 
            alt="Preview" 
            className="w-full max-w-md mx-auto rounded-lg shadow-md"
          />
        </div>
      </div>

      {/* Email Modal */}
      {showModal && (
        <EmailPreviewModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          previewData={testPreviewData}
        />
      )}
    </div>
  );
}