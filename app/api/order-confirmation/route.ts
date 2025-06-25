import { Resend } from 'resend';
import OrderConfirmationEmail from '@/app/emails/order-confirmation-email';
import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Fetch order details from Supabase
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }
    
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Error fetching order:', orderError);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Extract customer info
    const customerName = order.customer_name || order.customer_email?.split('@')[0] || 'Customer';
    const customerEmail = order.customer_email;

    if (!customerEmail) {
      return NextResponse.json(
        { error: 'Customer email not found' },
        { status: 400 }
      );
    }

    // Parse league data for team name
    const leagueData = order.league_data || {};
    const teamName = leagueData.teamName || 'Your Team';

    // Get plaque configuration
    const plaqueType = order.plaque_type || 'standard';
    const plaqueStyle = order.metadata?.plaqueStyle || 'classic';

    // Calculate amounts
    const subtotal = order.subtotal || order.total_amount || 0;
    const discountAmount = order.discount_amount || 0;
    const totalAmount = order.total_amount || 0;

    // Get shipping address if available
    const shippingAddress = order.shipping_address ? {
      line1: order.shipping_address.line1,
      line2: order.shipping_address.line2,
      city: order.shipping_address.city,
      state: order.shipping_address.state,
      postal_code: order.shipping_address.postal_code,
      country: order.shipping_address.country || 'US',
    } : undefined;

    // Check if it's a pre-order
    const isPreOrder = order.metadata?.is_pre_order === 'true';
    const estimatedDelivery = isPreOrder ? 'March 2025' : '7-10 business days';

    // Get preview URL if available
    const previewUrl = order.preview_url || order.metadata?.preview_url;

    // Use your verified domain or fall back to development email
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

    const { data, error } = await resend.emails.send({
      from: `RosterFrame <${fromEmail}>`,
      to: customerEmail,
      subject: `Order Confirmed #${order.order_number} - Your ${teamName} Plaque 🏆`,
      react: OrderConfirmationEmail({
        customerName,
        orderNumber: order.order_number,
        teamName,
        plaqueType,
        plaqueStyle,
        subtotal,
        discountAmount,
        totalAmount,
        shippingAddress,
        giftPackaging: order.gift_packaging || false,
        estimatedDelivery,
        isPreOrder,
        previewUrl,
      }),
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ 
        error: error.message || 'Failed to send email' 
      }, { status: 400 });
    }

    // Update order to indicate confirmation email was sent
    await supabase
      .from('orders')
      .update({ 
        confirmation_email_sent: true,
        confirmation_email_sent_at: new Date().toISOString()
      })
      .eq('id', orderId);

    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Order confirmation email sent successfully!' 
    });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: 'Failed to send order confirmation email' },
      { status: 500 }
    );
  }
}

// Helper function to send order confirmation (can be called from other places)
export async function sendOrderConfirmation(orderId: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/order-confirmation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ orderId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to send order confirmation');
  }

  return response.json();
}