'use client';

import { useState } from 'react';
import PlayerSearch from '../components/PlayerSearch';
import { Navigation } from '../components/ui/Navigation';

interface UnifiedCard {
  id: string;
  playerName: string;
  year: number;
  brand: string;
  series: string;
  condition: string;
  price: number;
  imageUrl: string;
  availability: 'in-stock' | 'sourced-on-demand';
  estimatedShipTime: string;
  rarity: 'common' | 'rare' | 'legendary';
}

export default function MarketplacePage() {
  const [searchResults, setSearchResults] = useState<UnifiedCard[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());

  const searchCards = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/cards/unified-search?q=${encodeURIComponent(query)}&limit=24`);
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.data.cards);
      }
    } catch (error) {
      console.error('Search error:', error);
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

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'rare': return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  const getAvailabilityColor = (availability: string) => {
    return availability === 'in-stock' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="min-h-screen bg-[var(--surface-1)]">
      {/* Navigation */}
      <Navigation 
        logo="Roster Frame"
        links={[
          { href: '/build-and-buy', label: 'Build & Buy' },
          { href: '/marketplace', label: 'Marketplace' },
          { href: '/collection', label: 'Collection' },
        ]}
      />

      {/* Header */}
      <div className="bg-[var(--surface-0)] shadow-sm border-b border-[var(--surface-2)] pt-20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Card Marketplace</h1>
          <p className="text-[var(--text-secondary)]">Find the perfect cards for your custom plaque</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="bg-[var(--surface-0)] rounded-xl shadow-lg border border-[var(--surface-2)] p-6 mb-8">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">🔍 Search for Player Cards</h2>
          
          <div className="max-w-lg">
                         <PlayerSearch
               value=""
               onChange={(playerName: string, card?: any) => {
                 if (playerName.length > 2) {
                   searchCards(playerName);
                 }
               }}
               placeholder="Search by player name (e.g., 'Tom Brady', 'Xavier Worthy')"
               className="text-lg py-3"
             />
          </div>

          {isSearching && (
            <div className="mt-4 flex items-center space-x-2 text-[var(--color-primary)]">
              <div className="animate-spin w-4 h-4 border-2 border-[var(--color-primary)] border-t-transparent rounded-full"></div>
              <span>Searching our inventory...</span>
            </div>
          )}
        </div>

        {/* Results Section */}
        {searchResults.length > 0 && (
          <div className="bg-[var(--surface-0)] rounded-xl shadow-lg border border-[var(--surface-2)] p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[var(--text-primary)]">
                Available Cards ({searchResults.length})
              </h3>
              {selectedCards.size > 0 && (
                <button className="btn btn-primary">
                  Add Selected to Plaque ({selectedCards.size})
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {searchResults.map((card) => (
                <div
                  key={card.id}
                  onClick={() => toggleCardSelection(card.id)}
                  className={`relative border rounded-xl p-4 transition-all cursor-pointer card-hover ${
                    selectedCards.has(card.id)
                      ? 'border-[var(--color-primary)] bg-[var(--surface-1)] transform scale-105'
                      : 'border-[var(--surface-2)] hover:border-[var(--surface-3)]'
                  }`}
                >
                  {/* Availability Badge */}
                  <div className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-full font-medium ${
                    getAvailabilityColor(card.availability)
                  }`}>
                    {card.availability === 'in-stock' ? 'In Stock' : 'Available'}
                  </div>

                  {/* Selection Indicator */}
                  {selectedCards.has(card.id) && (
                    <div className="absolute top-3 left-3 bg-[var(--color-primary)] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">
                      ✓
                    </div>
                  )}

                  {/* Card Image */}
                  <div className="w-full h-48 bg-[var(--surface-1)] rounded-lg mb-4 overflow-hidden">
                    {card.imageUrl ? (
                      <img
                        src={card.imageUrl}
                        alt={card.playerName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--text-tertiary)]">
                        <div className="text-center">
                          <div className="text-2xl mb-2">🃏</div>
                          <div className="text-sm">No Image</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Details */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-[var(--text-primary)]">{card.playerName}</h4>
                    
                    <div className="text-sm text-[var(--text-secondary)]">
                      {card.year} {card.brand} {card.series}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded border font-medium ${getRarityColor(card.rarity)}`}>
                        {card.rarity.charAt(0).toUpperCase() + card.rarity.slice(1)}
                      </span>
                      <span className="text-sm text-[var(--text-tertiary)]">{card.condition}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-[var(--color-accent)]">${card.price}</span>
                      <span className="text-xs text-[var(--text-tertiary)]">{card.estimatedShipTime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Info */}
            <div className="mt-8 p-4 bg-[var(--surface-1)] rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 bg-green-100 rounded-full"></span>
                    <span className="text-[var(--text-secondary)]">In Stock - Ships 1-2 days</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 bg-blue-100 rounded-full"></span>
                    <span className="text-[var(--text-secondary)]">Available - Ships 7-10 days</span>
                  </div>
                </div>
                <div className="text-[var(--text-tertiary)]">
                  Prices include all fees • Free shipping on all orders
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isSearching && searchResults.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Search for Player Cards</h3>
            <p className="text-[var(--text-secondary)]">Start typing a player name to find cards for your plaque</p>
          </div>
        )}
      </div>
    </div>
  );
} 