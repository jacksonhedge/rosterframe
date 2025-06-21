import { Navigation } from '@/app/components/ui/Navigation';
import { FootballPlayerScraper } from '@/app/components/FootballPlayerScraper';
import { Hero } from '@/app/components/ui/Hero';
import { ScrollFade } from '@/app/components/animations/ScrollFade';
import { Card } from '@/app/components/ui/Card';

export default function AdminScraperPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <Hero
        variant="default"
        title="Football Player Database Manager"
        subtitle="ADMIN TOOLS"
        description="Scrape and manage football player data from FootballDB.com"
      />

      {/* Main Scraper Component */}
      <section className="py-12 bg-[var(--surface-1)]">
        <div className="container">
          <FootballPlayerScraper />
        </div>
      </section>

      {/* Instructions */}
      <section className="py-16">
        <div className="container max-w-4xl">
          <ScrollFade>
            <Card>
              <h2 className="text-2xl font-bold mb-4">How to Use</h2>
              
              <div className="space-y-4 text-[var(--text-secondary)]">
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)] mb-2">1. Select Letters</h3>
                  <p>Choose which letters (A-Z) you want to scrape. By default, A-F are selected.</p>
                </div>

                <div>
                  <h3 className="font-semibold text-[var(--text-primary)] mb-2">2. Configure Options</h3>
                  <p>Enable "Save to database" if you want to store the scraped data in Supabase.</p>
                </div>

                <div>
                  <h3 className="font-semibold text-[var(--text-primary)] mb-2">3. Start Scraping</h3>
                  <p>Click "Start Scraping" and monitor the progress. The scraper will:</p>
                  <ul className="list-disc pl-6 mt-2">
                    <li>Iterate through each selected letter</li>
                    <li>Handle pagination automatically</li>
                    <li>Extract player names, positions, and years active</li>
                    <li>Respect rate limits (1.5s delay between requests)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-[var(--text-primary)] mb-2">4. View Results</h3>
                  <p>Once complete, you'll see a summary of players found for each letter.</p>
                </div>
              </div>
            </Card>
          </ScrollFade>

          <ScrollFade delay={200}>
            <Card className="mt-6">
              <h2 className="text-2xl font-bold mb-4">Important Notes</h2>
              
              <ul className="space-y-2 text-[var(--text-secondary)]">
                <li>• The scraper runs in the background - you can navigate away</li>
                <li>• Large scrapes (all letters) may take 15-30 minutes</li>
                <li>• Data includes: Player name, position, years active</li>
                <li>• Profile URLs are captured for future detail scraping</li>
                <li>• The scraper respects rate limits to avoid being blocked</li>
              </ul>
            </Card>
          </ScrollFade>

          <ScrollFade delay={300}>
            <Card className="mt-6">
              <h2 className="text-2xl font-bold mb-4">Database Schema</h2>
              
              <pre className="bg-[var(--surface-0)] p-4 rounded-[var(--radius)] overflow-x-auto text-sm">
{`CREATE TABLE football_players (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  position VARCHAR(50),
  years_active VARCHAR(100),
  college VARCHAR(255),
  height VARCHAR(20),
  weight VARCHAR(20),
  birth_date VARCHAR(100),
  profile_url TEXT,
  scraped_at TIMESTAMP DEFAULT NOW()
);`}
              </pre>
            </Card>
          </ScrollFade>
        </div>
      </section>
    </div>
  );
}