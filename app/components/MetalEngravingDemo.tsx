'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

// Font options for engraving
const ENGRAVING_FONTS = [
  { id: 'serif', name: 'Classic Serif', className: 'font-serif' },
  { id: 'sans', name: 'Modern Sans', className: 'font-sans' },
  { id: 'script', name: 'Elegant Script', style: { fontFamily: 'Brush Script MT, cursive' } },
  { id: 'georgia', name: 'Georgia', style: { fontFamily: 'Georgia, serif' } },
  { id: 'times', name: 'Times New Roman', style: { fontFamily: 'Times New Roman, serif' } },
  { id: 'arial', name: 'Arial', style: { fontFamily: 'Arial, sans-serif' } },
  { id: 'impact', name: 'Impact', style: { fontFamily: 'Impact, sans-serif' } },
  { id: 'courier', name: 'Courier', style: { fontFamily: 'Courier New, monospace' } },
];

// Plaque material options with images and specific positioning
const PLAQUE_MATERIALS = [
  { 
    id: 'wood', 
    name: 'Dark Maple Wood', 
    image: '/images/DarkMapleWood1.png',
    defaultPosition: { x: 50, y: 85 }, // Default position for wood
    optimalFontSize: 36,
  },
  { 
    id: 'clear', 
    name: 'Clear Plexiglass', 
    image: '/images/ClearPlaque8.png',
    defaultPosition: { x: 50, y: 88 }, // Clear might have gold area lower
    optimalFontSize: 34,
  },
  { 
    id: 'marble', 
    name: 'Black Marble', 
    image: '/images/BlackMarble8.png',
    defaultPosition: { x: 50, y: 82 }, // Marble might have gold area higher
    optimalFontSize: 38,
  },
];

// Plaque size options
const PLAQUE_SIZES = [
  { id: 'small', name: 'Small (8" × 10")', width: 400, height: 500 },
  { id: 'medium', name: 'Medium (12" × 14")', width: 600, height: 700 },
  { id: 'large', name: 'Large (16" × 20")', width: 800, height: 1000 },
];

// Calculate optimal position and size based on text length and material
const calculateOptimalSettings = (text: string, material: typeof PLAQUE_MATERIALS[0]) => {
  const length = text.length;
  
  // Base font size from material's optimal size
  let fontSize = material.optimalFontSize;
  
  // Adjust based on text length
  if (length <= 10) {
    fontSize += 6;
  } else if (length <= 20) {
    fontSize += 0; // Use material default
  } else if (length <= 30) {
    fontSize -= 6;
  } else {
    fontSize -= 12;
  }
  
  // Use material-specific position
  const position = { ...material.defaultPosition };
  
  return { fontSize, position };
};

// Saved configuration type
interface SavedEngraving {
  id?: string;
  text: string;
  font: typeof ENGRAVING_FONTS[0];
  fontSize: number;
  position: { x: number; y: number };
  material: typeof PLAQUE_MATERIALS[0];
  timestamp: number;
}

// Database saved configuration type
interface DBEngraving {
  id: string;
  text: string;
  font_id: string;
  font_name: string;
  font_size: number;
  position_x: number;
  position_y: number;
  material_id: string;
  material_name: string;
  plaque_size: string;
  created_at: string;
}

