import { NextRequest, NextResponse } from 'next/server';
import { ebayAPI } from '@/app/lib/ebay-api';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Search query is required' },
        { status: 400 }
      );
    }

    // For testing, let's use the Finding API approach since Browse API might need more setup
    // We'll search for sports cards with the given query
    const searchParams = {
      keywords: query + ' sports card',
      categoryId: '212', // Sports Trading Cards category
      limit: 12,
      sortOrder: 'BestMatch' as const,
    };

    const results = await ebayAPI.searchCards(searchParams);
    
    return NextResponse.json({
      success: true,
      query: query,
      totalItems: results.totalItems,
      items: results.items.map(item => ({
        ebayItemId: item.ebayItemId,
        title: item.title,
        playerName: item.playerName,
        year: item.year,
        brand: item.brand,
        currentPrice: item.currentPrice,
        imageUrls: item.imageUrls,
        listingUrl: item.listingUrl,
        seller: item.seller,
      })),
    });
  } catch (error) {
    console.error('eBay search error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Search failed',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}