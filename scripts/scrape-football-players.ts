#!/usr/bin/env node

/**
 * Command-line script to scrape football players from FootballDB
 * Usage: npx ts-node scripts/scrape-football-players.ts [options]
 */

import { scrapeFootballPlayersAtoF, FootballDBScraper } from '../app/lib/footballdb-scraper';
import { writeFileSync } from 'fs';
import { join } from 'path';

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  letters: [] as string[],
  output: 'json',
  saveToFile: true,
  verbose: false,
};

// Parse arguments
for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case '--letters':
    case '-l':
      options.letters = args[++i].split(',').map(l => l.toUpperCase());
      break;
    case '--output':
    case '-o':
      options.output = args[++i];
      break;
    case '--no-save':
      options.saveToFile = false;
      break;
    case '--verbose':
    case '-v':
      options.verbose = true;
      break;
    case '--help':
    case '-h':
      showHelp();
      process.exit(0);
  }
}

function showHelp() {
  console.log(`
Football Player Scraper

Usage: npx ts-node scripts/scrape-football-players.ts [options]

Options:
  -l, --letters <A,B,C>   Letters to scrape (default: A,B,C,D,E,F)
  -o, --output <format>   Output format: json, csv (default: json)
  --no-save               Don't save to file
  -v, --verbose           Show detailed progress
  -h, --help              Show this help message

Examples:
  # Scrape default letters (A-F)
  npx ts-node scripts/scrape-football-players.ts

  # Scrape specific letters
  npx ts-node scripts/scrape-football-players.ts -l A,B,C

  # Output as CSV
  npx ts-node scripts/scrape-football-players.ts -o csv

  # Verbose mode
  npx ts-node scripts/scrape-football-players.ts -v
`);
}

// Main scraping function
async function main() {
  const lettersToScrape = options.letters.length > 0 
    ? options.letters 
    : ['A', 'B', 'C', 'D', 'E', 'F'];

  console.log(`\n🏈 Football Player Scraper`);
  console.log(`📋 Letters to scrape: ${lettersToScrape.join(', ')}`);
  console.log(`💾 Output format: ${options.output}`);
  console.log(`📁 Save to file: ${options.saveToFile}\n`);

  const startTime = Date.now();
  let totalPlayers = 0;

  try {
    const results = await FootballDBScraper.scrapePlayersForLetters(
      lettersToScrape,
      (progress) => {
        if (options.verbose) {
          console.log(
            `📊 Letter ${progress.letter} - Page ${progress.page}/${progress.totalPages} - ` +
            `Players: ${progress.playersScraped}`
          );
        } else {
          // Simple progress indicator
          process.stdout.write(`\r⏳ Processing letter ${progress.letter}...`);
        }
      }
    );

    console.log('\n\n✅ Scraping completed!\n');

    // Process results
    const allPlayers: any[] = [];
    const summary: Record<string, number> = {};

    for (const [letter, players] of results) {
      allPlayers.push(...players);
      summary[letter] = players.length;
      totalPlayers += players.length;
      console.log(`   Letter ${letter}: ${players.length} players`);
    }

    console.log(`\n📈 Total players scraped: ${totalPlayers}`);

    // Save to file if requested
    if (options.saveToFile) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      
      if (options.output === 'json') {
        const filename = `football-players-${timestamp}.json`;
        const data = {
          metadata: {
            scrapedAt: new Date().toISOString(),
            letters: lettersToScrape,
            totalPlayers,
            summary,
          },
          players: allPlayers,
        };
        
        writeFileSync(
          join(process.cwd(), filename),
          JSON.stringify(data, null, 2)
        );
        
        console.log(`\n💾 Saved to ${filename}`);
      } else if (options.output === 'csv') {
        const filename = `football-players-${timestamp}.csv`;
        const csv = [
          'Name,Position,Years Active,Profile URL',
          ...allPlayers.map(p => 
            `"${p.name}","${p.position || ''}","${p.yearsActive || ''}","${p.profileUrl || ''}"`
          ),
        ].join('\n');
        
        writeFileSync(
          join(process.cwd(), filename),
          csv
        );
        
        console.log(`\n💾 Saved to ${filename}`);
      }
    }

    const duration = Math.round((Date.now() - startTime) / 1000);
    console.log(`\n⏱️  Total time: ${Math.floor(duration / 60)}m ${duration % 60}s`);
    
  } catch (error) {
    console.error('\n\n❌ Error during scraping:', error);
    process.exit(1);
  }
}

// Run the scraper
main().catch(console.error);