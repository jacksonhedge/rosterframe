'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function OrderCancelPage() {
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd send this feedback to your backend
    console.log('Feedback:', feedback);
    setFeedbackSent(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Cancel Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-3xl font-black text-amber-900 mb-3">Order Cancelled</h1>
          <p className="text-lg text-amber-700 mb-6">Your order has been cancelled and you have not been charged.</p>
          
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-blue-800">
              No worries! Your roster frame design has been saved and you can complete your order anytime.
            </p>
          </div>
        </div>

        {/* Reasons to Complete Order */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-amber-900 mb-6">Don't Miss Out!</h2>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <span className="text-2xl flex-shrink-0">🏆</span>
              <div>
                <h3 className="font-semibold text-lg mb-1">Celebrate Your Championship</h3>
                <p className="text-gray-600">Commemorate your fantasy football victory with a professional display.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <span className="text-2xl flex-shrink-0">🎁</span>
              <div>
                <h3 className="font-semibold text-lg mb-1">Perfect Gift</h3>
                <p className="text-gray-600">Makes an amazing gift for any fantasy sports enthusiast.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <span className="text-2xl flex-shrink-0">💰</span>
              <div>
                <h3 className="font-semibold text-lg mb-1">Limited Time Offer</h3>
                <p className="text-gray-600">Pre-order now and save 15% on your custom plaque!</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <span className="text-2xl flex-shrink-0">✨</span>
              <div>
                <h3 className="font-semibold text-lg mb-1">Premium Quality</h3>
                <p className="text-gray-600">Handcrafted with high-quality materials that will last for years.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Form */}
        {!feedbackSent ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-amber-900 mb-4">Help Us Improve</h2>
            <p className="text-gray-600 mb-4">We'd love to know why you didn't complete your order:</p>
            
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Was the price too high? Having technical issues? Let us know..."
                className="w-full p-4 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-400"
                rows={4}
              />
              
              <button
                type="submit"
                className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
              >
                Send Feedback
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-green-50 rounded-2xl shadow-xl p-8 mb-6 text-center">
            <div className="text-4xl mb-3">✅</div>
            <h3 className="text-xl font-semibold text-green-800 mb-2">Thank You!</h3>
            <p className="text-green-700">Your feedback has been received and will help us improve.</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <Link 
            href="/build-and-buy"
            className="inline-block bg-amber-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-amber-700 transition transform hover:scale-105 shadow-lg"
          >
            Complete Your Order
          </Link>
          
          <div className="space-x-4">
            <Link 
              href="/"
              className="text-amber-600 hover:text-amber-700 font-semibold"
            >
              Return to Homepage
            </Link>
            <span className="text-gray-400">•</span>
            <a 
              href="mailto:support@rosterframe.com"
              className="text-amber-600 hover:text-amber-700 font-semibold"
            >
              Contact Support
            </a>
          </div>
        </div>

        {/* Special Offer */}
        <div className="mt-12 bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl p-6 text-center">
          <h3 className="text-xl font-bold text-amber-900 mb-2">🎯 Special Offer Just for You!</h3>
          <p className="text-amber-800 mb-4">
            Complete your order in the next 24 hours and get an additional 5% off with code: <span className="font-mono font-bold">COMEBACK5</span>
          </p>
          <Link 
            href="/build-and-buy"
            className="inline-block bg-amber-900 text-white px-6 py-2 rounded-lg font-semibold hover:bg-amber-800 transition"
          >
            Claim Offer
          </Link>
        </div>
      </div>
    </div>
  );
}