'use client';

import { useEffect, useState } from 'react';

interface CardData {
  id: string;
  playerName: string;
  position: string;
  imageUrl?: string;
}

interface PlaquePreviewWithCardsProps {
  plaqueImage: string;
  plaqueStyle: string;
  teamName: string;
  className?: string;
  goldPosition?: 'top' | 'middle' | 'bottom';
  selectedCards: CardData[];
  maxCards?: number;
}

// Default text positioning for each plaque style - positioned on the gold nameplate
const DEFAULT_POSITIONS = {
  'dark-maple-wood': { 
    top: { x: 50, y: 25, fontSize: 20, color: '#000000' },
    middle: { x: 50, y: 50, fontSize: 20, color: '#000000' },
    bottom: { x: 50, y: 75, fontSize: 20, color: '#000000' }
  },
  'clear': { 
    top: { x: 50, y: 22, fontSize: 20, color: '#000000' },
    middle: { x: 50, y: 50, fontSize: 20, color: '#000000' },
    bottom: { x: 50, y: 78, fontSize: 20, color: '#000000' }
  },
  'clear-plaque': { 
    top: { x: 50, y: 22, fontSize: 20, color: '#000000' },
    middle: { x: 50, y: 50, fontSize: 20, color: '#000000' },
    bottom: { x: 50, y: 78, fontSize: 20, color: '#000000' }
  },
  'black-marble': { 
    top: { x: 50, y: 25, fontSize: 20, color: '#000000' },
    middle: { x: 50, y: 50, fontSize: 20, color: '#000000' },
    bottom: { x: 50, y: 75, fontSize: 20, color: '#000000' }
  },
  'blank': { 
    top: { x: 50, y: 25, fontSize: 20, color: '#000000' },
    middle: { x: 50, y: 50, fontSize: 20, color: '#000000' },
    bottom: { x: 50, y: 75, fontSize: 20, color: '#000000' }
  }
};

// Card layout configurations based on number of cards
const CARD_LAYOUTS = {
  1: [{ x: 50, y: 45, width: 15, height: 21 }],
  2: [
    { x: 35, y: 45, width: 15, height: 21 },
    { x: 65, y: 45, width: 15, height: 21 }
  ],
  3: [
    { x: 25, y: 45, width: 14, height: 19.6 },
    { x: 50, y: 45, width: 14, height: 19.6 },
    { x: 75, y: 45, width: 14, height: 19.6 }
  ],
  4: [
    { x: 20, y: 45, width: 13, height: 18.2 },
    { x: 40, y: 45, width: 13, height: 18.2 },
    { x: 60, y: 45, width: 13, height: 18.2 },
    { x: 80, y: 45, width: 13, height: 18.2 }
  ],
  5: [
    { x: 30, y: 30, width: 12, height: 16.8 },
    { x: 50, y: 30, width: 12, height: 16.8 },
    { x: 70, y: 30, width: 12, height: 16.8 },
    { x: 40, y: 55, width: 12, height: 16.8 },
    { x: 60, y: 55, width: 12, height: 16.8 }
  ],
  6: [
    { x: 25, y: 30, width: 11, height: 15.4 },
    { x: 50, y: 30, width: 11, height: 15.4 },
    { x: 75, y: 30, width: 11, height: 15.4 },
    { x: 25, y: 55, width: 11, height: 15.4 },
    { x: 50, y: 55, width: 11, height: 15.4 },
    { x: 75, y: 55, width: 11, height: 15.4 }
  ],
  7: [
    { x: 25, y: 25, width: 10, height: 14 },
    { x: 50, y: 25, width: 10, height: 14 },
    { x: 75, y: 25, width: 10, height: 14 },
    { x: 25, y: 45, width: 10, height: 14 },
    { x: 50, y: 45, width: 10, height: 14 },
    { x: 75, y: 45, width: 10, height: 14 },
    { x: 50, y: 65, width: 10, height: 14 }
  ]
};

export default function PlaquePreviewWithCards({ 
  plaqueImage, 
  plaqueStyle,
  teamName,
  className = '',
  goldPosition = 'bottom',
  selectedCards = [],
  maxCards = 7
}: PlaquePreviewWithCardsProps) {
  const stylePositions = DEFAULT_POSITIONS[plaqueStyle as keyof typeof DEFAULT_POSITIONS] || DEFAULT_POSITIONS['dark-maple-wood'];
  const [textPosition, setTextPosition] = useState(stylePositions[goldPosition]);

  // Update text position when goldPosition changes
  useEffect(() => {
    const stylePositions = DEFAULT_POSITIONS[plaqueStyle as keyof typeof DEFAULT_POSITIONS] || DEFAULT_POSITIONS['dark-maple-wood'];
    setTextPosition(stylePositions[goldPosition]);
  }, [plaqueStyle, goldPosition]);

  // Calculate font size based on team name length
  const calculateFontSize = () => {
    const baseSize = textPosition.fontSize * 0.7;
    const nameLength = teamName.length;
    
    if (nameLength <= 8) {
      return baseSize;
    } else {
      const scaleFactor = 8 / nameLength;
      return baseSize * Math.max(scaleFactor, 0.6);
    }
  };

  // Get the appropriate card layout based on number of selected cards
  const getCardLayout = () => {
    const cardCount = Math.min(selectedCards.length, maxCards);
    if (cardCount === 0) return [];
    
    const layoutKey = Math.min(cardCount, 7) as keyof typeof CARD_LAYOUTS;
    return CARD_LAYOUTS[layoutKey] || CARD_LAYOUTS[1];
  };

  const cardLayout = getCardLayout();

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        src={plaqueImage}
        alt="Plaque preview"
        className="w-full h-full object-contain"
      />
      
      {/* Render cards */}
      {selectedCards.length > 0 && cardLayout.map((position, index) => {
        if (index >= selectedCards.length) return null;
        const card = selectedCards[index];
        
        return (
          <div
            key={card.id || index}
            className="absolute"
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
              width: `${position.width}%`,
              height: `${position.height}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {card.imageUrl ? (
              <img
                src={card.imageUrl}
                alt={card.playerName}
                className="w-full h-full object-cover rounded-sm shadow-md"
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  (e.target as HTMLImageElement).src = '/images/cards/placeholder.svg';
                }}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 rounded-sm shadow-md flex items-center justify-center">
                <div className="text-center p-1">
                  <p className="text-xs font-bold text-gray-700 truncate">{card.playerName}</p>
                  <p className="text-xs text-gray-500">{card.position}</p>
                </div>
              </div>
            )}
          </div>
        );
      })}
      
      {/* Team name text */}
      {teamName && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: `${textPosition.x}%`,
              top: `${textPosition.y}%`,
              transform: 'translate(-50%, -50%)',
              fontSize: `${calculateFontSize()}px`,
              fontWeight: 'bold',
              color: textPosition.color,
              fontFamily: 'Arial, sans-serif',
              textAlign: 'center',
              textShadow: 'none',
              letterSpacing: '0.02em',
              whiteSpace: 'nowrap',
              maxWidth: '80%',
              zIndex: 10
            }}
          >
            {teamName.toUpperCase()}
          </div>
        </div>
      )}
    </div>
  );
}