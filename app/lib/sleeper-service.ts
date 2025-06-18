// Sleeper API Service
// TypeScript equivalent of SleeperService.swift

import {
  SleeperUser,
  SleeperLeague,
  SleeperRoster,
  SleeperPlayer,
  SleeperMatchup,
  ProcessedUser,
  ProcessedRoster,
  LeagueStanding,
  WeeklyPerformance,
  UserSeasonSummary,
  SleeperServiceResponse,
  SleeperDraft,
  DraftPick,
  ProcessedDraftPick,
} from './sleeper-types';

class SleeperService {
  private static instance: SleeperService;
  private readonly baseURL = 'https://api.sleeper.app/v1';
  private playersCache: Map<string, SleeperPlayer> = new Map();
  private cacheExpiry: number = 0;
  private readonly cacheExpirationMs = 24 * 60 * 60 * 1000; // 24 hours

  private constructor() {}

  static getInstance(): SleeperService {
    if (!SleeperService.instance) {
      SleeperService.instance = new SleeperService();
    }
    return SleeperService.instance;
  }

  // MARK: - Avatar URLs
  static getAvatarURL(avatarId: string | number | undefined): string | undefined {
    if (!avatarId) return undefined;
    return `https://sleepercdn.com/avatars/${avatarId}`;
  }

  static getLeagueAvatarURL(avatarId: string | undefined): string | undefined {
    if (!avatarId) return undefined;
    return `https://sleepercdn.com/avatars/${avatarId}`;
  }

