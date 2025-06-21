/**
 * NFL Data Import Service
 * Imports player data from https://github.com/hvpkod/NFL-Data
 * Focuses on 2020-2024 seasons as requested
 */

import { createClient } from '@supabase/supabase-js';

interface NFLPlayerData {
  Player: string;
  Team: string;
  Position: string;
  Age?: number;
  Games?: number;
  Points?: number;
  Rank?: number;
  PassingYards?: number;
  RushingYards?: number;
  ReceivingYards?: number;
  Touchdowns?: number;
  Fantasy_Points?: number;
  Season: number;
}

interface PlayerRecord {
  id?: string;
  name: string;
  sport_id: string;
  position_id?: string;
  team_id?: string;
  active: boolean;
  stats: any;
  season_data: NFLPlayerData[];
}

export class NFLDataImportService {
  private supabase: any;
  private readonly seasons = [2020, 2021, 2022, 2023, 2024];
  private readonly positions = [
    'QB', 'RB', 'WR', 'TE', 'K', 'DEF'
  ];

  constructor() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase environment variables');
    }
    
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }

  /**
   * Main import function - downloads and processes all NFL data
   */
  async importNFLData(): Promise<{ success: boolean; message: string; playersImported: number }> {
    try {
      console.log('🏈 Starting NFL data import from GitHub repository...');
      
      // Get sport and position IDs
      const { sportId, positionMap } = await this.setupSportData();
      
      let totalPlayersImported = 0;
      const playerMap = new Map<string, PlayerRecord>();

      // Process each season
      for (const season of this.seasons) {
        console.log(`\n📅 Processing ${season} season...`);
        
        for (const position of this.positions) {
          try {
            const seasonData = await this.fetchSeasonData(season, position);
            const processed = this.processSeasonData(seasonData, season, sportId, positionMap);
            
            // Merge with existing player data
            processed.forEach(player => {
              const key = `${player.name}_${position}`;
              if (playerMap.has(key)) {
                const existing = playerMap.get(key)!;
                existing.season_data.push(...player.season_data);
                existing.stats = this.aggregateStats(existing.season_data);
              } else {
                playerMap.set(key, player);
              }
            });
            
            console.log(`  ✓ ${position}: ${processed.length} players`);
          } catch (error) {
            console.warn(`  ⚠️ Failed to fetch ${position} data for ${season}:`, error);
          }
        }
      }

      // Import to database
      const players = Array.from(playerMap.values());
      totalPlayersImported = await this.importToDatabase(players);
      
      console.log(`\n🎉 Import completed! ${totalPlayersImported} players imported.`);
      
      return {
        success: true,
        message: `Successfully imported ${totalPlayersImported} NFL players from 2020-2024 seasons`,
        playersImported: totalPlayersImported
      };

    } catch (error) {
      console.error('❌ NFL data import failed:', error);
      return {
        success: false,
        message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        playersImported: 0
      };
    }
  }

  /**
   * Fetch data for a specific season and position from GitHub
   */
  private async fetchSeasonData(season: number, position: string): Promise<NFLPlayerData[]> {
    // GitHub raw URL for the data files
    const baseUrl = 'https://raw.githubusercontent.com/hvpkod/NFL-Data/main/NFL-data-Players';
    const fileName = `${season}_${position}.json`;
    const url = `${baseUrl}/${fileName}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Handle different possible data structures
      if (Array.isArray(data)) {
        return data;
      } else if (data.players && Array.isArray(data.players)) {
        return data.players;
      } else if (data.data && Array.isArray(data.data)) {
        return data.data;
      } else {
        console.warn(`Unexpected data structure for ${fileName}`);
        return [];
      }
    } catch (error) {
      // Try CSV format as fallback
      try {
        const csvUrl = `${baseUrl}/${season}_${position}.csv`;
        const csvResponse = await fetch(csvUrl);
        if (csvResponse.ok) {
          const csvText = await csvResponse.text();
          return this.parseCSVData(csvText, season);
        }
      } catch (csvError) {
        console.warn(`Failed to fetch CSV fallback for ${fileName}`);
      }
      
      throw error;
    }
  }

  /**
   * Parse CSV data format
   */
  private parseCSVData(csvText: string, season: number): NFLPlayerData[] {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const players: NFLPlayerData[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      if (values.length >= headers.length) {
        const player: any = { Season: season };
        headers.forEach((header, index) => {
          const value = values[index];
          if (value && value !== '-' && value !== '') {
            if (header === 'Player') {
              player.Player = value;
            } else if (header === 'Team') {
              player.Team = value;
            } else if (header === 'Position') {
              player.Position = value;
            } else if (!isNaN(Number(value))) {
              player[header] = Number(value);
            } else {
              player[header] = value;
            }
          }
        });
        
        if (player.Player) {
          players.push(player as NFLPlayerData);
        }
      }
    }

    return players;
  }

  /**
   * Process season data into player records
   */
  private processSeasonData(
    seasonData: NFLPlayerData[], 
    season: number, 
    sportId: string, 
    positionMap: Map<string, string>
  ): PlayerRecord[] {
    return seasonData
      .filter(data => data.Player && data.Position)
      .map(data => ({
        name: this.cleanPlayerName(data.Player),
        sport_id: sportId,
        position_id: positionMap.get(data.Position),
        active: season >= 2023, // Consider 2023+ players as currently active
        stats: {
          season: season,
          team: data.Team,
          position: data.Position,
          games: data.Games,
          points: data.Points || data.Fantasy_Points,
          rank: data.Rank,
          passing_yards: data.PassingYards,
          rushing_yards: data.RushingYards,
          receiving_yards: data.ReceivingYards,
          touchdowns: data.Touchdowns
        },
        season_data: [{ ...data, Season: season }]
      }));
  }

  /**
   * Set up sport and position mappings
   */
  private async setupSportData(): Promise<{ sportId: string; positionMap: Map<string, string> }> {
    // Get NFL sport ID
    const { data: sports } = await this.supabase
      .from('sports')
      .select('id')
      .eq('abbreviation', 'NFL')
      .single();

    if (!sports) {
      throw new Error('NFL sport not found in database');
    }

    // Get position mappings
    const { data: positions } = await this.supabase
      .from('positions')
      .select('id, abbreviation')
      .eq('sport_id', sports.id);

    const positionMap = new Map<string, string>();
    positions?.forEach((pos: { id: string; abbreviation: string }) => {
      positionMap.set(pos.abbreviation, pos.id);
    });

    return { sportId: sports.id, positionMap };
  }

  /**
   * Clean and standardize player names
   */
  private cleanPlayerName(name: string): string {
    return name
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\-\.\']/g, '')
      .split(' ')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Aggregate stats across multiple seasons
   */
  private aggregateStats(seasonData: NFLPlayerData[]): any {
    const totalSeasons = seasonData.length;
    const latestSeason = Math.max(...seasonData.map(d => d.Season));
    const latestData = seasonData.find(d => d.Season === latestSeason);

    return {
      career_seasons: totalSeasons,
      latest_season: latestSeason,
      latest_team: latestData?.Team,
      latest_position: latestData?.Position,
      total_games: seasonData.reduce((sum, d) => sum + (d.Games || 0), 0),
      total_fantasy_points: seasonData.reduce((sum, d) => sum + (d.Fantasy_Points || d.Points || 0), 0),
      seasons_data: seasonData
    };
  }

  /**
   * Import processed players to database
   */
  private async importToDatabase(players: PlayerRecord[]): Promise<number> {
    let imported = 0;
    const batchSize = 100;

    for (let i = 0; i < players.length; i += batchSize) {
      const batch = players.slice(i, i + batchSize);
      
      try {
        const { error } = await this.supabase
          .from('players')
          .upsert(
            batch.map(player => ({
              name: player.name,
              sport_id: player.sport_id,
              position_id: player.position_id,
              active: player.active,
              stats: player.stats
            })),
            { 
              onConflict: 'name,sport_id',
              ignoreDuplicates: false 
            }
          );

        if (error) {
          console.warn(`Batch import error:`, error);
        } else {
          imported += batch.length;
        }
      } catch (error) {
        console.warn(`Failed to import batch ${i}-${i + batch.length}:`, error);
      }
    }

    return imported;
  }

  /**
   * Search players by name (for the PlayerSearch component)
   */
  async searchPlayers(query: string, limit: number = 10): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('players')
      .select(`
        id,
        name,
        active,
        stats,
        sport:sports(name, abbreviation),
        position:positions(name, abbreviation)
      `)
      .ilike('name', `%${query}%`)
      .eq('sports.abbreviation', 'NFL')
      .eq('active', true)
      .order('name')
      .limit(limit);

    if (error) {
      console.error('Player search error:', error);
      return [];
    }

    return data?.map((player: any) => ({
      id: player.id,
      name: player.name,
      playerName: player.name,
      position: player.position?.abbreviation || 'N/A',
      year: player.stats?.latest_season || new Date().getFullYear(),
      brand: 'NFL Official',
      series: `${player.stats?.latest_season} Season`,
      condition: 'Mint',
      rookieCard: false,
      imageUrl: '', // Could be populated with team logos or player photos
      notes: `${player.stats?.latest_team || 'NFL'} • ${player.stats?.career_seasons || 1} seasons`
    })) || [];
  }
}

// Export singleton instance
export const nflDataService = new NFLDataImportService(); 