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
}

interface RosterPosition {
  id: string;
  position: string;
  playerName: string;
}

interface LivePlaquePreviewProps {
  teamName: string;
  plaqueStyle: string;
  selectedCards: Record<string, CardOption>;
  rosterPositions: RosterPosition[];
  plaqueType: '8' | '10';
}

export default function LivePlaquePreview({
  teamName,
  plaqueStyle,
  selectedCards,
  rosterPositions,
  plaqueType
}: LivePlaquePreviewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Get the plaque background based on style
  const getPlaqueBackground = () => {
    const style = plaqueStyle.toLowerCase();
    if (style.includes('dark') || style.includes('maple')) {
      return '/images/DarkMapleWood1.png';
    } else if (style.includes('clear')) {
      return '/images/ClearPlaque8.png';
    } else if (style.includes('black') || style.includes('marble')) {
      return '/images/BlackMarble8.png';
    }
    return '/images/DarkMapleWood1.png'; // Default
  };

  // Generate preview whenever cards change
  useEffect(() => {
    const generateLivePreview = async () => {
      const selectedCardsList = Object.values(selectedCards);
      // Always generate preview, even with empty plaque
      setIsGenerating(true);

      setIsGenerating(true);
      try {
        // Convert to the format expected by the preview API
        const playerCards = rosterPositions
          .filter(pos => selectedCards[pos.id])
          .map(pos => {
            const card = selectedCards[pos.id];
            return {
              id: card.id,
              playerName: card.playerName,
              position: pos.position,
              year: card.year,
              brand: card.brand,
              series: card.series,
              imageUrl: card.imageUrl,
              rarity: card.rarity,
              price: card.price,
              shipping: card.shipping || 0,
            };
          });

        // Get saved layout adjustments for this plaque configuration
        const savedLayouts = JSON.parse(localStorage.getItem('plaqueLayouts') || '[]');
        const matchingLayout = savedLayouts
          .filter((layout: any) => layout.plaqueType === plaqueType && layout.plaqueStyle === plaqueStyle)
          .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
        
        const layoutAdjustments = matchingLayout ? {
          cardSizeAdjustment: matchingLayout.cardSizeAdjustment || 100,
          cardSpacingAdjustment: matchingLayout.cardSpacingAdjustment || 100,
          horizontalOffset: matchingLayout.horizontalOffset || 0,
          verticalOffset: matchingLayout.verticalOffset || 0
        } : undefined;

        const response = await fetch('/api/preview/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plaqueType,
            plaqueStyle,
            teamName: teamName || 'Your Team',
            playerCards,
            isLivePreview: true,
            layoutAdjustments
          }),
        });

        if (response.ok) {
          const result = await response.json();
          setPreviewImage(result.imageUrl);
        }
      } catch (error) {
        console.error('Error generating live preview:', error);
      } finally {
        setIsGenerating(false);
      }
    };

    // Debounce the preview generation to avoid too many API calls
    const timeoutId = setTimeout(generateLivePreview, 500);
    return () => clearTimeout(timeoutId);
  }, [selectedCards, teamName, plaqueStyle, plaqueType, rosterPositions]);

  const selectedCount = Object.keys(selectedCards).length;
  const totalSlots = parseInt(plaqueType);
  const completionPercentage = (selectedCount / totalSlots) * 100;

  return (
    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl shadow-xl border-2 border-amber-200 p-6 mb-8">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-black text-amber-900 mb-2">
          🖼️ Live Preview
        </h3>
        <p className="text-amber-700">
          Watch your plaque come to life as you select cards
        </p>
        
        {/* Progress Bar */}
        <div className="mt-4 max-w-md mx-auto">
          <div className="flex justify-between text-sm text-amber-600 mb-2">
            <span>{selectedCount} of {totalSlots} cards selected</span>
            <span>{Math.round(completionPercentage)}% complete</span>
          </div>
          <div className="w-full bg-amber-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-amber-500 to-yellow-500 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Preview Container */}
      <div className="relative bg-white rounded-xl p-4 shadow-lg border border-amber-200">
        {isGenerating && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-amber-700 font-medium">Updating preview...</p>
            </div>
          </div>
        )}

        <div className="text-center">
          {previewImage ? (
            <>
              <img
                src={previewImage}
                alt="Live plaque preview"
                className="max-w-full h-auto rounded-lg shadow-md mx-auto"
                style={{ maxHeight: '400px' }}
              />
              <div className="mt-4 text-sm text-amber-600">
                <p className="font-semibold">{teamName || 'Your Team'}</p>
                <p>{plaqueStyle} • {selectedCount} players</p>
              </div>
            </>
          ) : (
            <>
              {/* Show empty plaque background */}
              <div className="relative">
                <img
                  src={getPlaqueBackground()}
                  alt="Empty plaque"
                  className="max-w-full h-auto rounded-lg shadow-md mx-auto opacity-90"
                  style={{ maxHeight: '400px' }}
                />
                {selectedCount === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4">
                      <p className="text-amber-600 font-medium">Players will appear here as you select them</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-4 text-sm text-amber-600">
                <p className="font-semibold">{teamName || 'Your Team'}</p>
                <p>{plaqueStyle} • Empty</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="text-center bg-amber-100 rounded-lg p-3">
          <div className="text-2xl font-black text-amber-900">{selectedCount}</div>
          <div className="text-xs text-amber-600">Cards Selected</div>
        </div>
        <div className="text-center bg-yellow-100 rounded-lg p-3">
          <div className="text-2xl font-black text-amber-900">
            ${selectedCount > 0 ? Object.values(selectedCards).reduce((sum, card) => sum + card.price + (card.shipping || 0), 0).toFixed(0) : '0'}
          </div>
          <div className="text-xs text-amber-600">Cards Value</div>
        </div>
        <div className="text-center bg-orange-100 rounded-lg p-3">
          <div className="text-2xl font-black text-amber-900">{totalSlots - selectedCount}</div>
          <div className="text-xs text-amber-600">Remaining</div>
        </div>
      </div>
    </div>
  );
} 