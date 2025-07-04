'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

interface PaymentFormProps {
  amount: number;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
  customerInfo: {
    teamName: string;
    email?: string;
    isGift: boolean;
  };
  orderDetails: {
    plaqueName: string;
    numPositions: number;
    numCards: number;
    isPreOrder?: boolean;
    savings?: number;
    promoCode?: string;
  };
}

function CheckoutForm({ 
  amount, 
  onPaymentSuccess, 
  onPaymentError, 
  customerInfo, 
  orderDetails 
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [cardComplete, setCardComplete] = useState(false);
  const [cardError, setCardError] = useState<string>('');

  useEffect(() => {
    // Create payment intent when component mounts
    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount,
            metadata: {
              team_name: customerInfo.teamName,
              is_gift: customerInfo.isGift.toString(),
              plaque_name: orderDetails.plaqueName,
              num_positions: orderDetails.numPositions.toString(),
              num_cards: orderDetails.numCards.toString(),
              is_pre_order: orderDetails.isPreOrder?.toString() || 'false',
              pre_order_savings: orderDetails.savings?.toString() || '0',
              expected_delivery: orderDetails.isPreOrder ? 'March 2025' : '7-10 business days',
              promo_code: orderDetails.promoCode || '',
              gold_position: orderDetails.goldPosition || 'bottom',
            },
            orderData: {
              customerEmail: customerInfo.email || 'customer@example.com', // Will be collected on success page
              customerName: customerInfo.teamName, // Using team name for now
              plaqueType: orderDetails.plaqueName.toLowerCase().includes('wood') ? 'wood' : 
                         orderDetails.plaqueName.toLowerCase().includes('glass') ? 'glass' : 'acrylic',
              plaqueSize: 'medium', // Default for now
              giftPackaging: customerInfo.isGift,
              leagueData: { teamName: customerInfo.teamName }, // Simplified for now
              selectedPlayers: { count: orderDetails.numCards }, // Simplified for now
              subtotal: amount / 100,
              discountAmount: orderDetails.savings || 0,
              discountCode: orderDetails.promoCode,
              shippingCost: 0, // Free shipping for now
              taxAmount: 0, // No tax calculation yet
              shippingAddress: {
                line1: '123 Main St', // Will be collected on success page
                city: 'Anytown',
                state: 'CA',
                postal_code: '12345',
                country: 'US'
              },
              previewImageUrl: null // Will be generated later
            }
          }),
        });

        const data = await response.json();
        
        if (data.error) {
          onPaymentError(data.error);
        } else {
          setClientSecret(data.clientSecret);
          
          // If this is a mock payment, show a warning
          if (data.warning) {
            console.warn(data.warning);
          }
        }
      } catch (error) {
        onPaymentError('Failed to initialize payment');
      }
    };

    createPaymentIntent();
  }, [amount, customerInfo, orderDetails, onPaymentError]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsLoading(true);

    try {
      // Confirm payment with the existing client secret
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/order-success`,
        },
        redirect: 'if_required',
      });

      if (stripeError) {
        onPaymentError(stripeError.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded
        onPaymentSuccess(paymentIntent.id);
      }
    } catch (error) {
      onPaymentError('Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: 'system-ui, -apple-system, sans-serif',
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-xl border-2 border-amber-200">
        <h3 className="text-lg font-bold text-amber-900 mb-4">Payment Details</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-semibold text-amber-800 mb-2">
            Card Information
          </label>
          <div className="p-4 border-2 border-amber-200 rounded-lg bg-white">
            <CardElement 
              options={cardElementOptions}
              onChange={(event) => {
                setCardComplete(event.complete);
                setCardError(event.error?.message || '');
              }}
            />
          </div>
        </div>

        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-6">
          <h4 className="font-semibold text-amber-900 mb-2">Order Summary</h4>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>Team: {customerInfo.teamName}</span>
              <span className="font-medium">${amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Plaque: {orderDetails.plaqueName}</span>
            </div>
            <div className="flex justify-between">
              <span>Positions: {orderDetails.numPositions}</span>
            </div>
            <div className="flex justify-between">
              <span>Cards: {orderDetails.numCards}</span>
            </div>
            {orderDetails.isPreOrder && (
              <div className="flex justify-between text-blue-600">
                <span>🚀 Pre-Order (Save 15%)</span>
                <span className="font-medium">-${orderDetails.savings?.toFixed(2) || '0.00'}</span>
              </div>
            )}
            {customerInfo.isGift && (
              <div className="flex justify-between text-green-600">
                <span>🎁 Gift Packaging: FREE</span>
              </div>
            )}
            {orderDetails.isPreOrder && (
              <div className="text-center pt-2 border-t border-amber-300">
                <span className="text-xs text-blue-600 font-medium">
                  Expected delivery: March 2025
                </span>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={!stripe || isLoading || !clientSecret || !cardComplete}
          className={`w-full py-4 text-lg font-bold rounded-xl transition-all transform hover:scale-[1.02] shadow-lg ${
            !stripe || isLoading || !clientSecret || !cardComplete
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Processing Payment...</span>
            </div>
          ) : (
            orderDetails.isPreOrder 
              ? `🚀 Pre-Order Now - $${amount.toFixed(2)}` 
              : `💳 Pay $${amount.toFixed(2)}`
          )}
        </button>
        
        {/* Checklist for why button might be disabled */}
        {(!stripe || !clientSecret || !cardComplete) && (
          <div className="mt-4 p-3 bg-gray-100 rounded-lg border border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-2">Complete these steps to enable payment:</p>
            <ul className="space-y-1 text-sm text-gray-600">
              {!stripe && (
                <li className="flex items-center">
                  <span className="text-red-500 mr-2">✗</span>
                  <span>Payment system is loading...</span>
                </li>
              )}
              {!clientSecret && (
                <li className="flex items-center">
                  <span className="text-red-500 mr-2">✗</span>
                  <span>Initializing payment...</span>
                </li>
              )}
              {!cardComplete && (
                <li className="flex items-center">
                  <span className="text-red-500 mr-2">✗</span>
                  <span>Enter complete card information (number, expiry, CVC, ZIP)</span>
                </li>
              )}
              {cardError && (
                <li className="flex items-center">
                  <span className="text-red-500 mr-2">✗</span>
                  <span className="text-red-600">{cardError}</span>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </form>
  );
}

export default function StripePaymentForm(props: PaymentFormProps) {
  if (!stripePromise) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <div className="text-yellow-800">
          <p className="font-semibold mb-2">Payment system is not configured</p>
          <p className="text-sm">Please add Stripe keys to your environment variables to enable payments.</p>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
} 