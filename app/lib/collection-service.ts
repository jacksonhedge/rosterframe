import { createClient } from '@supabase/supabase-js';
import {
  TargetPlayer,
  PlayerCollectionItem,
  CollectionStats,
  CreateTargetPlayerInput,
  UpdateCollectionStatusInput,
  AddCollectionItemInput,
  RosteredPlayerAnalysis,
  CollectionSearchFilters,
  CollectionSearchResult
} from './collection-types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export class CollectionService {
  private static instance: CollectionService;
  public supabase;

  constructor() {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  public static getInstance(): CollectionService {
    if (!CollectionService.instance) {
      CollectionService.instance = new CollectionService();
    }
    return CollectionService.instance;
  }

  // Analyze rostered players across all leagues
  async analyzeRosteredPlayers() {
    console.log('Analyzing rostered players across all leagues...');

    // Get all current rosters from Sleeper data
    const { data: rosters, error: rostersError } = await this.supabase
      .from('rosters')
      .select('*');

    if (rostersError) throw rostersError;

    // Get all leagues to calculate totals
    const { data: leagues, error: leaguesError } = await this.supabase
      .from('sleeper_leagues')
      .select('sleeper_league_id');

    if (leaguesError) throw leaguesError;

    const totalLeagues = leagues?.length || 1;

    // Aggregate player data
    const playerMap = new Map();

    // Process each roster
    rosters?.forEach(roster => {
      const players = roster.players || [];
      const leagueId = roster.sleeper_league_id;

      players.forEach((playerId: string) => {
        if (!playerMap.has(playerId)) {
          playerMap.set(playerId, { leagues: [] });
        }
        const playerData = playerMap.get(playerId);
        if (!playerData.leagues.includes(leagueId)) {
          playerData.leagues.push(leagueId);
        }
      });
    });

    // Convert to analysis objects
    const analyses = [];

    for (const [playerId, data] of playerMap.entries()) {
      const rosterPercentage = (data.leagues.length / totalLeagues) * 100;
      
      // Try to get player details from Sleeper API
      const playerDetails = await this.getSleeperPlayerDetails(playerId);
      
      analyses.push({
        sleeper_player_id: playerId,
        name: playerDetails?.name || `Player ${playerId}`,
        position: playerDetails?.position || 'UNKNOWN',
        team: playerDetails?.team || 'UNKNOWN',
        total_leagues: data.leagues.length,
        leagues_rostered_in: data.leagues,
        roster_percentage: Math.round(rosterPercentage * 100) / 100,
        is_rookie: playerDetails?.is_rookie || false,
        estimated_value_tier: this.calculateValueTier(rosterPercentage)
      });
    }

    // Sort by roster percentage (highest first)
    analyses.sort((a, b) => b.roster_percentage - a.roster_percentage);

    return analyses;
  }

  private async getSleeperPlayerDetails(playerId: string) {
    try {
      // Fetch from Sleeper API
      const response = await fetch(`https://api.sleeper.app/v1/players/nfl`);
      const allPlayers = await response.json();
      const player = allPlayers[playerId];

      if (player) {
        return {
          name: `${player.first_name || ''} ${player.last_name || ''}`.trim(),
          position: player.position,
          team: player.team,
          is_rookie: player.years_exp === 0
        };
      }

      return null;
    } catch (error) {
      console.error(`Error fetching player details for ${playerId}:`, error);
      return null;
    }
  }

  private calculateValueTier(rosterPercentage: number) {
    if (rosterPercentage >= 80) return 'elite';
    if (rosterPercentage >= 60) return 'high';
    if (rosterPercentage >= 40) return 'medium';
    if (rosterPercentage >= 20) return 'low';
    return 'dart_throw';
  }

  // Create target players from roster analysis
  async createTargetPlayersFromRoster(minRosterPercentage: number = 20) {
    console.log(`Creating target players for players rostered in ${minRosterPercentage}% or more of leagues...`);

    const analyses = await this.analyzeRosteredPlayers();
    const filteredPlayers = analyses.filter(p => p.roster_percentage >= minRosterPercentage);

    const targetPlayers = [];

    for (const analysis of filteredPlayers) {
      const playerData = {
        sleeper_player_id: analysis.sleeper_player_id,
        name: analysis.name,
        position: analysis.position,
        team: analysis.team,
        collection_status: 'wanted',
        priority_level: this.calculatePriorityFromTier(analysis.estimated_value_tier),
        total_leagues_rostered: analysis.total_leagues,
        roster_percentage: analysis.roster_percentage,
        leagues_rostered_in: analysis.leagues_rostered_in,
        is_rookie: analysis.is_rookie,
        target_card_types: this.getDefaultCardTypes(analysis),
        max_budget_per_card: this.getDefaultBudget(analysis.estimated_value_tier),
        notes: `Auto-generated from roster analysis. Rostered in ${analysis.roster_percentage}% of leagues.`
      };

      try {
        const { data, error } = await this.supabase
          .from('target_players')
          .insert(playerData)
          .select('*')
          .single();

        if (error) {
          // Player might already exist
          console.log(`Player ${analysis.name} already exists, skipping...`);
          continue;
        }

        targetPlayers.push(data);
      } catch (error) {
        console.error(`Error creating target player ${analysis.name}:`, error);
      }
    }

    return targetPlayers;
  }

  private calculatePriorityFromTier(tier: string): number {
    switch (tier) {
      case 'elite': return 1;
      case 'high': return 2;
      case 'medium': return 3;
      case 'low': return 4;
      case 'dart_throw': return 5;
      default: return 3;
    }
  }

  private getDefaultCardTypes(analysis: any): string[] {
    const types = ['base'];
    
    if (analysis.is_rookie) {
      types.unshift('rookie');
    }
    
    if (analysis.estimated_value_tier === 'elite') {
      types.push('prizm', 'optic', 'chrome');
    } else if (analysis.estimated_value_tier === 'high') {
      types.push('prizm');
    }

    return types;
  }

  private getDefaultBudget(tier: string): number {
    switch (tier) {
      case 'elite': return 100;
      case 'high': return 50;
      case 'medium': return 25;
      case 'low': return 15;
      case 'dart_throw': return 10;
      default: return 25;
    }
  }

  // Get all target players with filters
  async getTargetPlayers(filters: any = {}) {
    let query = this.supabase
      .from('target_players')
      .select('*');

    if (filters.collection_status) {
      query = query.eq('collection_status', filters.collection_status);
    }

    if (filters.priority_level) {
      query = query.eq('priority_level', filters.priority_level);
    }

    if (filters.position) {
      query = query.eq('position', filters.position);
    }

    if (filters.min_roster_percentage) {
      query = query.gte('roster_percentage', filters.min_roster_percentage);
    }

    // Apply sorting
    const sortBy = filters.sort_by || 'roster_percentage';
    const sortOrder = filters.sort_order || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  }

  // Update collection status
  async updateCollectionStatus(targetPlayerId: string, status: string, priority?: number) {
    const updateData: any = {
      collection_status: status,
      updated_at: new Date().toISOString()
    };

    if (priority) {
      updateData.priority_level = priority;
    }

    const { data, error } = await this.supabase
      .from('target_players')
      .update(updateData)
      .eq('id', targetPlayerId)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  // Add a collection item (card owned/wanted)
  async addCollectionItem(itemData: any) {
    const { data, error } = await this.supabase
      .from('player_collection_items')
      .insert(itemData)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  // Get collection statistics
  async getCollectionStats() {
    const { data: targetPlayers } = await this.supabase
      .from('target_players')
      .select('collection_status, priority_level, position, cards_owned, cards_wanted');

    if (!targetPlayers) {
      return this.getEmptyStats();
    }

    const totalTargetPlayers = targetPlayers.length;
    const playersOwned = targetPlayers.filter(p => p.collection_status === 'owned' || p.collection_status === 'multiple').length;
    const playersWanted = targetPlayers.filter(p => p.collection_status === 'wanted').length;
    const completionPercentage = totalTargetPlayers > 0 ? (playersOwned / totalTargetPlayers) * 100 : 0;

    const totalCardsOwned = targetPlayers.reduce((sum, p) => sum + (p.cards_owned || 0), 0);
    const totalCardsWanted = targetPlayers.reduce((sum, p) => sum + (p.cards_wanted || 0), 0);

    return {
      total_target_players: totalTargetPlayers,
      players_owned: playersOwned,
      players_wanted: playersWanted,
      completion_percentage: Math.round(completionPercentage * 100) / 100,
      total_cards_owned: totalCardsOwned,
      total_cards_wanted: totalCardsWanted
    };
  }

  private getEmptyStats() {
    return {
      total_target_players: 0,
      players_owned: 0,
      players_wanted: 0,
      completion_percentage: 0,
      total_cards_owned: 0,
      total_cards_wanted: 0
    };
  }

  // Utility Methods

  formatPriority(level: number): { label: string; color: string } {
    const priorities = {
      1: { label: 'Must Have', color: '#EF4444' },
      2: { label: 'High Priority', color: '#F97316' },
      3: { label: 'Medium Priority', color: '#EAB308' },
      4: { label: 'Low Priority', color: '#22C55E' },
      5: { label: 'Future Target', color: '#6B7280' }
    };
    return priorities[level as keyof typeof priorities] || priorities[3];
  }

  formatCollectionStatus(status: string): { label: string; color: string; icon: string } {
    const statuses = {
      wanted: { label: 'Wanted', color: '#EF4444', icon: '🎯' },
      owned: { label: 'Owned', color: '#22C55E', icon: '✅' },
      multiple: { label: 'Multiple Owned', color: '#8B5CF6', icon: '📚' },
      not_interested: { label: 'Not Interested', color: '#6B7280', icon: '❌' }
    };
    return statuses[status as keyof typeof statuses] || statuses.wanted;
  }

  // Add a public method for creating target players
  async createTargetPlayer(targetPlayerData: any) {
    const { data, error } = await this.supabase
      .from('target_players')
      .insert(targetPlayerData)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }
} 