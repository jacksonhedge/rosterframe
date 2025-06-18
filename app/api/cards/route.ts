import { NextRequest, NextResponse } from 'next/server';
import CardService from '../../lib/card-service';
import { CardSearchFilters } from '../../lib/card-types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract search parameters
    const filters: CardSearchFilters = {
      sport: searchParams.get('sport') || undefined,
      player_name: searchParams.get('player_name') || undefined,
      team: searchParams.get('team') || undefined,
      year: searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined,
      manufacturer: searchParams.get('manufacturer') || undefined,
      set_name: searchParams.get('set_name') || undefined,
      card_type: searchParams.get('card_type') || undefined,
      rookie_card: searchParams.get('rookie_card') === 'true' ? true : undefined,
      graded_only: searchParams.get('graded_only') === 'true' ? true : undefined,
      min_grade: searchParams.get('min_grade') ? parseFloat(searchParams.get('min_grade')!) : undefined,
      max_grade: searchParams.get('max_grade') ? parseFloat(searchParams.get('max_grade')!) : undefined,
      min_price: searchParams.get('min_price') ? parseFloat(searchParams.get('min_price')!) : undefined,
      max_price: searchParams.get('max_price') ? parseFloat(searchParams.get('max_price')!) : undefined,
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof CardSearchFilters] === undefined) {
        delete filters[key as keyof CardSearchFilters];
      }
    });

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const cardService = CardService.getInstance();
    const result = await cardService.searchCards(filters, page, limit);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error searching cards:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to search cards',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cardData = await request.json();
    
    // Validate required fields
    if (!cardData.player_id || !cardData.set_id || !cardData.card_number) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: player_id, set_id, card_number' 
        },
        { status: 400 }
      );
    }

    const cardService = CardService.getInstance();
    const card = await cardService.createCard(cardData);

    return NextResponse.json({
      success: true,
      data: card
    });

  } catch (error) {
    console.error('Error creating card:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create card',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 