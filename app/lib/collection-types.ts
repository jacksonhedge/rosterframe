// Player Collection Tracking Types

export interface TargetPlayer {
  id: string;
  sleeper_player_id: string;
  name: string;
  position: string;
  team: string;
  fantasy_positions: string[];
  
  // Collection status
  collection_status: 'wanted' | 'owned' | 'multiple' | 'not_interested';
  priority_level: 1 | 2 | 3 | 4 | 5; // 1 = highest priority
  
  // Roster analytics
  total_leagues_rostered: number;
  roster_percentage: number; // % of leagues where this player is rostered
  leagues_rostered_in: string[]; // League IDs
  
  // Collection details
  cards_owned: number;
  cards_wanted: number;
  target_card_types: string[]; // 'rookie', 'base', 'prizm', etc.
  max_budget_per_card: number;
  
  // Player metadata
  is_rookie: boolean;
  breakout_candidate: boolean;
  injury_risk: boolean;
  notes: string;
  
  created_at: string;
  updated_at: string;
}

export interface PlayerCollectionItem {
  id: string;
  target_player_id: string;
  card_id?: string; // Reference to cards table
  card_instance_id?: string; // Reference to card_instances table
  
  // Manual entry for cards not in database yet
  manual_entry?: {
    player_name: string;
    year: number;
    set_name: string;
    card_number: string;
    card_type: string;
    manufacturer: string;
  };
  
  status: 'owned' | 'watching' | 'bidding' | 'ordered' | 'wanted';
  acquisition_date?: string;
  purchase_price?: number;
  purchase_source?: string; // 'ebay', 'comc', 'local', 'trade', etc.
  condition?: string;
  grade?: number;
  grading_company?: string;
  
  storage_location?: string;
  estimated_value?: number;
  notes?: string;
  
  created_at: string;
  updated_at: string;
}

export interface CollectionStats {
  total_target_players: number;
  players_owned: number;
  players_wanted: number;
  completion_percentage: number;
  
  total_cards_owned: number;
  total_cards_wanted: number;
  estimated_collection_value: number;
  
  by_position: Record<string, {
    total: number;
    owned: number;
    percentage: number;
  }>;
  
  by_priority: Record<1 | 2 | 3 | 4 | 5, {
    total: number;
    owned: number;
    percentage: number;
  }>;
  
  recent_acquisitions: PlayerCollectionItem[];
  most_wanted: TargetPlayer[];
}

// API Request/Response Types
export interface CreateTargetPlayerInput {
  sleeper_player_id: string;
  priority_level: 1 | 2 | 3 | 4 | 5;
  target_card_types: string[];
  max_budget_per_card: number;
  notes?: string;
}

export interface UpdateCollectionStatusInput {
  target_player_id: string;
  collection_status: 'wanted' | 'owned' | 'multiple' | 'not_interested';
  priority_level?: 1 | 2 | 3 | 4 | 5;
}

export interface AddCollectionItemInput {
  target_player_id: string;
  card_id?: string;
  card_instance_id?: string;
  manual_entry?: {
    player_name: string;
    year: number;
    set_name: string;
    card_number: string;
    card_type: string;
    manufacturer: string;
  };
  status: 'owned' | 'watching' | 'bidding' | 'ordered' | 'wanted';
  acquisition_date?: string;
  purchase_price?: number;
  purchase_source?: string;
  condition?: string;
  grade?: number;
  grading_company?: string;
  storage_location?: string;
  notes?: string;
}

export interface RosteredPlayerAnalysis {
  sleeper_player_id: string;
  name: string;
  position: string;
  team: string;
  fantasy_positions: string[];
  total_leagues: number;
  leagues_rostered_in: string[];
  roster_percentage: number;
  is_rookie: boolean;
  estimated_value_tier: 'elite' | 'high' | 'medium' | 'low' | 'dart_throw';
}

// Search and Filter Types
export interface CollectionSearchFilters {
  collection_status?: 'wanted' | 'owned' | 'multiple' | 'not_interested';
  priority_level?: 1 | 2 | 3 | 4 | 5;
  position?: string;
  team?: string;
  min_roster_percentage?: number;
  max_roster_percentage?: number;
  rookie_only?: boolean;
  breakout_candidates_only?: boolean;
  has_cards?: boolean;
  sort_by?: 'name' | 'roster_percentage' | 'priority' | 'created_at' | 'cards_owned';
  sort_order?: 'asc' | 'desc';
}

export interface CollectionSearchResult {
  target_players: TargetPlayer[];
  total_count: number;
  filters_applied: CollectionSearchFilters;
}

// Utility Types
export const PRIORITY_LEVELS = [
  { value: 1, label: 'Must Have', color: '#EF4444' },
  { value: 2, label: 'High Priority', color: '#F97316' },
  { value: 3, label: 'Medium Priority', color: '#EAB308' },
  { value: 4, label: 'Low Priority', color: '#22C55E' },
  { value: 5, label: 'Future Target', color: '#6B7280' }
] as const;

export const COLLECTION_STATUS_OPTIONS = [
  { value: 'wanted', label: 'Wanted', color: '#EF4444', icon: '🎯' },
  { value: 'owned', label: 'Owned', color: '#22C55E', icon: '✅' },
  { value: 'multiple', label: 'Multiple Owned', color: '#8B5CF6', icon: '📚' },
  { value: 'not_interested', label: 'Not Interested', color: '#6B7280', icon: '❌' }
] as const;

export const CARD_TYPE_PRIORITIES = [
  'rookie',
  'base',
  'prizm',
  'optic',
  'chrome',
  'select',
  'autograph',
  'memorabilia',
  'patch',
  'insert',
  'parallel'
] as const; 