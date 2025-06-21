import { createHash } from 'crypto';

interface PlayerData {
  id?: string;
  name: string;
  position?: string;
  yearsActive?: string;
  college?: string;
  height?: string;
  weight?: string;
  birthDate?: string;
  profileUrl?: string;
}

interface ScraperProgress {
  letter: string;
  page: number;
  totalPages?: number;
  playersScraped: number;
}

export class FootballDBScraper {
  private static readonly BASE_URL = 'https://www.footballdb.com';
  private static readonly PLAYERS_URL = '/players/index.html';
  private static readonly DELAY_MS = 1500; // Delay between requests to be respectful

  private static headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Cache-Control': 'max-age=0',
  };

  /**
   * Delay execution to avoid rate limiting
   */
  private static async delay(ms: number = this.DELAY_MS): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Fetch a page with proper headers
   */
  private static async fetchPage(url: string): Promise<string> {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
        redirect: 'follow',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.text();
    } catch (error) {
      console.error(`Failed to fetch ${url}:`, error);
      throw error;
    }
  }

  /**
   * Parse player data from HTML
   */
  private static parsePlayersFromHTML(html: string): { players: PlayerData[], totalPages: number } {
    // Extract player rows using regex patterns
    const tableMatch = html.match(/<table[^>]*class="[^"]*statistics[^"]*"[^>]*>([\s\S]*?)<\/table>/i);
    if (!tableMatch) {
      console.warn('No player table found');
      return { players: [], totalPages: 1 };
    }

    const players: PlayerData[] = [];
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    const rows = tableMatch[1].match(rowRegex) || [];

    for (const row of rows) {
      // Skip header rows
      if (row.includes('<th') || row.includes('thead')) continue;

      // Extract cells
      const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
      const cells = row.match(cellRegex) || [];

      if (cells.length >= 3) {
        // Extract player name and URL
        const nameMatch = cells[0].match(/<a[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/i);
        const name = nameMatch ? nameMatch[2].trim() : cells[0].replace(/<[^>]+>/g, '').trim();
        const profileUrl = nameMatch ? this.BASE_URL + nameMatch[1] : undefined;

        // Extract position
        const position = cells[1].replace(/<[^>]+>/g, '').trim();

        // Extract years active
        const yearsActive = cells[2].replace(/<[^>]+>/g, '').trim();

        // Generate ID from name
        const id = createHash('md5').update(name.toLowerCase()).digest('hex').substring(0, 8);

        if (name) {
          players.push({
            id,
            name,
            position: position || undefined,
            yearsActive: yearsActive || undefined,
            profileUrl,
          });
        }
      }
    }

    // Extract total pages from pagination
    const paginationMatch = html.match(/Page \d+ of (\d+)/i);
    const totalPages = paginationMatch ? parseInt(paginationMatch[1]) : 1;

    return { players, totalPages };
  }

  /**
   * Scrape all players for a specific letter
   */
  static async scrapePlayersForLetter(
    letter: string,
    onProgress?: (progress: ScraperProgress) => void
  ): Promise<PlayerData[]> {
    const allPlayers: PlayerData[] = [];
    let page = 1;
    let totalPages = 1;

    do {
      try {
        const url = `${this.BASE_URL}${this.PLAYERS_URL}?letter=${letter}&page=${page}`;
        console.log(`Scraping ${url}`);

        const html = await this.fetchPage(url);
        const { players, totalPages: parsedTotalPages } = this.parsePlayersFromHTML(html);

        if (page === 1) {
          totalPages = parsedTotalPages;
        }

        allPlayers.push(...players);

        if (onProgress) {
          onProgress({
            letter,
            page,
            totalPages,
            playersScraped: allPlayers.length,
          });
        }

        console.log(`Found ${players.length} players on page ${page} of ${totalPages} for letter ${letter}`);

        // Delay before next request
        if (page < totalPages) {
          await this.delay();
        }

        page++;
      } catch (error) {
        console.error(`Error scraping page ${page} for letter ${letter}:`, error);
        // Continue with next page on error
        page++;
      }
    } while (page <= totalPages);

    return allPlayers;
  }

  /**
   * Scrape players for multiple letters
   */
  static async scrapePlayersForLetters(
    letters: string[],
    onProgress?: (progress: ScraperProgress & { currentLetter: number, totalLetters: number }) => void
  ): Promise<Map<string, PlayerData[]>> {
    const results = new Map<string, PlayerData[]>();

    for (let i = 0; i < letters.length; i++) {
      const letter = letters[i];
      console.log(`\nStarting scrape for letter ${letter} (${i + 1}/${letters.length})`);

      const players = await this.scrapePlayersForLetter(letter, (progress) => {
        if (onProgress) {
          onProgress({
            ...progress,
            currentLetter: i + 1,
            totalLetters: letters.length,
          });
        }
      });

      results.set(letter, players);
      console.log(`Completed letter ${letter}: ${players.length} players found`);

      // Delay between letters
      if (i < letters.length - 1) {
        await this.delay(2000); // Longer delay between letters
      }
    }

    return results;
  }

  /**
   * Scrape additional player details from profile page
   */
  static async scrapePlayerDetails(profileUrl: string): Promise<Partial<PlayerData>> {
    try {
      const html = await this.fetchPage(profileUrl);
      
      // Extract additional details using regex patterns
      const details: Partial<PlayerData> = {};

      // Height
      const heightMatch = html.match(/Height:\s*<[^>]+>([^<]+)</i);
      if (heightMatch) details.height = heightMatch[1].trim();

      // Weight
      const weightMatch = html.match(/Weight:\s*<[^>]+>([^<]+)</i);
      if (weightMatch) details.weight = weightMatch[1].trim();

      // Birth date
      const birthMatch = html.match(/Born:\s*<[^>]+>([^<]+)</i);
      if (birthMatch) details.birthDate = birthMatch[1].trim();

      // College
      const collegeMatch = html.match(/College:\s*<[^>]+>([^<]+)</i);
      if (collegeMatch) details.college = collegeMatch[1].trim();

      return details;
    } catch (error) {
      console.error(`Failed to scrape player details from ${profileUrl}:`, error);
      return {};
    }
  }

  /**
   * Save players to database
   */
  static async savePlayersToDatabase(players: PlayerData[]): Promise<void> {
    // This would integrate with your Supabase database
    // For now, we'll just prepare the data structure
    const batchSize = 100;
    
    for (let i = 0; i < players.length; i += batchSize) {
      const batch = players.slice(i, i + batchSize);
      
      // TODO: Insert into your database
      console.log(`Would save batch ${Math.floor(i / batchSize) + 1}: ${batch.length} players`);
      
      // Example Supabase insert:
      // const { error } = await supabase
      //   .from('football_players')
      //   .upsert(batch, { onConflict: 'name' });
    }
  }
}

// Export convenience function for scraping letters A-F
export async function scrapeFootballPlayersAtoF(
  onProgress?: (progress: any) => void
): Promise<{ players: PlayerData[], summary: Record<string, number> }> {
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
  const results = await FootballDBScraper.scrapePlayersForLetters(letters, onProgress);
  
  // Flatten results
  const allPlayers: PlayerData[] = [];
  const summary: Record<string, number> = {};
  
  for (const [letter, players] of results) {
    allPlayers.push(...players);
    summary[letter] = players.length;
  }
  
  return { players: allPlayers, summary };
}