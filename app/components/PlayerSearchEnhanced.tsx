'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface Card {
  id: string;
  name: string;
  playerName: string;
  position: string;
  year: string | number;
  brand: string;
  series: string;
  cardNumber: string;
  condition: string;
  rookieCard: boolean;
  imageUrl: string;
  backImageUrl?: string;
  cardType: string;
  notes: string;
  price?: number;
  inventory?: number;
}

interface PlayerSearchEnhancedProps {
  value: string;
  onChange: (playerName: string, card?: Card) => void;
  placeholder?: string;
  className?: string;
  sport?: 'NFL' | 'MLB' | 'NBA' | 'NHL';
  onCardCountFetch?: (count: number, priceRange: { min: number; max: number }) => void;
}

interface PlayerSuggestion {
  id: string;
  name: string;
  position: string;
  team: string;
  yearsActive: string;
  stats?: {
    passingYards?: number;
    touchdowns?: number;
    rushingYards?: number;
    receptions?: number;
  };
  imageUrl?: string;
  cardCount?: number;
  priceRange?: { min: number; max: number };
}

export default function PlayerSearchEnhanced({ 
  value, 
  onChange, 
  placeholder = "Search for player...", 
  className = "",
  sport = 'NFL',
  onCardCountFetch
}: PlayerSearchEnhancedProps) {
  const [searchTerm, setSearchTerm] = useState(value);
  const [players, setPlayers] = useState<PlayerSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [playerCardInfo, setPlayerCardInfo] = useState<Record<string, { count: number; priceRange: { min: number; max: number } }>>({});
  
  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.length >= 1) {
        searchPlayers(searchTerm);
      } else {
        setPlayers([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        !searchRef.current?.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch card info for players
  const fetchCardInfo = async (playerNames: string[]) => {
    const newCardInfo: Record<string, { count: number; priceRange: { min: number; max: number } }> = {};
    
    await Promise.all(
      playerNames.map(async (playerName) => {
        try {
          const response = await fetch(`/api/cards/player-info?player=${encodeURIComponent(playerName)}&sport=${sport}`);
          const data = await response.json();
          
          if (data.success) {
            newCardInfo[playerName] = {
              count: data.cardCount || 0,
              priceRange: data.priceRange || { min: 0, max: 0 }
            };
          }
        } catch (error) {
          console.error(`Failed to fetch card info for ${playerName}:`, error);
        }
      })
    );
    
    setPlayerCardInfo(prev => ({ ...prev, ...newCardInfo }));
  };

  const searchPlayers = async (query: string) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      // Use local NFL player data
      const { searchNFLPlayers } = await import('@/app/data/nfl-players');
      const searchResults = searchNFLPlayers(query, 10);
      
      // Convert to enhanced player format
      const enhancedPlayers: PlayerSuggestion[] = searchResults.map((player: any) => ({
        id: player.id,
        name: player.name,
        position: player.position || 'Unknown',
        team: player.team || '',
        yearsActive: player.yearsActive || '',
        stats: player.stats || {},
        imageUrl: getPlayerImage(player.name),
        cardCount: 0,
        priceRange: { min: 0, max: 0 }
      }));
      
      setPlayers(enhancedPlayers);
      setShowDropdown(enhancedPlayers.length > 0);
      setSelectedIndex(-1);
      
      // Fetch card info for the found players
      const playerNames = enhancedPlayers.map(p => p.name);
      fetchCardInfo(playerNames);
      
    } catch (error) {
      console.error('Error searching players:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPlayerImage = (playerName: string): string => {
    // Map of known player images (you can expand this)
    const knownImages: Record<string, string> = {
      'Patrick Mahomes': '/images/players/mahomes.jpg',
      'Jonathan Taylor': '/images/players/taylor.jpg',
      'Chris Godwin': '/images/players/godwin.jpg',
      // Add more player images as needed
    };
    
    return knownImages[playerName] || '/images/player-placeholder.svg';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    onChange(newValue);
    setShowDropdown(true);
  };

  const handlePlayerSelect = (player: PlayerSuggestion) => {
    setSearchTerm(player.name);
    onChange(player.name, {
      id: player.id,
      name: player.name,
      playerName: player.name,
      position: player.position,
      year: player.yearsActive,
      brand: sport,
      series: 'Player',
      cardNumber: '',
      condition: '',
      rookieCard: false,
      imageUrl: player.imageUrl || '',
      backImageUrl: '',
      cardType: 'player-data',
      notes: `${player.team} • ${player.position}`,
    });
    
    // Notify parent about card count and price range
    const cardInfo = playerCardInfo[player.name];
    if (cardInfo && onCardCountFetch) {
      onCardCountFetch(cardInfo.count, cardInfo.priceRange);
    }
    
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || players.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < players.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : players.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < players.length) {
          handlePlayerSelect(players[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleFocus = () => {
    if (searchTerm.length >= 1 && players.length > 0) {
      setShowDropdown(true);
    }
  };

  const formatPrice = (price: number) => {
    return price > 0 ? `$${price.toFixed(2)}` : 'N/A';
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={searchRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder}
          className={`w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        />
        
        {/* Search icon */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {/* Enhanced Dropdown */}
      {showDropdown && players.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-xl max-h-96 overflow-y-auto"
        >
          {players.map((player, index) => {
            const cardInfo = playerCardInfo[player.name];
            return (
              <div
                key={player.id}
                onClick={() => handlePlayerSelect(player)}
                className={`px-4 py-3 cursor-pointer border-b border-slate-100 last:border-b-0 transition-all ${
                  index === selectedIndex 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Player Image */}
                  <div className="w-12 h-12 bg-slate-100 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {player.imageUrl && player.imageUrl !== '/images/player-placeholder.svg' ? (
                      <Image 
                        src={player.imageUrl} 
                        alt={player.name}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    ) : (
                      <div className="text-lg font-bold text-slate-400">
                        {player.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  
                  {/* Player Info */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-800">{player.name}</div>
                        <div className="text-sm text-slate-600 flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            {player.position}
                          </span>
                          {player.team && (
                            <span className="text-slate-500">{player.team}</span>
                          )}
                          {player.yearsActive && (
                            <span className="text-slate-400">({player.yearsActive})</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Card Info */}
                      <div className="text-right">
                        {cardInfo ? (
                          <>
                            <div className="text-sm font-semibold text-green-600">
                              {cardInfo.count} cards
                            </div>
                            <div className="text-xs text-slate-500">
                              {formatPrice(cardInfo.priceRange.min)} - {formatPrice(cardInfo.priceRange.max)}
                            </div>
                          </>
                        ) : (
                          <div className="text-xs text-slate-400">Loading...</div>
                        )}
                      </div>
                    </div>
                    
                    {/* Player Stats (if available) */}
                    {player.stats && Object.keys(player.stats).length > 0 && (
                      <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                        {player.stats.passingYards && (
                          <span>Pass Yds: {player.stats.passingYards.toLocaleString()}</span>
                        )}
                        {player.stats.touchdowns && (
                          <span>TDs: {player.stats.touchdowns}</span>
                        )}
                        {player.stats.rushingYards && (
                          <span>Rush Yds: {player.stats.rushingYards.toLocaleString()}</span>
                        )}
                        {player.stats.receptions && (
                          <span>Rec: {player.stats.receptions}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* No results message */}
      {showDropdown && !isLoading && searchTerm.length >= 1 && players.length === 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg"
        >
          <div className="px-4 py-3 text-sm text-slate-500 text-center">
            No players found for "{searchTerm}"
          </div>
        </div>
      )}
    </div>
  );
}