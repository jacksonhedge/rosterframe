'use client';

import { useState } from 'react';
import ReferralModal from '@/app/components/ReferralModal';

export default function TestEmailsPage() {
  const [testEmail, setTestEmail] = useState('');
  const [testName, setTestName] = useState('Test User');
  const [sending, setSending] = useState<string | null>(null);
  const [results, setResults] = useState<{type: string, success: boolean, message: string}[]>([]);
  const [showReferralModal, setShowReferralModal] = useState(false);

  const addResult = (type: string, success: boolean, message: string) => {
    setResults(prev => [...prev, { type, success, message, timestamp: new Date().toISOString() }]);
  };

  const testOrderConfirmation = async () => {
    setSending('order');
    try {
      // Create a test order in the database first
      const response = await fetch('/api/order-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // For testing, we'll need to create a test order or use an existing one
          orderId: 'test-order-id' // You'll need to replace this with a real order ID
        })
      });

      const data = await response.json();
      if (response.ok) {
        addResult('Order Confirmation', true, 'Email sent successfully!');
      } else {
        addResult('Order Confirmation', false, data.error || 'Failed to send');
      }
    } catch (error) {
      addResult('Order Confirmation', false, error.message);
    } finally {
      setSending(null);
    }
  };

  const testPreviewEmail = async () => {
    setSending('preview');
    try {
      const response = await fetch('/api/email-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: testEmail,
          recipientName: testName,
          teamName: 'Test Champions',
          previewUrl: 'https://via.placeholder.com/600x400',
          plaqueType: 'standard',
          plaqueStyle: 'classic',
          senderName: 'RosterFrame Team',
          message: 'This is a test preview email'
        })
      });

      const data = await response.json();
      if (response.ok) {
        addResult('Preview Email', true, 'Email sent successfully!');
      } else {
        addResult('Preview Email', false, data.error || 'Failed to send');
      }
    } catch (error) {
      addResult('Preview Email', false, error.message);
    } finally {
      setSending(null);
    }
  };

  const testReferralEmail = async () => {
    setSending('referral');
    try {
      const response = await fetch('/api/referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: testEmail,
          recipientName: testName,
          senderName: 'Test Sender',
          senderEmail: 'sender@test.com',
          teamName: 'Test Team',
          message: 'Check out this awesome service!',
          previewUrl: 'https://via.placeholder.com/600x400'
        })
      });

      const data = await response.json();
      if (response.ok) {
        addResult('Referral Email', true, `Email sent! Code: ${data.referralCode}`);
      } else {
        addResult('Referral Email', false, data.error || 'Failed to send');
      }
    } catch (error) {
      addResult('Referral Email', false, error.message);
    } finally {
      setSending(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Email Integration Test</h1>

        {/* Configuration Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Configuration Checklist</h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
              <span>Resend API Key configured (check .env)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
              <span>Using onboarding@resend.dev (development mode)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-300 rounded-full mr-3"></div>
              <span>Custom domain not configured (requires DNS setup)</span>
            </div>
          </div>
        </div>

        {/* Test Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Email Sending</h2>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Test Email Address
              </label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="test@example.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Test Name
              </label>
              <input
                type="text"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={testPreviewEmail}
              disabled={!testEmail || sending === 'preview'}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              {sending === 'preview' ? 'Sending...' : 'Test Preview Email'}
            </button>

            <button
              onClick={testOrderConfirmation}
              disabled={!testEmail || sending === 'order'}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
            >
              {sending === 'order' ? 'Sending...' : 'Test Order Confirmation'}
            </button>

            <button
              onClick={testReferralEmail}
              disabled={!testEmail || sending === 'referral'}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400"
            >
              {sending === 'referral' ? 'Sending...' : 'Test Referral Email'}
            </button>

            <button
              onClick={() => setShowReferralModal(true)}
              className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition"
            >
              Test Referral Modal
            </button>
          </div>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <div className="space-y-2">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                  }`}
                >
                  <span className="font-semibold">{result.type}:</span> {result.message}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DNS Setup Instructions */}
        <div className="bg-blue-50 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">DNS Setup Instructions</h3>
          <ol className="list-decimal list-inside text-blue-800 space-y-2">
            <li>Go to <a href="https://resend.com/domains" className="underline">Resend Domains</a></li>
            <li>Add your domain (rosterframe.com)</li>
            <li>Add the provided DNS records to your domain provider</li>
            <li>Wait for verification (usually 5-30 minutes)</li>
            <li>Update RESEND_FROM_EMAIL in your .env file</li>
          </ol>
        </div>
      </div>

      <ReferralModal
        isOpen={showReferralModal}
        onClose={() => setShowReferralModal(false)}
        senderName="Test User"
        senderEmail="test@example.com"
        teamName="Test Champions"
        previewUrl="https://via.placeholder.com/600x400"
      />
    </div>
  );
}