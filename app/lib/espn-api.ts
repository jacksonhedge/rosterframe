// ESPN API utilities for fetching NFL player data
// Based on: https://gist.github.com/nntrn/ee26cb2a0716de0947a0a4e9a157bc1c

export interface ESPNPlayer {
  id: string;
  displayName: string;
  firstName: string;
  lastName: string;
  position?: {
    name: string;
    abbreviation: string;
  };
  team?: {
    id: string;
    name: string;
    abbreviation: string;
  };
  jersey?: string;
  experience?: {
    years: number;
  };
}

export interface ESPNAthletesResponse {
  items: Array<{
    $ref: string;
  }>;
  count: number;
  pageIndex: number;
  pageSize: number;
  pageCount: number;
}

export interface ESPNPlayerDetails {
  id: string;
  uid: string;
  guid: string;
  displayName: string;
  shortName: string;
  weight: number;
  displayWeight: string;
  height: number;
  displayHeight: string;
  age: number;
  dateOfBirth: string;
  birthPlace: {
    city: string;
    state: string;
    country: string;
  };
  citizenship: string;
  firstName: string;
  lastName: string;
  fullName: string;
  jersey: string;
  position: {
    id: string;
    name: string;
    displayName: string;
    abbreviation: string;
  };
  team: {
    $ref: string;
  };
  experience: {
    years: number;
  };
  status: {
    id: string;
    name: string;
    type: string;
    abbreviation: string;
  };
}

// Cache for storing fetched players to avoid repeated API calls
const playersCache = new Map<string, ESPNPlayer[]>();
const playerDetailsCache = new Map<string, ESPNPlayerDetails>();

/**
 * Fetch all active NFL players from ESPN API
 */
export async function fetchAllNFLPlayers(): Promise<ESPNPlayer[]> {
  const cacheKey = 'all_nfl_players';
  
  if (playersCache.has(cacheKey)) {
    return playersCache.get(cacheKey)!;
  }

  try {
    const response = await fetch(
      'https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/athletes?limit=1000&active=true'
    );
    
    if (!response.ok) {
      throw new Error(`ESPN API error: ${response.status}`);
    }

    const data: ESPNAthletesResponse = await response.json();
    
    // Fetch detailed info for each player (in batches to avoid overwhelming the API)
    const players: ESPNPlayer[] = [];
    const batchSize = 50;
    
    for (let i = 0; i < Math.min(data.items.length, 300); i += batchSize) {
      const batch = data.items.slice(i, i + batchSize);
      const batchPromises = batch.map(item => fetchPlayerDetails(item.$ref));
      
      try {
        const batchResults = await Promise.allSettled(batchPromises);
        batchResults.forEach(result => {
          if (result.status === 'fulfilled' && result.value) {
            players.push(result.value);
          }
        });
      } catch (error) {
        console.warn('Batch fetch error:', error);
      }
      
      // Add small delay between batches to be respectful to ESPN's API
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    playersCache.set(cacheKey, players);
    return players;
  } catch (error) {
    console.error('Error fetching NFL players:', error);
    return [];
  }
}

/**
 * Fetch detailed player information from ESPN API
 */
async function fetchPlayerDetails(playerRef: string): Promise<ESPNPlayer | null> {
  if (playerDetailsCache.has(playerRef)) {
    const details = playerDetailsCache.get(playerRef)!;
    return convertToESPNPlayer(details);
  }

  try {
    const response = await fetch(playerRef);
    
    if (!response.ok) {
      return null;
    }

    const playerDetails: ESPNPlayerDetails = await response.json();
    playerDetailsCache.set(playerRef, playerDetails);
    
    return convertToESPNPlayer(playerDetails);
  } catch (error) {
    console.warn('Error fetching player details:', error);
    return null;
  }
}

/**
 * Convert ESPN player details to our simplified format
 */
function convertToESPNPlayer(details: ESPNPlayerDetails): ESPNPlayer {
  return {
    id: details.id,
    displayName: details.displayName,
    firstName: details.firstName,
    lastName: details.lastName,
    position: details.position ? {
      name: details.position.name,
      abbreviation: details.position.abbreviation,
    } : undefined,
    jersey: details.jersey,
    experience: details.experience ? {
      years: details.experience.years,
    } : undefined,
  };
}

/**
 * Search for players by name
 */
export async function searchPlayersByName(query: string): Promise<ESPNPlayer[]> {
  if (!query || query.length < 2) {
    return [];
  }

  try {
    // First try the ESPN search API
    const searchResponse = await fetch(
      `https://site.web.api.espn.com/apis/search/v2?limit=20&query=${encodeURIComponent(query)}`
    );

    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      
      // Filter for NFL players from search results
      const nflPlayers = searchData.results?.filter((result: any) => 
        result.type === 'athlete' && 
        result.league === 'nfl'
      ) || [];

      return nflPlayers.map((player: any) => ({
        id: player.id,
        displayName: player.displayName,
        firstName: player.firstName || '',
        lastName: player.lastName || '',
        position: player.position ? {
          name: player.position.name,
          abbreviation: player.position.abbreviation,
        } : undefined,
        team: player.team ? {
          id: player.team.id,
          name: player.team.name,
          abbreviation: player.team.abbreviation,
        } : undefined,
      }));
    }
  } catch (error) {
    console.warn('ESPN search API error:', error);
  }

  // Fallback: search through cached players
  const allPlayers = await fetchAllNFLPlayers();
  const queryLower = query.toLowerCase();
  
  return allPlayers.filter(player => 
    player.displayName.toLowerCase().includes(queryLower) ||
    player.firstName.toLowerCase().includes(queryLower) ||
    player.lastName.toLowerCase().includes(queryLower)
  ).slice(0, 10); // Limit to 10 results
}

/**
 * Get players by position
 */
export async function getPlayersByPosition(position: string): Promise<ESPNPlayer[]> {
  const allPlayers = await fetchAllNFLPlayers();
  
  return allPlayers.filter(player => 
    player.position?.abbreviation?.toLowerCase() === position.toLowerCase() ||
    player.position?.name?.toLowerCase().includes(position.toLowerCase())
  );
}

/**
 * Get players by team
 */
export async function getPlayersByTeam(teamId: string): Promise<ESPNPlayer[]> {
  try {
    const response = await fetch(
      `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/teams/${teamId}/athletes`
    );
    
    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const players: ESPNPlayer[] = [];

    // Fetch details for each team player
    for (const item of data.items.slice(0, 30)) { // Limit to avoid too many requests
      const player = await fetchPlayerDetails(item.$ref);
      if (player) {
        players.push(player);
      }
    }

    return players;
  } catch (error) {
    console.error('Error fetching team players:', error);
    return [];
  }
} 