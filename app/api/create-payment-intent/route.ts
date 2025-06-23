import { NextRequest, NextResponse } from 'next/server';
import { isStripeConfigured, createPaymentIntent } from '@/app/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!isStripeConfigured()) {
      // Return a mock payment intent for testing purposes
      console.warn('⚠️ Stripe not configured. Returning mock payment intent for testing.');
      
      const body = await request.json();
      const { amount } = body;
      
      return NextResponse.json({
        clientSecret: `pi_test_mock_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
        paymentIntentId: `pi_test_mock_${Date.now()}`,
        warning: 'This is a mock payment intent. Stripe is not configured.',
        amount: amount
      });
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

  } catch (error: unknown) {
    console.error('Payment intent creation failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create payment intent',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
} 