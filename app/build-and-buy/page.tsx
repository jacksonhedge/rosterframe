"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import StripePaymentForm from "../components/StripePaymentForm";
import PlaquePreview from "../components/PlaquePreview";
import LivePlaquePreview from "../components/LivePlaquePreview";
import PreviewGenerator from "../components/PreviewGenerator";
import PlayerSearch from "../components/PlayerSearch";
import { Navigation } from "../components/ui/Navigation";

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

export default function BuildAndBuy() {
  const [currentStep, setCurrentStep] = useState<'setup' | 'building' | 'cards' | 'purchase' | 'done'>('setup');
  const [teamName, setTeamName] = useState<string>("");
  const [selectedSport, setSelectedSport] = useState<'NFL' | 'MLB' | 'NBA' | 'NHL'>('NFL');
  const [isGift, setIsGift] = useState<boolean>(false);
  const [playerSearchValue, setPlayerSearchValue] = useState<string>("");
  const [selectedPlaque, setSelectedPlaque] = useState<{
    id: string;
    name: string;
    material: string;
    description: string;
    price: number;
    pricePerSlot: number;
  } | null>(null);

  // Get default positions based on sport
  const getDefaultPositions = (sport: 'NFL' | 'MLB' | 'NBA' | 'NHL') => {
    switch (sport) {
      case 'NFL':
        return [
          { id: '1', position: 'Quarterback', playerName: '' },
          { id: '2', position: 'Running Back', playerName: '' },
          { id: '3', position: 'Running Back', playerName: '' },
          { id: '4', position: 'Wide Receiver', playerName: '' },
          { id: '5', position: 'Wide Receiver', playerName: '' },
          { id: '6', position: 'Flex', playerName: '' },
          { id: '7', position: 'Tight End', playerName: '' },
          { id: '8', position: 'Defense/ST', playerName: '' },
          { id: '9', position: 'Kicker', playerName: '' }
        ];
      case 'MLB':
        return [
          { id: '1', position: 'Pitcher', playerName: '' },
          { id: '2', position: 'Catcher', playerName: '' },
          { id: '3', position: 'First Base', playerName: '' },
          { id: '4', position: 'Second Base', playerName: '' },
          { id: '5', position: 'Third Base', playerName: '' },
          { id: '6', position: 'Shortstop', playerName: '' },
          { id: '7', position: 'Outfield', playerName: '' },
          { id: '8', position: 'Outfield', playerName: '' }
        ];
      case 'NBA':
        return [
          { id: '1', position: 'Point Guard', playerName: '' },
          { id: '2', position: 'Shooting Guard', playerName: '' },
          { id: '3', position: 'Small Forward', playerName: '' },
          { id: '4', position: 'Power Forward', playerName: '' },
          { id: '5', position: 'Center', playerName: '' },
          { id: '6', position: 'Bench', playerName: '' },
          { id: '7', position: 'Bench', playerName: '' },
          { id: '8', position: 'Bench', playerName: '' }
        ];
      case 'NHL':
        return [
          { id: '1', position: 'Center', playerName: '' },
          { id: '2', position: 'Left Wing', playerName: '' },
          { id: '3', position: 'Right Wing', playerName: '' },
          { id: '4', position: 'Defense', playerName: '' },
          { id: '5', position: 'Defense', playerName: '' },
          { id: '6', position: 'Goalie', playerName: '' },
          { id: '7', position: 'Bench', playerName: '' },
          { id: '8', position: 'Bench', playerName: '' }
        ];
      default:
        return [
          { id: '1', position: 'Position 1', playerName: '' },
          { id: '2', position: 'Position 2', playerName: '' },
          { id: '3', position: 'Position 3', playerName: '' },
          { id: '4', position: 'Position 4', playerName: '' }
        ];
    }
  };

  // Roster positions state - initialized with NFL defaults
  const [rosterPositions, setRosterPositions] = useState<Array<{
    id: string;
    position: string;
    playerName: string;
  }>>(getDefaultPositions('NFL'));

  // Card selections state
  const [selectedCards, setSelectedCards] = useState<Record<string, CardOption>>({});

  // Collapsed sections state for card selection
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Payment state
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [paymentError, setPaymentError] = useState<string>('');
  const [paymentIntentId, setPaymentIntentId] = useState<string>('');

  // Pre-order state
  const [isPreOrder, setIsPreOrder] = useState<boolean>(true); // Default to pre-order mode
  const [preOrderDiscount] = useState<number>(0.15); // 15% pre-order discount

  // Shipping and subscription state
  const [selectedShipping, setSelectedShipping] = useState<'standard' | 'express' | 'priority'>('standard');
  const [subscribeToPortfolio, setSubscribeToPortfolio] = useState<boolean>(false);

  // Shipping options
  const shippingOptions = {
    standard: { name: 'Standard Shipping', days: '7-10 days', price: 0 },
    express: { name: 'Express Shipping', days: '3-5 days', price: 9.99 },
    priority: { name: 'Priority Shipping', days: '1-2 days', price: 19.99 }
  };

  // Get available positions based on sport
  const getAvailablePositions = (sport: 'NFL' | 'MLB' | 'NBA' | 'NHL') => {
    switch (sport) {
      case 'NFL':
        return ['Quarterback', 'Running Back', 'Wide Receiver', 'Flex', 'Tight End', 'Kicker', 'Defense/ST'];
      case 'MLB':
        return ['Pitcher', 'Catcher', 'First Base', 'Second Base', 'Third Base', 'Shortstop', 'Outfield', 'Designated Hitter', 'Utility'];
      case 'NBA':
        return ['Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center', 'Guard', 'Forward', 'Bench'];
      case 'NHL':
        return ['Center', 'Left Wing', 'Right Wing', 'Defense', 'Goalie', 'Forward', 'Bench'];
      default:
        return ['Position 1', 'Position 2', 'Position 3', 'Position 4'];
    }
  };

  const availablePositions = getAvailablePositions(selectedSport);

  // Update roster positions when sport changes
  useEffect(() => {
    // Clear all selected cards when sport changes
    setSelectedCards({});
    // Set new default positions for the selected sport
    setRosterPositions(getDefaultPositions(selectedSport));
  }, [selectedSport]);

  // Generate card options for a player
  const generateCardOptions = (playerName: string): CardOption[] => {
    if (!playerName.trim()) return [];
    
    return [
      // Default recommended card
      {
        id: `${playerName}-default`,
        playerName,
        name: playerName,
        year: 2023,
        brand: 'Panini Prizm',
        series: 'Base',
        condition: 'Near Mint',
        price: 15.99,
        rarity: 'common',
        imageUrl: '',
        seller: 'RosterFrame',
        shipping: 0 // Free shipping included
      },
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
        rarity: 'common',
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
        rarity: 'common',
        imageUrl: '',
        seller: 'eBay',
        shipping: 0,
        listingUrl: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(playerName + ' trading card')}`
      },
      {
        id: `${playerName}-base`,
        playerName,
        name: playerName,
        year: 2020,
        brand: 'Score',
        series: 'Base Set',
        condition: 'Excellent',
        price: 8.99,
        rarity: 'common',
        imageUrl: '',
        seller: 'CardsForAll',
        shipping: 1.99
      }
    ];
  };

  const addPosition = () => {
    const newPosition = {
      id: Date.now().toString(),
      position: 'Quarterback',
      playerName: ''
    };
    setRosterPositions([...rosterPositions, newPosition]);
  };

  const removePosition = (id: string) => {
    if (rosterPositions.length > 1) {
      setRosterPositions(rosterPositions.filter(pos => pos.id !== id));
      // Remove any selected cards for this position
      const newSelectedCards = { ...selectedCards };
      delete newSelectedCards[id];
      setSelectedCards(newSelectedCards);
    }
  };

  const updatePosition = (id: string, field: 'position' | 'playerName', value: string) => {
    const currentPosition = rosterPositions.find(pos => pos.id === id);
    
    setRosterPositions(rosterPositions.map(pos => 
      pos.id === id ? { ...pos, [field]: value } : pos
    ));
    
    // If player name changed to empty or different player, clear selected card
    if (field === 'playerName' && currentPosition && currentPosition.playerName !== value) {
      if (!value) {
        // Only clear if the name is being emptied
        const newSelectedCards = { ...selectedCards };
        delete newSelectedCards[id];
        setSelectedCards(newSelectedCards);
      }
    }
  };

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

  const toggleCollapse = (positionId: string) => {
    setCollapsedSections({
      ...collapsedSections,
      [positionId]: !collapsedSections[positionId]
    });
  };

  const calculateTotalPrice = () => {
    const plaquePrice = selectedPlaque?.price || 78.00;
    const cardsPrice = Object.values(selectedCards).reduce((total, card) => total + card.price + (card.shipping || 0), 0);
    let subtotal = plaquePrice + cardsPrice;
    
    // Apply pre-order discount if applicable
    if (isPreOrder) {
      subtotal = subtotal * (1 - preOrderDiscount);
    }
    
    // Add shipping cost
    const shippingCost = shippingOptions[selectedShipping].price;
    
    // Add portfolio subscription if selected ($4.99/month)
    const subscriptionCost = subscribeToPortfolio ? 4.99 : 0;
    
    return subtotal + shippingCost + subscriptionCost;
  };

  const calculateSavings = () => {
    if (!isPreOrder) return 0;
    const plaquePrice = selectedPlaque?.price || 78.00;
    const cardsPrice = Object.values(selectedCards).reduce((total, card) => total + card.price + (card.shipping || 0), 0);
    const subtotal = plaquePrice + cardsPrice;
    return subtotal * preOrderDiscount;
  };

  // Determine plaque type based on number of positions
  const getPlaqueType = () => {
    return rosterPositions.length <= 8 ? '8' : '10';
  };

  // Plaque options - dynamically adjust based on roster size
  const plaqueOptions = [
    {
      id: 'dark-maple-wood',
      name: 'Dark Maple Wood Plaque',
      material: 'Premium dark maple wood finish',
      description: `Premium dark maple wood finish with ${getPlaqueType()} card slots`,
      price: getPlaqueType() === '8' ? 129.99 : 149.99,
      pricePerSlot: getPlaqueType() === '8' ? 16.25 : 15.00,
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
      description: `Crystal clear acrylic with ${getPlaqueType()} card slots - shows front or back`,
      price: getPlaqueType() === '8' ? 149.99 : 169.99,
      pricePerSlot: getPlaqueType() === '8' ? 18.75 : 17.00,
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
      description: `Elegant black marble finish with ${getPlaqueType()} card slots`,
      price: getPlaqueType() === '8' ? 159.99 : 179.99,
      pricePerSlot: getPlaqueType() === '8' ? 20.00 : 18.00,
      gradient: 'from-gray-800 to-black',
      border: 'border-gray-400',
      accent: 'text-gray-100',
      image: '/images/BlackMarble8.png',
      plaqueType: getPlaqueType() as '8' | '10',
      style: 'black-marble'
    }
  ];

  // Progress steps configuration
  const progressSteps = [
    { id: 'setup', name: 'Setup & Plaque', description: 'Team Info & Style Selection' },
    { id: 'building', name: 'Roster Details', description: 'Add Players' },
    { id: 'cards', name: 'Card Selection', description: 'Choose Player Cards' },
    { id: 'purchase', name: 'Purchase', description: 'Review & Checkout' },
    { id: 'done', name: 'Done', description: 'Order Complete' },
  ];

  const getCurrentStepIndex = () => {
    return progressSteps.findIndex(step => step.id === currentStep);
  };

  const handlePlaqueSelection = (plaque: typeof plaqueOptions[0]) => {
    setSelectedPlaque(plaque);
  };

  const canProceedToCards = () => {
    return rosterPositions.every(pos => pos.playerName.trim() !== '');
  };

  const canProceedToPurchase = () => {
    return rosterPositions.every(pos => selectedCards[pos.id]);
  };

  const handlePaymentSuccess = (paymentId: string) => {
    setPaymentIntentId(paymentId);
    setPaymentStatus('success');
    setCurrentStep('done');
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
    setPaymentStatus('error');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-50">
      {/* Navigation */}
      <Navigation 
        logo="Roster Frame"
        links={[
          { href: '/build-and-buy', label: 'Build & Buy' },
          { href: '/marketplace', label: 'Marketplace' },
          { href: '/collection', label: 'Collection' },
        ]}
      />

      {/* Spacer for fixed navigation */}
      <div className="h-16 md:h-20"></div>

      {/* Status Bar */}
      {currentStep !== 'setup' && (
        <div className="fixed top-20 left-0 right-0 z-10 bg-amber-50/95 backdrop-blur-md border-b border-amber-200 py-3">
          <div className="max-w-7xl mx-auto px-4 flex justify-center">
            <div className="flex items-center space-x-2 bg-amber-100 px-4 py-2 rounded-full border border-amber-200">
              <div className="w-2 h-2 bg-amber-600 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-amber-800">
                {currentStep === 'cards' ? 'Select Cards' : 
                 `Building ${teamName || 'Your Team'}`}
                {isGift && <span className="ml-2">🎁</span>}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar - STICKY (Always Visible) */}
      <div className="relative z-30 bg-white/90 backdrop-blur-md border-b border-amber-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {progressSteps.map((step, index) => {
              const isActive = index === getCurrentStepIndex();
              const isCompleted = index < getCurrentStepIndex();
              
              return (
                <div key={step.id} className="flex items-center flex-1">
                  {/* Step Circle */}
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                      isCompleted 
                        ? 'bg-amber-500 border-amber-500 text-white' 
                        : isActive 
                        ? 'bg-yellow-500 border-yellow-500 text-white' 
                        : 'bg-gray-200 border-gray-300 text-gray-500'
                    }`}>
                      {isCompleted ? '✓' : index + 1}
                    </div>
                    <div className="ml-3 min-w-0">
                      <p className={`text-sm font-bold ${isActive ? 'text-amber-600' : isCompleted ? 'text-amber-600' : 'text-gray-500'}`}>
                        {step.name}
                      </p>
                      <p className={`text-xs ${isActive ? 'text-yellow-500' : isCompleted ? 'text-amber-500' : 'text-gray-400'}`}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Connector Line */}
                  {index < progressSteps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${isCompleted ? 'bg-amber-500' : 'bg-gray-300'}`}></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content - Extra padding to account for sticky progress bar */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Live Plaque Preview - Shows after cards are selected in card selection and purchase steps */}
        {Object.keys(selectedCards).length > 0 && (currentStep === 'cards' || currentStep === 'purchase') && (
          <div className="mb-8 animate-in slide-in-from-top duration-500">
            <LivePlaquePreview
              teamName={teamName}
              plaqueStyle={selectedPlaque?.style || 'dark-maple-wood'}
              selectedCards={selectedCards}
              rosterPositions={rosterPositions}
              plaqueType={getPlaqueType()}
            />
          </div>
        )}
        <div className="grid grid-cols-1 gap-8">
          
          {/* Step 1: Setup & Plaque Selection */}
          {currentStep === 'setup' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mt-8">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-black text-amber-900 mb-4">
                  Build Your 
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-yellow-600"> Dream Plaque</span>
                </h1>
                <p className="text-xl text-amber-700">Transform your fantasy roster into a legendary display</p>
              </div>
              
              <div className="space-y-8">
                {/* Team Name */}
                <div>
                  <label htmlFor="team-name" className="block text-xl font-bold text-amber-800 mb-4">
                    🏆 What's your team name?
                  </label>
                  <input
                    type="text"
                    id="team-name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full px-6 py-4 text-xl bg-white/70 border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder-amber-400"
                    placeholder="Enter your legendary team name..."
                  />
                </div>

                {/* Sport Selection */}
                <div>
                  <label className="block text-xl font-bold text-amber-800 mb-4">
                    🏈 Pick a Sport
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { id: 'NFL', name: 'NFL', icon: '🏈', color: 'from-green-500 to-green-600' },
                      { id: 'MLB', name: 'MLB', icon: '⚾', color: 'from-red-500 to-red-600' },
                      { id: 'NBA', name: 'NBA', icon: '🏀', color: 'from-orange-500 to-orange-600' },
                      { id: 'NHL', name: 'NHL', icon: '🏒', color: 'from-blue-500 to-blue-600' }
                    ].map((sport) => (
                      <button
                        key={sport.id}
                        onClick={() => setSelectedSport(sport.id as 'NFL' | 'MLB' | 'NBA' | 'NHL')}
                        className={`relative p-6 rounded-xl border-2 transition-all transform hover:scale-105 ${
                          selectedSport === sport.id
                            ? `bg-gradient-to-br ${sport.color} text-white border-transparent shadow-lg`
                            : 'bg-white/70 border-amber-200 hover:border-amber-400'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-4xl mb-2">{sport.icon}</div>
                          <div className={`font-bold text-lg ${
                            selectedSport === sport.id ? 'text-white' : 'text-amber-800'
                          }`}>
                            {sport.name}
                          </div>
                        </div>
                        {selectedSport === sport.id && (
                          <div className="absolute top-2 right-2">
                            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                              <span className="text-sm">✓</span>
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Plaque Selection */}
                <div>
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-black text-amber-900 mb-3">Choose Your Plaque Style</h3>
                    <p className="text-lg text-amber-700">Select the perfect finish for your fantasy team display</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {plaqueOptions.map((plaque) => (
                      <div
                        key={plaque.id}
                        onClick={() => handlePlaqueSelection(plaque)}
                        className={`relative overflow-hidden bg-gradient-to-br ${plaque.gradient} ${plaque.border} rounded-2xl cursor-pointer border-2 hover:scale-[1.02] transition-all transform shadow-lg hover:shadow-xl ${
                          plaque.id === 'black-marble' ? 'text-white' : ''
                        } ${selectedPlaque?.id === plaque.id ? 'ring-4 ring-amber-500' : ''}`}
                      >
                        {/* Plaque Preview Image */}
                        <div className="relative h-48 bg-gradient-to-b from-gray-100 to-gray-200 overflow-hidden">
                          {plaque.image && (
                            <img
                              src={plaque.image}
                              alt={plaque.name}
                              className="w-full h-full object-contain"
                            />
                          )}
                          {plaque.hasBackOption && (
                            <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                              Front/Back Option
                            </div>
                          )}
                        </div>
                        
                        {/* Plaque Details */}
                        <div className="p-6">
                          <div className="mb-4">
                            <h3 className={`text-xl font-black mb-1 ${plaque.id === 'black-marble' ? 'text-white' : plaque.accent}`}>
                              {plaque.name}
                            </h3>
                            <p className={`text-sm font-semibold mb-2 ${plaque.id === 'black-marble' ? 'text-gray-300' : 'opacity-80'}`}>
                              {plaque.material}
                            </p>
                            <p className={`text-xs leading-relaxed ${plaque.id === 'black-marble' ? 'text-gray-400' : 'opacity-70'}`}>
                              {plaque.description}
                            </p>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div>
                              <p className={`text-2xl font-black ${plaque.id === 'black-marble' ? 'text-green-400' : plaque.accent}`}>
                                ${plaque.price.toFixed(2)}
                              </p>
                              <p className={`text-xs ${plaque.id === 'black-marble' ? 'text-gray-400' : 'opacity-70'}`}>
                                ${plaque.pricePerSlot.toFixed(2)} per slot
                              </p>
                            </div>
                            <div className={`${plaque.id === 'black-marble' ? 'bg-yellow-400/20' : 'bg-white/20'} px-3 py-1.5 rounded-lg`}>
                              <span className={`text-xs font-semibold ${plaque.id === 'black-marble' ? 'text-yellow-400' : plaque.accent}`}>
                                {selectedPlaque?.id === plaque.id ? '✓ Selected' : 'Select'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {selectedPlaque && (
                  <button
                    onClick={() => setCurrentStep('building')}
                    disabled={!teamName.trim()}
                    className={`w-full py-5 text-xl font-bold rounded-xl transition-all transform hover:scale-[1.02] shadow-lg ${
                      teamName.trim()
                        ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white hover:from-amber-700 hover:to-yellow-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {teamName.trim() 
                      ? '🚀 Continue to Build Roster' 
                      : '⬆️ Enter Team Name to Continue'
                    }
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Roster Building */}
          {currentStep === 'building' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-amber-900 mb-3">Build Your Roster</h2>
                <p className="text-lg text-amber-700">Add your players and select their cards</p>
              </div>
              
              {/* Live Plaque Preview */}
              {selectedPlaque && (
                <div className="mb-8">
                  <LivePlaquePreview
                    teamName={teamName}
                    plaqueStyle={selectedPlaque?.style || 'dark-maple-wood'}
                    selectedCards={selectedCards}
                    rosterPositions={rosterPositions}
                    plaqueType={getPlaqueType()}
                  />
                </div>
              )}
              
              <div className="space-y-6">
                {/* Player Database Info */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-blue-800 mb-2">
                      {selectedSport === 'NFL' && '🏈'}
                      {selectedSport === 'MLB' && '⚾'}
                      {selectedSport === 'NBA' && '🏀'}
                      {selectedSport === 'NHL' && '🏒'}
                      {' '}Search {selectedSport} Player Database
                    </h3>
                    <p className="text-sm text-blue-600">Find real {selectedSport} players with trading cards available</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {rosterPositions.map((position, index) => (
                    <div key={position.id} className="border-2 rounded-xl p-6 border-amber-300 bg-white/50 relative">
                      {/* Remove button for positions beyond the first 4 */}
                      {rosterPositions.length > 4 && index >= 4 && (
                        <button
                          onClick={() => removePosition(position.id)}
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold text-lg"
                          title="Remove position"
                        >
                          ×
                        </button>
                      )}
                      
                      <div className="flex items-center space-x-3 mb-4">
                        <span className="bg-amber-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        <select
                          value={position.position}
                          onChange={(e) => updatePosition(position.id, 'position', e.target.value)}
                          className="text-lg font-bold text-amber-800 bg-transparent border-none focus:outline-none cursor-pointer"
                        >
                          {availablePositions.map((pos) => (
                            <option key={pos} value={pos}>{pos}</option>
                          ))}
                        </select>
                      </div>
                      <PlayerSearch
                        value={position.playerName}
                        onChange={(playerName, card) => {
                          updatePosition(position.id, 'playerName', playerName);
                          // Auto-select a default card when player is selected
                          if (playerName && !selectedCards[position.id]) {
                            const defaultCard: CardOption = {
                              id: `${position.id}-default`,
                              playerName: playerName,
                              name: playerName,
                              year: 2023,
                              brand: 'Panini',
                              series: 'Base',
                              condition: 'Near Mint',
                              price: 15.99,
                              rarity: 'common',
                              imageUrl: '',
                              shipping: 3.99
                            };
                            selectCard(position.id, defaultCard);
                          }
                        }}
                        placeholder={`Type ${selectedSport} player name...`}
                        className="text-amber-800 font-medium"
                      />
                    </div>
                  ))}
                </div>
                
                {/* Add Position Button - Only show if less than 10 positions */}
                {rosterPositions.length < 10 && (
                  <div className="flex justify-center">
                    <button
                      onClick={addPosition}
                      className="bg-amber-100 text-amber-700 px-6 py-3 rounded-xl font-semibold hover:bg-amber-200 transition-all border-2 border-amber-300 flex items-center space-x-2"
                    >
                      <span className="text-xl">+</span>
                      <span>Add Position</span>
                    </button>
                  </div>
                )}
                
                {/* Import Options */}
                <div className="border-t border-amber-200 pt-6">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-amber-800 mb-2">Import Your Roster</h3>
                    <p className="text-sm text-amber-600">Quick import from your fantasy platform</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    {['Sleeper', 'ESPN', 'Yahoo'].map((platform) => (
                      <button
                        key={platform}
                        disabled
                        className="bg-gray-100 text-gray-400 px-4 py-3 rounded-lg font-semibold cursor-not-allowed border-2 border-gray-200 flex items-center justify-center space-x-2"
                      >
                        <span>{platform}</span>
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded">Coming Soon</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={() => setCurrentStep('cards')}
                  disabled={!canProceedToCards()}
                  className={`w-full py-4 text-lg font-bold rounded-xl transition-all transform hover:scale-[1.02] shadow-lg ${
                    canProceedToCards()
                      ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white hover:from-amber-700 hover:to-yellow-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  🃏 Continue to Card Selection
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Card Selection */}
          {currentStep === 'cards' && (
            <>
              {/* Card Selection */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-black text-amber-900 mb-3">Select Player Cards</h2>
                  <p className="text-lg text-amber-700">Choose the perfect cards for each player in your roster</p>
                  <div className="mt-4 flex justify-center space-x-4">
                    <div className="bg-amber-50 px-4 py-2 rounded-lg border border-amber-200">
                      <span className="text-sm font-semibold text-amber-700">
                        Plaque: ${selectedPlaque?.price.toFixed(2) || '78.00'}
                      </span>
                    </div>
                    <div className="bg-yellow-50 px-4 py-2 rounded-lg border border-yellow-200">
                      <span className="text-sm font-semibold text-yellow-700">
                        Cards: ${Object.values(selectedCards).reduce((total, card) => total + card.price + (card.shipping || 0), 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

              <div className="space-y-6">
                {rosterPositions.filter(pos => pos.playerName.trim()).map((position) => {
                  const cardOptions = generateCardOptions(position.playerName);
                  const selectedCard = selectedCards[position.id];
                  const isCollapsed = collapsedSections[position.id];
                  
                  return (
                    <div key={position.id} className={`border-2 rounded-xl bg-white/70 transition-all ${
                      selectedCard 
                        ? 'border-green-300 bg-green-50/50' 
                        : 'border-amber-200'
                    }`}>
                      {/* Clickable Header */}
                      <div 
                        onClick={() => toggleCollapse(position.id)}
                        className="flex items-center justify-between p-6 cursor-pointer hover:bg-amber-50/50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="bg-amber-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                            {rosterPositions.indexOf(position) + 1}
                          </span>
                          <div>
                            <h3 className="text-xl font-bold text-amber-900">{position.playerName}</h3>
                            <span className="text-sm text-amber-600 bg-amber-100 px-2 py-1 rounded">
                              {position.position}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          {selectedCard ? (
                            <div className="text-right">
                              <div className="text-sm text-green-600 font-semibold">
                                ✓ {selectedCard.year} {selectedCard.series}
                              </div>
                              <div className="text-lg font-bold text-green-700">
                                ${(selectedCard.price + (selectedCard.shipping || 0)).toFixed(2)}
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

                      {/* Collapsible Card Options */}
                      {!isCollapsed && (
                        <div className="px-6 pb-6 border-t border-amber-200/50">
                          <div className="pt-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                              {cardOptions.map((card) => {
                                const isSelected = selectedCard?.id === card.id;
                                return (
                                  <div
                                    key={card.id}
                                    onClick={() => selectCard(position.id, card)}
                                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all transform hover:scale-105 ${
                                      isSelected 
                                        ? 'border-amber-500 bg-amber-50 shadow-lg' 
                                        : 'border-gray-200 bg-white hover:border-amber-300 hover:shadow-md'
                                    }`}
                                  >
                                    {/* Card Visual */}
                                    <div className={`rounded-lg aspect-[3/4] mb-3 flex items-center justify-center border ${
                                      card.series === 'I have my own' 
                                        ? 'bg-gradient-to-br from-green-100 to-emerald-100 border-green-300'
                                        : card.series === 'Browse eBay'
                                        ? 'bg-gradient-to-br from-blue-100 to-indigo-100 border-blue-300'
                                        : 'bg-gradient-to-br from-amber-100 to-yellow-100 border-amber-200'
                                    }`}>
                                      <div className="text-center p-2">
                                        {card.series === 'I have my own' ? (
                                          <>
                                            <div className="text-3xl mb-2">🃏</div>
                                            <div className="text-sm font-bold text-green-800">I Have</div>
                                            <div className="text-sm font-bold text-green-800">My Own</div>
                                            <div className="text-xs text-green-600 mt-1">FREE</div>
                                          </>
                                        ) : card.series === 'Browse eBay' ? (
                                          <>
                                            <div className="text-3xl mb-2">🔍</div>
                                            <div className="text-sm font-bold text-blue-800">Search</div>
                                            <div className="text-sm font-bold text-blue-800">eBay</div>
                                            <div className="text-xs text-blue-600 mt-1">Browse Options</div>
                                          </>
                                        ) : (
                                          <>
                                            <div className="text-xs font-bold text-amber-800 mb-1">{card.year}</div>
                                            <div className="text-sm font-bold text-amber-900 leading-tight">{card.playerName}</div>
                                            <div className="text-xs text-amber-600 mt-1">{card.brand}</div>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {/* Card Details */}
                                    <div className="space-y-1">
                                      <div className="flex justify-between items-center">
                                        <span className="text-xs font-semibold text-gray-600">Year:</span>
                                        <span className="text-xs font-bold">{card.year}</span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-xs font-semibold text-gray-600">Condition:</span>
                                        <span className={`text-xs font-bold ${
                                          card.condition === 'Mint' ? 'text-green-600' : 
                                          card.condition === 'Near Mint' ? 'text-blue-600' : 'text-amber-600'
                                        }`}>
                                          {card.condition}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-xs font-semibold text-gray-600">Series:</span>
                                        <span className="text-xs font-bold text-purple-600">{card.series}</span>
                                      </div>
                                      <div className="pt-2 border-t border-gray-200">
                                        <div className="text-center">
                                          {card.series === 'I have my own' ? (
                                            <div className="text-lg font-black text-green-700">FREE</div>
                                          ) : card.series === 'Browse eBay' ? (
                                            <div className="text-sm font-bold text-blue-700">Click to Search</div>
                                          ) : (
                                            <>
                                              <div className="text-lg font-black text-amber-700">${card.price.toFixed(2)}</div>
                                              {card.shipping > 0 && (
                                                <div className="text-xs text-gray-500">+${card.shipping.toFixed(2)} shipping</div>
                                              )}
                                              {card.shipping === 0 && card.price > 0 && (
                                                <div className="text-xs text-green-600 font-semibold">FREE Shipping</div>
                                              )}
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {isSelected && (
                                      <div className="mt-2 text-center">
                                        <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded">
                                          SELECTED
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

                            </div>
              
              {/* Preview Generator */}
              {canProceedToPurchase() && (
                <div className="mt-8">
                  <PreviewGenerator
                    teamName={teamName}
                    plaqueType={rosterPositions.length <= 8 ? '8' : '10'}
                    plaqueStyle={selectedPlaque?.name || 'Classic Wood'}
                    selectedCards={selectedCards}
                    rosterPositions={rosterPositions}
                  />
                </div>
              )}
              
              {/* Action Buttons */}
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
                  className={`flex-2 py-4 text-lg font-bold rounded-xl transition-all transform hover:scale-[1.02] shadow-lg ${
                    canProceedToPurchase()
                      ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-white hover:from-amber-700 hover:to-yellow-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  🚀 Proceed to Checkout - ${calculateTotalPrice().toFixed(2)}
                </button>
              </div>
            </>
          )}

          {/* Step 5: Purchase */}
          {currentStep === 'purchase' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-amber-900 mb-3">Review Your Order</h2>
                <p className="text-lg text-amber-700">Confirm your plaque details and complete your purchase</p>
                {isGift && (
                  <p className="text-yellow-600 font-semibold mt-2">🎁 This order will be gift wrapped</p>
                )}
              </div>

              <div className="space-y-6 mb-8">
                {/* Pre-Order & Gift Options */}
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-6 border border-amber-200">
                  <h3 className="text-xl font-bold text-amber-900 mb-4">Order Options</h3>
                  <div className="space-y-4">
                    {/* Pre-Order Toggle */}
                    <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">🚀</span>
                        <div>
                          <span className="text-lg font-semibold text-amber-800">Pre-Order (Save 15%)</span>
                          <p className="text-sm text-amber-600">
                            {isPreOrder ? 'Ships March 2025' : 'Ships in 7-10 days'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsPreOrder(!isPreOrder)}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                          isPreOrder ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                            isPreOrder ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Gift Toggle */}
                    <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">🎁</span>
                        <div>
                          <span className="text-lg font-semibold text-amber-800">Is this a gift?</span>
                          <p className="text-sm text-amber-600">
                            {isGift ? "We'll include gift wrapping!" : "Optional gift wrapping"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsGift(!isGift)}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                          isGift ? 'bg-gradient-to-r from-amber-500 to-yellow-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          isGift ? 'translate-x-7' : 'translate-x-1'
                        }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Shipping Options */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <h3 className="text-xl font-bold text-blue-900 mb-4">📦 Shipping Options</h3>
                  <div className="space-y-3">
                    {Object.entries(shippingOptions).map(([key, option]) => (
                      <div 
                        key={key}
                        onClick={() => setSelectedShipping(key as 'standard' | 'express' | 'priority')}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedShipping === key
                            ? 'border-blue-500 bg-blue-100'
                            : 'border-gray-200 bg-white hover:border-blue-300'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold text-gray-800">{option.name}</div>
                            <div className="text-sm text-gray-600">{option.days}</div>
                          </div>
                          <div className="text-right">
                            <div className={`font-bold ${
                              option.price === 0 ? 'text-green-600' : 'text-gray-800'
                            }`}>
                              {option.price === 0 ? 'FREE' : `$${option.price.toFixed(2)}`}
                            </div>
                            {selectedShipping === key && (
                              <div className="text-xs text-blue-600 font-semibold">Selected</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Portfolio Value Tracking */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                  <h3 className="text-xl font-bold text-purple-900 mb-4">📈 Portfolio Value Tracking</h3>
                  <div className="p-4 bg-white/70 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-bold text-purple-800 mb-2">Card Portfolio Tracker</h4>
                        <p className="text-sm text-purple-600 mb-3">
                          Track your card values in real-time! Get monthly updates on how your card collection is performing.
                        </p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          <li className="flex items-center">
                            <span className="text-green-500 mr-1">✓</span>
                            Real-time market value updates
                          </li>
                          <li className="flex items-center">
                            <span className="text-green-500 mr-1">✓</span>
                            Monthly portfolio reports
                          </li>
                          <li className="flex items-center">
                            <span className="text-green-500 mr-1">✓</span>
                            Price alerts for significant changes
                          </li>
                        </ul>
                      </div>
                      <button
                        onClick={() => setSubscribeToPortfolio(!subscribeToPortfolio)}
                        className={`ml-4 p-2 rounded-lg transition-all ${
                          subscribeToPortfolio
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        <div className="text-center">
                          <div className="font-bold">${subscribeToPortfolio ? '✓' : '+'}</div>
                          <div className="text-xs">$4.99/mo</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Order Summary */}
                <div className="space-y-6">
                  <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                    <h3 className="text-xl font-bold text-amber-900 mb-4">Order Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Team Name:</span>
                        <span className="font-bold text-amber-600">{teamName}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Sport:</span>
                        <span className="font-bold text-amber-600">{selectedSport}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Plaque Style:</span>
                        <span className="font-bold">{selectedPlaque?.name || 'Classic Wood'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Material:</span>
                        <span className="font-bold">{selectedPlaque?.material || 'Premium Oak'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Number of Positions:</span>
                        <span className="font-bold">{rosterPositions.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Gift Packaging:</span>
                        <span className="font-bold">{isGift ? 'Yes (FREE)' : 'No'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Order Type:</span>
                        <span className="font-bold">{isPreOrder ? '🚀 Pre-Order' : '📦 Regular Order'}</span>
                      </div>
                      <div className="border-t border-amber-300 pt-3 mt-3 space-y-2">
                        <div className="flex justify-between items-center text-sm text-gray-600">
                          <span>Plaque & Cards:</span>
                          <span>${((selectedPlaque?.price || 0) + Object.values(selectedCards).reduce((sum, card) => sum + card.price + (card.shipping || 0), 0)).toFixed(2)}</span>
                        </div>
                        {isPreOrder && (
                          <div className="flex justify-between items-center text-sm text-green-600">
                            <span>Pre-Order Discount (15%):</span>
                            <span>-${calculateSavings().toFixed(2)}</span>
                          </div>
                        )}
                        {shippingOptions[selectedShipping].price > 0 && (
                          <div className="flex justify-between items-center text-sm text-gray-600">
                            <span>Shipping ({shippingOptions[selectedShipping].name}):</span>
                            <span>${shippingOptions[selectedShipping].price.toFixed(2)}</span>
                          </div>
                        )}
                        {subscribeToPortfolio && (
                          <div className="flex justify-between items-center text-sm text-purple-600">
                            <span>Portfolio Tracking (monthly):</span>
                            <span>$4.99</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center text-lg pt-2 border-t">
                          <span className="font-bold">Total Amount:</span>
                          <span className="font-bold text-green-600">${calculateTotalPrice().toFixed(2)}</span>
                        </div>
                        {isPreOrder && (
                          <div className="text-center pt-2">
                            <span className="text-sm text-blue-600 font-medium">
                              💰 You are saving ${calculateSavings().toFixed(2)} with pre-order!
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Summary */}
                  <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                    <h3 className="text-xl font-bold text-amber-900 mb-4">Selected Cards</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {Object.entries(selectedCards).map(([positionId, card]) => {
                        const position = rosterPositions.find(p => p.id === positionId);
                        return (
                          <div key={positionId} className="flex justify-between items-center text-sm">
                            <span className="font-semibold">{position?.playerName} ({card.year} {card.series}):</span>
                            <span className="font-bold text-amber-600">${(card.price + (card.shipping || 0)).toFixed(2)}</span>
                          </div>
                        );
                      })}
                      <div className="border-t border-yellow-300 pt-2 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold">Plaque Cost:</span>
                          <span className="font-bold text-amber-600">
                            ${selectedPlaque?.price.toFixed(2) || '78.00'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-bold">Cards Total:</span>
                          <span className="font-bold text-amber-600">
                            ${Object.values(selectedCards).reduce((total, card) => total + card.price + (card.shipping || 0), 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setCurrentStep('cards')}
                    className="w-full bg-amber-200 text-amber-700 py-3 text-lg font-bold rounded-xl hover:bg-amber-300 transition-all"
                  >
                    ← Back to Cards
                  </button>
                </div>

                {/* Payment Form */}
                <div className="space-y-6">
                  {paymentStatus === 'error' && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <div className="flex items-center space-x-2 text-red-600">
                        <span className="text-xl">❌</span>
                        <span className="font-semibold">Payment Error</span>
                      </div>
                      <p className="text-red-600 mt-2">{paymentError}</p>
                      <button
                        onClick={() => {
                          setPaymentStatus('idle');
                          setPaymentError('');
                        }}
                        className="mt-3 text-red-600 underline hover:no-underline"
                      >
                        Try Again
                      </button>
                    </div>
                  )}

                  <StripePaymentForm
                    amount={calculateTotalPrice()}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                    customerInfo={{
                      teamName,
                      selectedSport,
                      isGift,
                    }}
                    orderDetails={{
                      plaqueName: selectedPlaque?.name || 'Classic Wood',
                      numPositions: rosterPositions.length,
                      numCards: Object.keys(selectedCards).length,
                      isPreOrder,
                      savings: calculateSavings(),
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Order Complete */}
          {currentStep === 'done' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 text-center">
              <div className="mb-8">
                <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl text-white">✓</span>
                </div>
                <h2 className="text-3xl font-black text-amber-900 mb-3">
                  {isPreOrder ? 'Pre-Order Confirmed!' : 'Order Complete!'}
                </h2>
                <p className="text-lg text-amber-700">
                  {isPreOrder 
                    ? 'Thank you for your pre-order! Your plaque will be crafted and shipped in March 2025.'
                    : 'Thank you for your purchase. Your plaque is being prepared!'
                  }
                </p>
                {isPreOrder && (
                  <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-center space-x-2 text-blue-700">
                      <span className="text-xl">🚀</span>
                      <span className="font-semibold">
                        Pre-Order Benefits: You saved ${calculateSavings().toFixed(2)} (15% off)
                      </span>
                    </div>
                    <p className="text-blue-600 text-sm mt-2 text-center">
                      We will email you updates on production progress and shipping details.
                    </p>
                  </div>
                )}
                {isGift && (
                  <p className="text-yellow-600 font-semibold mt-2">🎁 Your gift will be beautifully wrapped</p>
                )}
              </div>

              <div className="bg-amber-50 rounded-xl p-6 mb-8 border border-amber-200">
                <h3 className="text-xl font-bold text-amber-800 mb-4">Order Details</h3>
                <div className="text-left space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">Order Number:</span>
                    <span className="font-mono">#RF-{Date.now().toString().slice(-6)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Team Name:</span>
                    <span>{teamName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Plaque Style:</span>
                    <span>{selectedPlaque?.name || 'Classic Wood'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Positions:</span>
                    <span>{rosterPositions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Cards Selected:</span>
                    <span>{Object.keys(selectedCards).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Total Paid:</span>
                    <span className="font-bold text-green-600">${calculateTotalPrice().toFixed(2)}</span>
                  </div>
                  {paymentIntentId && (
                    <div className="flex justify-between">
                      <span className="font-semibold">Payment ID:</span>
                      <span className="font-mono text-xs text-gray-600">{paymentIntentId}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="font-semibold">Estimated Delivery:</span>
                    <span>{isPreOrder ? 'March 2025' : '7-10 business days'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-amber-600">
                  We will email you updates about your order progress and tracking information.
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => window.location.href = '/'}
                    className="flex-1 bg-amber-600 text-white py-3 text-lg font-bold rounded-xl hover:bg-amber-700 transition-all"
                  >
                    Create Another Plaque
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex-1 bg-amber-200 text-amber-700 py-3 text-lg font-bold rounded-xl hover:bg-amber-300 transition-all"
                  >
                    Print Receipt
                  </button>
                </div>
              </div>
            </div>
          )}
          
        </div>
      </main>
    </div>
  );
} 