import { NextRequest, NextResponse } from 'next/server';
import { FootballDBScraper, scrapeFootballPlayersAtoF } from '@/app/lib/footballdb-scraper';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Store scraping progress in memory (in production, use Redis or similar)
const scrapingProgress = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const { action, letters, saveToDatabase = false } = await request.json();

    switch (action) {
      case 'scrapeLetters': {
        // Generate unique job ID
        const jobId = `scrape-${Date.now()}`;
        
        // Start scraping in background
        scrapeInBackground(jobId, letters || ['A', 'B', 'C', 'D', 'E', 'F'], saveToDatabase);
        
        return NextResponse.json({
          success: true,
          jobId,
          message: 'Scraping started',
        });
      }

      case 'getProgress': {
        const { jobId } = await request.json();
        const progress = scrapingProgress.get(jobId);
        
        return NextResponse.json({
          success: true,
          progress: progress || null,
        });
      }

      case 'scrapeSingleLetter': {
        const { letter } = await request.json();
        
        if (!letter || letter.length !== 1) {
          return NextResponse.json(
            { error: 'Invalid letter parameter' },
            { status: 400 }
          );
        }

        const players = await FootballDBScraper.scrapePlayersForLetter(letter);
        
        return NextResponse.json({
          success: true,
          letter,
          count: players.length,
          players,
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Football scraper error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Background scraping function
async function scrapeInBackground(
  jobId: string, 
  letters: string[], 
  saveToDatabase: boolean
) {
  // Initialize progress
  scrapingProgress.set(jobId, {
    status: 'running',
    startTime: new Date(),
    currentLetter: 0,
    totalLetters: letters.length,
    playersScraped: 0,
    errors: [],
  });

  try {
    const results = await FootballDBScraper.scrapePlayersForLetters(
      letters,
      (progress) => {
        // Update progress
        const currentProgress = scrapingProgress.get(jobId);
        scrapingProgress.set(jobId, {
          ...currentProgress,
          ...progress,
          lastUpdate: new Date(),
        });
      }
    );

    // Flatten results
    const allPlayers = [];
    const summary: Record<string, number> = {};
    
    for (const [letter, players] of results) {
      allPlayers.push(...players);
      summary[letter] = players.length;
    }

    // Save to database if requested
    if (saveToDatabase && allPlayers.length > 0) {
      await savePlayersToSupabase(allPlayers);
    }

    // Update final progress
    scrapingProgress.set(jobId, {
      status: 'completed',
      startTime: scrapingProgress.get(jobId).startTime,
      endTime: new Date(),
      totalPlayers: allPlayers.length,
      summary,
      errors: scrapingProgress.get(jobId).errors,
    });

    // Clean up after 1 hour
    setTimeout(() => {
      scrapingProgress.delete(jobId);
    }, 3600000);

  } catch (error) {
    console.error('Background scraping error:', error);
    
    const currentProgress = scrapingProgress.get(jobId);
    scrapingProgress.set(jobId, {
      ...currentProgress,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      endTime: new Date(),
    });
  }
}

// Save players to Supabase
async function savePlayersToSupabase(players: any[]) {
  const batchSize = 100;
  let totalSaved = 0;
  let totalErrors = 0;
  
  console.log(`Starting to save ${players.length} players to Supabase...`);
  
  for (let i = 0; i < players.length; i += batchSize) {
    const batch = players.slice(i, i + batchSize);
    
    try {
      const { data, error } = await supabaseAdmin
        .from('football_players')
        .upsert(
          batch.map(player => ({
            name: player.name,
            position: player.position || null,
            years_active: player.yearsActive || null,
            college: player.college || null,
            height: player.height || null,
            weight: player.weight || null,
            birth_date: player.birthDate || null,
            profile_url: player.profileUrl || null,
          })),
          { 
            onConflict: 'name,years_active',
            ignoreDuplicates: false 
          }
        );
      
      if (error) {
        console.error(`Error saving batch ${Math.floor(i / batchSize) + 1}:`, error);
        totalErrors += batch.length;
      } else {
        totalSaved += batch.length;
        console.log(`Saved batch ${Math.floor(i / batchSize) + 1} (${totalSaved}/${players.length})`);
      }
    } catch (error) {
      console.error(`Failed to save batch:`, error);
      totalErrors += batch.length;
    }
  }
  
  console.log(`Completed: ${totalSaved} saved, ${totalErrors} errors`);
  return { totalSaved, totalErrors };
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    status: 'Football player scraper API',
    endpoints: {
      scrapeLetters: {
        method: 'POST',
        description: 'Scrape players for specified letters (A-Z)',
        params: {
          action: 'scrapeLetters',
          letters: ['A', 'B', 'C'], // optional, defaults to A-F
          saveToDatabase: false // optional
        }
      },
      getProgress: {
        method: 'POST',
        description: 'Get progress of a scraping job',
        params: {
          action: 'getProgress',
          jobId: 'scrape-xxxxx'
        }
      },
      scrapeSingleLetter: {
        method: 'POST',
        description: 'Scrape players for a single letter',
        params: {
          action: 'scrapeSingleLetter',
          letter: 'A'
        }
      }
    }
  });
}