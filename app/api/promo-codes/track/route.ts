import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      promoCode,
      orderId,
      paymentIntentId,
      teamName,
      customerEmail,
      originalAmount,
      discountedAmount,
      savingsAmount,
      plaqueType,
      plaqueStyle,
      numPositions,
      numCards,
      isGift,
      sessionId,
      metadata
    } = body;

    // Get IP address and user agent
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Insert promo code usage
    const { data, error } = await supabase
      .from('promo_code_usage')
      .insert([
        {
          promo_code: promoCode,
          order_id: orderId,
          payment_intent_id: paymentIntentId,
          team_name: teamName,
          customer_email: customerEmail,
          original_amount: originalAmount,
          discounted_amount: discountedAmount,
          savings_amount: savingsAmount,
          plaque_type: plaqueType,
          plaque_style: plaqueStyle,
          num_positions: numPositions,
          num_cards: numCards,
          is_gift: isGift,
          session_id: sessionId,
          ip_address: ip,
          user_agent: userAgent,
          metadata: metadata || {}
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error tracking promo code:', error);
      return NextResponse.json(
        { error: 'Failed to track promo code usage' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Promo code usage tracked successfully',
      data 
    });

  } catch (error) {
    console.error('Error in promo code tracking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve promo code analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const promoCode = searchParams.get('code');

    if (promoCode) {
      // Get specific promo code usage
      const { data, error } = await supabase
        .from('promo_code_usage')
        .select('*')
        .eq('promo_code', promoCode)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return NextResponse.json({ data });
    } else {
      // Get analytics view
      const { data, error } = await supabase
        .from('promo_code_analytics')
        .select('*');

      if (error) throw error;

      return NextResponse.json({ data });
    }
  } catch (error) {
    console.error('Error fetching promo code data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch promo code data' },
      { status: 500 }
    );
  }
}