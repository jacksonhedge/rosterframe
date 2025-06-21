import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const payment = searchParams.get('payment') || 'all';

    // Use supabase directly
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Build query
    let query = supabase
      .from('transactions')
      .select(`
        id,
        order_number,
        total_amount,
        payment_status,
        fulfillment_status,
        created_at,
        buyer:seller_profiles!buyer_id(username, full_name)
      `);

    // Apply search filter
    if (search) {
      query = query.or(`order_number.ilike.%${search}%,buyer.username.ilike.%${search}%`);
    }

    // Apply status filters
    if (status !== 'all') {
      query = query.eq('fulfillment_status', status);
    }

    if (payment !== 'all') {
      query = query.eq('payment_status', payment);
    }

    // Apply sorting (newest first)
    query = query.order('created_at', { ascending: false });

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true });

    // Get total revenue
    const { data: revenueData } = await supabase
      .from('transactions')
      .select('total_amount')
      .eq('payment_status', 'paid');

    const totalRevenue = revenueData?.reduce((sum: number, transaction: any) => sum + (transaction.total_amount || 0), 0) || 0;

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: orders, error } = await query;

    if (error) {
      throw error;
    }

    // Enhance orders with additional data
    const enhancedOrders = await Promise.all(
      (orders || []).map(async (order: any) => {
        // Get item count for each order
        const { count: itemsCount } = await supabase
          .from('transaction_items')
          .select('*', { count: 'exact', head: true })
          .eq('transaction_id', order.id);

        return {
          ...order,
          user: order.buyer,
          items_count: itemsCount || 0,
          fulfillment_status: order.fulfillment_status || 'pending' // Default status
        };
      })
    );

    const result = {
      orders: enhancedOrders,
      total_count: totalCount || 0,
      total_revenue: totalRevenue
    };

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
} 