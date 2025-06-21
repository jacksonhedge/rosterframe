import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleSheetsExporter } from '@/app/lib/google-sheets-export';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const letters = searchParams.get('letters')?.split(',') || [];
    const position = searchParams.get('position');
    const format = searchParams.get('format') || 'csv';

    // Build query
    let query = supabase
      .from('football_players')
      .select('*')
      .order('name', { ascending: true });

    // Apply filters
    if (letters.length > 0) {
      query = query.in('letter', letters);
    }
    
    if (position) {
      query = query.eq('position', position);
    }

    // Limit to 10000 records for performance
    query = query.limit(10000);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch data', details: error.message },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'No data found' },
        { status: 404 }
      );
    }

    // Convert data format
    const players = data.map(player => ({
      name: player.name,
      position: player.position,
      yearsActive: player.years_active,
      college: player.college,
      height: player.height,
      weight: player.weight,
      birthDate: player.birth_date,
      profileUrl: player.profile_url
    }));

    if (format === 'json') {
      return NextResponse.json({
        count: players.length,
        players
      });
    }

    // Default to CSV
    const csv = GoogleSheetsExporter.toCSV(players);
    const timestamp = new Date().toISOString().split('T')[0];
    const letterStr = letters.length > 0 ? `-${letters.join('')}` : '';
    
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="football-players${letterStr}-${timestamp}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Export failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST endpoint for batch operations
export async function POST(request: NextRequest) {
  try {
    const { action, playerIds } = await request.json();

    switch (action) {
      case 'deleteSelected': {
        if (!playerIds || !Array.isArray(playerIds)) {
          return NextResponse.json(
            { error: 'Invalid player IDs' },
            { status: 400 }
          );
        }

        const { error } = await supabase
          .from('football_players')
          .delete()
          .in('id', playerIds);

        if (error) {
          return NextResponse.json(
            { error: 'Failed to delete players', details: error.message },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          deleted: playerIds.length
        });
      }

      case 'getStats': {
        const { data, error } = await supabase
          .from('football_players_stats')
          .select('*');

        if (error) {
          return NextResponse.json(
            { error: 'Failed to get stats', details: error.message },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          stats: data
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Request failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}