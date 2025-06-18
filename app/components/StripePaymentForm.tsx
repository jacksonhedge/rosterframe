'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

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
            },
          }),
        });

        const data = await response.json();
        
        if (data.error) {
          onPaymentError(data.error);
        } else {
          setClientSecret(data.client_secret);
        }
      } catch (error) {
        onPaymentError('Failed to initialize payment');
      }
    };

    createPaymentIntent();
  }, [amount, customerInfo, orderDetails, onPaymentError]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      // Create payment intent
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
          },
        }),
      });

      const { clientSecret } = await response.json();

      // Confirm payment
      const { error: stripeError } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/build-and-buy?payment=success`,
        },
        redirect: 'if_required',
      });

      if (stripeError) {
        onPaymentError(stripeError.message || 'Payment failed');
      } else {
        if (onPaymentSuccess) {
          onPaymentSuccess(clientSecret);
        }
      }
    } catch {
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
            <CardElement options={cardElementOptions} />
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
          disabled={!stripe || isLoading || !clientSecret}
          className={`w-full py-4 text-lg font-bold rounded-xl transition-all transform hover:scale-[1.02] shadow-lg ${
            !stripe || isLoading || !clientSecret
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
      </div>
    </form>
  );
}

export default function StripePaymentForm(props: PaymentFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
} 