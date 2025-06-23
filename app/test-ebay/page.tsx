'use client';

import { useState } from 'react';
import { Navigation } from '../components/ui/Navigation';

interface EBayCard {
  ebayItemId: string;
  title: string;
  playerName?: string;
  year?: number;
  brand?: string;
  currentPrice: number;
  imageUrls: string[];
  listingUrl: string;
  seller: {
    username: string;
    feedbackScore: number;
    feedbackPercentage: number;
  };
}

export default function TestEBay() {
  const [searchQuery, setSearchQuery] = useState('');
  const [cards, setCards] = useState<EBayCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);

  // Test eBay connection
  const testConnection = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/test-ebay-connection');
      const data = await response.json();
      
      if (data.success) {
        setConnectionStatus('✅ Connected to eBay ' + (data.environment || 'API'));
      } else {
        setConnectionStatus('❌ ' + data.message);
      }
    } catch (err) {
      setConnectionStatus('❌ Failed to connect to eBay API');
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Search for cards
  const searchCards = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    setCards([]);
    
    try {
      const response = await fetch('/api/search-ebay-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCards(data.items || []);
      } else {
        setError(data.error || 'Failed to search cards');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        logo="Roster Frame"
        links={[
          { href: '/build-and-buy', label: 'Build & Buy' },
          { href: '/marketplace', label: 'Marketplace' },
          { href: '/collection', label: 'Collection' },
        ]}
      />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">eBay API Test</h1>

        {/* Connection Test */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Connection</h2>
          <button
            onClick={testConnection}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Testing...' : 'Test eBay Connection'}
          </button>
          {connectionStatus && (
            <p className="mt-4 text-lg">{connectionStatus}</p>
          )}
        </div>

        {/* Card Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Search Sports Cards</h2>
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchCards()}
              placeholder="Search for player cards (e.g., 'Patrick Mahomes rookie')"
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={searchCards}
              disabled={loading || !searchQuery.trim()}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
        </div>

        {/* Results */}
        {cards.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              Found {cards.length} Cards
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cards.map((card) => (
                <div key={card.ebayItemId} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                  {card.imageUrls[0] && (
                    <img
                      src={card.imageUrls[0]}
                      alt={card.title}
                      className="w-full h-48 object-contain mb-4"
                    />
                  )}
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2">{card.title}</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    {card.playerName && <p>Player: {card.playerName}</p>}
                    {card.year && <p>Year: {card.year}</p>}
                    {card.brand && <p>Brand: {card.brand}</p>}
                  </div>
                  <p className="text-lg font-bold text-green-600 mt-2">
                    ${card.currentPrice.toFixed(2)}
                  </p>
                  <div className="text-xs text-gray-500 mt-2">
                    <p>Seller: {card.seller.username} ({card.seller.feedbackScore})</p>
                  </div>
                  <a
                    href={card.listingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 block text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                  >
                    View on eBay
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}