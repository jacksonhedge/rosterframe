import { NextRequest, NextResponse } from 'next/server';
import { nflDataService } from '../../../lib/nfl-data-import';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query || query.length < 1) {
      return NextResponse.json([]);
    }

    // Search NFL players from our imported database
    const players = await nflDataService.searchPlayers(query, limit);

    return NextResponse.json({
      success: true,
      data: players,
      source: 'NFL Database (2020-2024)',
      query: query,
      count: players.length
    });

  } catch (error) {
    console.error('NFL player search error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to search NFL players',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 