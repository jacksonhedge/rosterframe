import Stripe from 'stripe';
import { Stripe as StripeJS } from '@stripe/stripe-js';

// Production-ready Stripe configuration with enhanced features

// Client-side Stripe instance cache
let stripePromise: Promise<StripeJS | null> | null = null;

// Client-side Stripe (for frontend)
export const getStripe = async (): Promise<StripeJS | null> => {
  if (!stripePromise) {
    stripePromise = loadStripeJS();
  }
  return stripePromise;
};

async function loadStripeJS(): Promise<StripeJS | null> {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  
  if (!publishableKey) {
    console.warn('⚠️ Stripe publishable key not found. Payment features will be disabled.');
    return null;
  }

  if (typeof window !== 'undefined') {
    const { loadStripe } = await import('@stripe/stripe-js');
    return await loadStripe(publishableKey, {
      // Optional: Add connected account if using Stripe Connect
      // stripeAccount: 'acct_xxx',
      
      // Optional: Customize appearance
      // appearance: {
      //   theme: 'stripe',
      // },
    });
  }
  
  return null;
}

// Server-side Stripe instance with better error handling
const createStripeInstance = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  
  if (!secretKey) {
    console.warn('⚠️ Stripe secret key not found. Server-side payment features will be disabled.');
    return null;
  }
  
  try {
    return new Stripe(secretKey, {
      apiVersion: '2025-01-27.acacia',
      // Add telemetry metadata for better debugging in Stripe Dashboard
      appInfo: {
        name: 'RosterFrame',
        version: '1.0.0',
        url: 'https://rosterframe.com',
      },
      // Optional: Set maximum network retries
      maxNetworkRetries: 3,
    });
  } catch (error) {
    console.error('Failed to initialize Stripe:', error);
    return null;
  }
};

export const stripe = createStripeInstance();

// Environment configuration helper
export const stripeConfig = {
  isProduction: process.env.NODE_ENV === 'production',
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  secretKey: process.env.STRIPE_SECRET_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  isConfigured: () => {
    return !!(
      process.env.STRIPE_SECRET_KEY && 
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
      process.env.STRIPE_WEBHOOK_SECRET
    );
  },
  isTestMode: () => {
    const key = process.env.STRIPE_SECRET_KEY || '';
    return key.startsWith('sk_test_');
  },
};

// Enhanced payment intent creation with better error handling
export const createPaymentIntent = async (
  amount: number, 
  currency = 'usd', 
  metadata: Stripe.MetadataParam = {},
  options: {
    description?: string;
    receipt_email?: string;
    shipping?: Stripe.PaymentIntentCreateParams.Shipping;
    statement_descriptor?: string;
    transfer_group?: string;
  } = {}
): Promise<Stripe.PaymentIntent> => {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please add your Stripe keys to environment variables.');
  }

  if (amount <= 0) {
    throw new Error('Amount must be greater than zero');
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: formatAmountForStripe(amount, currency),
      currency,
      metadata: {
        ...metadata,
        environment: process.env.NODE_ENV,
        created_at: new Date().toISOString(),
      },
      automatic_payment_methods: {
        enabled: true,
        // Allow redirects for payment methods like bank transfers
        allow_redirects: 'always',
      },
      // Add optional parameters
      ...(options.description && { description: options.description }),
      ...(options.receipt_email && { receipt_email: options.receipt_email }),
      ...(options.shipping && { shipping: options.shipping }),
      ...(options.statement_descriptor && { 
        statement_descriptor: options.statement_descriptor.substring(0, 22) // Max 22 chars
      }),
      ...(options.transfer_group && { transfer_group: options.transfer_group }),
    });

    return paymentIntent;
  } catch (error) {
    console.error('Failed to create payment intent:', error);
    throw new Error(
      error instanceof Stripe.errors.StripeError 
        ? error.message 
        : 'Failed to create payment intent'
    );
  }
};

