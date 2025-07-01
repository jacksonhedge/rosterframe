"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navigation } from "../components/ui/Navigation";
import StripePaymentForm from "../components/StripePaymentForm";
import PlaquePreview from "../components/PlaquePreview";
import PreviewGenerator from "../components/PreviewGenerator";
import PlayerSearchEnhanced from "../components/PlayerSearchEnhanced";
import EmailCapturePopup from "../components/EmailCapturePopup";
import PlaquePreviewWithText from "../components/PlaquePreviewWithText";
import PlaquePreviewWithCards from "../components/PlaquePreviewWithCards";
import CardSelectionGrid from "../components/CardSelectionGrid";
import CheckoutFlowEnhanced from "../components/CheckoutFlowEnhanced";
import { sessionManager } from "@/app/lib/session-manager";
import type { BuildSession } from "@/app/lib/session-manager";
import { autoEmailService } from "@/app/lib/auto-email-service";
import { cardInventory, getCardsByPlayer } from "@/app/data/card-inventory";

// Type definitions
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

interface Position {
  id: string;
  position: string;
  playerName: string;
}

export default function BuildAndBuy() {
  // State management
  const [currentStep, setCurrentStep] = useState<'setup' | 'building' | 'cards' | 'purchase' | 'done'>('setup');
  const [teamName, setTeamName] = useState("");
  const [selectedSport, setSelectedSport] = useState<'NFL' | 'MLB' | 'NBA' | 'NHL'>('NFL');
  const [isGift, setIsGift] = useState(false);
  const [selectedPlaque, setSelectedPlaque] = useState<any>(null);
  const [goldPosition, setGoldPosition] = useState<'top' | 'middle' | 'bottom'>('bottom');
  const [rosterPositions, setRosterPositions] = useState<Position[]>([]);
  const [selectedCards, setSelectedCards] = useState<Record<string, CardOption>>({});
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [loadingCards, setLoadingCards] = useState<Record<string, boolean>>({});
  const [playerCards, setPlayerCards] = useState<Record<string, CardOption[]>>({});
  const [showCardBacks, setShowCardBacks] = useState(false);
  
  // Payment state
  const [selectedShipping, setSelectedShipping] = useState('standard');
  const [subscribeToPortfolio, setSubscribeToPortfolio] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [paymentError, setPaymentError] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  // Constants
  const preOrderDiscount = 0.20;
  const isPreOrder = true;
  
  const shippingOptions = {
    standard: { name: 'Standard Shipping (7-10 days)', price: 9.99 },
    express: { name: 'Express Shipping (3-5 days)', price: 19.99 },
    premium: { name: 'Premium Shipping (1-2 days)', price: 39.99 }
  };

  // Get default positions based on sport
  const getDefaultPositions = (sport: 'NFL' | 'MLB' | 'NBA' | 'NHL'): Position[] => {
    const positions = {
      'NFL': [
        { id: '1', position: 'Quarterback', playerName: '' },
        { id: '2', position: 'Running Back', playerName: '' },
        { id: '3', position: 'Running Back', playerName: '' },
        { id: '4', position: 'Wide Receiver', playerName: '' },
        { id: '5', position: 'Wide Receiver', playerName: '' },
        { id: '6', position: 'Flex', playerName: '' },
        { id: '7', position: 'Tight End', playerName: '' },
        { id: '8', position: 'Defense/ST', playerName: '' },
        { id: '9', position: 'Kicker', playerName: '' }
      ],
      'MLB': [
        { id: '1', position: 'Pitcher', playerName: '' },
        { id: '2', position: 'Catcher', playerName: '' },
        { id: '3', position: 'First Base', playerName: '' },
        { id: '4', position: 'Second Base', playerName: '' },
        { id: '5', position: 'Third Base', playerName: '' },
        { id: '6', position: 'Shortstop', playerName: '' },
        { id: '7', position: 'Outfield', playerName: '' },
        { id: '8', position: 'Outfield', playerName: '' }
      ],
      'NBA': [
        { id: '1', position: 'Point Guard', playerName: '' },
        { id: '2', position: 'Shooting Guard', playerName: '' },
        { id: '3', position: 'Small Forward', playerName: '' },
        { id: '4', position: 'Power Forward', playerName: '' },
        { id: '5', position: 'Center', playerName: '' }
      ],
      'NHL': [
        { id: '1', position: 'Center', playerName: '' },
        { id: '2', position: 'Left Wing', playerName: '' },
        { id: '3', position: 'Right Wing', playerName: '' },
        { id: '4', position: 'Defenseman', playerName: '' },
        { id: '5', position: 'Defenseman', playerName: '' },
        { id: '6', position: 'Goalie', playerName: '' }
      ]
    };
    
    return positions[sport] || positions['NFL'];
  };

  // Initialize positions when sport changes
  useEffect(() => {
    setRosterPositions(getDefaultPositions(selectedSport));
    setSelectedCards({});
  }, [selectedSport]);

  // Fetch real cards from eBay for a player
  const fetchPlayerCards = async (playerName: string, positionId: string) => {
    if (!playerName.trim() || playerCards[positionId]) return;
    
    setLoadingCards(prev => ({ ...prev, [positionId]: true }));
    
    try {
      const response = await fetch(`/api/cards/search-player?player=${encodeURIComponent(playerName)}&sport=${selectedSport}`);
      const data = await response.json();
      
      if (data.success && data.cards) {
        setPlayerCards(prev => ({ ...prev, [positionId]: data.cards }));
      }
    } catch (error) {
      console.error('Failed to fetch player cards:', error);
    } finally {
      setLoadingCards(prev => ({ ...prev, [positionId]: false }));
    }
  };

  // Generate card options for a player
  const generateCardOptions = (playerName: string, positionId: string): CardOption[] => {
    if (!playerName.trim()) return [];
    
    // First check if we have fetched eBay cards for this player
    const ebayCards = playerCards[positionId] || [];
    
    // Sort eBay cards by price (lowest to highest)
    const sortedEbayCards = [...ebayCards].sort((a, b) => a.price - b.price);
    
    // Check if we have real cards for this player in inventory
    const inventoryCards = getCardsByPlayer(playerName);
    const realCards = inventoryCards.map(card => ({
      id: card.id,
      playerName: card.playerName,
      name: card.playerName,
      year: card.year,
      brand: card.brand,
      series: card.series,
      condition: card.condition,
      price: card.price,
      rarity: card.rarity,
      imageUrl: card.imageUrl,
      seller: 'RosterFrame',
      shipping: 0,
      listingUrl: card.imageUrl
    }));
    
    const defaultOptions = [
      // I have my own card option
      {
        id: `${playerName}-own-card`,
        playerName,
        name: playerName,
        year: 2024,
        brand: 'Your Collection',
        series: 'I have my own',
        condition: 'Already Owned',
        price: 0,
        rarity: 'common' as const,
        imageUrl: '',
        seller: 'You',
        shipping: 0,
        listingUrl: '#own-card'
      },
      // Search eBay option
      {
        id: `${playerName}-search-ebay`,
        playerName,
        name: playerName,
        year: 2024,
        brand: 'Search',
        series: 'Browse eBay',
        condition: 'Various',
        price: 0,
        rarity: 'common' as const,
        imageUrl: '',
        seller: 'eBay',
        shipping: 0,
        listingUrl: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(playerName + ' trading card')}`
      }
    ];
    
    // Limit eBay cards to show only top 6 most affordable options
    const topEbayCards = sortedEbayCards.slice(0, 6);
    
    // Put eBay cards first (sorted by price), then inventory cards, then default options
    return [...topEbayCards, ...realCards, ...defaultOptions];
  };

  // Update position
  const updatePosition = (id: string, field: 'position' | 'playerName', value: string) => {
    setRosterPositions(positions => 
      positions.map(pos => pos.id === id ? { ...pos, [field]: value } : pos)
    );
  };

  // Add new position
  const addPosition = () => {
    const newId = Date.now().toString();
    const defaultPosition = selectedSport === 'NFL' ? 'Flex' : 
                           selectedSport === 'NBA' ? 'Bench' : 
                           selectedSport === 'MLB' ? 'Utility' : 'Forward';
    
    setRosterPositions([...rosterPositions, {
      id: newId,
      position: defaultPosition,
      playerName: ''
    }]);
  };

  // Remove position
  const removePosition = (id: string) => {
    if (rosterPositions.length <= 1) return; // Keep at least one position
    
    setRosterPositions(rosterPositions.filter(pos => pos.id !== id));
    // Also remove any selected card for this position
    const newSelectedCards = { ...selectedCards };
    delete newSelectedCards[id];
    setSelectedCards(newSelectedCards);
  };

  // Select card
  const selectCard = (positionId: string, card: CardOption) => {
    setSelectedCards({
      ...selectedCards,
      [positionId]: card
    });
    
    // Auto-collapse the section after selecting a card
    setCollapsedSections({
      ...collapsedSections,
      [positionId]: true
    });
  };

  // Toggle collapse
  const toggleCollapse = (positionId: string) => {
    setCollapsedSections({
      ...collapsedSections,
      [positionId]: !collapsedSections[positionId]
    });
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    if (promoApplied) {
      return 1.00;
    }
    
    const plaquePrice = rosterPositions.length * 1.99;
    const cardsPrice = Object.values(selectedCards).reduce((total, card) => total + card.price, 0);
    let subtotal = plaquePrice + cardsPrice;
    
    if (isPreOrder) {
      subtotal = subtotal * (1 - preOrderDiscount);
    }
    
    const shippingCost = shippingOptions[selectedShipping as keyof typeof shippingOptions].price;
    const subscriptionCost = subscribeToPortfolio ? 4.99 : 0;
    
    return subtotal + shippingCost + subscriptionCost;
  };

  // Apply promo code
  const applyPromoCode = () => {
    const validCodes = ['ROSTERTEST', 'TEST1', 'HEDGE', 'BANKROLL'];
    if (validCodes.includes(promoCode.toUpperCase())) {
      setPromoApplied(true);
      setPromoError('');
    } else {
      setPromoError('Invalid promo code');
      setPromoApplied(false);
    }
  };

  // Get plaque type
  const getPlaqueType = () => {
    if (rosterPositions.length <= 8) return '8';
    if (rosterPositions.length === 9) return '10';
    return '10';
  };

  // Plaque options
  const plaqueOptions = useMemo(() => [
    {
      id: 'dark-maple-wood',
      name: 'Dark Maple Wood Plaque',
      material: 'Premium dark maple wood finish',
      description: `Premium dark maple wood finish with ${rosterPositions.length} card slots (hardware included)`,
      price: rosterPositions.length * 1.99,
      pricePerSlot: 1.99,
      gradient: 'from-amber-50 to-amber-100',
      border: 'border-amber-200',
      accent: 'text-amber-800',
      image: '/images/DarkMapleWood1.png',
      plaqueType: getPlaqueType() as '8' | '10',
      style: 'dark-maple-wood'
    },
    {
      id: 'clear',
      name: 'Clear Plaque',
      material: 'Crystal clear acrylic',
      description: `Crystal clear acrylic with ${rosterPositions.length} card slots (hardware included) - shows front or back`,
      price: rosterPositions.length * 1.99,
      pricePerSlot: 1.99,
      gradient: 'from-blue-50 to-indigo-50',
      border: 'border-blue-200',
      accent: 'text-blue-800',
      image: '/images/ClearPlaque8.png',
      plaqueType: getPlaqueType() as '8' | '10',
      style: 'clear-plaque',
      hasBackOption: true
    },
    {
      id: 'black-marble',
      name: 'Black Marble Plaque',
      material: 'Elegant black marble finish',
      description: `Elegant black marble finish with ${rosterPositions.length} card slots (hardware included)`,
      price: rosterPositions.length * 1.99,
      pricePerSlot: 1.99,
      gradient: 'from-gray-800 to-black',
      border: 'border-gray-400',
      accent: 'text-gray-100',
      image: '/images/BlackMarble8.png',
      plaqueType: getPlaqueType() as '8' | '10',
      style: 'black-marble'
    }
  ], [rosterPositions.length]);

  // Can proceed checks
  const canProceedToCards = () => {
    return rosterPositions.every(pos => pos.playerName.trim() !== '');
  };

  const canProceedToPurchase = () => {
    return rosterPositions.every(pos => selectedCards[pos.id]);
  };

  // Handle payment success
  const handlePaymentSuccess = async (paymentId: string) => {
    setPaymentIntentId(paymentId);
    setPaymentStatus('success');
    setCurrentStep('done');
  };

  // Handle payment error
  const handlePaymentError = (error: string) => {
    setPaymentError(error);
    setPaymentStatus('error');
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-50">
        <Navigation 
          logo="Roster Frame"
        />
        
        <main className="container mx-auto px-4 py-8">
          <div className="h-16 md:h-20"></div>
          
          <div className="grid grid-cols-1 gap-8">
            {/* Step 1: Setup */}
            {currentStep === 'setup' && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-amber-900 mb-3">
                    Build Your Roster Frame
                  </h1>
                  <p className="text-base text-amber-700">Transform your fantasy team into a premium display piece</p>
                </div>

                <div className="space-y-8">
                  {/* Team Name */}
                  <div>
                    <label className="block text-base font-semibold text-amber-800 mb-3">
                      🏆 What's your team name?
                    </label>
                    <input
                      type="text"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="w-full px-4 py-3 text-base bg-white/70 border-2 border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-amber-900"
                      placeholder="Enter your legendary team name..."
                    />
                  </div>

                  {/* Sport Selection */}
                  <div>
                    <label className="block text-base font-semibold text-amber-800 mb-3">
                      🏈 Pick a Sport
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { id: 'NFL', name: 'NFL', icon: '🏈', color: 'from-green-500 to-green-600' },
                        { id: 'MLB', name: 'MLB', icon: '⚾', color: 'from-blue-500 to-blue-600' },
                        { id: 'NBA', name: 'NBA', icon: '🏀', color: 'from-orange-500 to-orange-600' },
                        { id: 'NHL', name: 'NHL', icon: '🏒', color: 'from-cyan-500 to-cyan-600' }
                      ].map((sport) => (
                        <button
                          key={sport.id}
                          onClick={() => setSelectedSport(sport.id as 'NFL' | 'MLB' | 'NBA' | 'NHL')}
                          className={`relative p-3 rounded-lg border-2 transition-all ${
                            selectedSport === sport.id
                              ? `bg-gradient-to-br ${sport.color} text-white border-transparent`
                              : 'bg-white/70 border-amber-200 hover:border-amber-400'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-2xl mb-1">{sport.icon}</div>
                            <div className={`font-semibold text-sm ${
                              selectedSport === sport.id ? 'text-white' : 'text-amber-700'
                            }`}>
                              {sport.name}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Plaque Selection */}
                  <div>
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-bold text-amber-900 mb-1">Select Your Plaque Style</h3>
                      <p className="text-sm text-amber-700">Choose the perfect backdrop for your cards</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {plaqueOptions.map((plaque) => (
                        <div
                          key={plaque.id}
                          onClick={() => setSelectedPlaque(plaque)}
                          className={`relative overflow-hidden bg-gradient-to-br ${plaque.gradient} rounded-xl border-2 ${plaque.border} cursor-pointer transition-all transform hover:scale-105 ${
                            selectedPlaque?.id === plaque.id ? 'ring-4 ring-amber-400 shadow-xl' : ''
                          }`}
                        >
                          <div className="relative h-48 bg-gradient-to-b from-transparent to-black/5 p-4">
                            {plaque.image && (
                              <PlaquePreviewWithText
                                plaqueImage={plaque.image}
                                plaqueStyle={plaque.style}
                                teamName={teamName}
                                goldPosition={goldPosition}
                                className="w-full h-full"
                              />
                            )}
                          </div>
                          <div className="p-4">
                            <h4 className={`font-bold text-lg ${plaque.accent}`}>{plaque.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{plaque.material}</p>
                            <div className={`mt-3 text-2xl font-black ${plaque.accent}`}>
                              ${plaque.price.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Gold Position Selection */}
                  {selectedPlaque && (
                    <div>
                      <div className="text-center mb-4">
                        <h3 className="text-lg font-bold text-amber-900 mb-1">Gold Plaque Position</h3>
                        <p className="text-sm text-amber-700">Where would you like your team name displayed?</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { position: 'top', label: 'Top', icon: '⬆️', description: 'Team name at the top' },
                          { position: 'middle', label: 'Middle', icon: '↔️', description: 'Team name in the center' },
                          { position: 'bottom', label: 'Bottom', icon: '⬇️', description: 'Team name at the bottom (Default)' }
                        ].map((option) => (
                          <button
                            key={option.position}
                            onClick={() => setGoldPosition(option.position as 'top' | 'middle' | 'bottom')}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              goldPosition === option.position
                                ? 'bg-gradient-to-br from-amber-100 to-yellow-100 border-amber-400 shadow-lg'
                                : 'bg-white/70 border-amber-200 hover:border-amber-300'
                            }`}
                          >
                            <div className="text-2xl mb-2">{option.icon}</div>
                            <div className={`font-semibold ${
                              goldPosition === option.position ? 'text-amber-800' : 'text-amber-700'
                            }`}>
                              {option.label}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">{option.description}</div>
                            {option.position === 'bottom' && (
                              <div className="text-xs text-amber-600 mt-1 font-semibold">(Recommended)</div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Continue Button */}
                  <div className="flex justify-center pt-4">
                    <button
                      onClick={() => {
                        if (teamName && selectedPlaque) {
                          setCurrentStep('building');
                        }
                      }}
                      disabled={!teamName || !selectedPlaque}
                      className={`px-8 py-3 text-lg font-bold rounded-xl transition-all ${
                        teamName && selectedPlaque
                          ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-white hover:from-amber-700 hover:to-yellow-600'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Continue to Build Roster →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Building Roster */}
            {currentStep === 'building' && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-center flex-1">
                    <h2 className="text-xl font-bold text-amber-900 mb-2">Build Your Roster</h2>
                    <p className="text-sm text-amber-700">Add your players and see their cards populate automatically</p>
                  </div>
                  <button
                    onClick={addPosition}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                  >
                    <span className="text-lg">+</span>
                    Add Position
                  </button>
                </div>
                
                {/* Preview */}
                {selectedPlaque && (
                  <div className="mb-8 bg-white rounded-lg p-4">
                    <h3 className="text-base font-semibold text-gray-700 mb-2 text-center">Preview</h3>
                    
                    {/* Toggle for Clear Plaque */}
                    {selectedPlaque.hasBackOption && (
                      <div className="text-center mb-4">
                        <p className="text-sm text-amber-700 mb-2">
                          💡 Clear Plaque can display cards from either side!
                        </p>
                        <button
                          onClick={() => setShowCardBacks(!showCardBacks)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg transition-colors"
                        >
                          <span>Show Card {showCardBacks ? 'Fronts' : 'Backs'}</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
                      </div>
                    )}
                    
                    <PlaquePreviewWithCards
                      plaqueImage={selectedPlaque.image}
                      plaqueStyle={selectedPlaque.style}
                      teamName={teamName}
                      goldPosition={goldPosition}
                      selectedCards={rosterPositions
                        .filter(pos => pos.playerName.trim() !== '')
                        .map(pos => ({
                          id: pos.id,
                          playerName: pos.playerName,
                          position: pos.position,
                          imageUrl: selectedCards[pos.id]?.imageUrl
                        }))}
                      maxCards={rosterPositions.length}
                      showCardBacks={showCardBacks}
                      className="w-full max-w-md mx-auto"
                    />
                  </div>
                )}
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {rosterPositions.map((position, index) => (
                      <div key={position.id} className="border-2 rounded-xl p-6 border-amber-300 bg-white/50 relative">
                        {rosterPositions.length > 1 && (
                          <button
                            onClick={() => removePosition(position.id)}
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1"
                            title="Remove position"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                        <div className="flex items-center space-x-3 mb-4">
                          <span className="bg-amber-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </span>
                          <input
                            type="text"
                            value={position.position}
                            onChange={(e) => updatePosition(position.id, 'position', e.target.value)}
                            className="text-lg font-bold text-amber-800 bg-transparent border-b-2 border-amber-300 focus:border-amber-500 outline-none px-1 flex-1"
                            placeholder="Position name"
                          />
                        </div>
                        
                        {position.position === 'Defense/ST' ? (
                          <input
                            type="text"
                            value={position.playerName}
                            onChange={(e) => {
                              updatePosition(position.id, 'playerName', e.target.value);
                              if (e.target.value.trim().length > 2) {
                                fetchPlayerCards(e.target.value, position.id);
                              }
                            }}
                            placeholder="Type NFL team name (e.g., Steelers)..."
                            className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-amber-800 font-medium"
                          />
                        ) : (
                          <PlayerSearchEnhanced
                            value={position.playerName}
                            onChange={async (playerName) => {
                              updatePosition(position.id, 'playerName', playerName);
                              if (playerName && playerName.trim().length > 2) {
                                await fetchPlayerCards(playerName, position.id);
                              }
                            }}
                            placeholder={`Type ${selectedSport} player name...`}
                            className="text-amber-800 font-medium"
                            sport={selectedSport}
                            onCardCountFetch={(count, priceRange) => {
                              console.log(`${position.playerName}: ${count} cards, $${priceRange.min}-$${priceRange.max}`);
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => setCurrentStep('setup')}
                      className="bg-gray-500 text-white px-6 py-3 rounded-xl text-lg font-semibold shadow-lg hover:bg-gray-600 transform hover:scale-105 transition inline-flex items-center space-x-2"
                    >
                      <span>← Back to Setup</span>
                    </button>
                    <button
                      onClick={() => setCurrentStep('cards')}
                      disabled={!canProceedToCards()}
                      className={`px-8 py-3 text-lg font-bold rounded-xl transition-all ${
                        canProceedToCards()
                          ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-white hover:from-amber-700 hover:to-yellow-600'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      🃏 Continue to Card Selection
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Card Selection */}
            {currentStep === 'cards' && (
              <>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                  <div className="text-center mb-4">
                    <h2 className="text-xl font-bold text-amber-900 mb-2">Select Player Cards</h2>
                    <p className="text-sm text-amber-700">Choose the perfect cards for each player in your roster</p>
                  </div>
                  
                  <div className="space-y-6">
                    {rosterPositions.filter(pos => pos.playerName.trim()).map((position) => {
                      const cardOptions = generateCardOptions(position.playerName, position.id);
                      const selectedCard = selectedCards[position.id];
                      const isCollapsed = collapsedSections[position.id];
                      
                      return (
                        <div key={position.id} className={`border-2 rounded-xl bg-white/70 transition-all ${
                          selectedCard ? 'border-green-300 bg-green-50/50' : 'border-amber-200'
                        }`}>
                          <div 
                            onClick={() => toggleCollapse(position.id)}
                            className="px-6 py-4 cursor-pointer hover:bg-amber-50/50 rounded-t-xl"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-lg font-bold text-amber-800">{position.position}</span>
                                <span className="ml-2 text-amber-600">{position.playerName}</span>
                              </div>
                              
                              <div className="flex items-center space-x-3">
                                {selectedCard ? (
                                  <div className="text-right">
                                    <div className="text-sm text-green-600 font-semibold">
                                      ✓ {selectedCard.year} {selectedCard.series}
                                    </div>
                                    <div className="text-lg font-bold text-green-700">
                                      ${selectedCard.price.toFixed(2)}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-sm text-amber-600 font-medium">
                                    Click to select card
                                  </div>
                                )}
                                
                                <div className="ml-4">
                                  <svg 
                                    className={`w-6 h-6 text-amber-600 transition-transform ${
                                      isCollapsed ? 'transform rotate-180' : ''
                                    }`} 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {!isCollapsed && (
                            <div className="px-6 pb-6 border-t border-amber-200/50">
                              <div className="pt-4">
                                {loadingCards && loadingCards[position.id] ? (
                                  <div className="text-center py-8">
                                    <div className="inline-flex items-center space-x-2">
                                      <svg className="animate-spin h-5 w-5 text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                      <span className="text-amber-600 font-medium">Searching for {position.playerName} cards on eBay...</span>
                                    </div>
                                  </div>
                                ) : (
                                  <CardSelectionGrid
                                    cards={cardOptions.map(card => ({
                                      ...card,
                                      source: card.seller === 'RosterFrame' ? 'inventory' : 
                                              card.seller === 'eBay' ? 'ebay' : 
                                              card.series === 'I have my own' || card.series === 'Browse eBay' ? 'custom' : 'ebay'
                                    }))}
                                    selectedCard={selectedCard}
                                    onCardSelect={(card) => selectCard(position.id, card)}
                                    loading={false}
                                    playerName={position.playerName}
                                  />
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="flex space-x-4 mt-8">
                    <button
                      onClick={() => setCurrentStep('building')}
                      className="flex-1 bg-amber-200 text-amber-700 py-4 text-lg font-bold rounded-xl hover:bg-amber-300 transition-all"
                    >
                      ← Back to Roster
                    </button>
                    <button
                      onClick={() => setCurrentStep('purchase')}
                      disabled={!canProceedToPurchase()}
                      className={`flex-2 py-4 text-lg font-bold rounded-xl transition-all ${
                        canProceedToPurchase()
                          ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-white hover:from-amber-700 hover:to-yellow-600'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      🚀 Proceed to Checkout - ${calculateTotalPrice().toFixed(2)}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Step 4: Purchase */}
            {currentStep === 'purchase' && (
              <div className="w-full">
                <CheckoutFlowEnhanced
                  orderSummary={{
                    plaqueName: selectedPlaque?.name || '',
                    plaqueImage: selectedPlaque?.image,
                    teamName: teamName,
                    goldPosition: goldPosition,
                    positions: rosterPositions.map(pos => ({
                      position: pos.position,
                      playerName: pos.playerName,
                      card: selectedCards[pos.id] ? {
                        name: selectedCards[pos.id].name,
                        price: selectedCards[pos.id].price,
                        imageUrl: selectedCards[pos.id].imageUrl,
                        seller: selectedCards[pos.id].seller,
                      } : undefined,
                    })),
                    subtotal: rosterPositions.length * 1.99 + Object.values(selectedCards).reduce((total, card) => total + card.price, 0),
                    discount: isPreOrder && !promoApplied ? 
                      (rosterPositions.length * 1.99 + Object.values(selectedCards).reduce((total, card) => total + card.price, 0)) * preOrderDiscount : 
                      promoApplied ? (rosterPositions.length * 1.99 + Object.values(selectedCards).reduce((total, card) => total + card.price, 0)) - 1.00 : 0,
                    discountCode: promoApplied ? promoCode : isPreOrder ? 'PREORDER20' : undefined,
                    shipping: {
                      method: shippingOptions[selectedShipping as keyof typeof shippingOptions].name,
                      price: shippingOptions[selectedShipping as keyof typeof shippingOptions].price,
                    },
                    total: calculateTotalPrice(),
                  }}
                  onSuccess={handlePaymentSuccess}
                  onBack={() => setCurrentStep('cards')}
                />
            )}

            {/* Step 5: Done */}
            {currentStep === 'done' && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 text-center">
                <div className="mb-8">
                  <div className="text-6xl mb-4">🎉</div>
                  <h2 className="text-3xl font-black text-amber-900 mb-3">Order Complete!</h2>
                  <p className="text-lg text-amber-700">Your roster frame is being prepared</p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-6 mb-8">
                  <p className="text-green-800 font-semibold">
                    Order ID: {paymentIntentId || 'RF-' + Date.now().toString().slice(-6)}
                  </p>
                  <p className="text-green-700 mt-2">
                    You'll receive an email confirmation shortly
                  </p>
                </div>
                
                <div className="flex justify-center">
                  <Link
                    href="/"
                    className="bg-amber-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-amber-700 transition-all"
                  >
                    Return to Home
                  </Link>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      
      {/* Email Capture Popup */}
      <EmailCapturePopup
        isOpen={showEmailCapture}
        onClose={() => setShowEmailCapture(false)}
        onContinue={(email) => {
          setShowEmailCapture(false);
          setCurrentStep('building');
        }}
        teamName={teamName}
        plaqueInfo={{
          style: selectedPlaque?.name || '',
          type: getPlaqueType(),
          price: selectedPlaque?.price || 0
        }}
      />
    </>
  );
}
