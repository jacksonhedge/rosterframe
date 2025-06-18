import { 
  SleeperLeague, 
  ProcessedUser, 
  ProcessedRoster, 
  SleeperPlayer,
  LeagueStanding 
} from './sleeper-types';
import { 
  SupabaseService, 
  Database,
  LeagueData,
  UserTeamData,
  RosterData,
  LeagueOutcomeData,
  PlayerData
} from './supabase';

export class SleeperSupabaseIntegration {
  
  // Convert Sleeper league data to Supabase format
  static convertLeagueData(
    league: SleeperLeague,
    season: string
  ): Database['public']['Tables']['leagues']['Insert'] {
    return {
      league_id: league.league_id,
      league_name: league.name,
      season: season,
      sport: league.sport,
      total_rosters: league.total_rosters,
      scoring_settings: league.settings || null,
      roster_positions: [] // SleeperLeague doesn't have roster_positions in the API
    };
  }

  // Convert Sleeper user data to Supabase format
  static convertUserTeamData(
    user: ProcessedUser,
    leagueDbId: string,
    leagueId: string
  ): Database['public']['Tables']['user_teams']['Insert'] {
    return {
      league_db_id: leagueDbId,
      league_id: leagueId,
      user_id: user.userId,
      username: user.username,
      display_name: user.displayName,
      team_name: user.teamName,
      avatar: user.avatar
    };
  }

  // Convert Sleeper roster data to Supabase format
  static convertRosterData(
    roster: ProcessedRoster,
    leagueDbId: string,
    leagueId: string
  ): Database['public']['Tables']['rosters']['Insert'] {
    return {
      league_db_id: leagueDbId,
      league_id: leagueId,
      user_id: roster.ownerId || '',
      roster_id: roster.rosterId,
      starters: roster.starters || [],
      players: roster.players || [],
      points: roster.points || 0,
      wins: roster.wins || 0,
      losses: roster.losses || 0,
      ties: roster.ties || 0,
      waiver_position: undefined, // ProcessedRoster doesn't have waiver info
      waiver_budget_used: undefined
    };
  }

  // Convert championship/outcome data to Supabase format
  static convertLeagueOutcomeData(
    leagueDbId: string,
    leagueId: string,
    season: string,
    champion: ProcessedUser | null,
    championRoster: ProcessedRoster | null,
    standings: LeagueStanding[],
    playoffBrackets?: any
  ): Database['public']['Tables']['league_outcomes']['Insert'] {
    // Find highest scorer
    const highestScorer = standings.reduce((prev, current) => 
      (prev.roster.points > current.roster.points) ? prev : current
    );

    // Find runner-up (if championship bracket exists)
    let runnerUp: LeagueStanding | null = null;
    if (playoffBrackets && champion) {
      // Logic to find runner-up from playoff brackets
      // This would need to be implemented based on bracket structure
      runnerUp = standings.find(s => 
        s.user.userId !== champion.userId && 
        s.roster.wins >= standings[1]?.roster?.wins
      ) || null;
    }

    return {
      league_db_id: leagueDbId,
      league_id: leagueId,
      season: season,
      champion_user_id: champion?.userId,
      champion_roster_id: championRoster?.rosterId,
      champion_points: championRoster?.points,
      runner_up_user_id: runnerUp?.user?.userId,
      runner_up_roster_id: runnerUp?.roster?.rosterId,
      highest_scorer_user_id: highestScorer?.user?.userId,
      highest_scorer_points: highestScorer?.roster?.points,
      playoff_structure: playoffBrackets,
      final_standings: standings.map(s => ({
        rank: standings.indexOf(s) + 1,
        user_id: s.user.userId,
        roster_id: s.roster.rosterId,
        points: s.roster.points,
        wins: s.roster.wins,
        losses: s.roster.losses,
        ties: s.roster.ties
      }))
    };
  }

  // Convert Sleeper player data to Supabase format
  static convertPlayersData(
    players: Record<string, SleeperPlayer>,
    playerIds: string[]
  ): Database['public']['Tables']['players']['Insert'][] {
    return playerIds
      .filter(id => players[id])
      .map(id => {
        const player = players[id];
        return {
          player_id: id,
          full_name: player.full_name || `${player.first_name || ''} ${player.last_name || ''}`.trim(),
          first_name: player.first_name,
          last_name: player.last_name,
          position: player.position || 'UNK',
          team: player.team,
          position_rank: undefined, // SleeperPlayer doesn't have depth_chart_order
          depth_chart_position: undefined, // SleeperPlayer doesn't have depth_chart_order
          status: player.status,
          sport: 'nfl' // Default to nfl since SleeperPlayer doesn't have sport
        };
      });
  }

