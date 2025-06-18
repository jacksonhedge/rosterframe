'use client';

import { useState } from 'react';
import {
  PLAQUE_COMBINATIONS,
  MATERIALS,
  FRAME_STYLES,
  PLAQUE_PACKAGES,
  calculatePricing,
  getRecommendedCombinations,
  type PlaqueCombination,
  type Material,
  type FrameStyle,
  type Sport,
  type PricingCalculation,
} from '@/app/lib/plaque-combinations';

export default function PlaqueCombinationsDemo() {
  const [selectedCombination, setSelectedCombination] = useState<PlaqueCombination>(
    PLAQUE_COMBINATIONS.CLASSIC_9_SPOT
  );
  const [selectedMaterial, setSelectedMaterial] = useState<Material>(
    MATERIALS.WOOD_BROWN
  );
  const [selectedStyle, setSelectedStyle] = useState<FrameStyle>(
    FRAME_STYLES.CLASSIC
  );
  const [preOrderDiscount, setPreOrderDiscount] = useState(15);
  const [selectedSport, setSelectedSport] = useState<Sport>('football');

  const pricing = calculatePricing(
    selectedCombination,
    selectedMaterial,
    selectedStyle,
    { preOrder: preOrderDiscount }
  );

  const recommendedCombinations = getRecommendedCombinations(selectedSport, 200, undefined);

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🏆 Plaque Combinations System Demo
        </h1>
        <p className="text-lg text-gray-600">
          Explore different roster frame configurations, materials, and pricing options.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sport Selection */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Select Sport</h2>
            <div className="grid grid-cols-4 gap-3">
              {(['football', 'basketball', 'baseball', 'hockey'] as Sport[]).map((sport) => (
                <button
                  key={sport}
                  onClick={() => setSelectedSport(sport)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedSport === sport
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-lg">
                    {sport === 'football' && '🏈'}
                    {sport === 'basketball' && '🏀'}
                    {sport === 'baseball' && '⚾'}
                    {sport === 'hockey' && '🏒'}
                  </div>
                  <div className="text-sm font-medium capitalize">{sport}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Plaque Combinations */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Plaque Configurations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendedCombinations.map((combination) => (
                <div
                  key={combination.id}
                  onClick={() => setSelectedCombination(combination)}
                  className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                    selectedCombination.id === combination.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{combination.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      combination.category === 'standard' ? 'bg-green-100 text-green-700' :
                      combination.category === 'premium' ? 'bg-purple-100 text-purple-700' :
                      combination.category === 'elite' ? 'bg-gold-100 text-gold-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {combination.category}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{combination.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">
                      ${combination.basePrice}
                    </span>
                    <span className="text-sm text-gray-500">
                      {combination.maxCards} spots
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {combination.dimensions.width}" × {combination.dimensions.height}"
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Layout Visualization */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Layout Preview</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <div 
                className="grid gap-2 mx-auto"
                style={{
                  gridTemplateColumns: `repeat(${selectedCombination.layout.gridColumns}, 1fr)`,
                  maxWidth: '400px'
                }}
              >
                {selectedCombination.layout.slots.map((slot) => (
                  <div
                    key={slot.id}
                    className={`
                      aspect-square rounded-lg border-2 flex items-center justify-center text-xs font-medium
                      ${slot.isRequired 
                        ? 'bg-blue-100 border-blue-300 text-blue-700' 
                        : 'bg-gray-100 border-gray-300 text-gray-600'
                      }
                      ${slot.priority >= 8 ? 'ring-2 ring-yellow-300' : ''}
                    `}
                  >
                    {slot.position}
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  {selectedCombination.layout.name} - {selectedCombination.layout.description}
                </p>
              </div>
            </div>
          </div>

          {/* Materials & Styles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Materials */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Materials</h3>
              <div className="space-y-3">
                {Object.values(MATERIALS)
                  .filter(m => m.isAvailable)
                  .map((material) => (
                  <div
                    key={material.id}
                    onClick={() => setSelectedMaterial(material)}
                    className={`cursor-pointer p-3 rounded-lg border transition-all ${
                      selectedMaterial.id === material.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{material.name}</h4>
                        <p className="text-sm text-gray-600">{material.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {material.multiplier}x
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Frame Styles */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Frame Styles</h3>
              <div className="space-y-3">
                {Object.values(FRAME_STYLES)
                  .filter(s => s.isAvailable)
                  .map((style) => (
                  <div
                    key={style.id}
                    onClick={() => setSelectedStyle(style)}
                    className={`cursor-pointer p-3 rounded-lg border transition-all ${
                      selectedStyle.id === style.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{style.name}</h4>
                        <div className="text-sm text-gray-600">
                          {style.features.join(', ')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {style.priceModifier > 0 ? '+' : ''}${style.priceModifier}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Popular Packages */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Popular Packages</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.values(PLAQUE_PACKAGES).map((pkg) => (
                <div key={pkg.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{pkg.name}</h3>
                    {pkg.isPopular && (
                      <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-medium">
                        Popular
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{pkg.description}</p>
                  <div className="space-y-1 mb-3">
                    {pkg.includes.map((feature, index) => (
                      <div key={index} className="text-sm text-gray-600 flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        {feature}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xl font-bold">${pkg.price}</span>
                      {pkg.originalPrice && (
                        <span className="text-gray-500 line-through ml-2">
                          ${pkg.originalPrice}
                        </span>
                      )}
                    </div>
                    {pkg.savings && (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                        Save ${pkg.savings}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing Panel */}
        <div className="space-y-6">
          {/* Price Calculator */}
          <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
            <h2 className="text-2xl font-semibold mb-4">Price Calculator</h2>
            
            {/* Pre-order Toggle */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-blue-900">
                  🚀 Pre-Order Discount
                </label>
                <button
                  onClick={() => setPreOrderDiscount(preOrderDiscount ? 0 : 15)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    preOrderDiscount ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      preOrderDiscount ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              {preOrderDiscount > 0 && (
                <p className="text-xs text-blue-700">
                  Save {preOrderDiscount}% with pre-order! Delivery: March 2025
                </p>
              )}
            </div>

            {/* Pricing Breakdown */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Base Price:</span>
                <span>${pricing.basePrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Material ({selectedMaterial.name}):</span>
                <span>{pricing.materialMultiplier}x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Style ({selectedStyle.name}):</span>
                <span>+${pricing.styleModifier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Size ({selectedCombination.category}):</span>
                <span>{pricing.sizeModifier}x</span>
              </div>
              <hr className="my-3" />
              <div className="flex justify-between font-medium">
                <span>Subtotal:</span>
                <span>${pricing.subtotal.toFixed(2)}</span>
              </div>
              {preOrderDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Pre-order Discount:</span>
                  <span>-${pricing.savings?.toFixed(2)}</span>
                </div>
              )}
              <hr className="my-3" />
              <div className="flex justify-between text-xl font-bold">
                <span>Final Price:</span>
                <span className={preOrderDiscount ? 'text-green-600' : 'text-gray-900'}>
                  ${pricing.finalPrice.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Configuration Summary */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Your Configuration</h3>
              <div className="space-y-1 text-sm">
                <div><strong>Layout:</strong> {selectedCombination.name}</div>
                <div><strong>Material:</strong> {selectedMaterial.name}</div>
                <div><strong>Style:</strong> {selectedStyle.name}</div>
                <div><strong>Dimensions:</strong> {selectedCombination.dimensions.width}" × {selectedCombination.dimensions.height}"</div>
                <div><strong>Card Slots:</strong> {selectedCombination.maxCards}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Add to Cart - ${pricing.finalPrice.toFixed(2)}
              </button>
              <button className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                Save Configuration
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Configuration Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Category:</span>
                <span className="font-medium capitalize">{selectedCombination.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Popularity Rank:</span>
                <span className="font-medium">#{selectedCombination.popularityRank}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Target Audience:</span>
                <span className="font-medium text-right text-sm">
                  {selectedCombination.targetAudience.join(', ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Recommended:</span>
                <span className={`font-medium ${
                  selectedCombination.isRecommended ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {selectedCombination.isRecommended ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 