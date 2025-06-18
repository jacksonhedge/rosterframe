import { NextRequest, NextResponse } from 'next/server';

const SLEEPER_BASE_URL = 'https://api.sleeper.app/v1';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ leagueId: string }> }
) {
  try {
    const { leagueId } = await params;
    
    if (!leagueId) {
      return NextResponse.json(
        { error: 'League ID is required' },
        { status: 400 }
      );
    }

    // Fetch both winners and losers bracket
    const [winnersResponse, losersResponse] = await Promise.all([
      fetch(`${SLEEPER_BASE_URL}/league/${leagueId}/winners_bracket`, {
        headers: { 'User-Agent': 'RosterFrame/1.0' },
      }),
      fetch(`${SLEEPER_BASE_URL}/league/${leagueId}/losers_bracket`, {
        headers: { 'User-Agent': 'RosterFrame/1.0' },
      }),
    ]);

    const brackets: any = {
      winners: null,
      losers: null,
    };

    if (winnersResponse.ok) {
      brackets.winners = await winnersResponse.json();
    }

    if (losersResponse.ok) {
      brackets.losers = await losersResponse.json();
    }

    // If neither bracket exists, the league might not have started playoffs
    if (!brackets.winners && !brackets.losers) {
      return NextResponse.json(
        { error: 'No playoff brackets found for this league' },
        { status: 404 }
      );
    }

    return NextResponse.json(brackets);

  } catch (error) {
    console.error('Sleeper API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 