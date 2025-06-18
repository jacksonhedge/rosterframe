import { NextResponse } from 'next/server';

const SLEEPER_BASE_URL = 'https://api.sleeper.app/v1';

// Cache players data for 24 hours
let playersCache: any = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export async function GET() {
  try {
    // Check if we have cached data that's still valid
    const now = Date.now();
    if (playersCache && (now - cacheTimestamp) < CACHE_DURATION) {
      return NextResponse.json(playersCache);
    }

    const response = await fetch(`${SLEEPER_BASE_URL}/players/nfl`, {
      headers: {
        'User-Agent': 'RosterFrame/1.0',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch players from Sleeper API' },
        { status: response.status }
      );
    }

    const playersData = await response.json();
    
    // Cache the data
    playersCache = playersData;
    cacheTimestamp = now;
    
    return NextResponse.json(playersData);

  } catch (error) {
    console.error('Error fetching Sleeper players:', error);
    return NextResponse.json(
      { error: 'Failed to fetch players' },
      { status: 500 }
    );
  }
} 