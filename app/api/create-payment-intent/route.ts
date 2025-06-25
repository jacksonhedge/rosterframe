import { NextRequest, NextResponse } from 'next/server';
import { isStripeConfigured, createPaymentIntent } from '@/app/lib/stripe';
import { supabase } from '@/app/lib/supabase';

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
    const { 
      amount, 
      currency = 'usd', 
      metadata = {},
      orderData 
    } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount provided' },
        { status: 400 }
      );
    }

    if (!orderData) {
      return NextResponse.json(
        { error: 'Order data is required' },
        { status: 400 }
      );
    }

    // Create payment intent using helper function
    const paymentIntent = await createPaymentIntent(amount, currency, metadata);

    // Create order in database
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }
    
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        stripe_payment_intent_id: paymentIntent.id,
        customer_email: orderData.customerEmail,
        customer_name: orderData.customerName,
        customer_phone: orderData.customerPhone || null,
        plaque_type: orderData.plaqueType,
        plaque_size: orderData.plaqueSize || 'medium',
        engraving_text: orderData.engravingText || null,
        gift_packaging: orderData.giftPackaging || false,
        league_data: orderData.leagueData,
        selected_players: orderData.selectedPlayers,
        subtotal: orderData.subtotal,
        discount_amount: orderData.discountAmount || 0,
        discount_code: orderData.discountCode || null,
        shipping_cost: orderData.shippingCost || 0,
        tax_amount: orderData.taxAmount || 0,
        total_amount: amount / 100, // Convert from cents to dollars
        currency: currency,
        shipping_address: orderData.shippingAddress,
        shipping_method: orderData.shippingMethod || 'standard',
        preview_image_url: orderData.previewImageUrl || null,
        payment_status: 'pending',
        fulfillment_status: 'pending',
        metadata: metadata
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      // Still return the payment intent even if order creation fails
      // The webhook will attempt to create the order again
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      orderId: order?.id,
      orderNumber: order?.order_number,
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