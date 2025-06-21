'use client';

import { useState, useEffect, useRef } from 'react';

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
}

interface PlayerSearchProps {
  value: string;
  onChange: (playerName: string, card?: Card) => void;
  placeholder?: string;
  className?: string;
}

export default function PlayerSearch({ value, onChange, placeholder = "Search for player...", className = "" }: PlayerSearchProps) {
  const [searchTerm, setSearchTerm] = useState(value);
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.length >= 1) {
        searchCards(searchTerm);
      } else {
        setCards([]);
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

  const searchCards = async (query: string) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      let allCards: Card[] = [];
      
      // Search football players database
      const response = await fetch(`/api/football-players/search?q=${encodeURIComponent(query)}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          // Convert football players to Card format
          const playerCards: Card[] = data.data.map((player: any) => ({
            id: player.id,
            name: player.playerName,
            playerName: player.playerName,
            position: player.position || 'Unknown',
            year: player.yearsActive || '',
            brand: 'NFL',
            series: 'Player',
            cardNumber: '',
            condition: '',
            rookieCard: false,
            imageUrl: '',
            backImageUrl: '',
            cardType: 'player-data',
            notes: `${player.college ? `College: ${player.college}` : ''} ${player.height && player.weight ? `• ${player.height} ${player.weight}` : ''}`.trim(),
          }));
          
          allCards = playerCards;
        }
      }
      
      setCards(allCards);
      setShowDropdown(allCards.length > 0);
      setSelectedIndex(-1);
      
    } catch (error) {
      console.error('Error searching players:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    onChange(newValue);
    setShowDropdown(true);
  };

  const handleCardSelect = (card: Card) => {
    setSearchTerm(card.name);
    onChange(card.name, card);
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || cards.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < cards.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : cards.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < cards.length) {
          handleCardSelect(cards[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleFocus = () => {
    if (searchTerm.length >= 1 && cards.length > 0) {
      setShowDropdown(true);
    }
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
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && cards.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {cards.map((card, index) => (
            <div
              key={card.id}
              onClick={() => handleCardSelect(card)}
              className={`px-4 py-3 cursor-pointer border-b border-slate-100 last:border-b-0 ${
                index === selectedIndex 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-800">{card.playerName}</span>
                    {card.position && card.position !== 'Unknown' && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                        {card.position}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-slate-600">
                    <div className="flex items-center space-x-2">
                      {card.year && <span>Years: {card.year}</span>}
                      {(card as any).team && (
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {(card as any).team}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">
                    {card.notes && card.notes.trim() && (
                      <span>{card.notes}</span>
                    )}
                  </div>
                </div>
                {card.imageUrl && (
                  <div className="ml-3 w-8 h-10 bg-slate-100 rounded overflow-hidden flex-shrink-0">
                    <img 
                      src={card.imageUrl} 
                      alt={card.playerName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results message */}
      {showDropdown && !isLoading && searchTerm.length >= 1 && cards.length === 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg"
        >
          <div className="px-4 py-3 text-sm text-slate-500 text-center">
            No cards found for "{searchTerm}"
          </div>
        </div>
      )}
    </div>
  );
} 