import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Database types
export interface LeagueData {
  id?: string;
  league_id: string;
  league_name: string;
  season: string;
  sport: string;
  total_rosters: number;
  scoring_settings: any;
  roster_positions: string[];
  created_at?: string;
  updated_at?: string;
}

export interface UserTeamData {
  id?: string;
  league_db_id: string;
  league_id: string;
  user_id: string;
  username: string;
  display_name: string;
  team_name?: string;
  avatar?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RosterData {
  id?: string;
  league_db_id: string;
  league_id: string;
  user_id: string;
  roster_id: number;
  starters: string[];
  players: string[];
  points: number;
  wins: number;
  losses: number;
  ties: number;
  waiver_position?: number;
  waiver_budget_used?: number;
  created_at?: string;
  updated_at?: string;
}

export interface LeagueOutcomeData {
  id?: string;
  league_db_id: string;
  league_id: string;
  season: string;
  champion_user_id?: string;
  champion_roster_id?: number;
  champion_points?: number;
  runner_up_user_id?: string;
  runner_up_roster_id?: number;
  highest_scorer_user_id?: string;
  highest_scorer_points?: number;
  playoff_structure?: any;
  final_standings?: any;
  created_at?: string;
  updated_at?: string;
}

export interface PlayerData {
  id?: string;
  player_id: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  position: string;
  team?: string;
  position_rank?: number;
  depth_chart_position?: number;
  status?: string;
  sport: string;
  created_at?: string;
  updated_at?: string;
}

export interface Database {
  public: {
    Tables: {
      leagues: {
        Row: LeagueData;
        Insert: Omit<LeagueData, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<LeagueData, 'id' | 'created_at' | 'updated_at'>>;
      };
      user_teams: {
        Row: UserTeamData;
        Insert: Omit<UserTeamData, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserTeamData, 'id' | 'created_at' | 'updated_at'>>;
      };
      rosters: {
        Row: RosterData;
        Insert: Omit<RosterData, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<RosterData, 'id' | 'created_at' | 'updated_at'>>;
      };
      league_outcomes: {
        Row: LeagueOutcomeData;
        Insert: Omit<LeagueOutcomeData, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<LeagueOutcomeData, 'id' | 'created_at' | 'updated_at'>>;
      };
      players: {
        Row: PlayerData;
        Insert: Omit<PlayerData, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<PlayerData, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper functions for data operations
export class SupabaseService {
  // Save league data (upsert to avoid duplicates)
  static async saveLeague(leagueData: Database['public']['Tables']['leagues']['Insert']) {
    const { data, error } = await supabase
      .from('leagues')
      .upsert(leagueData, {
        onConflict: 'league_id,season'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving league:', error);
      return { success: false, error };
    }

    return { success: true, data };
  }

  // Save user team data
  static async saveUserTeam(teamData: Database['public']['Tables']['user_teams']['Insert']) {
    const { data, error } = await supabase
      .from('user_teams')
      .upsert(teamData, {
        onConflict: 'league_id,user_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving user team:', error);
      return { success: false, error };
    }

    return { success: true, data };
  }

  // Save roster data
  static async saveRoster(rosterData: Database['public']['Tables']['rosters']['Insert']) {
    const { data, error } = await supabase
      .from('rosters')
      .upsert(rosterData, {
        onConflict: 'league_id,roster_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving roster:', error);
      return { success: false, error };
    }

    return { success: true, data };
  }

  // Save league outcome
  static async saveLeagueOutcome(outcomeData: Database['public']['Tables']['league_outcomes']['Insert']) {
    const { data, error } = await supabase
      .from('league_outcomes')
      .upsert(outcomeData, {
        onConflict: 'league_id,season'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving league outcome:', error);
      return { success: false, error };
    }

    return { success: true, data };
  }

  // Save player data
  static async savePlayer(playerData: Database['public']['Tables']['players']['Insert']) {
    const { data, error } = await supabase
      .from('players')
      .upsert(playerData, {
        onConflict: 'player_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving player:', error);
      return { success: false, error };
    }

    return { success: true, data };
  }

  // Batch save complete league data
  static async saveCompleteLeagueData(
    league: Database['public']['Tables']['leagues']['Insert'],
    teams: Database['public']['Tables']['user_teams']['Insert'][],
    rosters: Database['public']['Tables']['rosters']['Insert'][],
    outcome?: Database['public']['Tables']['league_outcomes']['Insert'],
    players?: Database['public']['Tables']['players']['Insert'][]
  ) {
    try {
      // Save league
      const leagueResult = await this.saveLeague(league);
      if (!leagueResult.success) {
        throw new Error(`Failed to save league: ${leagueResult.error}`);
      }

      // Save all user teams
      const teamResults = await Promise.all(
        teams.map(team => this.saveUserTeam(team))
      );

      // Save all rosters
      const rosterResults = await Promise.all(
        rosters.map(roster => this.saveRoster(roster))
      );

      // Save outcome if provided
      let outcomeResult = null;
      if (outcome) {
        outcomeResult = await this.saveLeagueOutcome(outcome);
      }

      // Save players if provided
      let playerResults = null;
      if (players && players.length > 0) {
        playerResults = await Promise.all(
          players.map(player => this.savePlayer(player))
        );
      }

      return {
        success: true,
        data: {
          league: leagueResult.data,
          teams: teamResults,
          rosters: rosterResults,
          outcome: outcomeResult?.data,
          players: playerResults
        }
      };

    } catch (error) {
      console.error('Error saving complete league data:', error);
      return { success: false, error };
    }
  }

  // Get existing league data
  static async getLeagueData(leagueId: string, season?: string) {
    let query = supabase
      .from('leagues')
      .select(`
        *,
        user_teams(*),
        rosters(*),
        league_outcomes(*)
      `)
      .eq('league_id', leagueId);

    if (season) {
      query = query.eq('season', season);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching league data:', error);
      return { success: false, error };
    }

    return { success: true, data };
  }

  // Check if league already exists
  static async leagueExists(leagueId: string, season: string) {
    const { data, error } = await supabase
      .from('leagues')
      .select('id')
      .eq('league_id', leagueId)
      .eq('season', season)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error checking league existence:', error);
      return { success: false, error };
    }

    return { success: true, exists: !!data };
  }
} 