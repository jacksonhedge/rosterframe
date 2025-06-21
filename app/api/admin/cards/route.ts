import { NextRequest, NextResponse } from 'next/server';
import { CardService } from '../../../lib/card-service';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const cardData = await request.json();
    
    // Validate required fields - only playerName is truly required now
    if (!cardData.playerName) {
      return NextResponse.json(
        { error: 'Missing required field: playerName' },
        { status: 400 }
      );
    }

    const cardService = CardService.getInstance();
    
    // Process and save images if provided
    let frontImageUrl = '';
    let backImageUrl = '';
    
    if (cardData.cardFrontImageUrl && cardData.cardFrontImageUrl.startsWith('data:image')) {
      frontImageUrl = await saveCardImage(cardData.cardFrontImageUrl, cardData.playerName, cardData.year, 'front');
    }
    
    if (cardData.cardBackImageUrl && cardData.cardBackImageUrl.startsWith('data:image')) {
      backImageUrl = await saveCardImage(cardData.cardBackImageUrl, cardData.playerName, cardData.year, 'back');
    }

    // First, ensure player exists or create new player
    const playerId = await ensurePlayerExists(cardService, {
      name: cardData.playerName,
      team: cardData.team,
      position: cardData.position,
      year: cardData.year
    });

    // Ensure card set/manufacturer exists (only if brand and year provided)
    let setId = null;
    if (cardData.brand && cardData.year) {
      setId = await ensureCardSetExists(cardService, {
        brand: cardData.brand,
        year: cardData.year,
        series: cardData.series || 'Base Set'
      });
    }

    // Create the card entry
    const cardParams: any = {
      player_id: playerId,
      card_number: cardData.cardNumber || '',
      card_type: cardData.cardType || 'base',
      rookie_card: cardData.rookieCard ?? false, // Handle null by defaulting to false
      error_card: false,
      rarity_level: cardData.rarityLevel || 1,
      card_front_image_url: frontImageUrl,
      card_back_image_url: backImageUrl,
      condition: cardData.condition || '',
      notes: cardData.notes || '',
    };
    
    // Only add set_id if it exists
    if (setId) {
      cardParams.set_id = setId;
    }
    
    const newCard = await cardService.createCard(cardParams);

    // Create market data entry with price range
    if (cardData.estimatedPriceMin > 0 || cardData.estimatedPriceMax > 0) {
      await createMarketData(cardService, newCard.id, {
        priceMin: cardData.estimatedPriceMin || 0,
        priceMax: cardData.estimatedPriceMax || cardData.estimatedPriceMin || 0
      });
    }

    return NextResponse.json({
      success: true,
      cardId: newCard.id,
      message: 'Card added successfully to inventory',
      frontImageUrl: frontImageUrl,
      backImageUrl: backImageUrl
    });

  } catch (error) {
    console.error('Error adding card:', error);
    return NextResponse.json(
      { 
        error: 'Failed to add card to inventory',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';

    const cardService = CardService.getInstance();
    
    // Build search filters
    const filters: any = {};
    if (search) {
      filters.player_name = search;
    }

    const result = await cardService.searchCards(filters, page, limit);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error fetching cards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cards' },
      { status: 500 }
    );
  }
}

// Helper function to save card image to Supabase Storage
async function saveCardImage(dataUrl: string, playerName: string, year: number, side: 'front' | 'back'): Promise<string> {
  try {
    // Get CardService instance for Supabase client
    const cardService = CardService.getInstance();
    const supabase = cardService.getSupabaseClient();
    
    // Extract base64 data and convert to buffer
    const base64Data = dataUrl.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Create safe filename
    const safePlayerName = playerName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const filename = `${safePlayerName}_${year}_${side}_${uuidv4()}.jpg`;
    const filePath = `card-images/${filename}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('card-images')
      .upload(filePath, buffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Error uploading to Supabase storage:', error);
      return '';
    }
    
    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from('card-images')
      .getPublicUrl(filePath);
    
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error saving card image to Supabase:', error);
    return '';
  }
}

// Helper function to ensure player exists
async function ensurePlayerExists(cardService: any, playerData: { name: string; team?: string; position?: string; year?: number }): Promise<string> {
  try {
    const supabase = cardService.getSupabase();
    
    // Check if player already exists
    const { data: existingPlayer } = await supabase
      .from('players')
      .select('id')
      .ilike('name', playerData.name)
      .single();
    
    if (existingPlayer) {
      return existingPlayer.id;
    }

    // Get NFL sport ID (or create if needed)
    let { data: sport } = await supabase
      .from('sports')
      .select('id')
      .eq('abbreviation', 'NFL')
      .single();

    if (!sport) {
      const { data: newSport } = await supabase
        .from('sports')
        .insert({ name: 'National Football League', abbreviation: 'NFL' })
        .select('id')
        .single();
      sport = newSport;
    }

    // Create new player
    const { data: newPlayer } = await supabase
      .from('players')
      .insert({
        name: playerData.name,
        sport_id: sport.id,
        active: true
      })
      .select('id')
      .single();

    return newPlayer.id;
  } catch (error) {
    console.error('Error ensuring player exists:', error);
    throw error;
  }
}

// Helper function to ensure card set exists
async function ensureCardSetExists(cardService: any, setData: { brand: string; year: number; series: string }): Promise<string> {
  try {
    const supabase = cardService.getSupabase();
    
    // Get or create manufacturer
    let { data: manufacturer } = await supabase
      .from('card_manufacturers')
      .select('id')
      .eq('name', setData.brand)
      .single();

    if (!manufacturer) {
      const { data: newManufacturer } = await supabase
        .from('card_manufacturers')
        .insert({ name: setData.brand, abbreviation: setData.brand.toUpperCase() })
        .select('id')
        .single();
      manufacturer = newManufacturer;
    }

    // Get sport ID
    const { data: sport } = await supabase
      .from('sports')
      .select('id')
      .eq('abbreviation', 'NFL')
      .single();

    // Check if set already exists
    const { data: existingSet } = await supabase
      .from('card_sets')
      .select('id')
      .eq('manufacturer_id', manufacturer.id)
      .eq('year', setData.year)
      .eq('name', setData.series)
      .single();

    if (existingSet) {
      return existingSet.id;
    }

    // Create new set
    const { data: newSet } = await supabase
      .from('card_sets')
      .insert({
        manufacturer_id: manufacturer.id,
        sport_id: sport?.id,
        name: setData.series,
        year: setData.year,
        significance_level: 5
      })
      .select('id')
      .single();

    return newSet.id;
  } catch (error) {
    console.error('Error ensuring card set exists:', error);
    throw error;
  }
}

// Helper function to create market data
async function createMarketData(cardService: any, cardId: string, priceData: number | { priceMin: number; priceMax: number }): Promise<void> {
  try {
    const supabase = cardService.getSupabase();
    
    const price = typeof priceData === 'number' ? priceData : (priceData.priceMax || priceData.priceMin);
    
    await supabase
      .from('card_market_data')
      .insert({
        card_id: cardId,
        current_market_value: price,
        last_sale_price: price,
        last_sale_date: new Date().toISOString().split('T')[0],
        data_source: 'admin_entry'
      });
  } catch (error) {
    console.error('Error creating market data:', error);
    // Don't throw error here as it's not critical
  }
} 