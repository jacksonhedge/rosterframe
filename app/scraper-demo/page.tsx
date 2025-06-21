import { Navigation } from '../components/ui/Navigation';
import { CardScraper } from '../components/CardScraper';
import { Hero } from '../components/ui/Hero';

export default function ScraperDemoPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <Hero
        variant="default"
        title="Card Marketplace Scraper"
        subtitle="POWERED BY MCP"
        description="Search and compare sports card prices across multiple marketplaces in real-time"
      />

      {/* Scraper Component */}
      <section className="py-12 bg-[var(--surface-1)]">
        <div className="container">
          <CardScraper />
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16">
        <div className="container max-w-4xl">
          <div className="prose prose-lg">
            <h2 className="text-2xl font-bold mb-4">About This Feature</h2>
            <p className="text-[var(--text-secondary)] mb-4">
              This scraper demonstrates web content fetching capabilities similar to the MCP fetch server.
              It allows you to search for sports cards across multiple marketplaces and compare prices.
            </p>
            
            <h3 className="text-xl font-semibold mb-3">Features:</h3>
            <ul className="list-disc pl-6 text-[var(--text-secondary)]">
              <li>Real-time marketplace search</li>
              <li>Multi-marketplace support (eBay, COMC, TCGPlayer)</li>
              <li>Card detail extraction</li>
              <li>Price comparison</li>
              <li>Respects robots.txt</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">Technical Implementation:</h3>
            <ul className="list-disc pl-6 text-[var(--text-secondary)]">
              <li>Server-side scraping for security</li>
              <li>Rate limiting to prevent abuse</li>
              <li>Caching for performance (coming soon)</li>
              <li>HTML to Markdown conversion</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}