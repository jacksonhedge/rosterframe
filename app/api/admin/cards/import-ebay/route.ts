import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey && supabaseUrl !== 'your_supabase_url_here'
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export async function POST(request: NextRequest) {
  try {
    const { cards } = await request.json();

    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No cards provided' },
        { status: 400 }
      );
    }

    // If Supabase is not configured, save to a local file for now
    if (!supabase) {
      console.log('Supabase not configured. Would save these cards:', cards);
      
      // For now, we'll append to the existing card-inventory.ts file
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const inventoryPath = path.join(process.cwd(), 'app/data/card-inventory.ts');
      const inventoryContent = await fs.readFile(inventoryPath, 'utf-8');
      
      // Extract the existing cardInventory array
      const startIndex = inventoryContent.indexOf('export const cardInventory: Card[] = [');
      const endIndex = inventoryContent.lastIndexOf('];');
      
      if (startIndex === -1 || endIndex === -1) {
        throw new Error('Could not parse card inventory file');
      }
      
      // Format new cards for TypeScript
      const newCards = cards.map(card => ({
        id: `ebay-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        playerName: card.playerName || card.title.split(' ')[0] + ' ' + card.title.split(' ')[1],
        year: card.year || new Date().getFullYear(),
        brand: card.brand || 'Unknown',
        series: card.series || 'eBay Import',
        cardNumber: '',
        team: '',
        position: '',
        rookieCard: false,
        autograph: false,
        relic: false,
        serialNumbered: false,
        gradingCompany: '',
        grade: '',
        condition: card.condition || 'Ungraded',
        estimatedValue: card.price,
        purchasePrice: card.price,
        purchaseDate: new Date().toISOString(),
        source: 'eBay',
        notes: `eBay listing: ${card.listingUrl}`,
        imageUrl: card.imageUrl,
        backImageUrl: '',
        price: card.price + (card.shipping || 0),
        rarity: card.price > 100 ? 'legendary' : card.price > 50 ? 'rare' : 'common',
        type: 'ebay'
      }));
      
      // Create new content
      const newCardsString = newCards.map(card => 
        `  ${JSON.stringify(card, null, 2).replace(/\n/g, '\n  ')}`
      ).join(',\n');
      
      const updatedContent = 
        inventoryContent.substring(0, endIndex) +
        (inventoryContent.substring(startIndex, endIndex).trim().endsWith('[') ? '' : ',\n') +
        newCardsString +
        inventoryContent.substring(endIndex);
      
      await fs.writeFile(inventoryPath, updatedContent);
      
      return NextResponse.json({
        success: true,
        message: `Added ${cards.length} cards to inventory`,
        cardsAdded: cards.length
      });
    }

    // If Supabase is configured, save to database
    const cardsToInsert = cards.map(card => ({
      player_name: card.playerName || card.title,
      year: card.year || new Date().getFullYear(),
      brand: card.brand || 'Unknown',
      series: card.series || 'eBay Import',
      condition: card.condition || 'Ungraded',
      price: card.price + (card.shipping || 0),
      image_url: card.imageUrl,
      listing_url: card.listingUrl,
      seller: card.seller,
      type: 'ebay',
      source: 'eBay',
      added_at: new Date().toISOString(),
      metadata: {
        original_price: card.price,
        shipping: card.shipping || 0,
        ebay_id: card.id,
        title: card.title
      }
    }));

    const { data, error } = await supabase
      .from('card_inventory')
      .insert(cardsToInsert)
      .select();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to save cards to database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully added ${cardsToInsert.length} cards to inventory`,
      cardsAdded: cardsToInsert.length,
      data
    });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to import cards',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}