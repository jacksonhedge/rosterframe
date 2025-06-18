import { NextRequest, NextResponse } from 'next/server';
import cardService from '../../../lib/card-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sportId = searchParams.get('sport_id') || undefined;
    const searchTerm = searchParams.get('search') || undefined;

    const players = await cardService.getPlayers(sportId, searchTerm);

    return NextResponse.json({
      success: true,
      data: players
    });

  } catch (error) {
    console.error('Error fetching players:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch players',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const playerData = await request.json();
    
    // Validate required fields
    if (!playerData.name || !playerData.sport_id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: name, sport_id' 
        },
        { status: 400 }
      );
    }

    const player = await cardService.createPlayer(playerData);

    return NextResponse.json({
      success: true,
      data: player
    });

  } catch (error) {
    console.error('Error creating player:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create player',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 