// Create or retrieve a customer
export const createOrRetrieveCustomer = async (
  email: string,
  name?: string,
  metadata?: Stripe.MetadataParam
): Promise<Stripe.Customer | null> => {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  try {
    // First, try to find existing customer by email
    const existingCustomers = await stripe.customers.list({
      email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      const customer = existingCustomers.data[0];
      
      // Update customer if name provided and different
      if (name && name !== customer.name) {
        return await stripe.customers.update(customer.id, {
          name,
          metadata,
        });
      }
      
      return customer;
    }

    // Create new customer
    return await stripe.customers.create({
      email,
      name,
      metadata: {
        ...metadata,
        created_via: 'rosterframe_checkout',
        created_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Failed to create/retrieve customer:', error);
    throw error;
  }
};

// Create a checkout session (alternative to payment intents)
export const createCheckoutSession = async (
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
  options: {
    customerEmail?: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: Stripe.MetadataParam;
    shippingOptions?: Stripe.Checkout.SessionCreateParams.ShippingOption[];
    allowPromotionCodes?: boolean;
  }
): Promise<Stripe.Checkout.Session> => {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: options.successUrl,
      cancel_url: options.cancelUrl,
      ...(options.customerEmail && { customer_email: options.customerEmail }),
      ...(options.metadata && { metadata: options.metadata }),
      ...(options.shippingOptions && { 
        shipping_address_collection: {
          allowed_countries: ['US', 'CA'],
        },
        shipping_options: options.shippingOptions,
      }),
      ...(options.allowPromotionCodes && { 
        allow_promotion_codes: true,
      }),
      // Enable tax calculation if needed
      // automatic_tax: { enabled: true },
      
      // Collect phone number
      phone_number_collection: {
        enabled: true,
      },
      
      // Invoice options
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: 'RosterFrame Custom Plaque Order',
          metadata: options.metadata,
        },
      },
    });

    return session;
  } catch (error) {
    console.error('Failed to create checkout session:', error);
    throw error;
  }
};

// Helper to create a product (for checkout sessions)
export const createProduct = async (
  name: string,
  description: string,
  images: string[] = [],
  metadata?: Stripe.MetadataParam
): Promise<Stripe.Product> => {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  try {
    return await stripe.products.create({
      name,
      description,
      images,
      metadata,
    });
  } catch (error) {
    console.error('Failed to create product:', error);
    throw error;
  }
};

// Helper to create a price (for checkout sessions)
export const createPrice = async (
  productId: string,
  amount: number,
  currency = 'usd',
  options: {
    nickname?: string;
    recurring?: Stripe.PriceCreateParams.Recurring;
    metadata?: Stripe.MetadataParam;
  } = {}
): Promise<Stripe.Price> => {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  try {
    return await stripe.prices.create({
      product: productId,
      unit_amount: formatAmountForStripe(amount, currency),
      currency,
      ...(options.nickname && { nickname: options.nickname }),
      ...(options.recurring && { recurring: options.recurring }),
      ...(options.metadata && { metadata: options.metadata }),
    });
  } catch (error) {
    console.error('Failed to create price:', error);
    throw error;
  }
};

// Refund helpers
export const createRefund = async (
  paymentIntentId: string,
  amount?: number,
  reason?: Stripe.RefundCreateParams.Reason,
  metadata?: Stripe.MetadataParam
): Promise<Stripe.Refund> => {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  try {
    return await stripe.refunds.create({
      payment_intent: paymentIntentId,
      ...(amount && { amount: formatAmountForStripe(amount) }),
      ...(reason && { reason }),
      metadata: {
        ...metadata,
        refunded_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Failed to create refund:', error);
    throw error;
  }
};

// Webhook signature verification
export const verifyWebhookSignature = (
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event => {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    throw error;
  }
};

// Helper function to format amount for Stripe (cents)
export const formatAmountForStripe = (
  amount: number, 
  currency: string = 'usd'
): number => {
  // Handle zero-decimal currencies
  const zeroDecimalCurrencies = ['jpy', 'krw', 'vnd', 'clp', 'pyg', 'xaf', 'xof', 'xpf'];
  
  if (zeroDecimalCurrencies.includes(currency.toLowerCase())) {
    return Math.round(amount);
  }
  
  return Math.round(amount * 100);
};

// Helper function to format amount for display
export const formatAmountFromStripe = (
  amount: number, 
  currency: string = 'usd'
): number => {
  const zeroDecimalCurrencies = ['jpy', 'krw', 'vnd', 'clp', 'pyg', 'xaf', 'xof', 'xpf'];
  
  if (zeroDecimalCurrencies.includes(currency.toLowerCase())) {
    return amount;
  }
  
  return amount / 100;
};

// Format currency for display
export const formatCurrency = (
  amount: number,
  currency: string = 'usd',
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount);
};

// Error handling utilities
export const isStripeError = (error: unknown): error is Stripe.errors.StripeError => {
  return error instanceof Error && 'type' in error;
};

export const getStripeErrorMessage = (error: unknown): string => {
  if (isStripeError(error)) {
    switch (error.type) {
      case 'StripeCardError':
        return error.message || 'Your card was declined.';
      case 'StripeRateLimitError':
        return 'Too many requests. Please try again later.';
      case 'StripeInvalidRequestError':
        return 'Invalid request. Please check your information.';
      case 'StripeAPIError':
        return 'Payment service temporarily unavailable. Please try again.';
      case 'StripeConnectionError':
        return 'Network error. Please check your connection and try again.';
      case 'StripeAuthenticationError':
        return 'Authentication failed. Please contact support.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }
  
  return 'An unexpected error occurred. Please try again.';
};