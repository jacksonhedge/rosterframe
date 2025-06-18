import { NextRequest, NextResponse } from 'next/server';

const SLEEPER_BASE_URL = 'https://api.sleeper.app/v1';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    
    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${SLEEPER_BASE_URL}/user/${username}`, {
      headers: {
        'User-Agent': 'RosterFrame/1.0',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch user from Sleeper API' },
        { status: response.status }
      );
    }

    const userData = await response.json();
    return NextResponse.json(userData);

  } catch (error) {
    console.error('Sleeper API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 