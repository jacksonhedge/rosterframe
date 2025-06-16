'use client';

import { useState, useEffect } from 'react';

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

interface PlayerCardModalProps {
  card: PlayerCard | null;
  playerName: string;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (card: PlayerCard) => void;
}

export default function PlayerCardModal({ 
  card, 
  playerName, 
  isOpen, 
  onClose, 
  onAddToCart 
}: PlayerCardModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible || !card) return null;

  const handleAddToCart = () => {
    onAddToCart(card);
    onClose();
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      case 'rare': return 'bg-gradient-to-r from-purple-400 to-indigo-500';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition?.toLowerCase()) {
      case 'mint': return 'bg-green-100 text-green-800 border-green-200';
      case 'near mint': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'excellent': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'good': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'fair': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'poor': return 'bg-red-100 text-red-800 border-red-200';
      case 'graded': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ungraded': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ease-out ${
        isOpen ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <div className="bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto">
          {/* Handle Bar */}
          <div className="flex justify-center pt-4 pb-2">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
          </div>
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-gray-900">{playerName}</h2>
                <p className="text-sm text-gray-600">Trading Card Details</p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <span className="text-gray-600 text-xl">×</span>
              </button>
            </div>
          </div>

          {/* Card Content */}
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Card Image */}
              <div className="space-y-4">
                <div className="relative">
                  <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl border-4 border-white shadow-xl overflow-hidden">
                    {card.imageUrl ? (
                      <img 
                        src={card.imageUrl} 
                        alt={`${playerName} ${card.year} ${card.brand}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center space-y-3">
                          <div className="text-6xl">🏈</div>
                          <div className="space-y-1">
                            <p className="font-bold text-gray-800 text-lg">{playerName}</p>
                            <p className="text-sm text-gray-600">{card.year} {card.brand}</p>
                            <p className="text-xs text-gray-500">{card.series}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Rarity Badge */}
                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-white text-xs font-bold shadow-lg ${getRarityColor(card.rarity)}`}>
                    {card.rarity.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Card Details */}
              <div className="space-y-6">
                
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Card Maker</label>
                    <p className="text-xl font-bold text-gray-900">{card.brand}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Year</label>
                      <p className="text-lg font-bold text-gray-900">{card.year}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Series</label>
                      <p className="text-lg font-bold text-gray-900">{card.series}</p>
                    </div>
                  </div>
                </div>

                {/* Condition */}
                {card.condition && (
                  <div>
                    <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Condition</label>
                    <span className={`inline-flex px-3 py-2 rounded-lg text-sm font-semibold border ${getConditionColor(card.condition)}`}>
                      {card.condition}
                    </span>
                  </div>
                )}

                {/* Seller Info */}
                {card.seller && (
                  <div>
                    <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Seller</label>
                    <p className="text-lg font-semibold text-gray-800">{card.seller}</p>
                  </div>
                )}

                {/* Pricing */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-700">Card Price</span>
                    <span className="text-2xl font-black text-gray-900">${card.price.toFixed(2)}</span>
                  </div>
                  
                  {card.shipping && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-semibold text-gray-800">+${card.shipping.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <span className="text-2xl font-black text-blue-600">
                        ${(card.price + (card.shipping || 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 text-lg font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-[1.02] shadow-lg"
                  >
                    Add to Plaque - ${(card.price + (card.shipping || 0)).toFixed(2)}
                  </button>
                  
                  {card.listingUrl && (
                    <button
                      onClick={() => window.open(card.listingUrl, '_blank')}
                      className="w-full bg-gray-200 text-gray-700 py-3 text-lg font-semibold rounded-xl hover:bg-gray-300 transition-all"
                    >
                      View on eBay
                    </button>
                  )}
                </div>

                {/* Additional Info */}
                <div className="text-xs text-gray-500 space-y-1">
                  <p>• Card details verified from marketplace listing</p>
                  <p>• Prices include seller fees and current market rates</p>
                  <p>• Card will be shipped directly from seller to your address</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 