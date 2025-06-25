'use client';

import { useState } from 'react';
import StripePaymentForm from '../components/StripePaymentForm';

export default function TestPaymentPage() {
  const [paymentStatus, setPaymentStatus] = useState<string>('');
  const [paymentError, setPaymentError] = useState<string>('');

  const handlePaymentSuccess = (paymentIntentId: string) => {
    setPaymentStatus(`Payment successful! Intent ID: ${paymentIntentId}`);
    setPaymentError('');
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(`Payment failed: ${error}`);
    setPaymentStatus('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h1 className="text-3xl font-bold text-amber-900 mb-4">Test Payment Integration</h1>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 font-semibold mb-2">⚠️ Test Mode Active</p>
            <p className="text-yellow-700 text-sm">
              You are using LIVE Stripe keys. Only use test cards or switch to test keys.
            </p>
            <p className="text-yellow-700 text-sm mt-2">
              <strong>Test Card:</strong> 4242 4242 4242 4242 (Any future date, any CVC)
            </p>
          </div>

          {paymentStatus && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800">{paymentStatus}</p>
            </div>
          )}

          {paymentError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{paymentError}</p>
            </div>
          )}
        </div>

        <StripePaymentForm
          amount={99.99}
          customerInfo={{
            teamName: "Test Team",
            email: "test@example.com",
            isGift: false
          }}
          orderDetails={{
            plaqueName: "Wood Frame Deluxe",
            numPositions: 5,
            numCards: 5,
            isPreOrder: false,
            savings: 0
          }}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
        />

        <div className="mt-8 bg-gray-100 rounded-lg p-6">
          <h2 className="font-bold text-gray-800 mb-3">Testing Checklist:</h2>
          <ul className="space-y-2 text-gray-700">
            <li>✓ Enter test card: 4242 4242 4242 4242</li>
            <li>✓ Use any future expiry date (e.g., 12/25)</li>
            <li>✓ Use any 3-digit CVC (e.g., 123)</li>
            <li>✓ Use any 5-digit ZIP (e.g., 12345)</li>
            <li>✓ Click pay button</li>
            <li>✓ Check Supabase orders table for new entry</li>
            <li>✓ Check email for confirmation (if domain verified)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}