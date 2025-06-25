import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/app/lib/supabase';
import { sendOrderConfirmation } from '@/app/lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-01-27.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment succeeded:', paymentIntent.id);

        // Update order payment status
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            payment_status: 'succeeded',
            paid_at: new Date().toISOString(),
            stripe_customer_id: paymentIntent.customer as string || null,
          })
          .eq('stripe_payment_intent_id', paymentIntent.id);

        if (updateError) {
          console.error('Error updating order:', updateError);
          throw updateError;
        }

        // Get the order ID for status history and email sending
        const { data: orderData } = await supabase
          .from('orders')
          .select('id')
          .eq('stripe_payment_intent_id', paymentIntent.id)
          .single();
        
        const orderId = orderData?.id;

        if (orderId) {
          // Record status change
          await supabase.from('order_status_history').insert({
            order_id: orderId,
            status_type: 'payment',
            old_status: 'pending',
            new_status: 'succeeded',
            changed_by: 'system',
            notes: 'Payment completed via Stripe webhook',
          });

          // Send order confirmation email
          try {
            await sendOrderConfirmation(orderId);
            console.log('Order confirmation email sent for order:', orderId);
          } catch (emailError) {
            console.error('Failed to send order confirmation email:', emailError);
            // Don't throw error here - we don't want to fail the webhook if email fails
          }
        }

        // TODO: Trigger production workflow

        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment failed:', paymentIntent.id);

        // Update order status
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            payment_status: 'failed',
          })
          .eq('stripe_payment_intent_id', paymentIntent.id);

        if (updateError) {
          console.error('Error updating order:', updateError);
        }

        // Record status change
        await supabase.from('order_status_history').insert({
          order_id: (await supabase
            .from('orders')
            .select('id')
            .eq('stripe_payment_intent_id', paymentIntent.id)
            .single()
          ).data?.id,
          status_type: 'payment',
          old_status: 'pending',
          new_status: 'failed',
          changed_by: 'system',
          notes: `Payment failed: ${paymentIntent.last_payment_error?.message || 'Unknown error'}`,
        });

        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Checkout session completed:', session.id);

        // Update order with checkout session data
        if (session.payment_intent) {
          const { error: updateError } = await supabase
            .from('orders')
            .update({
              stripe_checkout_session_id: session.id,
              customer_email: session.customer_email || session.customer_details?.email || '',
              customer_name: session.customer_details?.name || '',
              customer_phone: session.customer_details?.phone || null,
            })
            .eq('stripe_payment_intent_id', session.payment_intent);

          if (updateError) {
            console.error('Error updating order with session data:', updateError);
          }
        }

        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        console.log('Charge refunded:', charge.id);

        if (charge.payment_intent) {
          // Determine if it's a full or partial refund
          const refundAmount = charge.amount_refunded;
          const chargeAmount = charge.amount;
          const isFullRefund = refundAmount >= chargeAmount;

          const { error: updateError } = await supabase
            .from('orders')
            .update({
              payment_status: isFullRefund ? 'refunded' : 'partial_refund',
            })
            .eq('stripe_payment_intent_id', charge.payment_intent);

          if (updateError) {
            console.error('Error updating order for refund:', updateError);
          }

          // Record status change
          await supabase.from('order_status_history').insert({
            order_id: (await supabase
              .from('orders')
              .select('id')
              .eq('stripe_payment_intent_id', charge.payment_intent)
              .single()
            ).data?.id,
            status_type: 'payment',
            old_status: 'succeeded',
            new_status: isFullRefund ? 'refunded' : 'partial_refund',
            changed_by: 'system',
            notes: `Refund processed: ${(refundAmount / 100).toFixed(2)} ${charge.currency.toUpperCase()}`,
          });
        }

        break;
      }

      case 'customer.created': {
        const customer = event.data.object as Stripe.Customer;
        console.log('Customer created:', customer.id);
        
        // You might want to create a customer profile in your database
        // This is optional but can be useful for customer management
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// Stripe webhooks must use the raw body, so we need to disable body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};