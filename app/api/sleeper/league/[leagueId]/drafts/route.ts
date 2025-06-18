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

    const response = await fetch(`${SLEEPER_BASE_URL}/league/${leagueId}/drafts`, {
      headers: {
        'User-Agent': 'RosterFrame/1.0',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'No drafts found for this league' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch league drafts from Sleeper API' },
        { status: response.status }
      );
    }

    const draftsData = await response.json();
    return NextResponse.json(draftsData);

  } catch (error) {
    console.error('Sleeper API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 