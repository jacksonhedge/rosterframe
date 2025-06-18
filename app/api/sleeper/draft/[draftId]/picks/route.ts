import { NextRequest, NextResponse } from 'next/server';

const SLEEPER_BASE_URL = 'https://api.sleeper.app/v1';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ draftId: string }> }
) {
  try {
    const { draftId } = await params;
    
    if (!draftId) {
      return NextResponse.json(
        { error: 'Draft ID is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${SLEEPER_BASE_URL}/draft/${draftId}/picks`, {
      headers: {
        'User-Agent': 'RosterFrame/1.0',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Draft picks not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch draft picks from Sleeper API' },
        { status: response.status }
      );
    }

    const picksData = await response.json();
    return NextResponse.json(picksData);

  } catch (error) {
    console.error('Sleeper API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 