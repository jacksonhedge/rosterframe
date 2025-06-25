'use client';

import { useEffect, useState } from 'react';

interface PlaquePreviewWithTextProps {
  plaqueImage: string;
  plaqueStyle: string;
  teamName: string;
  className?: string;
  goldPosition?: 'top' | 'middle' | 'bottom';
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

export default function PlaquePreviewWithText({ 
  plaqueImage, 
  plaqueStyle,
  teamName,
  className = '',
  goldPosition = 'bottom'
}: PlaquePreviewWithTextProps) {
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
      // Scale down proportionally to fit within the space of 10 characters
      const scaleFactor = 8 / nameLength;
      return baseSize * Math.max(scaleFactor, 0.6); // Don't go below 60% of original size
    }
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        src={plaqueImage}
        alt="Plaque preview"
        className="w-full h-full object-contain"
      />
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
              maxWidth: '80%'
            }}
          >
            {teamName.toUpperCase()}
          </div>
        </div>
      )}
    </div>
  );
}