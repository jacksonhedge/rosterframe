'use client';

import { useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { ScrollFade } from './animations/ScrollFade';

interface ScrapedCard {
  title: string;
  price: string;
  link: string;
  image: string;
  marketplace: string;
}

export function CardScraper() {
  const [searchQuery, setSearchQuery] = useState('');
  const [marketplace, setMarketplace] = useState<'ebay' | 'comc' | 'tcgplayer'>('ebay');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ScrapedCard[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch('/api/scraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'searchCards',
          query: searchQuery,
          marketplace
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to search cards');
      }

      setResults(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = async (url: string) => {
    try {
      const response = await fetch('/api/scraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'getCardDetails',
          url
        })
      });

      const data = await response.json();
      
      if (data.success && data.data) {
        // Handle card details (e.g., show in modal or navigate)
        console.log('Card details:', data.data);
      }
    } catch (err) {
      console.error('Failed to get card details:', err);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <ScrollFade>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">
            <span className="gradient-text">Card Marketplace Search</span>
          </h2>
          <p className="text-[var(--text-secondary)]">
            Search for sports cards across multiple marketplaces
          </p>
        </div>
      </ScrollFade>

      <ScrollFade delay={100}>
        <Card className="mb-8">
          <div className="flex flex-col gap-4">
            {/* Search Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search for cards (e.g., 'Mike Trout 2023 Topps')"
                className="flex-1 px-4 py-2 rounded-[var(--radius)] border border-[var(--surface-3)] 
                         bg-[var(--surface-0)] text-[var(--text-primary)]
                         focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
              <Button
                onClick={handleSearch}
                loading={loading}
                disabled={!searchQuery.trim()}
              >
                Search
              </Button>
            </div>

            {/* Marketplace Selector */}
            <div className="flex gap-2 items-center">
              <span className="text-sm text-[var(--text-secondary)]">Marketplace:</span>
              {(['ebay', 'comc', 'tcgplayer'] as const).map((mp) => (
                <button
                  key={mp}
                  onClick={() => setMarketplace(mp)}
                  className={`px-3 py-1 rounded-[var(--radius-sm)] text-sm transition-all
                    ${marketplace === mp 
                      ? 'bg-[var(--color-primary)] text-white' 
                      : 'bg-[var(--surface-2)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)]'
                    }`}
                >
                  {mp.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </ScrollFade>

      {/* Error Message */}
      {error && (
        <ScrollFade>
          <div className="mb-4 p-4 rounded-[var(--radius)] bg-red-50 text-red-700 border border-red-200">
            {error}
          </div>
        </ScrollFade>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-[var(--color-primary)] 
                          border-t-transparent rounded-full"></div>
        </div>
      )}

      {/* Results Grid */}
      {results.length > 0 && (
        <ScrollFade delay={200}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((card, index) => (
              <ScrollFade key={index} delay={index * 50}>
                <Card 
                  hover
                  className="cursor-pointer"
                  onClick={() => handleCardClick(card.link)}
                >
                  <div className="flex flex-col h-full">
                    {/* Card Image */}
                    {card.image && (
                      <div className="mb-4 h-48 bg-[var(--surface-1)] rounded-[var(--radius)] overflow-hidden">
                        <img
                          src={card.image}
                          alt={card.title}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    {/* Card Info */}
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2 line-clamp-2 text-[var(--text-primary)]">
                        {card.title}
                      </h3>
                      <p className="text-2xl font-bold text-[var(--color-accent)] mb-2">
                        {card.price}
                      </p>
                      <p className="text-sm text-[var(--text-tertiary)]">
                        via {card.marketplace}
                      </p>
                    </div>

                    {/* Action Button */}
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full mt-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(card.link, '_blank', 'noopener,noreferrer');
                      }}
                    >
                      View on {card.marketplace}
                    </Button>
                  </div>
                </Card>
              </ScrollFade>
            ))}
          </div>
        </ScrollFade>
      )}

      {/* No Results */}
      {!loading && results.length === 0 && searchQuery && (
        <ScrollFade>
          <div className="text-center py-12 text-[var(--text-secondary)]">
            No cards found for "{searchQuery}"
          </div>
        </ScrollFade>
      )}
    </div>
  );
}