export default function MetalEngravingDemo() {
  const [engravingText, setEngravingText] = useState('CHAMPIONS 2024');
  const [selectedFont, setSelectedFont] = useState(ENGRAVING_FONTS[0]);
  const [selectedMaterial, setSelectedMaterial] = useState(PLAQUE_MATERIALS[0]);
  const [fontSize, setFontSize] = useState(selectedMaterial.optimalFontSize);
  const [selectedSize, setSelectedSize] = useState(PLAQUE_SIZES[1]);
  const [textPosition, setTextPosition] = useState(selectedMaterial.defaultPosition);
  const [savedEngravings, setSavedEngravings] = useState<SavedEngraving[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load saved engravings from Supabase
  const loadSavedEngravings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/engravings/simple');
      const data = await response.json();
      
      if (data.engravings) {
        // Convert DB format to component format
        const converted = data.engravings.map((db: DBEngraving) => ({
          id: db.id,
          text: db.text,
          font: ENGRAVING_FONTS.find(f => f.id === db.font_id) || ENGRAVING_FONTS[0],
          fontSize: db.font_size,
          position: { x: Number(db.position_x), y: Number(db.position_y) },
          material: PLAQUE_MATERIALS.find(m => m.id === db.material_id) || PLAQUE_MATERIALS[0],
          timestamp: new Date(db.created_at).getTime(),
        }));
        setSavedEngravings(converted);
      }
    } catch (error) {
      console.error('Error loading saved engravings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load saved engravings on component mount
  useEffect(() => {
    const loadAndApply = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/engravings/simple');
        const data = await response.json();
        
        if (data.engravings && data.engravings.length > 0) {
          // Convert DB format to component format
          const converted = data.engravings.map((db: DBEngraving) => ({
            id: db.id,
            text: db.text,
            font: ENGRAVING_FONTS.find(f => f.id === db.font_id) || ENGRAVING_FONTS[0],
            fontSize: db.font_size,
            position: { x: Number(db.position_x), y: Number(db.position_y) },
            material: PLAQUE_MATERIALS.find(m => m.id === db.material_id) || PLAQUE_MATERIALS[0],
            timestamp: new Date(db.created_at).getTime(),
          }));
          setSavedEngravings(converted);
          
          // Auto-load the most recent configuration
          const autoLoad = localStorage.getItem('autoLoadLastEngraving');
          if (autoLoad === 'true' && converted.length > 0) {
            const mostRecent = converted[0];
            setEngravingText(mostRecent.text);
            setSelectedFont(mostRecent.font);
            setFontSize(mostRecent.fontSize);
            setTextPosition(mostRecent.position);
            setSelectedMaterial(mostRecent.material);
          }
        }
      } catch (error) {
        console.error('Error loading saved engravings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAndApply();
  }, []);

  // Auto-adjust settings when text changes
  const handleTextChange = (newText: string) => {
    setEngravingText(newText);
    // Only adjust font size, not position - let user keep their manual positioning
    const optimal = calculateOptimalSettings(newText, selectedMaterial);
    setFontSize(optimal.fontSize);
  };

  // Save current configuration to Supabase
  const saveConfiguration = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/engravings/simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: engravingText,
          fontId: selectedFont.id,
          fontName: selectedFont.name,
          fontSize,
          positionX: textPosition.x,
          positionY: textPosition.y,
          materialId: selectedMaterial.id,
          materialName: selectedMaterial.name,
          plaqueSize: selectedSize.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Reload the list to show the new save
        await loadSavedEngravings();
        
        // Enable auto-loading for next refresh
        localStorage.setItem('autoLoadLastEngraving', 'true');
        
        // More detailed confirmation
        alert(`Engraving configuration saved permanently!\nText: ${engravingText}\nPosition: X=${textPosition.x.toFixed(1)}%, Y=${textPosition.y.toFixed(1)}%\nSize: ${fontSize}px\n\nThis will be automatically loaded on page refresh.`);
      } else {
        const errorData = await response.json();
        console.error('Save failed:', errorData);
        throw new Error(errorData.details || errorData.error || 'Failed to save');
      }
    } catch (error: any) {
      console.error('Error saving configuration:', error);
      alert(`Failed to save configuration: ${error.message}\n\nPlease check the browser console for more details.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Load a saved configuration
  const loadConfiguration = (saved: SavedEngraving) => {
    setEngravingText(saved.text);
    setSelectedFont(saved.font);
    setFontSize(saved.fontSize);
    setTextPosition(saved.position);
    setSelectedMaterial(saved.material);
    setShowSaved(false);
  };

  // Reset to optimal position
  const resetToOptimal = () => {
    const optimal = calculateOptimalSettings(engravingText, selectedMaterial);
    setFontSize(optimal.fontSize);
    setTextPosition(optimal.position);
  };
  
  // Handle material change
  const handleMaterialChange = (material: typeof PLAQUE_MATERIALS[0]) => {
    setSelectedMaterial(material);
    // Apply material-specific defaults
    const optimal = calculateOptimalSettings(engravingText, material);
    setFontSize(optimal.fontSize);
    setTextPosition(optimal.position);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gradient-to-br from-amber-50 to-yellow-50">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          ✨ Custom Plaque Engraving
        </h1>
        <p className="text-lg text-gray-600">
          Add personalized engraving directly on your plaque
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Preview Panel */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Preview</h2>
            <button
              onClick={saveConfiguration}
              disabled={isLoading}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V2" />
              </svg>
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
          <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center">
            <div 
              className="relative overflow-hidden rounded-lg shadow-2xl"
              style={{ 
                width: selectedSize.width, 
                height: selectedSize.height,
                maxWidth: '100%',
                aspectRatio: `${selectedSize.width} / ${selectedSize.height}`
              }}
            >
              {/* Plaque Background Image */}
              <Image
                src={selectedMaterial.image}
                alt={selectedMaterial.name}
                fill
                className="object-cover"
                priority
              />

              {/* Engraved Text Directly on Plaque */}
              <div 
                className="absolute flex items-center justify-center"
                style={{
                  left: `${textPosition.x}%`,
                  top: `${textPosition.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: '90%',
                }}
              >
                <h3 
                  className={selectedFont.className}
                  style={{
                    ...selectedFont.style,
                    fontSize: `${fontSize}px`,
                    color: '#000',
                    textShadow: `
                      -1px -1px 0 rgba(255, 255, 255, 0.5),
                      1px 1px 2px rgba(0, 0, 0, 0.8)
                    `,
                    letterSpacing: '0.05em',
                    fontWeight: 'bold',
                  }}
                >
                  {engravingText}
                </h3>
              </div>
            </div>
          </div>
          
          {/* Position Arrow Controls */}
          <div className="mt-6 flex flex-col items-center">
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-sm text-gray-600 mb-3 text-center">Adjust Position</p>
              <div className="grid grid-cols-3 gap-2 w-32">
                <div></div>
                <button
                  onClick={() => setTextPosition({ ...textPosition, y: Math.max(10, textPosition.y - 0.5) })}
                  className="bg-gray-100 hover:bg-gray-200 rounded p-2 flex items-center justify-center transition-colors"
                  title="Move Up"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <div></div>
                
                <button
                  onClick={() => setTextPosition({ ...textPosition, x: Math.max(10, textPosition.x - 0.5) })}
                  className="bg-gray-100 hover:bg-gray-200 rounded p-2 flex items-center justify-center transition-colors"
                  title="Move Left"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={resetToOptimal}
                  className="bg-amber-100 hover:bg-amber-200 rounded p-2 flex items-center justify-center transition-colors"
                  title="Center"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </button>
                <button
                  onClick={() => setTextPosition({ ...textPosition, x: Math.min(90, textPosition.x + 0.5) })}
                  className="bg-gray-100 hover:bg-gray-200 rounded p-2 flex items-center justify-center transition-colors"
                  title="Move Right"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                <div></div>
                <button
                  onClick={() => setTextPosition({ ...textPosition, y: Math.min(95, textPosition.y + 0.5) })}
                  className="bg-gray-100 hover:bg-gray-200 rounded p-2 flex items-center justify-center transition-colors"
                  title="Move Down"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div></div>
              </div>
              
              {/* Size controls */}
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  onClick={() => setFontSize(Math.max(16, fontSize - 2))}
                  className="bg-gray-100 hover:bg-gray-200 rounded px-3 py-1 text-sm font-medium transition-colors"
                  title="Decrease Size"
                >
                  A-
                </button>
                <span className="text-sm text-gray-600">{fontSize}px</span>
                <button
                  onClick={() => setFontSize(Math.min(60, fontSize + 2))}
                  className="bg-gray-100 hover:bg-gray-200 rounded px-3 py-1 text-sm font-medium transition-colors"
                  title="Increase Size"
                >
                  A+
                </button>
              </div>
              
              {/* Quick Save Button */}
              <button
                onClick={saveConfiguration}
                disabled={isLoading}
                className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                💾 {isLoading ? 'Saving...' : 'Save Design'}
              </button>
            </div>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="space-y-6">
          {/* Material Selection */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Plaque Material</h3>
            <div className="grid grid-cols-1 gap-3">
              {PLAQUE_MATERIALS.map((material) => (
                <button
                  key={material.id}
                  onClick={() => handleMaterialChange(material)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedMaterial.id === material.id
                      ? 'border-amber-500 bg-amber-50 text-amber-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="font-medium">{material.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Text Input */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Engraving Text</h3>
            <input
              type="text"
              value={engravingText}
              onChange={(e) => handleTextChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Enter your text..."
              maxLength={50}
            />
            <p className="text-sm text-gray-500 mt-2">
              {engravingText.length}/50 characters
            </p>
          </div>

          {/* Font Selection */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Font Style</h3>
            <div className="grid grid-cols-2 gap-3">
              {ENGRAVING_FONTS.map((font) => (
                <button
                  key={font.id}
                  onClick={() => setSelectedFont(font)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedFont.id === font.id
                      ? 'border-amber-500 bg-amber-50 text-amber-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span 
                    className={font.className}
                    style={font.style}
                  >
                    {font.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Size Controls */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Text Size</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Font Size: {fontSize}px
                </label>
                <input
                  type="range"
                  min="20"
                  max="48"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Position Controls */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Text Position</h3>
            <button
              onClick={resetToOptimal}
              className="w-full mb-4 bg-amber-100 text-amber-700 py-2 rounded-lg font-medium hover:bg-amber-200 transition-colors"
            >
              Auto-Position for Text Length
            </button>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horizontal Position
                </label>
                <input
                  type="range"
                  min="20"
                  max="80"
                  value={textPosition.x}
                  onChange={(e) => setTextPosition({ ...textPosition, x: Number(e.target.value) })}
                  className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vertical Position
                </label>
                <input
                  type="range"
                  min="70"
                  max="95"
                  value={textPosition.y}
                  onChange={(e) => setTextPosition({ ...textPosition, y: Number(e.target.value) })}
                  className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Plaque Size */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Plaque Size</h3>
            <div className="space-y-3">
              {PLAQUE_SIZES.map((size) => (
                <button
                  key={size.id}
                  onClick={() => setSelectedSize(size)}
                  className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                    selectedSize.id === size.id
                      ? 'border-amber-500 bg-amber-50 text-amber-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {size.name}
                </button>
              ))}
            </div>
          </div>


          {/* Action Buttons */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Ready to Order?</h3>
            <div className="space-y-3">
              <button className="w-full bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors">
                Add Engraving to Cart
              </button>
              <button 
                onClick={saveConfiguration}
                disabled={isLoading}
                className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Save Configuration'}
              </button>
              <button 
                onClick={() => setShowSaved(!showSaved)}
                className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                {showSaved ? 'Hide' : 'Load'} Saved Designs ({savedEngravings.length})
              </button>
              <div className="flex items-center justify-between mt-3 p-3 bg-gray-50 rounded-lg">
                <label className="text-sm text-gray-700">Auto-load last save on refresh</label>
                <button
                  onClick={() => {
                    const current = localStorage.getItem('autoLoadLastEngraving') === 'true';
                    localStorage.setItem('autoLoadLastEngraving', (!current).toString());
                    alert(current ? 'Auto-load disabled' : 'Auto-load enabled');
                  }}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    localStorage.getItem('autoLoadLastEngraving') === 'true'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-300 text-gray-700'
                  }`}
                >
                  {localStorage.getItem('autoLoadLastEngraving') === 'true' ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
            <div className="mt-4 p-4 bg-amber-50 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> Custom engraving adds $25 to your plaque order
              </p>
            </div>
          </div>

          {/* Saved Configurations */}
          {showSaved && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Saved Designs</h3>
              {isLoading ? (
                <p className="text-gray-500 text-center py-4">Loading saved designs...</p>
              ) : savedEngravings.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                {savedEngravings.map((saved, index) => (
                  <button
                    key={saved.timestamp}
                    onClick={() => loadConfiguration(saved)}
                    className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{saved.text}</p>
                        <p className="text-xs text-gray-500">
                          {saved.material.name} • {saved.font.name} • {saved.fontSize}px
                        </p>
                        <p className="text-xs text-gray-400">
                          Position: X={saved.position.x.toFixed(1)}%, Y={saved.position.y.toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(saved.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </button>
                ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No saved designs yet. Save one to see it here!</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}