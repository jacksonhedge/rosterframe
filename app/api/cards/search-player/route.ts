import { NextRequest, NextResponse } from 'next/server';
import { ebayAPI } from '@/app/lib/ebay-api';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const playerName = searchParams.get('player');
    const sport = searchParams.get('sport') || '';
    
    if (!playerName) {
      return NextResponse.json(
        { error: 'Player name is required' },
        { status: 400 }
      );
    }

    // Build search query based on player name and sport
    let searchQuery = playerName;
    
    // Add sport-specific terms for better results
    if (sport) {
      const sportTerms: Record<string, string> = {
        'NFL': 'football card',
        'MLB': 'baseball card',
        'NBA': 'basketball card',
        'NHL': 'hockey card'
      };
      searchQuery = `${playerName} ${sportTerms[sport] || 'trading card'}`;
    } else {
      searchQuery = `${playerName} trading card`;
    }

    // Search eBay for cards
    const results = await ebayAPI.searchCards({
      keywords: searchQuery,
      categoryId: '212', // Sports Trading Cards
      limit: 20,
      sortOrder: 'BestMatch',
      minPrice: 1, // Filter out very cheap items
      maxPrice: 500, // Reasonable upper limit
    });

    // Transform results to match our card format
    const cards = results.items.map(item => ({
      id: item.ebayItemId,
      playerName: playerName,
      name: item.title,
      year: extractYear(item.title) || new Date().getFullYear(),
      brand: extractBrand(item.title) || 'Various',
      series: extractSeries(item.title) || 'Base',
      condition: item.condition || 'Good',
      price: item.currentPrice,
      rarity: determineRarity(item.currentPrice),
      imageUrl: item.imageUrls[0] || '',
      seller: item.seller?.username,
      shipping: item.shipping?.cost || 0,
      listingUrl: item.listingUrl,
      // Additional eBay-specific data
      ebayData: {
        endTime: item.endTime,
        listingType: item.listingType,
        location: item.location,
        feedbackScore: item.seller?.feedbackScore,
        feedbackPercentage: item.seller?.feedbackPercentage,
      }
    }));

    return NextResponse.json({
      success: true,
      player: playerName,
      sport: sport,
      totalResults: results.totalItems,
      cards: cards
    });

  } catch (error) {
    console.error('Player card search error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to search cards',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper functions to extract card details from titles
function extractYear(title: string): number | null {
  // Look for 4-digit years (1900-2099)
  const yearMatch = title.match(/\b(19\d{2}|20\d{2})\b/);
  return yearMatch ? parseInt(yearMatch[1]) : null;
}

function extractBrand(title: string): string | null {
  const brands = [
    'Topps', 'Panini', 'Upper Deck', 'Bowman', 'Prizm', 'Select', 'Optic',
    'Donruss', 'Fleer', 'Score', 'Pro Set', 'Leaf', 'Stadium Club',
    'Chrome', 'Mosaic', 'Contenders', 'Absolute', 'Phoenix'
  ];
  
  const titleLower = title.toLowerCase();
  for (const brand of brands) {
    if (titleLower.includes(brand.toLowerCase())) {
      return brand;
    }
  }
  return null;
}

function extractSeries(title: string): string | null {
  const series = [
    'Rookie', 'RC', 'Base', 'Chrome', 'Prizm', 'Refractor', 'Parallel',
    'Insert', 'Auto', 'Autograph', 'Jersey', 'Patch', 'Relic',
    'Silver', 'Gold', 'Black', 'Red', 'Blue', 'Green'
  ];
  
  const titleLower = title.toLowerCase();
  for (const s of series) {
    if (titleLower.includes(s.toLowerCase())) {
      return s;
    }
  }
  return null;
}

function determineRarity(price: number): 'common' | 'rare' | 'legendary' {
  if (price >= 100) return 'legendary';
  if (price >= 25) return 'rare';
  return 'common';
}