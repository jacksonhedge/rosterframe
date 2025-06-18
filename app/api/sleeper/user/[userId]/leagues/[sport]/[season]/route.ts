import { NextRequest, NextResponse } from 'next/server';

const SLEEPER_BASE_URL = 'https://api.sleeper.app/v1';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; sport: string; season: string }> }
) {
  try {
    const { userId, sport, season } = await params;
    
    if (!userId || !sport || !season) {
      return NextResponse.json(
        { error: 'UserId, sport, and season are required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${SLEEPER_BASE_URL}/user/${userId}/leagues/${sport}/${season}`,
      {
        headers: {
          'User-Agent': 'RosterFrame/1.0',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'No leagues found for this user' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch leagues from Sleeper API' },
        { status: response.status }
      );
    }

    const leaguesData = await response.json();
    return NextResponse.json(leaguesData);

  } catch (error) {
    console.error('Sleeper API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 