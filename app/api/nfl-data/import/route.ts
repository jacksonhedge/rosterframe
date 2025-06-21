import { NextRequest, NextResponse } from 'next/server';
import { nflDataService } from '../../../lib/nfl-data-import';

export async function POST(request: NextRequest) {
  try {
    // Optional: Add authentication check here for admin-only access
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.includes('Bearer')) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    console.log('Starting NFL data import from GitHub repository...');
    
    const result = await nflDataService.importNFLData();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        playersImported: result.playersImported,
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: result.message 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('NFL data import API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to import NFL data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'NFL Data Import API',
    description: 'POST to this endpoint to import NFL player data from 2020-2024 seasons',
    source: 'https://github.com/hvpkod/NFL-Data',
    seasons: [2020, 2021, 2022, 2023, 2024],
    positions: ['QB', 'RB', 'WR', 'TE', 'K', 'DEF']
  });
} 