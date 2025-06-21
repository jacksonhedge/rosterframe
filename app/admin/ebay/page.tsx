'use client';

import { useState } from 'react';

interface EBayCard {
  ebayItemId: string;
  title: string;
  playerName?: string;
  year?: number;
  brand?: string;
  condition?: string;
  currentPrice: number;
  ourPrice?: number;
  totalCost?: number;
  totalOurPrice?: number;
  listingUrl: string;
  imageUrls: string[];
  seller: {
    username: string;
    feedbackScore: number;
    feedbackPercentage: number;
  };
  location: string;
  listingType: string;
  shipping?: {
    cost: number;
    expedited: boolean;
  };
}

interface SearchResults {
  items: EBayCard[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  hasMore: boolean;
}

export default function AdminEBayPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<any>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());

  const testConnection = async () => {
    setIsTestingConnection(true);
    try {
      const response = await fetch('/api/ebay/test');
      const data = await response.json();
      setConnectionStatus(data);
    } catch (error) {
      setConnectionStatus({
        success: false,
        error: 'Failed to test connection',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const searchCards = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        limit: '20',
      });
      
      const response = await fetch(`/api/ebay/search?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.data);
      } else {
        alert(`Search failed: ${data.error}`);
      }
    } catch (error) {
      alert(`Search error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleCardSelection = (cardId: string) => {
    const newSelected = new Set(selectedCards);
    if (newSelected.has(cardId)) {
      newSelected.delete(cardId);
    } else {
      newSelected.add(cardId);
    }
    setSelectedCards(newSelected);
  };

  const importSelectedCards = async () => {
    if (selectedCards.size === 0) {
      alert('Please select cards to import');
      return;
    }

    try {
      const response = await fetch('/api/ebay/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'import_cards',
          cardIds: Array.from(selectedCards),
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(data.message);
        setSelectedCards(new Set());
      } else {
        alert(`Import failed: ${data.error}`);
      }
    } catch (error) {
      alert(`Import error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">🛒 eBay Marketplace Integration</h1>
        <p className="text-slate-600">Search and import cards from eBay to expand your inventory</p>
      </div>

      {/* Connection Test Section */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">🔗 API Connection</h2>
          <button
            onClick={testConnection}
            disabled={isTestingConnection}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isTestingConnection
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isTestingConnection ? 'Testing...' : 'Test Connection'}
          </button>
        </div>

        {connectionStatus && (
          <div className={`p-4 rounded-lg border ${
            connectionStatus.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg">
                {connectionStatus.success ? '✅' : '❌'}
              </span>
              <span className="font-medium">
                {connectionStatus.success ? 'Connection Successful' : 'Connection Failed'}
              </span>
            </div>
            
            {connectionStatus.message && (
              <p className="text-sm mb-3">{connectionStatus.message}</p>
            )}

            {connectionStatus.credentials && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">App ID:</span>
                  <div className={connectionStatus.credentials.hasAppId ? 'text-green-600' : 'text-red-600'}>
                    {connectionStatus.credentials.hasAppId ? '✅ Set' : '❌ Missing'}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Dev ID:</span>
                  <div className={connectionStatus.credentials.hasDevId ? 'text-green-600' : 'text-red-600'}>
                    {connectionStatus.credentials.hasDevId ? '✅ Set' : '❌ Missing'}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Cert ID:</span>
                  <div className={connectionStatus.credentials.hasCertId ? 'text-green-600' : 'text-red-600'}>
                    {connectionStatus.credentials.hasCertId ? '✅ Set' : '❌ Missing'}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Environment:</span>
                  <div className="text-blue-600 capitalize">
                    {connectionStatus.credentials.environment || 'sandbox'}
                  </div>
                </div>
              </div>
            )}

            {connectionStatus.searchTest && (
              <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                <h4 className="font-medium mb-2">Search Test Results:</h4>
                {connectionStatus.searchTest.error ? (
                  <p className="text-red-600 text-sm">{connectionStatus.searchTest.error}</p>
                ) : (
                  <p className="text-green-600 text-sm">
                    Found {connectionStatus.searchTest.itemsFound} items
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4">🔍 Search eBay Marketplace</h2>
        
        <div className="flex space-x-4 mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for player cards (e.g., 'Tom Brady', 'Xavier Worthy rookie')"
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && searchCards()}
          />
          <button
            onClick={searchCards}
            disabled={isSearching || !searchQuery.trim()}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              isSearching || !searchQuery.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isSearching ? 'Searching...' : 'Search eBay'}
          </button>
        </div>

        {/* Search Results */}
        {searchResults && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">
                Search Results ({searchResults.totalItems} items found)
              </h3>
              {selectedCards.size > 0 && (
                <button
                  onClick={importSelectedCards}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
                >
                  Import Selected ({selectedCards.size})
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.items.map((card) => (
                <div 
                  key={card.ebayItemId} 
                  className={`border rounded-lg p-4 transition-all cursor-pointer ${
                    selectedCards.has(card.ebayItemId)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => toggleCardSelection(card.ebayItemId)}
                >
                  {/* Card Image */}
                  {card.imageUrls[0] && (
                    <div className="w-full h-48 bg-slate-100 rounded-lg mb-3 overflow-hidden">
                      <img
                        src={card.imageUrls[0]}
                        alt={card.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Card Details */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-slate-800 line-clamp-2">{card.title}</h4>
                    
                    {card.playerName && (
                      <p className="text-sm text-blue-600">Player: {card.playerName}</p>
                    )}
                    
                    <div className="flex justify-between text-sm">
                      <span>eBay Price:</span>
                      <span className="font-medium">${card.currentPrice}</span>
                    </div>
                    
                    {card.ourPrice && (
                      <div className="flex justify-between text-sm">
                        <span>Our Price:</span>
                        <span className="font-medium text-green-600">${card.ourPrice}</span>
                      </div>
                    )}
                    
                    {card.shipping && card.shipping.cost > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Shipping:</span>
                        <span>${card.shipping.cost}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm">
                      <span>Condition:</span>
                      <span>{card.condition}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span>Seller:</span>
                      <span>{card.seller.username} ({card.seller.feedbackPercentage}%)</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span>Type:</span>
                      <span>{card.listingType}</span>
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {selectedCards.has(card.ebayItemId) && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">
                      ✓
                    </div>
                  )}
                </div>
              ))}
            </div>

            {searchResults.hasMore && (
              <div className="text-center">
                <button className="bg-slate-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-700">
                  Load More Results
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 