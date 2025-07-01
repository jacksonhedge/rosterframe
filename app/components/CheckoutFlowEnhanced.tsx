'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import StripePaymentFormEnhanced from './StripePaymentFormEnhanced';
import { formatCurrency } from '@/app/lib/stripe-enhanced';

interface CheckoutFlowEnhancedProps {
  orderSummary: {
    plaqueName: string;
    plaqueImage?: string;
    teamName: string;
    goldPosition: string;
    positions: Array<{
      position: string;
      playerName: string;
      card?: {
        name: string;
        price: number;
        imageUrl?: string;
        seller?: string;
      };
    }>;
    subtotal: number;
    discount: number;
    discountCode?: string;
    shipping: {
      method: string;
      price: number;
    };
    total: number;
  };
  customerInfo?: {
    email?: string;
    name?: string;
    phone?: string;
  };
  onSuccess: (paymentIntentId: string) => void;
  onBack: () => void;
}

export default function CheckoutFlowEnhanced({
  orderSummary,
  customerInfo,
  onSuccess,
  onBack,
}: CheckoutFlowEnhancedProps) {
  const [currentSection, setCurrentSection] = useState<'info' | 'payment'>('info');
  const [customerData, setCustomerData] = useState({
    email: customerInfo?.email || '',
    name: customerInfo?.name || '',
    phone: customerInfo?.phone || '',
    newsletter: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showOrderDetails, setShowOrderDetails] = useState(true);

  // Validate customer info
  const validateCustomerInfo = () => {
    const newErrors: Record<string, string> = {};
    
    if (!customerData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!customerData.name) {
      newErrors.name = 'Name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinueToPayment = () => {
    if (validateCustomerInfo()) {
      setCurrentSection('payment');
    }
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    // Track the successful order
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'purchase', {
        transaction_id: paymentIntentId,
        value: orderSummary.total,
        currency: 'USD',
      });
    }
    
    onSuccess(paymentIntentId);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Checkout Form */}
        <div className="lg:col-span-2">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 right-0 top-1/2 h-1 bg-gray-200 -translate-y-1/2"></div>
              <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${
                currentSection === 'info' ? 'bg-amber-600 text-white' : 'bg-green-600 text-white'
              }`}>
                {currentSection === 'payment' ? '✓' : '1'}
              </div>
              <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${
                currentSection === 'payment' ? 'bg-amber-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm font-medium text-gray-700">Contact Info</span>
              <span className="text-sm font-medium text-gray-700">Payment</span>
            </div>
          </div>

          {/* Contact Information Section */}
          {currentSection === 'info' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={customerData.email}
                    onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="you@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={customerData.name}
                    onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="John Doe"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={customerData.phone}
                    onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="newsletter"
                    checked={customerData.newsletter}
                    onChange={(e) => setCustomerData({ ...customerData, newsletter: e.target.checked })}
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                  />
                  <label htmlFor="newsletter" className="ml-2 text-sm text-gray-700">
                    Send me exclusive offers and product updates
                  </label>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={onBack}
                  className="text-gray-600 hover:text-gray-800 font-medium"
                >
                  ← Back to Cards
                </button>
                <button
                  onClick={handleContinueToPayment}
                  className="bg-gradient-to-r from-amber-600 to-yellow-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-amber-700 hover:to-yellow-600 transition-all"
                >
                  Continue to Payment →
                </button>
              </div>
            </div>
          )}

          {/* Payment Section */}
          {currentSection === 'payment' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Payment Details</h2>
                <button
                  onClick={() => setCurrentSection('info')}
                  className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                >
                  Edit Contact Info
                </button>
              </div>

              <StripePaymentFormEnhanced
                amount={orderSummary.total}
                customerEmail={customerData.email}
                customerName={customerData.name}
                onSuccess={handlePaymentSuccess}
                onError={(error) => {
                  console.error('Payment error:', error);
                }}
                metadata={{
                  plaqueName: orderSummary.plaqueName,
                  teamName: orderSummary.teamName,
                  positionCount: orderSummary.positions.length.toString(),
                }}
                showShippingAddress={true}
              />
            </div>
          )}
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Order Summary</h3>
              <button
                onClick={() => setShowOrderDetails(!showOrderDetails)}
                className="text-amber-600 hover:text-amber-700"
              >
                <svg className={`w-5 h-5 transition-transform ${showOrderDetails ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Plaque Preview */}
            {orderSummary.plaqueImage && (
              <div className="mb-4 bg-gray-50 rounded-lg p-3">
                <img
                  src={orderSummary.plaqueImage}
                  alt={orderSummary.plaqueName}
                  className="w-full rounded"
                />
                <p className="text-center mt-2 text-sm font-medium text-gray-700">
                  {orderSummary.teamName}
                </p>
              </div>
            )}

            {/* Order Details */}
            {showOrderDetails && (
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                <div className="text-sm space-y-2">
                  <div className="font-medium text-gray-900">
                    {orderSummary.plaqueName}
                  </div>
                  <div className="text-gray-600">
                    {orderSummary.positions.length} positions
                  </div>
                </div>

                {/* List selected cards */}
                {orderSummary.positions.filter(p => p.card).map((position, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex-1">
                      <div className="font-medium text-gray-700">{position.playerName}</div>
                      <div className="text-gray-500 text-xs">{position.card?.name}</div>
                    </div>
                    <div className="text-gray-900">
                      {position.card?.price ? formatCurrency(position.card.price) : 'FREE'}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Price Breakdown */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">{formatCurrency(orderSummary.subtotal)}</span>
              </div>

              {orderSummary.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount {orderSummary.discountCode && `(${orderSummary.discountCode})`}</span>
                  <span>-{formatCurrency(orderSummary.discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Shipping ({orderSummary.shipping.method})
                </span>
                <span className="text-gray-900">{formatCurrency(orderSummary.shipping.price)}</span>
              </div>

              <div className="border-t pt-2 flex justify-between">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-lg text-amber-700">
                  {formatCurrency(orderSummary.total)}
                </span>
              </div>
            </div>

            {/* Security Badges */}
            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center justify-center space-x-4">
                <div className="flex items-center text-xs text-gray-500">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Secure Checkout
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                    <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                  </svg>
                  SSL Encrypted
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}