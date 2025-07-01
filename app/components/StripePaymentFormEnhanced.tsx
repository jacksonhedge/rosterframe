'use client';

import { useState, useEffect } from 'react';
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
  AddressElement,
} from '@stripe/react-stripe-js';
import { getStripe, formatCurrency } from '@/app/lib/stripe-enhanced';
import type { StripePaymentElementOptions } from '@stripe/stripe-js';

interface StripePaymentFormEnhancedProps {
  amount: number;
  currency?: string;
  orderId?: string;
  customerEmail?: string;
  customerName?: string;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: string) => void;
  metadata?: Record<string, string>;
  showBillingAddress?: boolean;
  showShippingAddress?: boolean;
}

function PaymentForm({
  amount,
  currency = 'usd',
  orderId,
  customerEmail,
  customerName,
  onSuccess,
  onError,
  metadata,
  showBillingAddress = true,
  showShippingAddress = false,
}: StripePaymentFormEnhancedProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [paymentIntentId, setPaymentIntentId] = useState<string>('');
  const [clientSecret, setClientSecret] = useState<string>('');

  // Create payment intent
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount,
            currency,
            metadata: {
              ...metadata,
              orderId: orderId || '',
              customerEmail: customerEmail || '',
              customerName: customerName || '',
            },
            orderData: {
              customerEmail,
              customerName,
              // Add other order data as needed
            },
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create payment intent');
        }

        setClientSecret(data.clientSecret);
        setPaymentIntentId(data.paymentIntentId);
      } catch (error) {
        console.error('Error creating payment intent:', error);
        setErrorMessage(error instanceof Error ? error.message : 'Failed to initialize payment');
        onError?.(error instanceof Error ? error.message : 'Failed to initialize payment');
      }
    };

    createPaymentIntent();
  }, [amount, currency, orderId, customerEmail, customerName, metadata, onError]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      // Confirm the payment
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-success?payment_intent=${paymentIntentId}`,
          receipt_email: customerEmail,
          payment_method_data: {
            billing_details: {
              email: customerEmail,
              name: customerName,
            },
          },
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        setErrorMessage(confirmError.message || 'Payment failed');
        onError?.(confirmError.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess?.(paymentIntent.id);
      }
    } catch (error) {
      console.error('Payment error:', error);
      const message = error instanceof Error ? error.message : 'Payment failed';
      setErrorMessage(message);
      onError?.(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const paymentElementOptions: StripePaymentElementOptions = {
    layout: 'tabs',
    defaultValues: {
      billingDetails: {
        email: customerEmail,
        name: customerName,
      },
    },
    business: {
      name: 'RosterFrame',
    },
    fields: {
      billingDetails: {
        email: showBillingAddress ? 'auto' : 'never',
        name: showBillingAddress ? 'auto' : 'never',
        phone: showBillingAddress ? 'auto' : 'never',
        address: showBillingAddress ? 'auto' : 'never',
      },
    },
  };

  if (!clientSecret) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Order Summary */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-2">Order Summary</h3>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total Amount:</span>
          <span className="text-xl font-bold text-gray-900">
            {formatCurrency(amount, currency)}
          </span>
        </div>
      </div>

      {/* Payment Element */}
      <div className="border border-gray-200 rounded-lg p-4">
        <PaymentElement 
          options={paymentElementOptions}
          className="mb-4"
        />
      </div>

      {/* Shipping Address (if enabled) */}
      {showShippingAddress && (
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Shipping Address</h3>
          <AddressElement 
            options={{
              mode: 'shipping',
              defaultValues: {
                name: customerName,
              },
            }}
          />
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="text-sm">{errorMessage}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all ${
          !stripe || isProcessing
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-700 hover:to-yellow-600 shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
        }`}
      >
        {isProcessing ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Processing Payment...
          </div>
        ) : (
          `Pay ${formatCurrency(amount, currency)}`
        )}
      </button>

      {/* Security Badge */}
      <div className="flex items-center justify-center text-xs text-gray-500">
        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        Secure payment powered by Stripe
      </div>

      {/* Test Mode Warning */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-xs text-yellow-800">
            <strong>Test Mode:</strong> Use card number 4242 4242 4242 4242 with any future expiry date and CVC.
          </p>
        </div>
      )}
    </form>
  );
}

export default function StripePaymentFormEnhanced(props: StripePaymentFormEnhancedProps) {
  const [stripePromise, setStripePromise] = useState<any>(null);

  useEffect(() => {
    getStripe().then(setStripePromise);
  }, []);

  if (!stripePromise) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center">
          <svg className="animate-spin h-5 w-5 mr-3 text-amber-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-gray-600">Loading payment system...</span>
        </div>
      </div>
    );
  }

  return (
    <Elements 
      stripe={stripePromise}
      options={{
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#d97706', // amber-600
            colorBackground: '#ffffff',
            colorText: '#1f2937',
            colorDanger: '#dc2626',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            borderRadius: '8px',
          },
        },
      }}
    >
      <PaymentForm {...props} />
    </Elements>
  );
}