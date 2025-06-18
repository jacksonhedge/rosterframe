import { NextRequest, NextResponse } from 'next/server';
import { SleeperSupabaseIntegration } from '../../../lib/sleeper-supabase-integration';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      league,
      season,
      users,
      rosters,
      standings,
      champion,
      playoffBrackets,
      players
    } = body;

    // Validate required fields
    if (!league || !season || !users || !rosters || !standings) {
      return NextResponse.json(
        { error: 'Missing required fields: league, season, users, rosters, standings' },
        { status: 400 }
      );
    }

    // Save to Supabase
    const result = await SleeperSupabaseIntegration.saveCompleteLeagueToSupabase(
      league,
      season,
      users,
      rosters,
      standings,
      champion,
      playoffBrackets,
      players
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        skipped: result.skipped || false,
        data: result.data
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in save-league API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Batch save multiple leagues
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { leaguesData } = body;

    if (!leaguesData || !Array.isArray(leaguesData)) {
      return NextResponse.json(
        { error: 'Missing or invalid leaguesData array' },
        { status: 400 }
      );
    }

    // Batch save to Supabase
    const result = await SleeperSupabaseIntegration.saveMultipleLeagues(leaguesData);

    return NextResponse.json({
      success: result.success,
      summary: result.summary,
      results: result.results
    });

  } catch (error) {
    console.error('Error in batch save-league API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 