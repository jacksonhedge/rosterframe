import { NextRequest, NextResponse } from 'next/server';
import { CardService } from '../../../../lib/card-service';

export async function GET(request: NextRequest) {
  try {
    const cardService = CardService.getInstance();
    const supabase = cardService.getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query || query.length < 1) {
      return NextResponse.json([]);
    }

    // Search for cards with player names matching the query
    const { data: cards, error } = await supabase
      .from('cards')
      .select(`
        id,
        card_number,
        card_type,
        rookie_card,
        condition,
        notes,
        card_front_image_url,
        card_back_image_url,
        player:card_players!inner(
          id,
          name
        ),
        set:card_sets(
          id,
          name,
          year,
          manufacturer:card_manufacturers(name)
        )
      `)
      .ilike('card_players.name', `%${query}%`)
      .limit(limit)
      .order('card_players.name');

    if (error) {
      console.error('Error searching cards:', error);
      return NextResponse.json({ error: 'Failed to search cards' }, { status: 500 });
    }

    // Format the response to include useful card information
    const formattedCards = cards?.map(card => {
      const player = Array.isArray(card.player) ? card.player[0] : card.player;
      const cardSet = Array.isArray(card.set) ? card.set[0] : card.set;
      const manufacturer = Array.isArray(cardSet?.manufacturer) 
        ? cardSet.manufacturer[0] 
        : cardSet?.manufacturer;
      
              return {
          id: card.id,
          name: player?.name || 'Unknown Player',
          playerName: player?.name || 'Unknown Player',
          position: 'N/A', // Will be filled from card details if available
          year: cardSet?.year || 'Unknown',
          brand: manufacturer?.name || 'Unknown Brand',
          series: cardSet?.name || 'Base',
          cardNumber: card.card_number || '',
          condition: card.condition || '',
          rookieCard: card.rookie_card || false,
          imageUrl: card.card_front_image_url || '',
          backImageUrl: card.card_back_image_url || '',
          cardType: card.card_type || 'base',
          notes: card.notes || ''
        };
    }) || [];

    return NextResponse.json(formattedCards);

  } catch (error) {
    console.error('Error in player search API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 