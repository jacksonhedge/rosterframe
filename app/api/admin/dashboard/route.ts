import { NextRequest, NextResponse } from 'next/server';
import { CardService } from '../../../lib/card-service';

export async function GET(request: NextRequest) {
  try {
    const cardService = CardService.getInstance();

    // Get dashboard statistics
    const [
      totalCards,
      totalUsers, 
      totalOrders,
      totalRevenue,
      recentOrders,
      lowStockCards
    ] = await Promise.all([
      getTotalCards(cardService),
      getTotalUsers(cardService),
      getTotalOrders(cardService),
      getTotalRevenue(cardService),
      getRecentOrders(cardService),
      getLowStockCards(cardService)
    ]);

    const stats = {
      totalCards,
      totalUsers,
      totalOrders,
      totalRevenue,
      recentOrders,
      lowStockCards
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}

async function getTotalCards(cardService: any): Promise<number> {
  try {
    const supabase = cardService.getSupabase();
    const { count } = await supabase
      .from('cards')
      .select('*', { count: 'exact', head: true });
    return count || 0;
  } catch (error) {
    console.error('Error getting total cards:', error);
    return 0;
  }
}

async function getTotalUsers(cardService: any): Promise<number> {
  try {
    const supabase = cardService.getSupabase();
    const { count } = await supabase
      .from('seller_profiles')
      .select('*', { count: 'exact', head: true });
    return count || 0;
  } catch (error) {
    console.error('Error getting total users:', error);
    return 0;
  }
}

async function getTotalOrders(cardService: any): Promise<number> {
  try {
    const supabase = cardService.getSupabase();
    const { count } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true });
    return count || 0;
  } catch (error) {
    console.error('Error getting total orders:', error);
    return 0;
  }
}

async function getTotalRevenue(cardService: any): Promise<number> {
  try {
    const supabase = cardService.getSupabase();
    const { data } = await supabase
      .from('transactions')
      .select('total_amount')
      .eq('payment_status', 'paid');
    
    return data?.reduce((sum: number, transaction: any) => sum + (transaction.total_amount || 0), 0) || 0;
  } catch (error) {
    console.error('Error getting total revenue:', error);
    return 0;
  }
}

async function getRecentOrders(cardService: any): Promise<number> {
  try {
    const supabase = cardService.getSupabase();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { count } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString());
    
    return count || 0;
  } catch (error) {
    console.error('Error getting recent orders:', error);
    return 0;
  }
}

async function getLowStockCards(cardService: any): Promise<number> {
  try {
    const supabase = cardService.getSupabase();
    const { count } = await supabase
      .from('card_listings')
      .select('*', { count: 'exact', head: true })
      .eq('listing_status', 'active')
      .lt('asking_price', 10); // Mock low stock indicator
    
    return count || 0;
  } catch (error) {
    console.error('Error getting low stock cards:', error);
    return 0;
  }
} 