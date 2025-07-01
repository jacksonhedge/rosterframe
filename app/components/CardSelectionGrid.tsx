'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface CardOption {
  id: string;
  playerName: string;
  name: string;
  year: number;
  brand: string;
  series: string;
  condition: string;
  price: number;
  rarity: 'common' | 'rare' | 'legendary';
  imageUrl: string;
  seller?: string;
  shipping?: number;
  listingUrl?: string;
  source?: 'inventory' | 'ebay' | 'custom';
  availability?: 'in-stock' | 'limited' | 'out-of-stock';
}

interface CardSelectionGridProps {
  cards: CardOption[];
  selectedCard?: CardOption;
  onCardSelect: (card: CardOption) => void;
  loading?: boolean;
  playerName: string;
}

export default function CardSelectionGrid({ 
  cards, 
  selectedCard, 
  onCardSelect, 
  loading = false,
  playerName 
}: CardSelectionGridProps) {
  const [filter, setFilter] = useState<'all' | 'inventory' | 'ebay'>('all');
  const [sortBy, setSortBy] = useState<'price' | 'year' | 'rarity'>('price');
  const [showFilters, setShowFilters] = useState(false);

  // Categorize cards
  const inventoryCards = cards.filter(card => card.source === 'inventory' || card.seller === 'RosterFrame');
  const ebayCards = cards.filter(card => card.source === 'ebay' || (card.seller && card.seller !== 'RosterFrame'));
  const customCards = cards.filter(card => card.series === 'I have my own' || card.series === 'Browse eBay');

  // Apply filters and sorting
  const getFilteredCards = () => {
    let filtered = cards;
    
    if (filter === 'inventory') {
      filtered = inventoryCards;
    } else if (filter === 'ebay') {
      filtered = ebayCards;
    }
    
    // Sort cards
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price;
        case 'year':
          return b.year - a.year;
        case 'rarity':
          const rarityOrder = { 'common': 0, 'rare': 1, 'legendary': 2 };
          return rarityOrder[b.rarity] - rarityOrder[a.rarity];
        default:
          return 0;
      }
    });
  };

  const filteredCards = getFilteredCards();
  
  // Group cards by source for better display
  const cardGroups = {
    featured: inventoryCards.slice(0, 3), // Show top 3 inventory cards as featured
    all: filteredCards
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'from-purple-500 to-pink-500';
      case 'rare':
        return 'from-blue-500 to-cyan-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  const getAvailabilityBadge = (card: CardOption) => {
    if (card.source === 'inventory' || card.seller === 'RosterFrame') {
      return (
        <span className="absolute top-2 left-2 z-10 px-2 py-1 text-xs font-bold bg-green-500 text-white rounded-full">
          In Stock
        </span>
      );
    }
    if (card.source === 'ebay') {
      return (
        <span className="absolute top-2 left-2 z-10 px-2 py-1 text-xs font-bold bg-blue-500 text-white rounded-full flex items-center gap-1">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          eBay
        </span>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center space-x-2">
          <svg className="animate-spin h-6 w-6 text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-amber-600 font-medium">Searching for {playerName} cards...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters and Sort */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="text-sm font-medium">Filters</span>
          </button>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>{filteredCards.length} cards available</span>
            {inventoryCards.length > 0 && (
              <span className="text-green-600 font-medium">
                ({inventoryCards.length} in stock)
              </span>
            )}
          </div>
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-4 py-2 bg-white rounded-lg border border-gray-200 text-sm font-medium"
        >
          <option value="price">Sort by Price</option>
          <option value="year">Sort by Year</option>
          <option value="rarity">Sort by Rarity</option>
        </select>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Show:</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="filter"
                value="all"
                checked={filter === 'all'}
                onChange={(e) => setFilter(e.target.value as any)}
                className="text-amber-600"
              />
              <span className="text-sm">All Cards</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="filter"
                value="inventory"
                checked={filter === 'inventory'}
                onChange={(e) => setFilter(e.target.value as any)}
                className="text-amber-600"
              />
              <span className="text-sm">In Stock Only</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="filter"
                value="ebay"
                checked={filter === 'ebay'}
                onChange={(e) => setFilter(e.target.value as any)}
                className="text-amber-600"
              />
              <span className="text-sm">eBay Cards</span>
            </label>
          </div>
        </div>
      )}

      {/* Featured Cards (if any in inventory) */}
      {filter === 'all' && cardGroups.featured.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span className="text-green-600">★</span> Featured Cards (In Stock)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cardGroups.featured.map((card) => (
              <CardItem
                key={card.id}
                card={card}
                isSelected={selectedCard?.id === card.id}
                onSelect={onCardSelect}
                featured={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredCards.map((card) => (
          <CardItem
            key={card.id}
            card={card}
            isSelected={selectedCard?.id === card.id}
            onSelect={onCardSelect}
          />
        ))}
      </div>

      {/* Custom Options */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => onCardSelect({
            id: `custom-own-${playerName}`,
            playerName: playerName,
            name: `${playerName} - I have my own`,
            year: new Date().getFullYear(),
            brand: 'Custom',
            series: 'I have my own',
            condition: 'Your Card',
            price: 0,
            rarity: 'common',
            imageUrl: '',
            seller: 'You',
            source: 'custom'
          })}
          className="p-6 border-2 border-green-300 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 hover:border-green-400 transition-all"
        >
          <div className="text-center">
            <div className="text-3xl mb-2">🃏</div>
            <div className="font-bold text-green-800">I Have My Own Card</div>
            <div className="text-sm text-green-600 mt-1">Use your existing card - FREE</div>
          </div>
        </button>

        <a
          href={`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(playerName + ' trading card')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-6 border-2 border-blue-300 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 hover:border-blue-400 transition-all"
        >
          <div className="text-center">
            <div className="text-3xl mb-2">🔍</div>
            <div className="font-bold text-blue-800">Browse More on eBay</div>
            <div className="text-sm text-blue-600 mt-1">Find more options →</div>
          </div>
        </a>
      </div>
    </div>
  );
}

// Individual Card Component
function CardItem({ 
  card, 
  isSelected, 
  onSelect, 
  featured = false 
}: { 
  card: CardOption; 
  isSelected: boolean; 
  onSelect: (card: CardOption) => void;
  featured?: boolean;
}) {
  const rarityColor = card.rarity === 'legendary' ? 'from-purple-500 to-pink-500' :
                     card.rarity === 'rare' ? 'from-blue-500 to-cyan-500' :
                     'from-gray-400 to-gray-500';

  return (
    <div
      onClick={() => onSelect(card)}
      className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all transform hover:scale-105 ${
        isSelected 
          ? 'border-amber-500 bg-amber-50 shadow-lg ring-2 ring-amber-300' 
          : featured
          ? 'border-green-300 bg-green-50/50 hover:border-green-400 hover:shadow-md'
          : 'border-gray-200 bg-white hover:border-amber-300 hover:shadow-md'
      }`}
    >
      {/* Availability Badge */}
      {(card.source === 'inventory' || card.seller === 'RosterFrame') && (
        <span className="absolute top-2 left-2 z-10 px-2 py-1 text-xs font-bold bg-green-500 text-white rounded-full">
          In Stock
        </span>
      )}
      {card.source === 'ebay' && (
        <span className="absolute top-2 left-2 z-10 px-2 py-1 text-xs font-bold bg-blue-500 text-white rounded-full">
          eBay
        </span>
      )}

      {/* Rarity Indicator */}
      <div className={`absolute top-2 right-2 w-2 h-2 rounded-full bg-gradient-to-br ${rarityColor}`}></div>

      {/* Card Image */}
      <div className="rounded-lg aspect-[3/4] mb-3 flex items-center justify-center border overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        {card.imageUrl && card.imageUrl.trim() !== '' ? (
          <img 
            src={card.imageUrl} 
            alt={`${card.playerName} ${card.year} ${card.brand}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = `
                  <div class="text-center p-2">
                    <div class="text-2xl mb-1">🃏</div>
                    <div class="text-xs font-bold text-gray-700">${card.playerName}</div>
                    <div class="text-xs text-gray-500">${card.brand}</div>
                  </div>
                `;
              }
            }}
          />
        ) : (
          <div className="text-center p-2">
            <div className="text-2xl mb-1">🃏</div>
            <div className="text-xs font-bold text-gray-700">{card.playerName}</div>
            <div className="text-xs text-gray-500">{card.brand}</div>
          </div>
        )}
      </div>
      
      {/* Card Details */}
      <div className="space-y-1">
        <div className="font-semibold text-sm text-gray-800 line-clamp-1">{card.year} {card.series}</div>
        <div className="text-xs text-gray-600">{card.brand} • {card.condition}</div>
        
        {/* Price */}
        <div className="pt-2 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-lg font-black text-amber-700">
              ${card.price.toFixed(2)}
            </div>
            {card.shipping && card.shipping > 0 && (
              <div className="text-xs text-gray-500">
                +${card.shipping.toFixed(2)} ship
              </div>
            )}
          </div>
          {card.seller && card.seller !== 'RosterFrame' && (
            <div className="text-xs text-gray-600 mt-1">via {card.seller}</div>
          )}
        </div>
      </div>

      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center shadow-md">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </div>
  );
}