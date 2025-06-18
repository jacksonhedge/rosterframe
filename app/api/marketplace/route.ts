import { NextRequest, NextResponse } from 'next/server';
import cardService from '../../lib/card-service';
import { MarketplaceSearchFilters } from '../../lib/card-types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract marketplace search parameters
    const filters: MarketplaceSearchFilters = {
      sport: searchParams.get('sport') || undefined,
      player_name: searchParams.get('player_name') || undefined,
      team: searchParams.get('team') || undefined,
      year: searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined,
      manufacturer: searchParams.get('manufacturer') || undefined,
      set_name: searchParams.get('set_name') || undefined,
      card_type: searchParams.get('card_type') || undefined,
      rookie_card: searchParams.get('rookie_card') === 'true' ? true : undefined,
      min_price: searchParams.get('min_price') ? parseFloat(searchParams.get('min_price')!) : undefined,
      max_price: searchParams.get('max_price') ? parseFloat(searchParams.get('max_price')!) : undefined,
      condition: searchParams.get('condition') || undefined,
      graded_only: searchParams.get('graded_only') === 'true' ? true : undefined,
      min_grade: searchParams.get('min_grade') ? parseFloat(searchParams.get('min_grade')!) : undefined,
      max_grade: searchParams.get('max_grade') ? parseFloat(searchParams.get('max_grade')!) : undefined,
      seller_rating: searchParams.get('seller_rating') ? parseFloat(searchParams.get('seller_rating')!) : undefined,
      verified_sellers_only: searchParams.get('verified_sellers_only') === 'true' ? true : undefined,
      location: searchParams.get('location') || undefined,
      accepts_offers: searchParams.get('accepts_offers') === 'true' ? true : undefined,
      sort_by: searchParams.get('sort_by') as any || 'newest'
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof MarketplaceSearchFilters] === undefined) {
        delete filters[key as keyof MarketplaceSearchFilters];
      }
    });

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const result = await cardService.searchMarketplace(filters, page, limit);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error: unknown) {
    console.error('Marketplace API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch marketplace data' },
      { status: 500 }
    );
  }
} 