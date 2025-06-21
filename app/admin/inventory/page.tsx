'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Card {
  id: string;
  card_number: string;
  card_type: string;
  rookie_card: boolean;
  rarity_level: number;
  card_front_image_url?: string;
  player: {
    name: string;
    sport: { abbreviation: string };
  };
  set: {
    name: string;
    year: number;
    manufacturer: { name: string };
  };
  market_data?: {
    current_market_value: number;
  }[];
}

interface InventoryData {
  cards: Card[];
  total_count: number;
}

export default function InventoryManagement() {
  const [inventory, setInventory] = useState<InventoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('newest');
  const [filterRarity, setFilterRarity] = useState('all');

  const cardsPerPage = 20;

  useEffect(() => {
    fetchInventory();
  }, [currentPage, searchTerm, sortBy, filterRarity]);

  const fetchInventory = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: cardsPerPage.toString(),
        search: searchTerm,
        sort: sortBy,
        rarity: filterRarity
      });

      const response = await fetch(`/api/admin/cards?${params}`);
      if (response.ok) {
        const { data } = await response.json();
        setInventory(data);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityBadge = (level: number) => {
    if (level >= 8) return { label: 'Legendary', color: 'bg-yellow-500 text-white' };
    if (level >= 5) return { label: 'Rare', color: 'bg-purple-500 text-white' };
    return { label: 'Common', color: 'bg-gray-500 text-white' };
  };

  const getMarketValue = (card: Card) => {
    return card.market_data?.[0]?.current_market_value || 0;
  };

  const totalPages = inventory ? Math.ceil(inventory.total_count / cardsPerPage) : 0;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Search Cards
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by player name..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="player">Player Name</option>
                <option value="value">Market Value</option>
                <option value="rarity">Rarity Level</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Filter by Rarity
              </label>
              <select
                value={filterRarity}
                onChange={(e) => setFilterRarity(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Rarities</option>
                <option value="legendary">Legendary (8-10)</option>
                <option value="rare">Rare (5-7)</option>
                <option value="common">Common (1-4)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Quick Actions
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterRarity('all');
                    setSortBy('newest');
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 text-sm"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Cards</p>
                <p className="text-2xl font-bold">{inventory?.total_count || 0}</p>
              </div>
              <div className="text-3xl">🃏</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Estimated Value</p>
                <p className="text-2xl font-bold">
                  ${inventory?.cards.reduce((sum, card) => sum + getMarketValue(card), 0).toLocaleString() || '0'}
                </p>
              </div>
              <div className="text-3xl">💰</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Rookie Cards</p>
                <p className="text-2xl font-bold">
                  {inventory?.cards.filter(card => card.rookie_card).length || 0}
                </p>
              </div>
              <div className="text-3xl">⭐</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Legendary Cards</p>
                <p className="text-2xl font-bold">
                  {inventory?.cards.filter(card => card.rarity_level >= 8).length || 0}
                </p>
              </div>
              <div className="text-3xl">🏆</div>
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        {inventory && inventory.cards.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {inventory.cards.map((card) => {
                const rarity = getRarityBadge(card.rarity_level);
                const marketValue = getMarketValue(card);

                return (
                  <div
                    key={card.id}
                    className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    {/* Card Image */}
                    <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200">
                      {card.card_front_image_url ? (
                        <Image
                          src={card.card_front_image_url}
                          alt={`${card.player.name} card`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center text-slate-500">
                            <div className="text-4xl mb-2">🃏</div>
                            <div className="text-sm">No Image</div>
                          </div>
                        </div>
                      )}
                      
                      {/* Rarity Badge */}
                      <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold ${rarity.color}`}>
                        {rarity.label}
                      </div>
                      
                      {/* Rookie Badge */}
                      {card.rookie_card && (
                        <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          RC
                        </div>
                      )}
                    </div>

                    {/* Card Details */}
                    <div className="p-4">
                      <h3 className="font-bold text-slate-800 mb-1 truncate">
                        {card.player.name}
                      </h3>
                      <p className="text-sm text-slate-600 mb-2">
                        {card.set.year} {card.set.manufacturer.name}
                      </p>
                      <p className="text-xs text-slate-500 mb-3 truncate">
                        {card.set.name} {card.card_number && `#${card.card_number}`}
                      </p>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-green-600">
                          ${marketValue.toFixed(2)}
                        </span>
                        <div className="flex space-x-1">
                          <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                            ✏️
                          </button>
                          <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 rounded-lg ${
                    currentPage === 1
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
                  }`}
                >
                  ← Previous
                </button>
                
                <span className="text-sm text-slate-600">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 rounded-lg ${
                    currentPage === totalPages
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
                  }`}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              No Cards Found
            </h3>
            <p className="text-slate-500 mb-6">
              {searchTerm 
                ? 'No cards match your search criteria. Try adjusting your filters.'
                : 'Your inventory is empty. Start by adding some cards!'
              }
            </p>
            <Link
              href="/admin/scanner"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              📱 Add Your First Card
            </Link>
          </div>
        )}
    </div>
  );
} 