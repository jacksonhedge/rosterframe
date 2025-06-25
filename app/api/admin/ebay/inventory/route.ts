import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Get all eBay cards with their approval status
    const { data: cards, error } = await supabase
      .from('ebay_listings')
      .select(`
        *,
        cards (
          id,
          player_name,
          year,
          card_number,
          rarity,
          manufacturer_id,
          manufacturers (name)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Transform the data to match our interface
    const transformedCards = cards?.map(listing => ({
      id: listing.id,
      ebayItemId: listing.ebay_item_id,
      title: listing.title,
      playerName: listing.player_name || listing.cards?.player_name,
      year: listing.year || listing.cards?.year,
      brand: listing.brand || listing.cards?.manufacturers?.name,
      price: listing.ebay_price,
      ourPrice: listing.our_price,
      shipping: listing.shipping_cost || 0,
      imageUrl: listing.image_urls?.[0] || '',
      listingUrl: listing.listing_url,
      seller: listing.seller_username,
      sellerFeedback: listing.seller_feedback_percentage,
      condition: listing.condition,
      status: listing.approval_status || 'pending',
      approvedAt: listing.approved_at,
      approvedBy: listing.approved_by,
      notes: listing.approval_notes,
      affiliateUrl: listing.affiliate_url
    })) || [];

    return NextResponse.json({
      success: true,
      cards: transformedCards
    });
  } catch (error) {
    console.error('Error fetching eBay inventory:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inventory' },
      { status: 500 }
    );
  }
}