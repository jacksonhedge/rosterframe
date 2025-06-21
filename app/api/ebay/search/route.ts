import { NextRequest, NextResponse } from 'next/server';
import { ebayAPI, type EBaySearchParams } from '../../../lib/ebay-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract search parameters
    const searchQuery: EBaySearchParams = {
      keywords: searchParams.get('q') || '',
      categoryId: searchParams.get('category') || undefined,
      minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
      condition: searchParams.get('condition')?.split(',').filter(Boolean) || undefined,
      sortOrder: (searchParams.get('sort') as EBaySearchParams['sortOrder']) || 'BestMatch',
      limit: parseInt(searchParams.get('limit') || '20'),
      page: parseInt(searchParams.get('page') || '1'),
    };

    // Validate required parameters
    if (!searchQuery.keywords.trim()) {
      return NextResponse.json(
        { error: 'Search keywords are required' },
        { status: 400 }
      );
    }

    // Call eBay API
    const results = await ebayAPI.searchCards(searchQuery);

    // Add our pricing to each card
    const cardsWithOurPricing = results.items.map(card => ({
      ...card,
      ourPrice: ebayAPI.calculateOurPrice(card.currentPrice),
      totalCost: card.currentPrice + (card.shipping?.cost || 0),
      totalOurPrice: ebayAPI.calculateOurPrice(card.currentPrice + (card.shipping?.cost || 0)),
    }));

    return NextResponse.json({
      success: true,
      data: {
        ...results,
        items: cardsWithOurPricing,
      },
      searchParams: searchQuery,
    });

  } catch (error) {
    console.error('eBay search API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to search eBay marketplace',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'import_cards':
        return await importCardsToInventory(data.cardIds);
      
      case 'save_search':
        return await saveSearchResults(data);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('eBay search POST error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

/**
 * Import selected eBay cards to our inventory
 */
async function importCardsToInventory(cardIds: string[]) {
  // TODO: Implement card import functionality
  // This would:
  // 1. Get detailed item information for each card
  // 2. Save to ebay_listings table
  // 3. Create entries in cards table with source='ebay'
  // 4. Return success/failure count
  
  return NextResponse.json({
    success: true,
    message: `Import functionality coming soon. Would import ${cardIds.length} cards.`,
    imported: 0,
    failed: 0,
  });
}

/**
 * Save search results to cache
 */
async function saveSearchResults(data: any) {
  // TODO: Implement search caching
  // This would save search results to ebay_search_cache table
  
  return NextResponse.json({
    success: true,
    message: 'Search caching functionality coming soon.',
  });
} 