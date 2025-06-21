import { NextRequest, NextResponse } from 'next/server';
import { CardService } from '../../../lib/card-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const sort = searchParams.get('sort') || 'newest';

    const cardService = CardService.getInstance();
    
    // Use supabase directly since getSupabase is private
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Build query
    let query = supabase
      .from('seller_profiles')
      .select(`
        id,
        username,
        full_name,
        email,
        created_at
      `);

    // Apply search filter
    if (search) {
      query = query.or(`username.ilike.%${search}%,full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Apply status filter (mock implementation)
    // In real implementation, you'd have a status field in seller_profiles
    
    // Apply sorting
    switch (sort) {
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'username':
        query = query.order('username', { ascending: true });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    // Get total count
    const { count: totalCount } = await supabase
      .from('seller_profiles')
      .select('*', { count: 'exact', head: true });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: users, error } = await query;

    if (error) {
      throw error;
    }

    // Enhance users with additional data
    const enhancedUsers = await Promise.all(
      (users || []).map(async (user: any) => {
        // Get order statistics for each user
        const { data: orders } = await supabase
          .from('transactions')
          .select('total_amount, created_at')
          .eq('buyer_id', user.id)
          .eq('payment_status', 'paid');

        const totalOrders = orders?.length || 0;
        const totalSpent = orders?.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0) || 0;
        const lastOrderDate = orders?.length ? orders[orders.length - 1].created_at : null;

        return {
          ...user,
          total_orders: totalOrders,
          total_spent: totalSpent,
          last_order_date: lastOrderDate,
          status: 'active' as const // Mock status
        };
      })
    );

    const result = {
      users: enhancedUsers,
      total_count: totalCount || 0
    };

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
} 