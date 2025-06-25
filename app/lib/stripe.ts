import Stripe from 'stripe';
import { Stripe as StripeJS } from '@stripe/stripe-js';

// Client-side Stripe (for frontend)
export const getStripe = async (): Promise<StripeJS | null> => {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  
  if (!publishableKey) {
    console.warn('⚠️ Stripe publishable key not found. Payment features will be disabled.');
    return null;
  }

  if (typeof window !== 'undefined') {
    const { loadStripe } = await import('@stripe/stripe-js');
    return await loadStripe(publishableKey);
  }
  
  return null;
};

// Server-side Stripe (for API routes)
export const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-01-27.acacia',
    })
  : null;

// Helper function to check if Stripe is configured
export const isStripeConfigured = () => {
  return !!(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
};

// Helper function for safe payment intent creation
export const createPaymentIntent = async (amount: number, currency = 'usd', metadata = {}) => {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please add your Stripe keys to environment variables.');
  }

  return await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency,
    metadata,
    automatic_payment_methods: {
      enabled: true,
    },
  });
};

// Helper function to format amount for Stripe (cents)
export const formatAmountForStripe = (amount: number, currency: string = 'usd'): number => {
  return Math.round(amount * 100);
};

// Helper function to format amount for display
export const formatAmountFromStripe = (amount: number, currency: string = 'usd'): number => {
  return amount / 100;
}; 