import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
      const yearsActive = `${new Date(player.debut_date).getFullYear()} - ${player.active ? 'Present' : (player.retirement_date ? new Date(player.retirement_date).getFullYear() : 'Unknown')}`;
      
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