  // MARK: - API Calls via our Next.js API routes
  async getUser(username: string): Promise<SleeperServiceResponse<SleeperUser>> {
    try {
      const response = await fetch(`/api/sleeper/username/${encodeURIComponent(username)}`);
      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to fetch user' };
      }
      
      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Network error while fetching user' };
    }
  }

  async getUserLeagues(
    userId: string, 
    season: string = '2024', 
    sport: string = 'nfl'
  ): Promise<SleeperServiceResponse<SleeperLeague[]>> {
    try {
      const response = await fetch(
        `/api/sleeper/user/${encodeURIComponent(userId)}/leagues/${sport}/${season}`
      );
      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to fetch leagues' };
      }
      
      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Network error while fetching leagues' };
    }
  }

  async getLeagueUsers(leagueId: string): Promise<SleeperServiceResponse<SleeperUser[]>> {
    try {
      const response = await fetch(`/api/sleeper/league/${encodeURIComponent(leagueId)}/users`);
      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to fetch league users' };
      }
      
      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Network error while fetching league users' };
    }
  }

  async getLeagueRosters(leagueId: string): Promise<SleeperServiceResponse<SleeperRoster[]>> {
    try {
      const response = await fetch(`/api/sleeper/league/${encodeURIComponent(leagueId)}/rosters`);
      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to fetch league rosters' };
      }
      
      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Network error while fetching league rosters' };
    }
  }

  async getPlayers(): Promise<SleeperServiceResponse<Record<string, SleeperPlayer>>> {
    try {
      // Check cache first
      if (this.playersCache.size > 0 && Date.now() < this.cacheExpiry) {
        const playersObj = Object.fromEntries(this.playersCache);
        return { success: true, data: playersObj };
      }

      const response = await fetch('/api/sleeper/players');
      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to fetch players' };
      }
      
      // Cache the data
      this.playersCache.clear();
      Object.entries(data).forEach(([id, player]) => {
        this.playersCache.set(id, player as SleeperPlayer);
      });
      this.cacheExpiry = Date.now() + this.cacheExpirationMs;
      
      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Network error while fetching players' };
    }
  }

  getPlayer(playerId: string): SleeperPlayer | undefined {
    return this.playersCache.get(playerId);
  }

  // MARK: - Data Processing Methods
  processUsers(users: SleeperUser[]): ProcessedUser[] {
    return users.map(user => ({
      userId: user.user_id,
      displayName: user.display_name || user.username || user.user_id,
      username: user.username || user.display_name || user.user_id,
      avatar: user.avatar?.toString(),
      isOwner: user.is_owner || false,
      teamName: user.metadata?.team_name,
    }));
  }

  processRosters(rosters: SleeperRoster[], users: ProcessedUser[]): ProcessedRoster[] {
    return rosters.map(roster => {
      const owner = users.find(user => user.userId === roster.owner_id);
      const wins = roster.settings?.wins || 0;
      const losses = roster.settings?.losses || 0;
      const ties = roster.settings?.ties || 0;
      const points = (roster.settings?.fpts || 0) + (roster.settings?.fpts_decimal || 0) / 100;
      const pointsAgainst = (roster.settings?.fpts_against || 0) + (roster.settings?.fpts_against_decimal || 0) / 100;

      return {
        rosterId: roster.roster_id,
        ownerId: roster.owner_id,
        ownerName: owner?.displayName || 'Unknown Owner',
        players: roster.players || [],
        starters: roster.starters || [],
        wins,
        losses,
        ties,
        points: Math.round(points * 100) / 100,
        pointsAgainst: Math.round(pointsAgainst * 100) / 100,
        record: `${wins}-${losses}${ties > 0 ? `-${ties}` : ''}`,
      };
    });
  }

  calculateStandings(rosters: ProcessedRoster[], users: ProcessedUser[]): LeagueStanding[] {
    const standings = rosters.map(roster => {
      const user = users.find(u => u.userId === roster.ownerId);
      const totalGames = roster.wins + roster.losses + roster.ties;
      const winPercentage = totalGames > 0 ? 
        (roster.wins + (roster.ties * 0.5)) / totalGames : 0;

      return {
        rank: 0, // Will be set after sorting
        user: user || {
          userId: roster.ownerId || '',
          displayName: 'Unknown',
          username: 'Unknown',
          isOwner: false,
        },
        roster,
        winPercentage,
      };
    });

    // Sort by win percentage (descending), then by points for (descending)
    standings.sort((a, b) => {
      if (b.winPercentage !== a.winPercentage) {
        return b.winPercentage - a.winPercentage;
      }
      return b.roster.points - a.roster.points;
    });

    // Assign ranks
    standings.forEach((standing, index) => {
      standing.rank = index + 1;
    });

    return standings;
  }

  // MARK: - Utility Methods
  getCurrentSeason(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // JavaScript months are 0-indexed
    
    // NFL season typically starts in September and goes to February of next year
    // So if we're in January-July, we're still in the previous year's season
    if (month <= 7) {
      return (year - 1).toString();
    }
    return year.toString();
  }

  formatPlayerName(player: SleeperPlayer): string {
    if (player.full_name) return player.full_name;
    if (player.first_name && player.last_name) {
      return `${player.first_name} ${player.last_name}`;
    }
    return player.first_name || player.last_name || 'Unknown Player';
  }

  getPositionColor(position: string): string {
    const colors: Record<string, string> = {
      QB: '#ef4444', // red-500
      RB: '#10b981', // emerald-500
      WR: '#3b82f6', // blue-500
      TE: '#f59e0b', // amber-500
      K: '#8b5cf6',  // violet-500
      DEF: '#6b7280', // gray-500
    };
    return colors[position] || '#6b7280';
  }

  // MARK: - Advanced Data Methods
  async getLeagueMatchups(leagueId: string, week: number): Promise<SleeperServiceResponse<SleeperMatchup[]>> {
    try {
      const response = await fetch(`/api/sleeper/league/${encodeURIComponent(leagueId)}/matchups/${week}`);
      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to fetch matchups' };
      }
      
      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Network error while fetching matchups' };
    }
  }

  async getPlayoffBrackets(leagueId: string): Promise<SleeperServiceResponse<any>> {
    try {
      const response = await fetch(`/api/sleeper/league/${encodeURIComponent(leagueId)}/brackets`);
      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to fetch playoff brackets' };
      }
      
      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Network error while fetching playoff brackets' };
    }
  }

  async getLeagueDrafts(leagueId: string): Promise<SleeperServiceResponse<SleeperDraft[]>> {
    try {
      const response = await fetch(`/api/sleeper/league/${encodeURIComponent(leagueId)}/drafts`);
      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to fetch league drafts' };
      }
      
      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Network error while fetching league drafts' };
    }
  }

  async getDraftPicks(draftId: string): Promise<SleeperServiceResponse<DraftPick[]>> {
    try {
      const response = await fetch(`/api/sleeper/draft/${encodeURIComponent(draftId)}/picks`);
      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to fetch draft picks' };
      }
      
      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Network error while fetching draft picks' };
    }
  }

  processDraftPicks(
    picks: DraftPick[], 
    users: ProcessedUser[], 
    players: Record<string, SleeperPlayer>
  ): ProcessedDraftPick[] {
    return picks.map(pick => {
      const player = players[pick.player_id];
      const owner = users.find(user => user.userId === pick.picked_by);
      const pickInRound = pick.pick_no - ((pick.round - 1) * users.length);
      
      return {
        pick_no: pick.pick_no,
        round: pick.round,
        pick_in_round: pickInRound,
        roster_id: pick.roster_id,
        player_id: pick.player_id,
        player_name: this.formatPlayerName(player),
        player_position: player?.position || 'N/A',
        player_team: player?.team || 'N/A',
        owner_name: owner?.displayName || 'Unknown',
        draft_slot: pick.draft_slot,
        is_keeper: pick.is_keeper || false,
      };
    }).sort((a, b) => a.pick_no - b.pick_no); // Sort by pick number
  }

  async getCompleteDraftData(leagueId: string): Promise<SleeperServiceResponse<{
    drafts: SleeperDraft[];
    picks: ProcessedDraftPick[];
    users: ProcessedUser[];
  }>> {
    try {
      // Get drafts and users in parallel
      const [draftsResponse, usersResponse, playersResponse] = await Promise.all([
        this.getLeagueDrafts(leagueId),
        this.getLeagueUsers(leagueId),
        this.getPlayers(),
      ]);

      if (!draftsResponse.success) {
        return { success: false, error: 'Failed to fetch league drafts' };
      }

      if (!usersResponse.success) {
        return { success: false, error: 'Failed to fetch league users' };
      }

      const drafts = draftsResponse.data!;
      const rawUsers = usersResponse.data!;
      const players = playersResponse.data || {};

      if (drafts.length === 0) {
        return { success: false, error: 'No drafts found for this league' };
      }

      // Get picks for the most recent draft
      const mostRecentDraft = drafts[0]; // Assuming the first draft is the most recent
      const picksResponse = await this.getDraftPicks(mostRecentDraft.draft_id);

      if (!picksResponse.success) {
        return { success: false, error: 'Failed to fetch draft picks' };
      }

      const rawPicks = picksResponse.data!;
      const processedUsers = this.processUsers(rawUsers);
      const processedPicks = this.processDraftPicks(rawPicks, processedUsers, players);

      return {
        success: true,
        data: {
          drafts,
          picks: processedPicks,
          users: processedUsers,
        },
      };
    } catch (error) {
      return { success: false, error: 'Network error while fetching complete draft data' };
    }
  }

  async getCompleteSeasonData(leagueId: string): Promise<SleeperServiceResponse<{
    users: ProcessedUser[];
    rosters: ProcessedRoster[];
    standings: LeagueStanding[];
    weeklyMatchups: Record<number, SleeperMatchup[]>;
    playoffBrackets?: any;
    seasonSummaries: UserSeasonSummary[];
  }>> {
    try {
      // Get basic league data first
      const [usersResponse, rostersResponse, playersResponse] = await Promise.all([
        this.getLeagueUsers(leagueId),
        this.getLeagueRosters(leagueId),
        this.getPlayers(),
      ]);

      if (!usersResponse.success || !rostersResponse.success) {
        return { success: false, error: 'Failed to fetch basic league data' };
      }

      const rawUsers = usersResponse.data!;
      const rawRosters = rostersResponse.data!;
      const players = playersResponse.data || {};

      const processedUsers = this.processUsers(rawUsers);
      const processedRosters = this.processRosters(rawRosters, processedUsers);
      const standings = this.calculateStandings(processedRosters, processedUsers);

      // Get weekly matchups for weeks 1-18 (covers most regular seasons)
      const weeklyMatchups: Record<number, SleeperMatchup[]> = {};
      const weekPromises = Array.from({ length: 18 }, (_, i) => i + 1).map(async (week) => {
        const matchupsResponse = await this.getLeagueMatchups(leagueId, week);
        if (matchupsResponse.success && matchupsResponse.data) {
          weeklyMatchups[week] = matchupsResponse.data;
        }
      });

      await Promise.all(weekPromises);

      // Get playoff brackets
      const bracketsResponse = await this.getPlayoffBrackets(leagueId);

      // Calculate season summaries for each user
      const seasonSummaries = this.calculateSeasonSummaries(
        processedUsers,
        processedRosters,
        weeklyMatchups,
        players
      );

      return {
        success: true,
        data: {
          users: processedUsers,
          rosters: processedRosters,
          standings,
          weeklyMatchups,
          playoffBrackets: bracketsResponse.success ? bracketsResponse.data : undefined,
          seasonSummaries,
        },
      };
    } catch (error) {
      return { success: false, error: 'Network error while fetching complete season data' };
    }
  }

  private calculateSeasonSummaries(
    users: ProcessedUser[],
    rosters: ProcessedRoster[],
    weeklyMatchups: Record<number, SleeperMatchup[]>,
    players: Record<string, SleeperPlayer>
  ): UserSeasonSummary[] {
    return users.map(user => {
      const roster = rosters.find(r => r.ownerId === user.userId);
      if (!roster) {
        return {
          user,
          roster: {
            rosterId: 0,
            ownerId: user.userId,
            ownerName: user.displayName,
            players: [],
            starters: [],
            wins: 0,
            losses: 0,
            ties: 0,
            points: 0,
            pointsAgainst: 0,
            record: '0-0',
          },
          weeklyPerformance: [],
          seasonStats: {
            highest_week: 0,
            lowest_week: 0,
            average_points: 0,
            consistency_score: 0,
            head_to_head_record: {},
          },
        };
      }

      // Calculate weekly performance
      const weeklyPerformance: WeeklyPerformance[] = [];
      const weeklyPoints: number[] = [];

      Object.entries(weeklyMatchups).forEach(([weekStr, matchups]) => {
        const week = parseInt(weekStr);
        const userMatchup = matchups.find(m => m.roster_id === roster.rosterId);
        
        if (userMatchup) {
          const opponentMatchup = matchups.find(
            m => m.matchup_id === userMatchup.matchup_id && m.roster_id !== roster.rosterId
          );

          const points = userMatchup.points || 0;
          const opponentPoints = opponentMatchup?.points || 0;
          
          weeklyPoints.push(points);

          weeklyPerformance.push({
            week,
            roster_id: roster.rosterId,
            points,
            matchup_id: userMatchup.matchup_id,
            opponent_roster_id: opponentMatchup?.roster_id,
            opponent_points: opponentPoints,
            is_win: points > opponentPoints,
            is_tie: points === opponentPoints,
            is_playoff: week > 14, // Assume playoffs start week 15
          });
        }
      });

      // Calculate season stats
      const highestWeek = Math.max(...weeklyPoints, 0);
      const lowestWeek = weeklyPoints.length > 0 ? Math.min(...weeklyPoints) : 0;
      const averagePoints = weeklyPoints.length > 0 ? 
        weeklyPoints.reduce((sum, points) => sum + points, 0) / weeklyPoints.length : 0;
      
      // Calculate consistency (lower standard deviation = more consistent)
      const variance = weeklyPoints.length > 0 ? 
        weeklyPoints.reduce((sum, points) => sum + Math.pow(points - averagePoints, 2), 0) / weeklyPoints.length : 0;
      const consistencyScore = Math.max(0, 100 - Math.sqrt(variance));

      return {
        user,
        roster,
        weeklyPerformance,
        seasonStats: {
          highest_week: highestWeek,
          lowest_week: lowestWeek,
          average_points: Math.round(averagePoints * 100) / 100,
          consistency_score: Math.round(consistencyScore * 100) / 100,
          head_to_head_record: {}, // TODO: Calculate head-to-head records
        },
      };
    });
  }
}

