'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface PlayerCard {
  id: string;
  name: string;
  year: number;
  brand: string;
  series: string;
  price: number;
  rarity: 'common' | 'rare' | 'legendary';
  imageUrl: string;
  condition?: string;
  seller?: string;
  shipping?: number;
  listingUrl?: string;
}

interface PlaquePreviewProps {
  plaqueType: '8' | '10'; // 8 or 10 spots
  selectedCards: { [positionId: string]: PlayerCard };
  rosterPositions: Array<{ id: string; position: string; playerName: string }>;
  className?: string;
}

// Define the card position coordinates for each plaque type
const CARD_POSITIONS = {
  '8': [
    { x: 15, y: 15, width: 20, height: 28 },   // Top left
    { x: 40, y: 15, width: 20, height: 28 },   // Top center-left
    { x: 65, y: 15, width: 20, height: 28 },   // Top center-right
    { x: 90, y: 15, width: 20, height: 28 },   // Top right
    { x: 15, y: 57, width: 20, height: 28 },   // Bottom left
    { x: 40, y: 57, width: 20, height: 28 },   // Bottom center-left
    { x: 65, y: 57, width: 20, height: 28 },   // Bottom center-right
    { x: 90, y: 57, width: 20, height: 28 },   // Bottom right
  ],
  '10': [
    { x: 10, y: 12, width: 16, height: 22 },   // Top row
    { x: 28, y: 12, width: 16, height: 22 },
    { x: 46, y: 12, width: 16, height: 22 },
    { x: 64, y: 12, width: 16, height: 22 },
    { x: 82, y: 12, width: 16, height: 22 },
    { x: 10, y: 66, width: 16, height: 22 },   // Bottom row
    { x: 28, y: 66, width: 16, height: 22 },
    { x: 46, y: 66, width: 16, height: 22 },
    { x: 64, y: 66, width: 16, height: 22 },
    { x: 82, y: 66, width: 16, height: 22 },
  ]
};

export default function PlaquePreview({ 
  plaqueType, 
  selectedCards, 
  rosterPositions,
  className = '' 
}: PlaquePreviewProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const positions = CARD_POSITIONS[plaqueType];
  const plaqueImage = plaqueType === '8' ? '/images/Plaque8Spots.png' : '/images/Plaque10Spots.png';
  
  // Filter roster positions that have selected cards and create indexed array
  const cardsToShow = rosterPositions
    .filter(pos => pos.playerName.trim() && selectedCards[pos.id])
    .slice(0, parseInt(plaqueType)) // Limit to plaque capacity
    .map((pos, index) => ({
      card: selectedCards[pos.id],
      position: positions[index],
      playerName: pos.playerName,
      positionName: pos.position
    }));

  return (
    <div className={`relative bg-white rounded-2xl shadow-2xl overflow-hidden ${className}`}>
      {/* Plaque Background */}
      <div className="relative w-full aspect-[4/3]">
        <Image
          src={plaqueImage}
          alt={`${plaqueType} spot plaque`}
          fill
          className="object-contain"
          onLoad={() => setImageLoaded(true)}
          priority
        />
        
        {/* Card Overlays */}
        {imageLoaded && cardsToShow.map((item, index) => (
          <div
            key={`${item.card.id}-${index}`}
            className="absolute transition-all duration-300 hover:scale-105 hover:z-10"
            style={{
              left: `${item.position.x}%`,
              top: `${item.position.y}%`,
              width: `${item.position.width}%`,
              height: `${item.position.height}%`,
            }}
          >
            {/* Card Container */}
            <div className="relative w-full h-full group">
              {/* Card Image */}
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg shadow-lg overflow-hidden border-2 border-white">
                {item.card.imageUrl ? (
                  <Image
                    src={item.card.imageUrl}
                    alt={`${item.playerName} card`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100px, 150px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                    <div className="text-center p-1">
                      <div className="text-xs font-bold text-blue-800 mb-1">{item.card.year}</div>
                      <div className="text-xs font-bold text-blue-900 leading-tight">{item.playerName}</div>
                      <div className="text-xs text-blue-600 mt-1">{item.card.brand}</div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Hover Info Tooltip */}
              <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-20 pointer-events-none">
                <div className="font-bold">{item.playerName}</div>
                <div>{item.positionName}</div>
                <div>{item.card.year} {item.card.brand}</div>
                <div className="font-semibold">${item.card.price.toFixed(2)}</div>
                {/* Tooltip Arrow */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/90"></div>
              </div>
              
              {/* Rarity Indicator */}
              <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
                item.card.rarity === 'legendary' ? 'bg-yellow-400' :
                item.card.rarity === 'rare' ? 'bg-purple-400' :
                'bg-gray-400'
              }`}></div>
            </div>
          </div>
        ))}
        
        {/* Empty Slot Indicators */}
        {imageLoaded && positions.slice(cardsToShow.length).map((position, index) => (
          <div
            key={`empty-${index}`}
            className="absolute"
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
              width: `${position.width}%`,
              height: `${position.height}%`,
            }}
          >
            <div className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg bg-gray-50/50 flex items-center justify-center">
              <div className="text-gray-400 text-xs text-center p-1">
                <div className="text-lg mb-1">+</div>
                <div>Add Card</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Preview Info */}
      <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-800">Your Custom {plaqueType}-Card Plaque</h3>
            <p className="text-sm text-gray-600">
              {cardsToShow.length} of {plaqueType} cards selected
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-blue-600">
              ${cardsToShow.reduce((total, item) => total + item.card.price + (item.card.shipping || 0), 0).toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">Total cards cost</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Completion</span>
            <span>{Math.round((cardsToShow.length / parseInt(plaqueType)) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(cardsToShow.length / parseInt(plaqueType)) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
} 