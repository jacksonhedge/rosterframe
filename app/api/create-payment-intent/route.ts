import { NextRequest, NextResponse } from 'next/server';
import { stripe, isStripeConfigured, createPaymentIntent } from '@/app/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { 
          error: 'Payment system not configured. Please add Stripe environment variables.',
          devMessage: 'Add STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to your .env.local file'
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { amount, currency = 'usd', metadata = {} } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount provided' },
        { status: 400 }
      );
    }

    // Create payment intent using helper function
    const paymentIntent = await createPaymentIntent(amount, currency, metadata);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });

  } catch (error: any) {
    console.error('Payment intent creation failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create payment intent',
        message: error?.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
} 