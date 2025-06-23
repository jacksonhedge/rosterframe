'use client';

import { useEffect, useState } from 'react';

interface PlaquePreviewWithTextProps {
  plaqueImage: string;
  plaqueStyle: string;
  teamName: string;
  className?: string;
}

// Default text positioning for each plaque style - positioned on the gold nameplate
const DEFAULT_POSITIONS = {
  'dark-maple-wood': { x: 50, y: 90, fontSize: 20, color: '#000000' },
  'clear': { x: 50, y: 90, fontSize: 20, color: '#000000' },
  'clear-plaque': { x: 50, y: 90, fontSize: 20, color: '#000000' },
  'black-marble': { x: 50, y: 90, fontSize: 20, color: '#FFD700' },
  'blank': { x: 50, y: 50, fontSize: 20, color: '#000000' }
};

export default function PlaquePreviewWithText({ 
  plaqueImage, 
  plaqueStyle,
  teamName,
  className = ''
}: PlaquePreviewWithTextProps) {
  const [textPosition, setTextPosition] = useState(DEFAULT_POSITIONS[plaqueStyle as keyof typeof DEFAULT_POSITIONS] || DEFAULT_POSITIONS['dark-maple-wood']);

  // Load saved engraving configuration from localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('engraving_config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        if (config[plaqueStyle]) {
          setTextPosition(config[plaqueStyle]);
        }
      } catch (error) {
        console.error('Error loading saved engraving config:', error);
      }
    }
  }, [plaqueStyle]);

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
              fontSize: `${textPosition.fontSize * 0.7}px`,
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