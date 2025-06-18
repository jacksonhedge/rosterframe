// Sleeper API TypeScript Types
// Based on Swift models from bankrollDemo project

export interface SleeperUser {
  user_id: string;
  display_name?: string;
  username?: string;
  avatar?: string | number;
  is_owner?: boolean;
  metadata?: {
    team_name?: string;
  };
}

// League settings and playoff info
export interface LeagueSettings {
  type: number;
  scoring_type: string;
  playoff_week_start: number;
  playoff_teams: number;
  playoff_rounds: number;
  playoff_type: number;
  champion_week?: number;
  consolation_week?: number;
  regular_season_weeks: number;
  total_weeks: number;
}

export interface SleeperLeague {
  league_id: string;
  name: string;
  total_rosters: number;
  sport: string;
  season: string;
  avatar?: string;
  status: string;
  settings?: LeagueSettings;
}

export interface RosterSettings {
  wins?: number;
  losses?: number;
  ties?: number;
  fpts?: number;
  fpts_against?: number;
  fpts_decimal?: number;
  fpts_against_decimal?: number;
}

export interface SleeperRoster {
  roster_id: number;
  owner_id?: string;
  co_owners?: string[];
  players?: string[];
  starters?: string[];
  settings?: RosterSettings;
  metadata?: {
    record?: string;
  };
}

export interface SleeperPlayer {
  player_id: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  position?: string;
  team?: string;
  number?: number;
  status?: string;
  fantasy_positions?: string[];
}

// Processed data types for UI
export interface ProcessedUser {
  userId: string;
  displayName: string;
  username: string;
  avatar?: string;
  isOwner: boolean;
  teamName?: string;
}

export interface ProcessedRoster {
  rosterId: number;
  ownerId?: string;
  ownerName?: string;
  players: string[];
  starters: string[];
  wins: number;
  losses: number;
  ties: number;
  points: number;
  pointsAgainst: number;
  record: string;
}

export interface LeagueStanding {
  rank: number;
  user: ProcessedUser;
  roster: ProcessedRoster;
  winPercentage: number;
}

// Weekly matchup data
export interface SleeperMatchup {
  matchup_id: number;
  roster_id: number;
  players: string[];
  starters: string[];
  points: number;
  custom_points?: number;
}

// Playoff bracket data
export interface PlayoffBracket {
  round: number;
  matchup_id: number;
  team_1_roster_id: number;
  team_2_roster_id?: number;
  winner_roster_id?: number;
  loser_roster_id?: number;
  team_1_points?: number;
  team_2_points?: number;
}

// Draft data
export interface SleeperDraft {
  draft_id: string;
  type: string;
  status: string;
  sport: string;
  season: string;
  season_type: string;
  league_id: string;
  settings: {
    teams: number;
    slots_wr: number;
    slots_te: number;
    slots_rb: number;
    slots_qb: number;
    slots_k: number;
    slots_def: number;
    slots_bn: number;
    rounds: number;
    pick_timer?: number;
  };
}

export interface DraftPick {
  pick_no: number;
  round: number;
  roster_id: number;
  player_id: string;
  picked_by: string;
  draft_slot: number;
  draft_id: string;
  is_keeper?: boolean;
  metadata?: {
    years_exp?: string;
    team?: string;
    status?: string;
    sport?: string;
    position?: string;
    player_id?: string;
    number?: string;
    news_updated?: string;
    last_name?: string;
    injury_status?: string;
    first_name?: string;
  };
}

export interface ProcessedDraftPick {
  pick_no: number;
  round: number;
  pick_in_round: number;
  roster_id: number;
  player_id: string;
  player_name: string;
  player_position: string;
  player_team: string;
  owner_name: string;
  draft_slot: number;
  is_keeper?: boolean;
}

// Weekly performance tracking
export interface WeeklyPerformance {
  week: number;
  roster_id: number;
  points: number;
  matchup_id: number;
  opponent_roster_id?: number;
  opponent_points?: number;
  is_win?: boolean;
  is_tie?: boolean;
  is_playoff?: boolean;
}

// User season summary
export interface UserSeasonSummary {
  user: ProcessedUser;
  roster: ProcessedRoster;
  weeklyPerformance: WeeklyPerformance[];
  playoffResults?: {
    made_playoffs: boolean;
    playoff_seed?: number;
    rounds_won: number;
    championship_result?: 'won' | 'lost' | 'third' | 'fourth';
  };
  seasonStats: {
    highest_week: number;
    lowest_week: number;
    average_points: number;
    consistency_score: number;
    head_to_head_record: Record<string, { wins: number; losses: number; ties: number }>;
  };
}

export interface SleeperServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
} 