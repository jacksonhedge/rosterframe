import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getSupabaseClient() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables not configured');
  }
  return createClient(supabaseUrl, supabaseKey);
}

// Create league management tables if they don't exist
const createLeagueManagementTables = async (supabase: any) => {
  try {
    // Create sports table
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS admin_sports (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(100) NOT NULL UNIQUE,
          abbreviation VARCHAR(10) NOT NULL UNIQUE,
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_admin_sports_active ON admin_sports(active);
      `
    });

    // Create leagues table
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS admin_leagues (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          sport_id UUID REFERENCES admin_sports(id) ON DELETE CASCADE,
          season VARCHAR(50) NOT NULL,
          status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('active', 'completed', 'upcoming')),
          total_teams INTEGER DEFAULT 0,
          start_date DATE,
          end_date DATE,
          commissioner_name VARCHAR(255),
          commissioner_email VARCHAR(255),
          settings JSONB DEFAULT '{}',
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_admin_leagues_sport ON admin_leagues(sport_id);
        CREATE INDEX IF NOT EXISTS idx_admin_leagues_status ON admin_leagues(status);
        CREATE INDEX IF NOT EXISTS idx_admin_leagues_season ON admin_leagues(season);
      `
    });

    // Create teams table
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS admin_teams (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          league_id UUID REFERENCES admin_leagues(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          city VARCHAR(100),
          abbreviation VARCHAR(10),
          owner_name VARCHAR(255),
          founded_year INTEGER,
          active BOOLEAN DEFAULT true,
          colors TEXT[],
          logo_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_admin_teams_league ON admin_teams(league_id);
        CREATE INDEX IF NOT EXISTS idx_admin_teams_active ON admin_teams(active);
      `
    });

    // Insert default sports if none exist
    await supabase.rpc('exec_sql', {
      sql: `
        INSERT INTO admin_sports (name, abbreviation) 
        VALUES 
          ('Football', 'NFL'),
          ('Basketball', 'NBA'),
          ('Baseball', 'MLB'),
          ('Hockey', 'NHL'),
          ('Soccer', 'MLS')
        ON CONFLICT (name) DO NOTHING;
      `
    });

  } catch (error) {
    console.log('Table creation error (may already exist):', error);
  }
};

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const sportFilter = searchParams.get('sport') || 'all';
    const statusFilter = searchParams.get('status') || 'all';
    const tab = searchParams.get('tab') || 'leagues';
    
    const offset = (page - 1) * limit;

    // Try to create tables first
    await createLeagueManagementTables(supabase);

    let result;

    switch (tab) {
      case 'sports':
        result = await handleSportsRequest(supabase, { page, limit, search, offset });
        break;
      case 'teams':
        result = await handleTeamsRequest(supabase, { page, limit, search, offset });
        break;
      case 'leagues':
      default:
        result = await handleLeaguesRequest(supabase, { 
          page, limit, search, sportFilter, statusFilter, offset 
        });
        break;
    }

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleLeaguesRequest(supabase: any, params: any) {
  const { page, limit, search, sportFilter, statusFilter, offset } = params;

  // Build query for leagues
  let query = supabase
    .from('admin_leagues')
    .select(`
      *,
      sport:admin_sports(*)
    `, { count: 'exact' })
    .eq('active', true)
    .order('created_at', { ascending: false });

  // Apply filters
  if (search) {
    query = query.or(`name.ilike.%${search}%,season.ilike.%${search}%,commissioner_name.ilike.%${search}%`);
  }

  if (sportFilter !== 'all') {
    query = query.eq('sport_id', sportFilter);
  }

  if (statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data: leagues, error: leaguesError, count } = await query;

  if (leaguesError) {
    console.error('Error fetching leagues:', leaguesError);
    throw leaguesError;
  }

  // Get sports for filters
  const { data: sports } = await supabase
    .from('admin_sports')
    .select('*')
    .eq('active', true)
    .order('name');

  // Get teams for stats
  const { data: teams } = await supabase
    .from('admin_teams')
    .select('*')
    .eq('active', true);

  // Calculate stats
  const activeLeagues = leagues?.filter((league: any) => league.status === 'active').length || 0;

  return {
    leagues: leagues || [],
    sports: sports || [],
    teams: teams || [],
    total_leagues: count || 0,
    active_leagues: activeLeagues,
    total_teams: teams?.length || 0,
    page,
    limit,
    total_pages: Math.ceil((count || 0) / limit)
  };
}

async function handleSportsRequest(supabase: any, params: any) {
  const { page, limit, search, offset } = params;

  let query = supabase
    .from('admin_sports')
    .select('*', { count: 'exact' })
    .eq('active', true)
    .order('name');

  if (search) {
    query = query.or(`name.ilike.%${search}%,abbreviation.ilike.%${search}%`);
  }

  query = query.range(offset, offset + limit - 1);

  const { data: sports, error, count } = await query;

  if (error) {
    console.error('Error fetching sports:', error);
    throw error;
  }

  // Get leagues and teams for stats
  const { data: leagues } = await supabase
    .from('admin_leagues')
    .select('*')
    .eq('active', true);

  const { data: teams } = await supabase
    .from('admin_teams')
    .select('*')
    .eq('active', true);

  return {
    sports: sports || [],
    leagues: leagues || [],
    teams: teams || [],
    total_leagues: leagues?.length || 0,
    active_leagues: leagues?.filter((league: any) => league.status === 'active').length || 0,
    total_teams: teams?.length || 0
  };
}

async function handleTeamsRequest(supabase: any, params: any) {
  const { page, limit, search, offset } = params;

  let query = supabase
    .from('admin_teams')
    .select(`
      *,
      league:admin_leagues(name, season)
    `, { count: 'exact' })
    .eq('active', true)
    .order('name');

  if (search) {
    query = query.or(`name.ilike.%${search}%,city.ilike.%${search}%,owner_name.ilike.%${search}%`);
  }

  query = query.range(offset, offset + limit - 1);

  const { data: teams, error, count } = await query;

  if (error) {
    console.error('Error fetching teams:', error);
    throw error;
  }

  // Get sports and leagues for stats
  const { data: sports } = await supabase
    .from('admin_sports')
    .select('*')
    .eq('active', true);

  const { data: leagues } = await supabase
    .from('admin_leagues')
    .select('*')
    .eq('active', true);

  return {
    teams: teams || [],
    sports: sports || [],
    leagues: leagues || [],
    total_leagues: leagues?.length || 0,
    active_leagues: leagues?.filter((league: any) => league.status === 'active').length || 0,
    total_teams: count || 0
  };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { type, ...data } = body;

    await createLeagueManagementTables(supabase);

    let result;

    switch (type) {
      case 'sport':
        result = await createSport(supabase, data);
        break;
      case 'league':
        result = await createLeague(supabase, data);
        break;
      case 'team':
        result = await createTeam(supabase, data);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid type specified' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error creating item:', error);
    return NextResponse.json(
      { error: 'Failed to create item', details: error },
      { status: 500 }
    );
  }
}

async function createSport(supabase: any, data: any) {
  const { name, abbreviation } = data;

  if (!name || !abbreviation) {
    throw new Error('Name and abbreviation are required for sports');
  }

  const { data: sport, error } = await supabase
    .from('admin_sports')
    .insert([{ name, abbreviation, active: true }])
    .select()
    .single();

  if (error) throw error;
  return sport;
}

async function createLeague(supabase: any, data: any) {
  const {
    name,
    sport_id,
    season,
    status = 'upcoming',
    total_teams = 0,
    start_date,
    end_date,
    commissioner_name,
    commissioner_email,
    settings = {}
  } = data;

  if (!name || !sport_id || !season) {
    throw new Error('Name, sport_id, and season are required for leagues');
  }

  const { data: league, error } = await supabase
    .from('admin_leagues')
    .insert([{
      name,
      sport_id,
      season,
      status,
      total_teams,
      start_date,
      end_date,
      commissioner_name,
      commissioner_email,
      settings,
      active: true
    }])
    .select(`
      *,
      sport:admin_sports(*)
    `)
    .single();

  if (error) throw error;
  return league;
}

async function createTeam(supabase: any, data: any) {
  const {
    league_id,
    name,
    city,
    abbreviation,
    owner_name,
    founded_year,
    colors = [],
    logo_url
  } = data;

  if (!name || !league_id) {
    throw new Error('Name and league_id are required for teams');
  }

  const { data: team, error } = await supabase
    .from('admin_teams')
    .insert([{
      league_id,
      name,
      city,
      abbreviation,
      owner_name,
      founded_year,
      colors,
      logo_url,
      active: true
    }])
    .select(`
      *,
      league:admin_leagues(name, season)
    `)
    .single();

  if (error) throw error;
  return team;
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { type, id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required for updates' },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case 'sport':
        result = await updateSport(supabase, id, data);
        break;
      case 'league':
        result = await updateLeague(supabase, id, data);
        break;
      case 'team':
        result = await updateTeam(supabase, id, data);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid type specified' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error updating item:', error);
    return NextResponse.json(
      { error: 'Failed to update item', details: error },
      { status: 500 }
    );
  }
}

async function updateSport(supabase: any, id: string, data: any) {
  const { data: sport, error } = await supabase
    .from('admin_sports')
    .update({
      ...data,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return sport;
}

async function updateLeague(supabase: any, id: string, data: any) {
  const { data: league, error } = await supabase
    .from('admin_leagues')
    .update({
      ...data,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select(`
      *,
      sport:admin_sports(*)
    `)
    .single();

  if (error) throw error;
  return league;
}

async function updateTeam(supabase: any, id: string, data: any) {
  const { data: team, error } = await supabase
    .from('admin_teams')
    .update({
      ...data,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select(`
      *,
      league:admin_leagues(name, season)
    `)
    .single();

  if (error) throw error;
  return team;
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');

    if (!id || !type) {
      return NextResponse.json(
        { error: 'ID and type are required' },
        { status: 400 }
      );
    }

    let tableName;
    switch (type) {
      case 'sport':
        tableName = 'admin_sports';
        break;
      case 'league':
        tableName = 'admin_leagues';
        break;
      case 'team':
        tableName = 'admin_teams';
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid type specified' },
          { status: 400 }
        );
    }

    // Soft delete by setting active to false
    const { data, error } = await supabase
      .from(tableName)
      .update({ 
        active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error deleting item:', error);
      return NextResponse.json(
        { error: 'Failed to delete item', details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 