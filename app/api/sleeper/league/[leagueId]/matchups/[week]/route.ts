import { NextRequest, NextResponse } from 'next/server';

const SLEEPER_BASE_URL = 'https://api.sleeper.app/v1';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ leagueId: string; week: string }> }
) {
  try {
    const { leagueId, week } = await params;
    
    if (!leagueId || !week) {
      return NextResponse.json(
        { error: 'League ID and week are required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${SLEEPER_BASE_URL}/league/${leagueId}/matchups/${week}`, {
      headers: {
        'User-Agent': 'RosterFrame/1.0',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Matchups not found for this week' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch matchups from Sleeper API' },
        { status: response.status }
      );
    }

    const matchupsData = await response.json();
    return NextResponse.json(matchupsData);

  } catch (error) {
    console.error('Sleeper API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 