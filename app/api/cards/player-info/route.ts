import { NextRequest, NextResponse } from 'next/server';
import { cardInventory, getCardsByPlayer } from '@/app/data/card-inventory';
import { ebayFindingAPI } from '@/app/lib/ebay-finding-api';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const playerName = searchParams.get('player');
    const sport = searchParams.get('sport') || 'NFL';
    
    if (!playerName) {
      return NextResponse.json(
        { error: 'Player name is required' },
        { status: 400 }
      );
    }

    // Get cards from local inventory
    const inventoryCards = getCardsByPlayer(playerName);
    let inventoryCount = inventoryCards.length;
    let inventoryPriceRange = {
      min: inventoryCards.length > 0 ? Math.min(...inventoryCards.map(c => c.price)) : 0,
      max: inventoryCards.length > 0 ? Math.max(...inventoryCards.map(c => c.price)) : 0
    };

    // Try to get eBay card count and price range
    let ebayCount = 0;
    let ebayPriceRange = { min: 0, max: 0 };
    
    try {
      // Build search query
      const sportTerms: Record<string, string> = {
        'NFL': 'football card',
        'MLB': 'baseball card',
        'NBA': 'basketball card',
        'NHL': 'hockey card'
      };
      const searchQuery = `${playerName} ${sportTerms[sport] || 'trading card'}`;
      
      // Quick eBay search just to get count and price range
      const results = await ebayFindingAPI.searchCards({
        keywords: searchQuery,
        categoryId: '212', // Sports Trading Cards
        limit: 10, // Just need a sample for stats
        sortOrder: 'BestMatch',
        minPrice: 1,
        maxPrice: 500,
      });
      
      if (results.items && results.items.length > 0) {
        ebayCount = results.totalItems || 0;
        const prices = results.items.map(item => item.currentPrice).filter(p => p > 0);
        if (prices.length > 0) {
          ebayPriceRange = {
            min: Math.min(...prices),
            max: Math.max(...prices)
          };
        }
      }
    } catch (ebayError) {
      console.log('eBay API not available for player info:', ebayError);
      // Continue with just inventory data
    }

    // Combine counts and price ranges
    const totalCount = inventoryCount + (ebayCount > 0 ? Math.min(ebayCount, 100) : 0); // Cap eBay count at 100
    const priceRange = {
      min: Math.min(
        inventoryPriceRange.min || Infinity, 
        ebayPriceRange.min || Infinity
      ) || 0,
      max: Math.max(
        inventoryPriceRange.max || 0, 
        ebayPriceRange.max || 0
      ) || 0
    };

    // Get player stats (mock data for now, you could integrate with a sports API)
    const playerStats = getPlayerStats(playerName, sport);

    return NextResponse.json({
      success: true,
      player: playerName,
      sport: sport,
      cardCount: totalCount,
      inventoryCount: inventoryCount,
      ebayCount: ebayCount,
      priceRange: priceRange,
      stats: playerStats
    });

  } catch (error) {
    console.error('Player info error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get player info',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Mock player stats - replace with real sports API integration
function getPlayerStats(playerName: string, sport: string) {
  // This is mock data - you would integrate with a real sports stats API
  const mockStats: Record<string, any> = {
    'Patrick Mahomes': {
      passingYards: 5250,
      touchdowns: 41,
      completionPercentage: 67.1,
      qbRating: 105.2
    },
    'Jonathan Taylor': {
      rushingYards: 1811,
      touchdowns: 18,
      yardsPerCarry: 5.5,
      receptions: 40
    },
    'Chris Godwin': {
      receptions: 98,
      receivingYards: 1103,
      touchdowns: 7,
      yardsPerReception: 11.3
    },
    // Add more players as needed
  };
  
  return mockStats[playerName] || null;
}