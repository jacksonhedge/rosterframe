import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get NFL sport ID
    const { data: sports } = await supabase
      .from('sports')
      .select('id')
      .eq('abbreviation', 'NFL')
      .single();

    if (!sports) {
      return NextResponse.json({ error: 'NFL sport not found' }, { status: 404 });
    }

    // Sample NFL players from 2020-2024 seasons
    const samplePlayers = [
      {
        name: 'Josh Allen',
        sport_id: sports.id,
        active: true,
        stats: {
          latest_season: 2024,
          latest_team: 'BUF',
          latest_position: 'QB',
          career_seasons: 5,
          total_games: 72,
          total_fantasy_points: 1825.4
        }
      },
      {
        name: 'Lamar Jackson',
        sport_id: sports.id,
        active: true,
        stats: {
          latest_season: 2024,
          latest_team: 'BAL',
          latest_position: 'QB',
          career_seasons: 6,
          total_games: 85,
          total_fantasy_points: 1943.2
        }
      },
      {
        name: 'Christian McCaffrey',
        sport_id: sports.id,
        active: true,
        stats: {
          latest_season: 2024,
          latest_team: 'SF',
          latest_position: 'RB',
          career_seasons: 7,
          total_games: 82,
          total_fantasy_points: 1654.8
        }
      },
      {
        name: 'Cooper Kupp',
        sport_id: sports.id,
        active: true,
        stats: {
          latest_season: 2024,
          latest_team: 'LAR',
          latest_position: 'WR',
          career_seasons: 7,
          total_games: 88,
          total_fantasy_points: 1442.6
        }
      },
      {
        name: 'Travis Kelce',
        sport_id: sports.id,
        active: true,
        stats: {
          latest_season: 2024,
          latest_team: 'KC',
          latest_position: 'TE',
          career_seasons: 11,
          total_games: 156,
          total_fantasy_points: 1876.3
        }
      },
      {
        name: 'Tyreek Hill',
        sport_id: sports.id,
        active: true,
        stats: {
          latest_season: 2024,
          latest_team: 'MIA',
          latest_position: 'WR',
          career_seasons: 8,
          total_games: 108,
          total_fantasy_points: 1523.7
        }
      },
      {
        name: 'Derrick Henry',
        sport_id: sports.id,
        active: true,
        stats: {
          latest_season: 2024,
          latest_team: 'BAL',
          latest_position: 'RB',
          career_seasons: 8,
          total_games: 118,
          total_fantasy_points: 1645.2
        }
      },
      {
        name: 'Davante Adams',
        sport_id: sports.id,
        active: true,
        stats: {
          latest_season: 2024,
          latest_team: 'LV',
          latest_position: 'WR',
          career_seasons: 10,
          total_games: 142,
          total_fantasy_points: 1678.9
        }
      },
      {
        name: 'Aaron Rodgers',
        sport_id: sports.id,
        active: true,
        stats: {
          latest_season: 2024,
          latest_team: 'NYJ',
          latest_position: 'QB',
          career_seasons: 19,
          total_games: 225,
          total_fantasy_points: 4234.8
        }
      },
      {
        name: 'Patrick Mahomes',
        sport_id: sports.id,
        active: true,
        stats: {
          latest_season: 2024,
          latest_team: 'KC',
          latest_position: 'QB',
          career_seasons: 7,
          total_games: 92,
          total_fantasy_points: 1823.6
        }
      }
    ];

    // Insert sample players
    const { data, error } = await supabase
      .from('players')
      .insert(samplePlayers)
      .select();

    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully added ${samplePlayers.length} sample NFL players`,
      playersAdded: samplePlayers.length,
      data: data
    });

  } catch (error) {
    console.error('Test import error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to add sample NFL players',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'NFL Test Data Import API',
    description: 'POST to this endpoint to add sample NFL players for testing',
    samplePlayers: [
      'Josh Allen (QB, BUF)',
      'Lamar Jackson (QB, BAL)', 
      'Christian McCaffrey (RB, SF)',
      'Cooper Kupp (WR, LAR)',
      'Travis Kelce (TE, KC)',
      'Tyreek Hill (WR, MIA)',
      'Derrick Henry (RB, BAL)',
      'Davante Adams (WR, LV)',
      'Aaron Rodgers (QB, NYJ)',
      'Patrick Mahomes (QB, KC)'
    ]
  });
} 