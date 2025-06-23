import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Mock data for when Supabase is not configured
const mockPlayers = [
  { id: '1', name: 'Patrick Mahomes', position: 'QB', team: 'Kansas City Chiefs', yearsActive: '2017 - Present' },
  { id: '2', name: 'Patrick Peterson', position: 'CB', team: 'Minnesota Vikings', yearsActive: '2011 - Present' },
  { id: '3', name: 'Patrick Willis', position: 'LB', team: 'San Francisco 49ers', yearsActive: '2007 - 2014' },
  { id: '4', name: 'Patrick Ramsey', position: 'QB', team: 'Washington', yearsActive: '2002 - 2008' },
  { id: '5', name: 'Tom Brady', position: 'QB', team: 'Tampa Bay Buccaneers', yearsActive: '2000 - 2022' },
  { id: '6', name: 'Aaron Rodgers', position: 'QB', team: 'New York Jets', yearsActive: '2005 - Present' },
  { id: '7', name: 'Josh Allen', position: 'QB', team: 'Buffalo Bills', yearsActive: '2018 - Present' },
  { id: '8', name: 'Justin Jefferson', position: 'WR', team: 'Minnesota Vikings', yearsActive: '2020 - Present' },
  { id: '9', name: 'Tyreek Hill', position: 'WR', team: 'Miami Dolphins', yearsActive: '2016 - Present' },
  { id: '10', name: 'Derrick Henry', position: 'RB', team: 'Tennessee Titans', yearsActive: '2016 - Present' },
];

// Initialize Supabase client only if credentials are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey && supabaseUrl !== 'your_supabase_url_here' 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query || query.length < 1) {
      return NextResponse.json({ 
        success: true, 
        data: [] 
      });
    }

    // If Supabase is not configured, use mock data
    if (!supabase) {
      const filtered = mockPlayers
        .filter(player => player.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, limit)
        .map(player => ({
          id: player.id,
          playerName: player.name,
          position: player.position,
          yearsActive: player.yearsActive,
          team: player.team,
          stats: {},
          achievements: []
        }));

      return NextResponse.json({
        success: true,
        data: filtered,
        count: filtered.length
      });
    }

    // Search for players by name (case-insensitive) from card_players view
    const { data, error } = await supabase
      .from('card_players')
      .select(`
        *,
        positions:position_id (
          name,
          abbreviation
        ),
        sports:sport_id (
          name,
          abbreviation
        )
      `)
      .ilike('name', `%${query}%`)
      .order('name', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Search error:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to search players', 
          details: error.message 
        },
        { status: 500 }
      );
    }

    // Format the data for the PlayerSearch component
    const formattedData = (data || []).map(player => {
      const stats = player.stats || {};
      const position = player.positions?.abbreviation || 'Unknown';
      const team = stats.team || '';
      
      // Safely handle dates
      let yearsActive = '';
      try {
        if (player.debut_date) {
          const debutYear = new Date(player.debut_date).getFullYear();
          const endYear = player.active ? 'Present' : (player.retirement_date ? new Date(player.retirement_date).getFullYear() : 'Unknown');
          yearsActive = `${debutYear} - ${endYear}`;
        }
      } catch (e) {
        yearsActive = 'Unknown';
      }
      
      return {
        id: player.id,
        playerName: player.name,
        position: position,
        yearsActive: yearsActive,
        team: team,
        stats: stats,
        achievements: player.achievements || []
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedData,
      count: formattedData.length
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Search failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}