export const sleeperService = SleeperService.getInstance();
export { SleeperService };
export default sleeperService;

export async function fetchSleeperLeagues(userId: string): Promise<SleeperLeague[]> {
  try {
    const response = await fetch(`https://api.sleeper.app/v1/user/${userId}/leagues/nfl/2024`);
    const leagues = await response.json();
    return leagues;
  } catch {
    return [];
  }
}

export async function fetchSleeperUser(username: string): Promise<SleeperUser | null> {
  try {
    const response = await fetch(`https://api.sleeper.app/v1/user/${username}`);
    const user = await response.json();
    return user;
  } catch {
    return null;
  }
}

export async function fetchSleeperDrafts(leagueId: string): Promise<SleeperDraft[]> {
  try {
    const response = await fetch(`https://api.sleeper.app/v1/league/${leagueId}/drafts`);
    const drafts = await response.json();
    return drafts;
  } catch {
    return [];
  }
}

export async function fetchSleeperMatchups(leagueId: string, week: number): Promise<SleeperMatchup[]> {
  try {
    const response = await fetch(`https://api.sleeper.app/v1/league/${leagueId}/matchups/${week}`);
    const matchups = await response.json();
    return matchups;
  } catch {
    return [];
  }
}

export async function fetchSleeperRosters(leagueId: string): Promise<SleeperRoster[]> {
  try {
    const response = await fetch(`https://api.sleeper.app/v1/league/${leagueId}/rosters`);
    const rosters = await response.json();
    return rosters;
  } catch {
    return [];
  }
} 