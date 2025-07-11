'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { previewMaker, type PlaqueConfiguration, type CompiledPreview, type PlayerCardData } from '@/app/lib/preview-maker';
import PlayerSearch from '@/app/components/PlayerSearch';
import SavedPreviewDebug from '@/app/components/SavedPreviewDebug';
import EmailPreviewModal from '@/app/components/EmailPreviewModal';

interface TestCard {
  id: string;
  playerName: string;
  position: string;
  year: number;
  brand: string;
  series: string;
  imageUrl: string;
  backImageUrl?: string;
  rarity: 'common' | 'rare' | 'legendary';
  price: number;
  shipping: number;
}

export default function AdminPreviewMaker() {
  const [teamName, setTeamName] = useState('Test Team');
  const [testCards, setTestCards] = useState<TestCard[]>([]);
  const [selectedPositions, setSelectedPositions] = useState<Record<number, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPreviews, setGeneratedPreviews] = useState<CompiledPreview[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [showCardBacks, setShowCardBacks] = useState(false);
  const [materialFilter, setMaterialFilter] = useState<string>('All');
  const [cardCountFilter, setCardCountFilter] = useState<string>('All');
  const [cardSizeAdjustment, setCardSizeAdjustment] = useState<number>(100); // Percentage adjustment
  const [cardSpacingAdjustment, setCardSpacingAdjustment] = useState<number>(100); // Percentage adjustment for spacing
  const [horizontalOffset, setHorizontalOffset] = useState<number>(0); // Pixels to move left/right
  const [verticalOffset, setVerticalOffset] = useState<number>(0); // Pixels to move up/down
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info' | null; message: string }>({
    type: null,
    message: ''
  });
  const [previewUpdateKey, setPreviewUpdateKey] = useState(0); // Force re-render when preview updates
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedPreviewForEmail, setSelectedPreviewForEmail] = useState<CompiledPreview | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to get saved preview for a specific plaque configuration
  const getSavedPreviewForPlaque = (plaqueType: string, plaqueStyle: string, isBackView?: boolean) => {
    try {
      const savedPreviews = JSON.parse(localStorage.getItem('savedPreviews') || '[]');
      
      const matchingPreview = savedPreviews.find((preview: any) => 
        preview.plaqueType === plaqueType && 
        preview.plaqueStyle === plaqueStyle &&
        (isBackView === undefined || preview.isBackView === isBackView)
      );
      
      return matchingPreview;
    } catch (error) {
      console.error('Error loading saved preview:', error);
      return null;
    }
  };

  // Generate all plaque options for each card count (4-10) and material
  const generatePlaqueOptions = () => {
    const materials = [
      {
        style: 'dark-maple-wood',
        name: 'Dark Maple Wood',
        basePrice: 89.99,
        pricePerSlot: 5,
        hasBackOption: false,
        description: 'Premium dark maple wood finish'
      },
      {
        style: 'clear-plaque',
        name: 'Clear Plaque',
        basePrice: 99.99,
        pricePerSlot: 6,
        hasBackOption: true,
        description: 'Crystal clear acrylic - shows front or back'
      },
      {
        style: 'black-marble',
        name: 'Black Marble',
        basePrice: 109.99,
        pricePerSlot: 7,
        hasBackOption: false,
        description: 'Elegant black marble finish'
      }
    ];

    const cardCounts = ['4', '5', '6', '7', '8', '9', '10'] as const;
    const options = [];

    for (const count of cardCounts) {
      for (const material of materials) {
        const slots = parseInt(count);
        const price = material.basePrice + (material.pricePerSlot * slots);
        
        // Calculate dimensions based on card count
        let dimensions = '16" x 12"'; // default
        if (slots <= 4) dimensions = '12" x 8"';
        else if (slots <= 6) dimensions = '14" x 10"';
        else if (slots >= 10) dimensions = '18" x 12"';

        // Always use the same base images - card sizing creates the illusion
        let imagePath = '/images/';
        if (material.style === 'dark-maple-wood') {
          imagePath += 'DarkMapleWood1.png';
        } else if (material.style === 'clear-plaque') {
          imagePath += 'ClearPlaque8.png';
        } else if (material.style === 'black-marble') {
          imagePath += 'BlackMarble8.png';
        }

        // Check if we have a saved preview for this configuration
        // For Clear Plaque, prefer front view but check for both
        let savedPreview = null;
        if (material.hasBackOption) {
          // Try to get front view first, then back view
          savedPreview = getSavedPreviewForPlaque(count, material.style, false) || 
                        getSavedPreviewForPlaque(count, material.style, true);
        } else {
          savedPreview = getSavedPreviewForPlaque(count, material.style);
        }
        const displayImage = savedPreview?.imageUrl || imagePath;

        options.push({
          id: `${material.style}-${count}`,
          plaqueType: count,
          style: material.style,
          name: `${material.name} Plaque (${count} Cards)`,
          description: `${material.description} with ${count} card slots`,
          image: displayImage,
          baseImage: imagePath,
          material: material.name,
          slots,
          dimensions,
          price: Math.round(price * 100) / 100,
          hasBackOption: material.hasBackOption,
          hasSavedPreview: !!savedPreview
        });
      }
    }

    return options;
  };

  const plaqueOptions = generatePlaqueOptions();

  const [selectedPlaqueOption, setSelectedPlaqueOption] = useState(plaqueOptions[0]);

  // Update plaqueType and plaqueStyle based on selection
  const plaqueType = selectedPlaqueOption.plaqueType;
  const plaqueStyle = selectedPlaqueOption.style;

  // Dynamic positions based on card count
  const getPositionsForCount = (count: string) => {
    const positionSets: Record<string, string[]> = {
      '4': ['QB', 'RB', 'WR1', 'WR2'],
      '5': ['QB', 'RB', 'WR1', 'WR2', 'TE'],
      '6': ['QB', 'RB', 'WR1', 'WR2', 'TE', 'K'],
      '7': ['QB', 'RB', 'WR1', 'WR2', 'TE', 'K', 'DEF'],
      '8': ['QB', 'RB', 'WR1', 'WR2', 'TE', 'K', 'DEF', 'FLEX'],
      '9': ['QB', 'RB1', 'RB2', 'WR1', 'WR2', 'TE', 'K', 'DEF', 'FLEX'],
      '10': ['QB', 'RB1', 'RB2', 'WR1', 'WR2', 'WR3', 'TE', 'K', 'DEF', 'FLEX']
    };
    return positionSets[count] || positionSets['8'];
  };

  const positions = getPositionsForCount(plaqueType);
  
  // Track if we're actively editing to prevent auto-loading
  const [isEditing, setIsEditing] = useState(false);
  const [lastLoadedLayout, setLastLoadedLayout] = useState<string | null>(null);

  // Force re-render when plaque selection changes to check for saved previews
  useEffect(() => {
    setPreviewUpdateKey(prev => prev + 1);
  }, [selectedPlaqueOption.plaqueType, selectedPlaqueOption.style, showCardBacks]);

  // Check for saved previews on mount
  useEffect(() => {
    const savedPreview = getSavedPreviewForPlaque(
      selectedPlaqueOption.plaqueType,
      selectedPlaqueOption.style,
      selectedPlaqueOption.hasBackOption && showCardBacks
    );
    if (savedPreview) {
      setPreviewUpdateKey(prev => prev + 1);
    }
  }, []);

  // Load saved complete layout when plaque selection changes
  useEffect(() => {
    // Don't auto-load if user is actively editing
    if (isEditing) return;
    
    const layoutKey = `${selectedPlaqueOption.plaqueType}-${selectedPlaqueOption.style}-${showCardBacks}`;
    
    // Don't reload the same layout
    if (layoutKey === lastLoadedLayout) return;
    
    const savedLayouts = JSON.parse(localStorage.getItem('completePlaqueLayouts') || '[]');
    const matchingLayout = savedLayouts.find((layout: any) => 
      layout.plaqueType === selectedPlaqueOption.plaqueType && 
      layout.plaqueStyle === selectedPlaqueOption.style &&
      layout.isBackView === (selectedPlaqueOption.hasBackOption && showCardBacks)
    );
    
    if (matchingLayout) {
      console.log('Loading saved layout:', matchingLayout);
      
      // Apply the saved layout
      setTeamName(matchingLayout.teamName || 'Test Team');
      setTestCards(matchingLayout.testCards || []);
      setSelectedPositions(matchingLayout.selectedPositions || {});
      setCardSizeAdjustment(matchingLayout.cardSizeAdjustment || 100);
      setCardSpacingAdjustment(matchingLayout.cardSpacingAdjustment || 100);
      setHorizontalOffset(matchingLayout.horizontalOffset || 0);
      setVerticalOffset(matchingLayout.verticalOffset || 0);
      
      setLastLoadedLayout(layoutKey);
      
      setStatus({ 
        type: 'info', 
        message: `Loaded saved layout for ${selectedPlaqueOption.slots} cards on ${selectedPlaqueOption.material}` 
      });
    } else {
      // Reset to defaults if no saved layout
      setTestCards([]);
      setSelectedPositions({});
      setCardSizeAdjustment(100);
      setCardSpacingAdjustment(100);
      setHorizontalOffset(0);
      setVerticalOffset(0);
      setLastLoadedLayout(null);
    }
  }, [selectedPlaqueOption, showCardBacks, isEditing]);

  const presetCards = [
    {
      id: 'preset-1',
      playerName: 'Tom Brady',
      position: 'QB',
      year: 2000,
      brand: 'Bowman',
      series: 'Chrome',
      imageUrl: '', // Will generate placeholder
      rarity: 'legendary' as const,
      price: 1250.00,
      shipping: 15.00
    },
    {
      id: 'preset-2',
      playerName: 'Patrick Mahomes',
      position: 'QB',
      year: 2017,
      brand: 'Panini',
      series: 'Prizm',
      imageUrl: '', // Will generate placeholder
      rarity: 'rare' as const,
      price: 850.00,
      shipping: 12.00
    },
    {
      id: 'preset-3',
      playerName: 'Travis Kelce',
      position: 'TE',
      year: 2013,
      brand: 'Topps',
      series: 'Chrome',
      imageUrl: '', // Will generate placeholder
      rarity: 'rare' as const,
      price: 325.00,
      shipping: 8.00
    },
    {
      id: 'preset-4',
      playerName: 'Tyreek Hill',
      position: 'WR',
      year: 2016,
      brand: 'Panini',
      series: 'Select',
      imageUrl: '', // Will generate placeholder
      rarity: 'common' as const,
      price: 125.00,
      shipping: 5.00
    }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    
    setIsEditing(true); // Mark as editing when adding cards

    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        const newCard: TestCard = {
          id: `upload-${Date.now()}-${index}`,
          playerName: `Test Player ${testCards.length + index + 1}`,
          position: positions[0],
          year: 2023,
          brand: 'Test Brand',
          series: 'Test Series',
          imageUrl,
          rarity: 'common',
          price: 50.00,
          shipping: 5.00
        };
        setTestCards(prev => [...prev, newCard]);
      };
      reader.readAsDataURL(file);
    });
  };

  const addPresetCard = (preset: typeof presetCards[0]) => {
    const newCard: TestCard = {
      ...preset,
      id: `preset-${Date.now()}-${Math.random()}`
    };
    setTestCards(prev => [...prev, newCard]);
  };

  const removeCard = (cardId: string) => {
    setTestCards(prev => prev.filter(card => card.id !== cardId));
    // Also remove from selected positions
    const newPositions = { ...selectedPositions };
    Object.keys(newPositions).forEach(key => {
      if (newPositions[parseInt(key)] === cardId) {
        delete newPositions[parseInt(key)];
      }
    });
    setSelectedPositions(newPositions);
  };

  const updateCard = (cardId: string, updates: Partial<TestCard>) => {
    setTestCards(prev => prev.map(card => 
      card.id === cardId ? { ...card, ...updates } : card
    ));
  };

  const handlePositionSelection = (positionIndex: number, cardId: string) => {
    setSelectedPositions(prev => ({
      ...prev,
      [positionIndex]: cardId
    }));
  };

  const generatePreview = async () => {
    if (!teamName.trim()) {
      setStatus({ type: 'error', message: 'Team name is required' });
      return;
    }

    const selectedCards = Object.values(selectedPositions)
      .map(cardId => testCards.find(card => card.id === cardId))
      .filter(Boolean) as TestCard[];

    if (selectedCards.length === 0) {
      setStatus({ type: 'error', message: 'Please assign at least one card to a position' });
      return;
    }

    setIsGenerating(true);
    setStatus({ type: 'info', message: 'Generating preview...' });

    try {
      const playerCards: PlayerCardData[] = selectedCards.map((card, index) => ({
        id: card.id,
        playerName: card.playerName,
        position: positions[Object.keys(selectedPositions).find(key => 
          selectedPositions[parseInt(key)] === card.id
        ) ? parseInt(Object.keys(selectedPositions).find(key => 
          selectedPositions[parseInt(key)] === card.id
        )!) : index],
        year: card.year,
        brand: card.brand,
        series: card.series,
        imageUrl: showCardBacks && selectedPlaqueOption.hasBackOption && card.backImageUrl 
          ? card.backImageUrl 
          : card.imageUrl,
        backImageUrl: card.backImageUrl,
        rarity: card.rarity,
        price: card.price,
        shipping: card.shipping
      }));

      const config: PlaqueConfiguration = {
        plaqueType: selectedPlaqueOption.plaqueType,
        plaqueStyle: selectedPlaqueOption.style,
        teamName,
        playerCards,
        showCardBacks: showCardBacks && selectedPlaqueOption.hasBackOption,
        layoutAdjustments: {
          cardSizeAdjustment,
          cardSpacingAdjustment,
          horizontalOffset,
          verticalOffset
        }
      };

      const preview = await previewMaker.generatePreview(config);
      setGeneratedPreviews(prev => [preview, ...prev]);
      
      // Save preview info to localStorage for plaque selection display
      const savedPreviews = JSON.parse(localStorage.getItem('savedPreviews') || '[]');
      const previewInfo = {
        plaqueType: selectedPlaqueOption.plaqueType,
        plaqueStyle: selectedPlaqueOption.style,
        imageUrl: preview.imageUrl,
        timestamp: new Date().toISOString(),
        isBackView: showCardBacks && selectedPlaqueOption.hasBackOption
      };
      
      
      // Remove any existing preview for this exact configuration
      const filteredPreviews = savedPreviews.filter((p: any) => 
        !(p.plaqueType === previewInfo.plaqueType && 
          p.plaqueStyle === previewInfo.plaqueStyle &&
          p.isBackView === previewInfo.isBackView)
      );
      
      // Add the new preview
      filteredPreviews.push(previewInfo);
      localStorage.setItem('savedPreviews', JSON.stringify(filteredPreviews));
      
      // Force re-render to update Selected Plaque display
      setPreviewUpdateKey(prev => prev + 1);
      
      setStatus({ type: 'success', message: 'Preview generated and saved! Check the Selected Plaque section.' });

    } catch (error) {
      console.error('Error generating preview:', error);
      setStatus({ type: 'error', message: 'Failed to generate preview. Please try again.' });
    } finally {
      setIsGenerating(false);
    }
  };

  const clearAll = () => {
    setTestCards([]);
    setSelectedPositions({});
    setStatus({ type: null, message: '' });
  };

  // Save current configuration
  const saveConfiguration = () => {
    const config = {
      id: Date.now().toString(),
      name: `${selectedPlaqueOption.material} - ${selectedPlaqueOption.slots} Cards`,
      teamName,
      plaqueOption: selectedPlaqueOption,
      testCards,
      selectedPositions,
      showCardBacks,
      createdAt: new Date().toISOString()
    };

    // Get existing saved configs
    const savedConfigs = JSON.parse(localStorage.getItem('previewMakerConfigs') || '[]');
    savedConfigs.push(config);
    localStorage.setItem('previewMakerConfigs', JSON.stringify(savedConfigs));

    setStatus({ type: 'success', message: 'Configuration saved successfully!' });
  };

  // Load saved configurations
  const loadConfiguration = (config: any) => {
    setTeamName(config.teamName);
    setSelectedPlaqueOption(config.plaqueOption);
    setTestCards(config.testCards);
    setSelectedPositions(config.selectedPositions);
    setShowCardBacks(config.showCardBacks);
    setStatus({ type: 'success', message: 'Configuration loaded successfully!' });
  };

  // Get saved configurations
  const [savedConfigurations, setSavedConfigurations] = useState<any[]>([]);
  useEffect(() => {
    const configs = JSON.parse(localStorage.getItem('previewMakerConfigs') || '[]');
    setSavedConfigurations(configs);
  }, []);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'rare': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="p-6 max-w-full mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">🎨 Preview Maker</h1>
        <p className="text-slate-600">Test and generate plaque previews with custom configurations</p>
      </div>

      {/* Plaque Selection */}
      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">🖼️ Choose Your Plaque Configuration</h2>
          
          {/* Material Filter */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-700 mb-3">Select Material:</h3>
            <div className="flex flex-wrap gap-3">
              {['All', 'Dark Maple Wood', 'Clear Plaque', 'Black Marble'].map((material) => (
                <button
                  key={material}
                  onClick={() => setMaterialFilter(material)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    materialFilter === material
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {material}
                </button>
              ))}
            </div>
          </div>

          {/* Card Count Filter */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-700 mb-3">Select Card Count:</h3>
            <div className="flex flex-wrap gap-2">
              {['All', '4', '5', '6', '7', '8', '9', '10'].map((count) => (
                <button
                  key={count}
                  onClick={() => {
                    setCardCountFilter(count);
                    // Auto-select the first plaque with this card count if not "All"
                    if (count !== 'All') {
                      const matchingPlaque = plaqueOptions.find(
                        option => option.plaqueType === count && 
                        (materialFilter === 'All' || option.material === materialFilter)
                      );
                      if (matchingPlaque) {
                        setSelectedPlaqueOption(matchingPlaque);
                      }
                    }
                  }}
                  className={`px-3 py-2 rounded-lg font-medium transition-all ${
                    cardCountFilter === count
                      ? 'bg-amber-600 text-white'
                      : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  }`}
                >
                  {count === 'All' ? 'All Sizes' : `${count} Cards`}
                </button>
              ))}
            </div>
          </div>
          
          {/* Filtered Plaque Options */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Selected Plaque Preview - Large */}
            <div className="lg:col-span-1">
              <div className="bg-blue-50 rounded-xl border-2 border-blue-500 p-4">
                <h4 className="font-semibold text-blue-800 mb-3 text-center">Selected Plaque</h4>
                {getSavedPreviewForPlaque(
                  selectedPlaqueOption.plaqueType,
                  selectedPlaqueOption.style,
                  selectedPlaqueOption.hasBackOption && showCardBacks
                ) && (
                  <div className="mb-2 text-center">
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Using Saved Preview
                    </span>
                  </div>
                )}
                <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
                  {(() => {
                    // Check for saved preview first
                    const savedPreview = getSavedPreviewForPlaque(
                      selectedPlaqueOption.plaqueType,
                      selectedPlaqueOption.style,
                      selectedPlaqueOption.hasBackOption && showCardBacks
                    );
                    const imageSrc = savedPreview?.imageUrl || selectedPlaqueOption.baseImage || selectedPlaqueOption.image;
                    
                    return (
                      <img
                        key={`selected-plaque-${previewUpdateKey}-${Date.now()}`}
                        src={`${imageSrc}?t=${previewUpdateKey}`}
                        alt={selectedPlaqueOption.name}
                        className="absolute inset-0 w-full h-full object-contain"
                        onError={(e) => {
                          console.error('Image failed to load:', imageSrc);
                          e.currentTarget.src = selectedPlaqueOption.baseImage || selectedPlaqueOption.image;
                        }}
                      />
                    );
                  })()}
                  {/* Overlay card positions - only show if not using saved preview */}
                  {!getSavedPreviewForPlaque(
                    selectedPlaqueOption.plaqueType,
                    selectedPlaqueOption.style,
                    selectedPlaqueOption.hasBackOption && showCardBacks
                  ) && (
                    <div className="absolute inset-0 pointer-events-none">
                      {(() => {
                        const layout = previewMaker.getCardPositions(selectedPlaqueOption.plaqueType);
                        const xavierWorthyCardUrl = 'https://wdwbkuhanclpkbgxgwdg.supabase.co/storage/v1/object/public/card-images/card-images/xavier_worthy_2025_cc1af96a-8680-474e-9f0a-911a98495fe3.jpg';
                        
                        return Array.from({ length: parseInt(selectedPlaqueOption.plaqueType) }).map((_, i) => {
                        const pos = layout.positions[i];
                        
                        const leftPercent = (pos.x / layout.imageWidth) * 100;
                        const topPercent = (pos.y / layout.imageHeight) * 100;
                        const widthPercent = (pos.width / layout.imageWidth) * 100;
                        const heightPercent = (pos.height / layout.imageHeight) * 100;
                        
                        return (
                          <div
                            key={i}
                            className="absolute overflow-hidden opacity-90 shadow-md"
                            style={{
                              left: `${leftPercent}%`,
                              top: `${topPercent}%`,
                              width: `${widthPercent}%`,
                              height: `${heightPercent}%`,
                            }}
                          >
                            <img
                              src={xavierWorthyCardUrl}
                              alt="Player Card"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        );
                      });
                    })()}
                  </div>
                  )}
                </div>
                <div className="mt-3 text-center">
                  <h3 className="font-bold text-lg text-slate-800">{selectedPlaqueOption.slots} Cards</h3>
                  <p className="text-sm text-slate-600">{selectedPlaqueOption.material}</p>
                  <p className="text-xl font-bold text-green-600 mt-1">${selectedPlaqueOption.price}</p>
                </div>
              </div>
            </div>
            
            {/* All Options Grid - Smaller */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto p-1">
                {plaqueOptions
                  .filter(option => {
                    const materialMatch = materialFilter === 'All' || option.material === materialFilter;
                    const countMatch = cardCountFilter === 'All' || option.plaqueType === cardCountFilter;
                    return materialMatch && countMatch;
                  })
                  .map((option) => (
                  <div
                    key={option.id}
                    onClick={() => setSelectedPlaqueOption(option)}
                    className={`cursor-pointer rounded-lg border-2 transition-all ${
                      selectedPlaqueOption.id === option.id
                        ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                    }`}
                  >
                    <div className="p-2">
                      <div className="relative w-full h-20 rounded overflow-hidden bg-slate-100 mb-1">
                        <Image
                          key={`grid-${option.id}-${previewUpdateKey}`}
                          src={(() => {
                            const savedPreview = getSavedPreviewForPlaque(
                              option.plaqueType,
                              option.style,
                              option.hasBackOption && showCardBacks
                            );
                            return savedPreview?.imageUrl || option.baseImage || option.image;
                          })()}
                          alt={option.name}
                          fill
                          className="object-cover"
                        />
                        {getSavedPreviewForPlaque(option.plaqueType, option.style, option.hasBackOption && showCardBacks) && (
                          <div className="absolute top-1 right-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          </div>
                        )}
                      </div>
                      <h3 className="font-bold text-xs text-slate-800">{option.slots} Cards</h3>
                      <p className="text-xs text-slate-600">{option.material}</p>
                      <p className="text-sm font-bold text-green-600">${option.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card Back Option for Clear Plaque */}
          {selectedPlaqueOption.hasBackOption && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-800">🔄 Card Display Option</h4>
                  <p className="text-sm text-slate-600">
                    Choose whether to show card fronts or backs in your clear plaque
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="cardSide"
                      checked={!showCardBacks}
                      onChange={() => setShowCardBacks(false)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm font-medium">Card Fronts</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="cardSide"
                      checked={showCardBacks}
                      onChange={() => setShowCardBacks(true)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm font-medium">Card Backs</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Message */}
      {status.message && (
        <div className={`mb-6 p-4 rounded-lg border ${
          status.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
          status.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
          'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          <div className="flex items-center space-x-2">
            <span className="text-lg">
              {status.type === 'success' ? '✅' : 
               status.type === 'error' ? '❌' : '🔄'}
            </span>
            <span className="font-medium">{status.message}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        {/* Configuration Panel */}
        <div className="xl:col-span-3 space-y-6">
          {/* Selected Plaque Info */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">⚙️ Selected Plaque Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Team Name
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter team name"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Selected Plaque
                </label>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-lg font-semibold text-blue-800">
                    {selectedPlaqueOption.name}
                  </div>
                  <div className="text-sm text-blue-600 mb-2">
                    {selectedPlaqueOption.description}
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <div><span className="font-medium">Material:</span> {selectedPlaqueOption.material}</div>
                    <div><span className="font-medium">Dimensions:</span> {selectedPlaqueOption.dimensions}</div>
                    <div><span className="font-medium">Card Slots:</span> {selectedPlaqueOption.slots}</div>
                    <div className="text-green-600 font-bold">${selectedPlaqueOption.price}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card Management */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-800">🃏 Test Cards</h3>
              <div className="flex space-x-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  📁 Upload Images
                </button>
                <button
                  onClick={clearAll}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  🗑️ Clear All
                </button>
              </div>
            </div>

            {/* Search for Player */}
            <div className="mb-6">
              <h4 className="font-semibold text-slate-700 mb-3">🔍 Search for Player:</h4>
              <div className="max-w-md">
                                  <PlayerSearch
                    value={searchValue}
                    onChange={(playerName, card) => {
                      setSearchValue(playerName);
                      if (card) {
                        // Create a new card with actual card data from inventory
                        const newCard: TestCard = {
                          id: `search-${Date.now()}`,
                          playerName: card.playerName,
                          position: card.position || 'N/A',
                          year: typeof card.year === 'string' ? parseInt(card.year) : card.year,
                          brand: card.brand,
                          series: card.series,
                          imageUrl: card.imageUrl || '', // Use actual card image
                          backImageUrl: card.backImageUrl || '', // Use actual card back image
                          rarity: card.rookieCard ? 'legendary' : 'common',
                          price: 25.00, // Default price for preview
                          shipping: 3.00
                        };
                        setTestCards(prev => [...prev, newCard]);
                        setSearchValue(''); // Clear search after selection
                      }
                    }}
                  placeholder="Type player name (e.g. Xavier Worthy)..."
                  className="bg-white"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Start typing to search cards from your inventory
                </p>
              </div>
            </div>

            {/* Preset Cards */}
            <div className="mb-6">
              <h4 className="font-semibold text-slate-700 mb-3">Quick Add Preset Cards:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {presetCards.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => addPresetCard(preset)}
                    className="p-2 bg-slate-100 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    + {preset.playerName}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Fill Options */}
            <div className="mb-6">
              <h4 className="font-semibold text-slate-700 mb-3">Quick Fill Actions:</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    // Add cards for all positions
                    const numCards = parseInt(plaqueType);
                    for (let i = 0; i < numCards && i < presetCards.length; i++) {
                      addPresetCard(presetCards[i % presetCards.length]);
                    }
                  }}
                  className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                >
                  Fill All Slots
                </button>
                <button
                  onClick={() => {
                    // Auto-assign all cards to positions
                    const newPositions: Record<number, string> = {};
                    testCards.forEach((card, index) => {
                      if (index < positions.length) {
                        newPositions[index] = card.id;
                      }
                    });
                    setSelectedPositions(newPositions);
                  }}
                  className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                >
                  Auto-Assign All
                </button>
                <button
                  onClick={() => setSelectedPositions({})}
                  className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-200 transition-colors"
                >
                  Clear Assignments
                </button>
              </div>
            </div>

            {/* Cards List */}
            {testCards.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-700">Available Cards ({testCards.length}):</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {testCards.map((card) => (
                    <div key={card.id} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-16 h-22 bg-slate-100 rounded flex-shrink-0 overflow-hidden">
                          {card.imageUrl && (
                            <Image
                              src={card.imageUrl}
                              alt={card.playerName}
                              width={64}
                              height={88}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <PlayerSearch
                            value={card.playerName}
                            onChange={(playerName, selectedCard) => {
                              const updates: Partial<TestCard> = { playerName };
                              // If a card is selected from search, update relevant fields
                              if (selectedCard) {
                                updates.position = selectedCard.position || card.position;
                                updates.year = typeof selectedCard.year === 'string' 
                                  ? parseInt(selectedCard.year) 
                                  : selectedCard.year;
                                updates.brand = selectedCard.brand;
                                updates.series = selectedCard.series;
                                updates.imageUrl = selectedCard.imageUrl || card.imageUrl;
                                updates.backImageUrl = selectedCard.backImageUrl || card.backImageUrl;
                                updates.rarity = selectedCard.rookieCard ? 'legendary' : 'common';
                              }
                              updateCard(card.id, updates);
                            }}
                            placeholder="Search for player..."
                            className="font-semibold text-slate-800 bg-transparent border-none p-0 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
                          />
                          <div className="text-sm text-slate-600">
                            {card.year} {card.brand} {card.series}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`px-2 py-1 rounded text-xs font-medium border ${getRarityColor(card.rarity)}`}>
                              {card.rarity}
                            </span>
                            <span className="text-sm font-medium text-green-600">
                              ${card.price.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeCard(card.id)}
                          className="text-red-600 hover:text-red-800 font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Position Assignment */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">🎯 Position Assignment</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {positions.map((position, index) => (
                <div key={position} className="border border-slate-200 rounded-lg p-3">
                  <div className="font-semibold text-slate-700 mb-2">{position}</div>
                  <select
                    value={selectedPositions[index] || ''}
                    onChange={(e) => handlePositionSelection(index, e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Select card...</option>
                    {testCards.map((card) => (
                      <option key={card.id} value={card.id}>
                        {card.playerName}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Generate Preview */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <div className="flex gap-4">
              <button
                onClick={generatePreview}
                disabled={isGenerating || Object.keys(selectedPositions).length === 0}
                className={`flex-1 py-4 text-lg font-bold rounded-xl transition-all ${
                  !isGenerating && Object.keys(selectedPositions).length > 0
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.02]'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Generating Preview...</span>
                  </div>
                ) : (
                  '🎨 Generate Preview'
                )}
              </button>
              <button
                onClick={saveConfiguration}
                disabled={Object.keys(selectedPositions).length === 0}
                className="px-6 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                💾 Save Config
              </button>
            </div>
          </div>

          {/* Saved Configurations */}
          {savedConfigurations.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4">📁 Saved Configurations</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {savedConfigurations.map((config) => (
                  <div key={config.id} className="border border-slate-200 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800">{config.name}</div>
                      <div className="text-sm text-slate-600">
                        {config.teamName} • {new Date(config.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => loadConfiguration(config)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => {
                          const configs = savedConfigurations.filter(c => c.id !== config.id);
                          localStorage.setItem('previewMakerConfigs', JSON.stringify(configs));
                          setSavedConfigurations(configs);
                        }}
                        className="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Large Preview Area */}
        <div className="xl:col-span-2 space-y-6">
          {/* Current Plaque Preview */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">
              🖼️ Plaque Preview
            </h3>
            
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4">
              {/* Plaque Layout Visual */}
              <div className="w-full max-w-md mx-auto mb-4">
                <div className="bg-white rounded-lg shadow-lg p-4">
                  <div className="text-center mb-3">
                    <h5 className="font-semibold text-slate-700">Card Layout Preview</h5>
                    <p className="text-xs text-slate-500">{selectedPlaqueOption.slots} Card Configuration</p>
                  </div>
                  {/* View toggle for Clear Plaque */}
                  {selectedPlaqueOption.hasBackOption && (
                    <div className="mb-4 flex justify-center">
                      <div className="bg-purple-100 rounded-lg p-1 flex gap-1">
                        <button
                          onClick={() => setShowCardBacks(false)}
                          className={`px-4 py-2 rounded-md font-medium transition-all ${
                            !showCardBacks 
                              ? 'bg-white text-purple-700 shadow-sm' 
                              : 'text-purple-600 hover:text-purple-700'
                          }`}
                        >
                          Front View
                        </button>
                        <button
                          onClick={() => setShowCardBacks(true)}
                          className={`px-4 py-2 rounded-md font-medium transition-all ${
                            showCardBacks 
                              ? 'bg-white text-purple-700 shadow-sm' 
                              : 'text-purple-600 hover:text-purple-700'
                          }`}
                        >
                          Back View
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Real plaque image with overlaid card positions */}
                  <div className="relative w-full">
                    <Image
                      src={selectedPlaqueOption.image}
                      alt={selectedPlaqueOption.name}
                      width={400}
                      height={300}
                      className="w-full h-auto object-contain rounded-lg"
                      style={selectedPlaqueOption.hasBackOption && showCardBacks ? { transform: 'scaleX(-1)' } : {}}
                    />
                    {/* Overlay actual card images */}
                    <div className="absolute inset-0 pointer-events-none" style={selectedPlaqueOption.hasBackOption && showCardBacks ? { transform: 'scaleX(-1)' } : {}}>
                      {(() => {
                        // Get card positions for this layout
                        const layout = previewMaker.getCardPositions(plaqueType);
                        
                        // Xavier Worthy card image URLs
                        const xavierWorthyCardUrl = 'https://wdwbkuhanclpkbgxgwdg.supabase.co/storage/v1/object/public/card-images/card-images/xavier_worthy_2025_cc1af96a-8680-474e-9f0a-911a98495fe3.jpg';
                        
                        // For card back, we'll create a data URL with a simple design
                        const createCardBackDataUrl = () => {
                          const canvas = document.createElement('canvas');
                          canvas.width = 300;
                          canvas.height = 420;
                          const ctx = canvas.getContext('2d');
                          
                          // Background gradient
                          const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
                          gradient.addColorStop(0, '#1a1a2e');
                          gradient.addColorStop(1, '#16213e');
                          ctx.fillStyle = gradient;
                          ctx.fillRect(0, 0, canvas.width, canvas.height);
                          
                          // Border
                          ctx.strokeStyle = '#eab308';
                          ctx.lineWidth = 8;
                          ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
                          
                          // Center logo/text
                          ctx.fillStyle = '#eab308';
                          ctx.font = 'bold 24px Arial';
                          ctx.textAlign = 'center';
                          ctx.fillText('ROSTER', canvas.width / 2, canvas.height / 2 - 20);
                          ctx.fillText('FRAME', canvas.width / 2, canvas.height / 2 + 20);
                          
                          // Stats area
                          ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                          ctx.fillRect(30, canvas.height - 150, canvas.width - 60, 120);
                          
                          ctx.fillStyle = '#ffffff';
                          ctx.font = '12px Arial';
                          ctx.textAlign = 'left';
                          ctx.fillText('PLAYER STATS', 40, canvas.height - 130);
                          ctx.fillText('• Yards: 1,245', 40, canvas.height - 105);
                          ctx.fillText('• TDs: 12', 40, canvas.height - 85);
                          ctx.fillText('• Rec: 87', 40, canvas.height - 65);
                          ctx.fillText('• Avg: 14.3', 40, canvas.height - 45);
                          
                          return canvas.toDataURL();
                        };
                        
                        const cardBackUrl = createCardBackDataUrl();
                        
                        return Array.from({ length: parseInt(plaqueType) }).map((_, i) => {
                          const pos = layout.positions[i];
                          const isSelected = selectedPositions[i];
                          
                          // Calculate spacing adjustments as percentages
                          let spacingXPercent = 0;
                          let spacingYPercent = 0;
                          
                          // Determine row and column for this card
                          if (plaqueType === '4') {
                            // Single row: adjust horizontal spacing from left
                            spacingXPercent = i * (cardSpacingAdjustment - 100) * 0.15;
                          } else if (plaqueType === '5') {
                            // 3-2 layout
                            if (i < 3) {
                              spacingXPercent = i * (cardSpacingAdjustment - 100) * 0.15;
                            } else {
                              spacingXPercent = (i - 3) * (cardSpacingAdjustment - 100) * 0.15 + (cardSpacingAdjustment - 100) * 0.075;
                              spacingYPercent = (cardSpacingAdjustment - 100) * 0.2;
                            }
                          } else if (plaqueType === '6') {
                            // 3x2 grid
                            const row = Math.floor(i / 3);
                            const col = i % 3;
                            spacingXPercent = col * (cardSpacingAdjustment - 100) * 0.15;
                            spacingYPercent = row * (cardSpacingAdjustment - 100) * 0.2;
                          } else if (plaqueType === '7') {
                            // Pyramid: 3-3-1
                            if (i < 3) {
                              spacingXPercent = i * (cardSpacingAdjustment - 100) * 0.15;
                            } else if (i < 6) {
                              spacingXPercent = (i - 3) * (cardSpacingAdjustment - 100) * 0.15;
                              spacingYPercent = (cardSpacingAdjustment - 100) * 0.2;
                            } else {
                              spacingXPercent = (cardSpacingAdjustment - 100) * 0.075;
                              spacingYPercent = (cardSpacingAdjustment - 100) * 0.4;
                            }
                          } else if (plaqueType === '8') {
                            // 4x2 grid
                            const row = Math.floor(i / 4);
                            const col = i % 4;
                            spacingXPercent = col * (cardSpacingAdjustment - 100) * 0.15;
                            spacingYPercent = row * (cardSpacingAdjustment - 100) * 0.3;
                          } else if (plaqueType === '9') {
                            // 3x3 grid
                            const row = Math.floor(i / 3);
                            const col = i % 3;
                            spacingXPercent = col * (cardSpacingAdjustment - 100) * 0.15;
                            spacingYPercent = row * (cardSpacingAdjustment - 100) * 0.2;
                          } else if (plaqueType === '10') {
                            // 5x2 grid
                            const row = Math.floor(i / 5);
                            const col = i % 5;
                            spacingXPercent = col * (cardSpacingAdjustment - 100) * 0.1;
                            spacingYPercent = row * (cardSpacingAdjustment - 100) * 0.2;
                          }
                          
                          // Convert positions to percentages
                          const leftPercent = (pos.x / layout.imageWidth) * 100;
                          const topPercent = (pos.y / layout.imageHeight) * 100;
                          const widthPercent = (pos.width / layout.imageWidth) * 100;
                          const heightPercent = (pos.height / layout.imageHeight) * 100;
                          
                          // Apply offsets as percentages
                          const horizontalOffsetPercent = (horizontalOffset / layout.imageWidth) * 100;
                          const verticalOffsetPercent = (verticalOffset / layout.imageHeight) * 100;
                          
                          return (
                            <div
                              key={i}
                              className={`absolute overflow-hidden transition-all duration-200 ${
                                isSelected 
                                  ? 'ring-2 ring-green-400 shadow-xl transform scale-105' 
                                  : 'opacity-90 shadow-md'
                              }`}
                              style={{
                                left: `${leftPercent + spacingXPercent + horizontalOffsetPercent}%`,
                                top: `${topPercent + spacingYPercent + verticalOffsetPercent}%`,
                                width: `${widthPercent * (cardSizeAdjustment / 100)}%`,
                                height: `${heightPercent * (cardSizeAdjustment / 100)}%`,
                                boxShadow: isSelected 
                                  ? '0 10px 30px rgba(0, 0, 0, 0.3)' 
                                  : '0 4px 10px rgba(0, 0, 0, 0.2)',
                              }}
                            >
                              <img
                                src={selectedPlaqueOption.hasBackOption && showCardBacks ? cardBackUrl : xavierWorthyCardUrl}
                                alt="Player Card"
                                className="w-full h-full object-cover"
                                style={selectedPlaqueOption.hasBackOption && showCardBacks ? { transform: 'scaleX(-1)' } : {}}
                              />
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                  
                  {/* Card size controls and info */}
                  <div className="mt-4 space-y-3">
                      {/* Card size adjustment */}
                      <div className="bg-slate-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-semibold text-slate-700">
                          Card Size Adjustment
                        </label>
                        <span className="text-sm font-medium text-blue-600">
                          {cardSizeAdjustment}%
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setCardSizeAdjustment(Math.max(50, cardSizeAdjustment - 5))}
                          className="px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded text-sm font-medium"
                        >
                          -
                        </button>
                        <input
                          type="range"
                          min="50"
                          max="150"
                          value={cardSizeAdjustment}
                          onChange={(e) => setCardSizeAdjustment(parseInt(e.target.value))}
                          className="flex-1"
                        />
                        <button
                          onClick={() => setCardSizeAdjustment(Math.min(150, cardSizeAdjustment + 5))}
                          className="px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded text-sm font-medium"
                        >
                          +
                        </button>
                        <button
                          onClick={() => setCardSizeAdjustment(100)}
                          className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-sm font-medium"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                    
                    {/* Padding/Spacing adjustment */}
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-semibold text-slate-700">
                          Card Spacing Adjustment
                        </label>
                        <span className="text-sm font-medium text-purple-600">
                          {cardSpacingAdjustment}%
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setCardSpacingAdjustment(Math.max(50, cardSpacingAdjustment - 5))}
                          className="px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded text-sm font-medium"
                        >
                          -
                        </button>
                        <input
                          type="range"
                          min="50"
                          max="150"
                          value={cardSpacingAdjustment}
                          onChange={(e) => setCardSpacingAdjustment(parseInt(e.target.value))}
                          className="flex-1"
                        />
                        <button
                          onClick={() => setCardSpacingAdjustment(Math.min(150, cardSpacingAdjustment + 5))}
                          className="px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded text-sm font-medium"
                        >
                          +
                        </button>
                        <button
                          onClick={() => setCardSpacingAdjustment(100)}
                          className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded text-sm font-medium"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                    
                    {/* Position adjustment */}
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="mb-2">
                        <label className="text-sm font-semibold text-slate-700">
                          Position Adjustment
                        </label>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {/* Up button */}
                        <div></div>
                        <button
                          onClick={() => setVerticalOffset(verticalOffset - 5)}
                          className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium flex items-center justify-center"
                        >
                          ↑
                        </button>
                        <div></div>
                        
                        {/* Left button */}
                        <button
                          onClick={() => setHorizontalOffset(horizontalOffset - 5)}
                          className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium flex items-center justify-center"
                        >
                          ←
                        </button>
                        
                        {/* Center/Reset button */}
                        <button
                          onClick={() => {
                            setHorizontalOffset(0);
                            setVerticalOffset(0);
                          }}
                          className="px-3 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded text-sm font-medium"
                        >
                          Center
                        </button>
                        
                        {/* Right button */}
                        <button
                          onClick={() => setHorizontalOffset(horizontalOffset + 5)}
                          className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium flex items-center justify-center"
                        >
                          →
                        </button>
                        
                        {/* Down button */}
                        <div></div>
                        <button
                          onClick={() => setVerticalOffset(verticalOffset + 5)}
                          className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium flex items-center justify-center"
                        >
                          ↓
                        </button>
                        <div></div>
                      </div>
                      <div className="text-center mt-2 text-xs text-slate-600">
                        X: {horizontalOffset}px, Y: {verticalOffset}px
                      </div>
                    </div>
                    
                    {/* Card size info */}
                    <p className="text-xs text-slate-600 text-center">
                      Card Size: {
                        plaqueType === '4' ? 'Extra Large' :
                        plaqueType === '5' ? 'Large' :
                        plaqueType === '6' ? 'Medium' :
                        plaqueType === '7' ? 'Small' :
                        plaqueType === '8' ? 'Standard' :
                        plaqueType === '9' ? 'Small' :
                        'Extra Small'
                      } ({Math.round((parseInt(plaqueType) === 8 ? 100 : 
                        parseInt(plaqueType) === 4 ? 92 :
                        parseInt(plaqueType) === 5 ? 83 :
                        parseInt(plaqueType) === 6 ? 75 :
                        parseInt(plaqueType) === 7 ? 67 :
                        parseInt(plaqueType) === 9 ? 63 :
                        58) * cardSizeAdjustment / 100)}% of standard)
                    </p>
                  </div>
                  
                  {/* Save layout button */}
                  <div className="mt-4 space-y-2">
                    <button
                      onClick={() => {
                        console.log('Saving layout with:', {
                          testCards: testCards.length,
                          selectedPositions,
                          plaqueType,
                          plaqueStyle: selectedPlaqueOption.style
                        });
                        
                        // Create complete layout configuration including card data
                        const layoutConfig = {
                          id: Date.now().toString(),
                          plaqueType,
                          plaqueStyle: selectedPlaqueOption.style,
                          material: selectedPlaqueOption.material,
                          teamName,
                          // Card placement data
                          testCards,
                          selectedPositions,
                          // Layout adjustments
                          cardSizeAdjustment,
                          cardSpacingAdjustment,
                          horizontalOffset,
                          verticalOffset,
                          isBackView: selectedPlaqueOption.hasBackOption && showCardBacks,
                          timestamp: new Date().toISOString()
                        };
                        
                        try {
                          // Save complete layout to localStorage
                          const savedLayouts = JSON.parse(localStorage.getItem('completePlaqueLayouts') || '[]');
                          
                          // Remove any existing layout for this exact plaque configuration
                          const filteredLayouts = savedLayouts.filter((layout: any) => 
                            !(layout.plaqueType === layoutConfig.plaqueType && 
                              layout.plaqueStyle === layoutConfig.plaqueStyle &&
                              layout.isBackView === layoutConfig.isBackView)
                          );
                          
                          // Add the new layout
                          filteredLayouts.push(layoutConfig);
                          localStorage.setItem('completePlaqueLayouts', JSON.stringify(filteredLayouts));
                          
                          // Update the last loaded layout key to prevent reload
                          const layoutKey = `${layoutConfig.plaqueType}-${layoutConfig.plaqueStyle}-${layoutConfig.isBackView}`;
                          setLastLoadedLayout(layoutKey);
                          setIsEditing(false);
                          
                          console.log('Layout saved successfully:', layoutConfig);
                          console.log('Total saved layouts:', filteredLayouts.length);
                          
                          // Also save just the adjustments for backward compatibility
                          const adjustmentsOnly = {
                            plaqueType,
                            plaqueStyle: selectedPlaqueOption.style,
                            material: selectedPlaqueOption.material,
                            cardSizeAdjustment,
                            cardSpacingAdjustment,
                            horizontalOffset,
                            verticalOffset,
                            isBackView: selectedPlaqueOption.hasBackOption && showCardBacks,
                            timestamp: new Date().toISOString()
                          };
                          const savedAdjustments = JSON.parse(localStorage.getItem('plaqueLayouts') || '[]');
                          savedAdjustments.push(adjustmentsOnly);
                          localStorage.setItem('plaqueLayouts', JSON.stringify(savedAdjustments));
                          
                          setStatus({ 
                            type: 'success', 
                            message: `Complete layout saved: ${selectedPlaqueOption.slots} cards on ${selectedPlaqueOption.material} with ${testCards.length} cards` 
                          });
                        } catch (error) {
                          console.error('Error saving layout:', error);
                          setStatus({ 
                            type: 'error', 
                            message: 'Failed to save layout. Please try again.' 
                          });
                        }
                      }}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                      💾 Save This Layout Configuration {selectedPlaqueOption.hasBackOption && showCardBacks ? '(Back View)' : '(Front View)'}
                    </button>
                    
                    {/* View saved layouts button */}
                    <button
                      onClick={() => {
                        const savedLayouts = JSON.parse(localStorage.getItem('completePlaqueLayouts') || '[]');
                        const layoutsForThisPlaque = savedLayouts.filter((layout: any) => 
                          layout.plaqueType === selectedPlaqueOption.plaqueType && 
                          layout.plaqueStyle === selectedPlaqueOption.style
                        );
                        
                        if (layoutsForThisPlaque.length > 0) {
                          const layoutInfo = layoutsForThisPlaque.map((layout: any) => 
                            `${layout.isBackView ? 'Back' : 'Front'} view - ${layout.testCards.length} cards - ${new Date(layout.timestamp).toLocaleDateString()}`
                          ).join('\n');
                          
                          setStatus({ 
                            type: 'info', 
                            message: `Saved layouts for this plaque:\n${layoutInfo}` 
                          });
                        } else {
                          setStatus({ 
                            type: 'info', 
                            message: 'No saved layouts for this plaque configuration yet' 
                          });
                        }
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                      📋 View Saved Layouts
                    </button>
                    
                    {/* Info about saved layouts */}
                    <div className="text-xs text-center text-slate-600">
                      <p>Saved layouts will automatically load when you select</p>
                      <p>this plaque configuration with matching card placements</p>
                      {selectedPlaqueOption.hasBackOption && (
                        <p className="text-purple-600 font-medium mt-1">
                          Note: Front and back views are saved separately
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <h4 className="text-lg font-bold text-slate-800">{selectedPlaqueOption.name}</h4>
                <p className="text-slate-600 text-sm">{selectedPlaqueOption.description}</p>
                <div className="flex justify-center items-center space-x-4 mt-2 text-sm text-slate-500">
                  <span>{selectedPlaqueOption.material}</span>
                  <span>•</span>
                  <span>{selectedPlaqueOption.dimensions}</span>
                  <span>•</span>
                  <span className="font-bold text-green-600">${selectedPlaqueOption.price}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Generated Previews */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">
              📸 Generated Previews ({generatedPreviews.length})
            </h3>
            
            {generatedPreviews.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <div className="text-6xl mb-4">📷</div>
                <p className="text-lg font-medium mb-2">No previews generated yet</p>
                <p className="text-sm">Configure your cards and generate a preview to see the final result</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {generatedPreviews.map((preview, index) => (
                  <div key={preview.previewId} className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="aspect-[4/3] bg-slate-100">
                      <Image
                        src={preview.imageUrl}
                        alt={`Preview ${index + 1}`}
                        width={400}
                        height={300}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="p-3">
                      <div className="font-semibold text-slate-800">{preview.configuration.teamName}</div>
                      <div className="text-sm text-slate-600">
                        {preview.configuration.plaqueType}-spot • {preview.configuration.plaqueStyle}
                      </div>
                      <div className="text-sm text-slate-500">
                        {preview.configuration.playerCards.length} cards
                      </div>
                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={() => {
                            setSelectedPreviewForEmail(preview);
                            setShowEmailModal(true);
                          }}
                          className="flex-1 bg-green-600 text-white text-center py-2 px-3 rounded text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                          📧 Email
                        </button>
                        <a
                          href={preview.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-blue-600 text-white text-center py-2 px-3 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          📥 Download
                        </a>
                        <button
                          onClick={() => setGeneratedPreviews(prev => prev.filter(p => p.previewId !== preview.previewId))}
                          className="bg-red-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-red-700 transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Debug Panel */}
      <div className="fixed bottom-4 right-4 bg-black bg-opacity-90 text-white p-4 rounded-lg max-w-xs z-50">
        <h4 className="font-bold mb-2 text-yellow-400">🔧 Debug Save System</h4>
        <div className="text-xs space-y-1">
          <div>Plaque: {selectedPlaqueOption.material} ({selectedPlaqueOption.plaqueType} cards)</div>
          <div>Cards Added: {testCards.length}</div>
          <div>Cards Assigned: {Object.keys(selectedPositions).length}</div>
          <div>Editing Mode: {isEditing ? '✅ Yes' : '❌ No'}</div>
          <div className="mt-3 space-y-2">
            <button
              onClick={() => {
                const saved = localStorage.getItem('completePlaqueLayouts');
                const layouts = saved ? JSON.parse(saved) : [];
                const currentLayout = layouts.find((l: any) => 
                  l.plaqueType === selectedPlaqueOption.plaqueType && 
                  l.plaqueStyle === selectedPlaqueOption.style
                );
                console.log('All saved layouts:', layouts);
                console.log('Current plaque saved data:', currentLayout);
                alert(`Total saved layouts: ${layouts.length}\n` +
                      `Current plaque has saved data: ${currentLayout ? 'Yes' : 'No'}\n` +
                      `Check console for details.`);
              }}
              className="w-full bg-blue-500 px-2 py-1 rounded text-xs hover:bg-blue-600"
            >
              🔍 Check Saved Layouts
            </button>
            <button
              onClick={() => {
                if (confirm('Clear all saved layouts?')) {
                  localStorage.removeItem('completePlaqueLayouts');
                  localStorage.removeItem('plaqueLayouts');
                  setStatus({ type: 'info', message: 'All saved layouts cleared!' });
                }
              }}
              className="w-full bg-red-500 px-2 py-1 rounded text-xs hover:bg-red-600"
            >
              🗑️ Clear All Saved Data
            </button>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="w-full bg-purple-500 px-2 py-1 rounded text-xs hover:bg-purple-600"
            >
              {isEditing ? '🔓 Unlock Auto-Load' : '🔒 Lock for Editing'}
            </button>
          </div>
        </div>
      </div>
      <SavedPreviewDebug />
      
      {/* Email Modal */}
      {showEmailModal && selectedPreviewForEmail && (
        <EmailPreviewModal
          isOpen={showEmailModal}
          onClose={() => {
            setShowEmailModal(false);
            setSelectedPreviewForEmail(null);
          }}
          previewData={{
            imageUrl: selectedPreviewForEmail.imageUrl,
            teamName: selectedPreviewForEmail.configuration.teamName,
            plaqueType: selectedPreviewForEmail.configuration.plaqueType,
            plaqueStyle: selectedPreviewForEmail.configuration.plaqueStyle,
          }}
        />
      )}
    </div>
  );
} 