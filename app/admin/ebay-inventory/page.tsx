'use client';

import { useState } from 'react';
import AdminAuth from '@/app/components/AdminAuth';

interface EbayCard {
  id: string;
  title: string;
  price: number;
  shipping: number;
  imageUrl: string;
  listingUrl: string;
  seller: string;
  condition?: string;
  endTime?: string;
  bids?: number;
  playerName?: string;
  year?: number;
  brand?: string;
  features?: string[];
}

export default function EbayInventoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<EbayCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sport, setSport] = useState<'NFL' | 'NBA' | 'MLB' | 'NHL'>('NFL');

  const searchEbayCards = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(`/api/cards/search-player?player=${encodeURIComponent(searchQuery)}&sport=${sport}`);
      const data = await response.json();

      if (data.success && data.cards) {
        setSearchResults(data.cards);
        setSelectedCards(new Set());
      } else {
        alert('Failed to search eBay cards');
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Error searching eBay');
    } finally {
      setIsSearching(false);
    }
  };

  const toggleCardSelection = (cardId: string) => {
    const newSelection = new Set(selectedCards);
    if (newSelection.has(cardId)) {
      newSelection.delete(cardId);
    } else {
      newSelection.add(cardId);
    }
    setSelectedCards(newSelection);
  };

  const saveSelectedCards = async () => {
    if (selectedCards.size === 0) {
      alert('Please select at least one card to add to inventory');
      return;
    }

    setIsSaving(true);
    try {
      const cardsToSave = searchResults
        .filter(card => selectedCards.has(card.id))
        .map(card => ({
          ...card,
          type: 'ebay',
          addedAt: new Date().toISOString()
        }));

      const response = await fetch('/api/admin/cards/import-ebay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cards: cardsToSave })
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`Successfully added ${cardsToSave.length} cards to inventory!`);
        setSelectedCards(new Set());
        setSearchResults([]);
        setSearchQuery('');
      } else {
        alert('Failed to save cards to inventory');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Error saving cards');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminAuth>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">eBay Inventory Management</h1>
          
          {/* Search Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Search eBay for Cards</h2>
            
            <div className="flex gap-4 mb-4">
              <select
                value={sport}
                onChange={(e) => setSport(e.target.value as any)}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="NFL">NFL</option>
                <option value="NBA">NBA</option>
                <option value="MLB">MLB</option>
                <option value="NHL">NHL</option>
              </select>
              
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchEbayCards()}
                placeholder="Enter player name (e.g., Patrick Mahomes)"
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <button
                onClick={searchEbayCards}
                disabled={isSearching || !searchQuery.trim()}
                className={`px-6 py-2 rounded-lg font-medium ${
                  isSearching || !searchQuery.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isSearching ? 'Searching...' : 'Search eBay'}
              </button>
            </div>
            
            {selectedCards.size > 0 && (
              <div className="mt-4 flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                <span className="text-blue-700">
                  {selectedCards.size} card{selectedCards.size !== 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={saveSelectedCards}
                  disabled={isSaving}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    isSaving
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {isSaving ? 'Saving...' : 'Add to Inventory'}
                </button>
              </div>
            )}
          </div>

          {/* Results Section */}
          {searchResults.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">
                Search Results ({searchResults.length} cards found)
              </h2>
              
              {/* Mock Data Notice */}
              {searchResults.some(card => card.id.startsWith('mock-')) && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h3 className="text-sm font-medium text-yellow-800">Using Sample Data</h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        eBay API is not configured. Showing mock cards with simulated data. 
                        <a href="/EBAY_API_SETUP.md" className="underline ml-1">Learn how to set up real eBay integration</a>
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {searchResults.map(card => (
                  <div
                    key={card.id}
                    className={`border rounded-lg overflow-hidden transition-all cursor-pointer ${
                      selectedCards.has(card.id)
                        ? 'border-blue-500 shadow-lg ring-2 ring-blue-300'
                        : 'border-gray-200 hover:shadow-md'
                    }`}
                    onClick={() => toggleCardSelection(card.id)}
                  >
                    {/* Card Image */}
                    <div className="relative h-48 bg-gray-100">
                      <img
                        src={card.imageUrl}
                        alt={card.title}
                        className="w-full h-full object-contain"
                      />
                      {selectedCards.has(card.id) && (
                        <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-2">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    {/* Card Details */}
                    <div className="p-4">
                      <h3 className="font-medium text-sm mb-2 line-clamp-2">{card.title}</h3>
                      
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-bold text-green-600">
                          ${card.price.toFixed(2)}
                        </span>
                        {card.shipping > 0 && (
                          <span className="text-sm text-gray-500">
                            +${card.shipping.toFixed(2)} ship
                          </span>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>Seller: {card.seller}</div>
                        {card.condition && <div>Condition: {card.condition}</div>}
                        {card.bids !== undefined && card.bids > 0 && (
                          <div>{card.bids} bids</div>
                        )}
                      </div>
                      
                      <div className="mt-3 flex gap-2">
                        <a
                          href={card.listingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          View on eBay
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminAuth>
  );
}