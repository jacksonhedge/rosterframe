import { NextRequest, NextResponse } from 'next/server';
import { ebayAPI } from '../../../lib/ebay-api';
import { CardService } from '../../../lib/card-service';

interface UnifiedCard {
  id: string;
  playerName: string;
  year: number;
  brand: string;
  series: string;
  condition: string;
  price: number;
  shipping: number;
  imageUrl: string;
  backImageUrl?: string;
  rarity: 'common' | 'rare' | 'legendary';
  availability: 'in-stock' | 'sourced-on-demand';
  estimatedShipTime: string; // "Ships in 1-2 days" vs "Ships in 7-10 days"
  source: 'internal' | 'marketplace'; // Hidden from customer, used internally
  sourceDetails?: any; // eBay details for admin use only
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
    const includeMarketplace = searchParams.get('includeMarketplace') !== 'false'; // Default true

    if (!query.trim()) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    const results: UnifiedCard[] = [];

    // 1. Search internal inventory first
    try {
      const cardService = CardService.getInstance();
      const internalResults = await cardService.searchCards(
        { player_name: query },
        page,
        Math.min(limit, 50)
      );

      // Convert internal cards to unified format
      for (const card of internalResults.cards || []) {
        results.push({
          id: card.id,
          playerName: card.player?.name || 'Unknown Player',
          year: card.set?.year || new Date().getFullYear(),
          brand: card.set?.manufacturer?.name || 'Unknown',
          series: card.set?.name || 'Base',
          condition: 'Near Mint', // Default since Card doesn't have condition
          price: 25.00, // Default since Card doesn't have price directly
          shipping: 0, // Free shipping for internal inventory
          imageUrl: card.card_front_image_url || '',
          backImageUrl: card.card_back_image_url || undefined,
          rarity: determineRarity(card),
          availability: 'in-stock',
          estimatedShipTime: 'Ships in 1-2 business days',
          source: 'internal',
        });
      }
    } catch (error) {
      console.warn('Internal search failed:', error);
    }

    // 2. Search eBay marketplace if enabled and we need more results
    if (includeMarketplace && results.length < limit) {
      try {
        const remainingLimit = limit - results.length;
        const ebayResults = await ebayAPI.searchCards({
          keywords: query,
          limit: remainingLimit,
          minPrice,
          maxPrice,
        });

        // Convert eBay cards to unified format (hide eBay details from customer)
        for (const ebayCard of ebayResults.items) {
          // Only include cards that meet quality standards
          if (shouldIncludeEbayCard(ebayCard)) {
            results.push({
              id: `marketplace-${ebayCard.ebayItemId}`,
              playerName: ebayCard.playerName || extractPlayerFromTitle(ebayCard.title),
              year: ebayCard.year || new Date().getFullYear(),
              brand: ebayCard.brand || 'Various',
              series: ebayCard.series || 'Base',
              condition: normalizeCondition(ebayCard.condition),
              price: ebayAPI.calculateOurPrice(ebayCard.currentPrice + (ebayCard.shipping?.cost || 0)),
              shipping: 0, // We absorb shipping cost in price
              imageUrl: ebayCard.imageUrls[0] || '',
              rarity: determineRarityFromPrice(ebayCard.currentPrice),
              availability: 'sourced-on-demand',
              estimatedShipTime: getEstimatedShipTime(ebayCard),
              source: 'marketplace',
              sourceDetails: {
                ebayItemId: ebayCard.ebayItemId,
                originalPrice: ebayCard.currentPrice,
                shippingCost: ebayCard.shipping?.cost || 0,
                seller: ebayCard.seller,
                listingUrl: ebayCard.listingUrl,
              },
            });
          }
        }
      } catch (error) {
        console.warn('eBay search failed:', error);
        // Continue with just internal results
      }
    }

    // 3. Sort results by relevance and availability
    const sortedResults = results.sort((a, b) => {
      // Prioritize in-stock items
      if (a.availability === 'in-stock' && b.availability !== 'in-stock') return -1;
      if (b.availability === 'in-stock' && a.availability !== 'in-stock') return 1;
      
      // Then by price (ascending)
      return a.price - b.price;
    });

    return NextResponse.json({
      success: true,
      data: {
        cards: sortedResults.slice(0, limit),
        totalCards: sortedResults.length,
        hasMore: sortedResults.length >= limit,
        filters: {
          inStock: sortedResults.filter(c => c.availability === 'in-stock').length,
          sourcedOnDemand: sortedResults.filter(c => c.availability === 'sourced-on-demand').length,
        },
      },
      query: {
        searchTerm: query,
        page,
        limit,
        includeMarketplace,
      },
    });

  } catch (error) {
    console.error('Unified search error:', error);
    return NextResponse.json(
      { 
        error: 'Search failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Determine if an eBay card should be included in customer results
 */
function shouldIncludeEbayCard(card: any): boolean {
  // Quality filters for customer-facing results
  if (!card.imageUrls || card.imageUrls.length === 0) return false;
  if (card.currentPrice < 5 || card.currentPrice > 500) return false;
  if (card.seller.feedbackPercentage < 95) return false;
  if (card.seller.feedbackScore < 100) return false;
  
  // Exclude poor conditions
  const badConditions = ['poor', 'damaged', 'heavily played'];
  if (badConditions.some(condition => 
    card.condition?.toLowerCase().includes(condition)
  )) return false;

  return true;
}

/**
 * Extract player name from eBay title
 */
function extractPlayerFromTitle(title: string): string {
  // Simple extraction - could be enhanced with ML/NLP
  const words = title.split(' ');
  if (words.length >= 2) {
    const firstName = words[0];
    const lastName = words[1];
    if (firstName.match(/^[A-Z][a-z]+$/) && lastName.match(/^[A-Z][a-z]+$/)) {
      return `${firstName} ${lastName}`;
    }
  }
  return 'Unknown Player';
}

/**
 * Normalize condition names for consistency
 */
function normalizeCondition(condition?: string): string {
  if (!condition) return 'Good';
  
  const conditionMap: Record<string, string> = {
    'mint': 'Mint',
    'near mint': 'Near Mint', 
    'nm': 'Near Mint',
    'excellent': 'Excellent',
    'very good': 'Very Good',
    'good': 'Good',
    'fair': 'Fair',
    'poor': 'Poor',
  };
  
  const normalized = condition.toLowerCase();
  for (const [key, value] of Object.entries(conditionMap)) {
    if (normalized.includes(key)) {
      return value;
    }
  }
  
  return 'Good';
}

/**
 * Determine rarity from internal card data
 */
function determineRarity(card: any): 'common' | 'rare' | 'legendary' {
  if (card.rookie_card) return 'legendary';
  if (card.rarity_level >= 8) return 'legendary';
  if (card.rarity_level >= 5) return 'rare';
  return 'common';
}

/**
 * Determine rarity from price
 */
function determineRarityFromPrice(price: number): 'common' | 'rare' | 'legendary' {
  if (price > 100) return 'legendary';
  if (price > 25) return 'rare';
  return 'common';
}

/**
 * Get estimated shipping time based on eBay card details
 */
function getEstimatedShipTime(card: any): string {
  // Most eBay cards: 7-10 days (purchase + ship to us + process + ship to customer)
  if (card.shipping?.expedited) {
    return 'Ships in 5-7 business days';
  }
  
  return 'Ships in 7-10 business days';
} 