  // Main function to save complete league data to Supabase
  static async saveCompleteLeagueToSupabase(
    league: SleeperLeague,
    season: string,
    users: ProcessedUser[],
    rosters: ProcessedRoster[],
    standings: LeagueStanding[],
    champion: ProcessedUser | null,
    playoffBrackets?: any,
    players?: Record<string, SleeperPlayer>
  ) {
    try {
      console.log(`Saving league ${league.name} (${season}) to Supabase...`);

      // Check if league already exists
      const existsResult = await SupabaseService.leagueExists(league.league_id, season);
      if (existsResult.success && existsResult.exists) {
        console.log(`League ${league.league_id} for season ${season} already exists in Supabase`);
        return { success: true, message: 'League already exists', skipped: true };
      }

      // Convert data to Supabase format
      const leagueData = this.convertLeagueData(league, season);
      
      // Save league first to get the UUID
      const leagueResult = await SupabaseService.saveLeague(leagueData);
      if (!leagueResult.success) {
        throw new Error(`Failed to save league: ${leagueResult.error}`);
      }

      const savedLeague = leagueResult.data;
      const leagueDbId = savedLeague.id;

      // Convert data to Supabase format using the saved league's UUID
      const teamsData = users.map(user => 
        this.convertUserTeamData(user, leagueDbId, league.league_id)
      );
      
      const rostersData = rosters.map(roster => 
        this.convertRosterData(roster, leagueDbId, league.league_id)
      );

      // Find champion's roster
      const championRoster = champion ? 
        rosters.find(r => r.ownerId === champion.userId) || null : null;

      const outcomeData = this.convertLeagueOutcomeData(
        leagueDbId,
        league.league_id,
        season,
        champion,
        championRoster,
        standings,
        playoffBrackets
      );

      // Convert relevant players (only those in rosters)
      let playersData: Database['public']['Tables']['players']['Insert'][] = [];
      if (players) {
        const allPlayerIds = rosters.flatMap(r => [...(r.players || []), ...(r.starters || [])]);
        const uniquePlayerIds = [...new Set(allPlayerIds)];
        playersData = this.convertPlayersData(players, uniquePlayerIds);
      }

      // Save related data (teams, rosters, outcome)
      const teamResults = await Promise.all(
        teamsData.map(team => SupabaseService.saveUserTeam(team))
      );

      const rosterResults = await Promise.all(
        rostersData.map(roster => SupabaseService.saveRoster(roster))
      );

      let outcomeResult = null;
      if (outcomeData) {
        outcomeResult = await SupabaseService.saveLeagueOutcome(outcomeData);
      }

      let playerResults = null;
      if (playersData.length > 0) {
        playerResults = await Promise.all(
          playersData.map(player => SupabaseService.savePlayer(player))
        );
      }

      // Save to Supabase
      const result = await SupabaseService.saveCompleteLeagueData(
        leagueData,
        teamsData,
        rostersData,
        outcomeData,
        playersData.length > 0 ? playersData : undefined
      );

      if (result.success) {
        console.log(`✅ Successfully saved league ${league.name} to Supabase`);
        return { 
          success: true, 
          message: 'League saved successfully',
          data: {
            league: savedLeague,
            teams: teamResults,
            rosters: rosterResults,
            outcome: outcomeResult?.data,
            players: playerResults
          }
        };
      } else {
        console.error(`❌ Failed to save league ${league.name}:`, result.error);
        return { 
          success: false, 
          error: result.error instanceof Error ? result.error.message : 'Unknown error'
        };
      }

    } catch (error) {
      console.error('Error saving league to Supabase:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Function to get league data from Supabase (useful for building mockups)
  static async getLeagueFromSupabase(leagueId: string, season?: string) {
    try {
      const result = await SupabaseService.getLeagueData(leagueId, season);
      
      if (result.success && result.data) {
        return {
          success: true,
          data: result.data
        };
      } else {
        return {
          success: false,
          error: result.error || 'League not found'
        };
      }
    } catch (error) {
      console.error('Error fetching league from Supabase:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Function to batch save multiple leagues (useful for saving all of a user's leagues)
  static async saveMultipleLeagues(
    leaguesData: Array<{
      league: SleeperLeague;
      season: string;
      users: ProcessedUser[];
      rosters: ProcessedRoster[];
      standings: LeagueStanding[];
      champion: ProcessedUser | null;
      playoffBrackets?: any;
      players?: Record<string, SleeperPlayer>;
    }>
  ) {
    console.log(`Starting batch save of ${leaguesData.length} leagues...`);
    
    const results = [];
    let saved = 0;
    let skipped = 0;
    let errors = 0;

    for (const data of leaguesData) {
      const result = await this.saveCompleteLeagueToSupabase(
        data.league,
        data.season,
        data.users,
        data.rosters,
        data.standings,
        data.champion,
        data.playoffBrackets,
        data.players
      );

      results.push({
        leagueId: data.league.league_id,
        leagueName: data.league.name,
        season: data.season,
        result
      });

      if (result.success) {
        if (result.skipped) {
          skipped++;
        } else {
          saved++;
        }
      } else {
        errors++;
      }

      // Add a small delay to avoid overwhelming Supabase
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`✅ Batch save complete: ${saved} saved, ${skipped} skipped, ${errors} errors`);

    return {
      success: errors === 0,
      summary: {
        total: leaguesData.length,
        saved,
        skipped,
        errors
      },
      results
    };
  }
}