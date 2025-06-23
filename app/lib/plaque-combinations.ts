// Plaque Combinations Data Types and Configuration System

// =============================================================================
// POSITION TYPES
// =============================================================================

export type FootballPosition = 
  | 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF/ST' | 'FLEX' | 'BENCH';

export type BasketballPosition = 
  | 'PG' | 'SG' | 'SF' | 'PF' | 'C' | 'UTIL' | 'BENCH';

export type BaseballPosition = 
  | 'C' | '1B' | '2B' | '3B' | 'SS' | 'OF' | 'UTIL' | 'P' | 'BENCH';

export type HockeyPosition = 
  | 'C' | 'LW' | 'RW' | 'D' | 'G' | 'UTIL' | 'BENCH';

export type Position = FootballPosition | BasketballPosition | BaseballPosition | HockeyPosition;

export type Sport = 'football' | 'basketball' | 'baseball' | 'hockey';

// =============================================================================
// MATERIAL & STYLE TYPES
// =============================================================================

export interface Material {
  id: string;
  name: string;
  multiplier: number;
  description: string;
  isAvailable: boolean;
  premiumFeatures?: string[];
}

export interface FrameStyle {
  id: string;
  name: string;
  priceModifier: number;
  features: string[];
  isAvailable: boolean;
}

export interface Dimensions {
  width: number;
  height: number;
  unit: 'inches' | 'cm';
}

// =============================================================================
// PLAQUE CONFIGURATION TYPES
// =============================================================================

export interface PlaqueSlot {
  id: string;
  position: Position;
  x: number; // Grid position X
  y: number; // Grid position Y
  size: 'standard' | 'large' | 'small';
  isRequired: boolean;
  priority: number; // 1-10, higher = more prominent
}

export interface PlaqueLayout {
  id: string;
  name: string;
  description: string;
  sport: Sport;
  slots: PlaqueSlot[];
  gridColumns: number;
  gridRows: number;
  specialLayout?: 'pyramid' | 'showcase' | 'standard';
}

export interface PlaqueCombination {
  id: string;
  name: string;
  description: string;
  category: 'compact' | 'standard' | 'premium' | 'elite';
  layout: PlaqueLayout;
  basePrice: number;
  dimensions: Dimensions;
  maxCards: number;
  targetAudience: string[];
  popularityRank: number;
  isRecommended: boolean;
  tags: string[];
}

// =============================================================================
// PRICING TYPES
// =============================================================================

export interface PricingCalculation {
  basePrice: number;
  materialMultiplier: number;
  styleModifier: number;
  sizeModifier: number;
  subtotal: number;
  discounts: {
    preOrder?: number;
    bulk?: number;
    loyalty?: number;
  };
  finalPrice: number;
  savings?: number;
}

export interface PlaqueConfiguration {
  combination: PlaqueCombination;
  material: Material;
  style: FrameStyle;
  customizations?: {
    engraving?: string;
    teamColors?: [string, string];
    logoUpload?: boolean;
  };
  pricing: PricingCalculation;
}

// =============================================================================
// PREDEFINED MATERIALS
// =============================================================================

export const MATERIALS: Record<string, Material> = {
  WOOD_BROWN: {
    id: 'wood-brown',
    name: 'Wood Brown',
    multiplier: 1.0,
    description: 'Classic oak finish with traditional appeal',
    isAvailable: true,
  },
  CLEAR_PLEXIGLASS: {
    id: 'clear-plexiglass',
    name: 'Clear Plexiglass',
    multiplier: 1.2,
    description: 'Modern transparent display with clean lines',
    isAvailable: true,
  },
  PREMIUM_GLASS: {
    id: 'premium-glass',
    name: 'Premium Glass',
    multiplier: 1.5,
    description: 'Museum-quality tempered glass with anti-glare coating',
    isAvailable: true,
    premiumFeatures: ['anti-glare', 'scratch-resistant', 'museum-quality'],
  },
  MATTE_BLACK: {
    id: 'matte-black',
    name: 'Matte Black',
    multiplier: 1.3,
    description: 'Sleek contemporary design with fingerprint resistance',
    isAvailable: true,
  },
  BRUSHED_METAL: {
    id: 'brushed-metal',
    name: 'Brushed Metal',
    multiplier: 1.8,
    description: 'Premium aluminum with laser engraving capabilities',
    isAvailable: true,
    premiumFeatures: ['laser-engraving-ready', 'premium-weight', 'corrosion-resistant'],
  },
  CARBON_FIBER: {
    id: 'carbon-fiber',
    name: 'Carbon Fiber',
    multiplier: 2.0,
    description: 'Ultra-premium modern material with unique texture',
    isAvailable: false, // Coming soon
    premiumFeatures: ['ultra-premium', 'unique-texture', 'lightweight-strong'],
  },
  GOLD_METAL: {
    id: 'gold-metal',
    name: 'Gold Metal',
    multiplier: 2.2,
    description: 'Luxurious gold-finished metal with custom engraving',
    isAvailable: true,
    premiumFeatures: ['custom-engraving', 'gold-finish', 'premium-weight', 'tarnish-resistant'],
  },
};

// =============================================================================
// PREDEFINED FRAME STYLES
// =============================================================================

export const FRAME_STYLES: Record<string, FrameStyle> = {
  CLASSIC: {
    id: 'classic',
    name: 'Classic',
    priceModifier: 0,
    features: ['simple-border', 'clean-lines', 'timeless-design'],
    isAvailable: true,
  },
  CHAMPIONSHIP: {
    id: 'championship',
    name: 'Championship',
    priceModifier: 25,
    features: ['gold-accents', 'trophy-elements', 'winner-styling'],
    isAvailable: true,
  },
  VINTAGE: {
    id: 'vintage',
    name: 'Vintage',
    priceModifier: 20,
    features: ['retro-design', 'aged-appearance', 'classic-typography'],
    isAvailable: true,
  },
  MODERN: {
    id: 'modern',
    name: 'Modern',
    priceModifier: 15,
    features: ['minimal-design', 'led-ready', 'contemporary-styling'],
    isAvailable: true,
  },
  CUSTOM_ENGRAVED: {
    id: 'custom-engraved',
    name: 'Custom Engraved',
    priceModifier: 40,
    features: ['personal-message', 'team-logos', 'custom-text'],
    isAvailable: true,
  },
};

// =============================================================================
// PREDEFINED PLAQUE COMBINATIONS
// =============================================================================

export const PLAQUE_COMBINATIONS: Record<string, PlaqueCombination> = {
  // Standard Football Configurations
  CLASSIC_9_SPOT: {
    id: 'classic-9-spot',
    name: '9-Spot Classic',
    description: 'Perfect for standard fantasy football leagues',
    category: 'standard',
    layout: {
      id: 'football-9-standard',
      name: 'Standard Football 9-Spot',
      description: 'Traditional 3x3 grid layout',
      sport: 'football',
      gridColumns: 3,
      gridRows: 3,
      slots: [
        { id: 'qb', position: 'QB', x: 0, y: 0, size: 'standard', isRequired: true, priority: 10 },
        { id: 'rb1', position: 'RB', x: 1, y: 0, size: 'standard', isRequired: true, priority: 9 },
        { id: 'rb2', position: 'RB', x: 2, y: 0, size: 'standard', isRequired: true, priority: 8 },
        { id: 'wr1', position: 'WR', x: 0, y: 1, size: 'standard', isRequired: true, priority: 9 },
        { id: 'wr2', position: 'WR', x: 1, y: 1, size: 'standard', isRequired: true, priority: 8 },
        { id: 'flex', position: 'FLEX', x: 2, y: 1, size: 'standard', isRequired: true, priority: 7 },
        { id: 'te', position: 'TE', x: 0, y: 2, size: 'standard', isRequired: true, priority: 6 },
        { id: 'k', position: 'K', x: 1, y: 2, size: 'standard', isRequired: true, priority: 3 },
        { id: 'def', position: 'DEF/ST', x: 2, y: 2, size: 'standard', isRequired: true, priority: 4 },
      ],
    },
    basePrice: 89.99,
    dimensions: { width: 12, height: 9, unit: 'inches' },
    maxCards: 9,
    targetAudience: ['casual-players', 'standard-leagues', 'first-time-buyers'],
    popularityRank: 1,
    isRecommended: true,
    tags: ['popular', 'standard', 'football', 'beginner-friendly'],
  },

  PREMIUM_12_SPOT: {
    id: 'premium-12-spot',
    name: '12-Spot Premium',
    description: 'Perfect for deep roster and keeper leagues',
    category: 'premium',
    layout: {
      id: 'football-12-premium',
      name: 'Premium Football 12-Spot',
      description: 'Extended 4x3 grid with bench spots',
      sport: 'football',
      gridColumns: 4,
      gridRows: 3,
      slots: [
        { id: 'qb', position: 'QB', x: 0, y: 0, size: 'standard', isRequired: true, priority: 10 },
        { id: 'rb1', position: 'RB', x: 1, y: 0, size: 'standard', isRequired: true, priority: 9 },
        { id: 'rb2', position: 'RB', x: 2, y: 0, size: 'standard', isRequired: true, priority: 8 },
        { id: 'wr1', position: 'WR', x: 3, y: 0, size: 'standard', isRequired: true, priority: 9 },
        { id: 'wr2', position: 'WR', x: 0, y: 1, size: 'standard', isRequired: true, priority: 8 },
        { id: 'wr3', position: 'WR', x: 1, y: 1, size: 'standard', isRequired: true, priority: 7 },
        { id: 'flex', position: 'FLEX', x: 2, y: 1, size: 'standard', isRequired: true, priority: 7 },
        { id: 'te1', position: 'TE', x: 3, y: 1, size: 'standard', isRequired: true, priority: 6 },
        { id: 'te2', position: 'TE', x: 0, y: 2, size: 'standard', isRequired: false, priority: 5 },
        { id: 'k', position: 'K', x: 1, y: 2, size: 'standard', isRequired: true, priority: 3 },
        { id: 'def', position: 'DEF/ST', x: 2, y: 2, size: 'standard', isRequired: true, priority: 4 },
        { id: 'bench', position: 'BENCH', x: 3, y: 2, size: 'standard', isRequired: false, priority: 2 },
      ],
    },
    basePrice: 119.99,
    dimensions: { width: 15, height: 10, unit: 'inches' },
    maxCards: 12,
    targetAudience: ['keeper-leagues', 'deep-rosters', 'experienced-players'],
    popularityRank: 2,
    isRecommended: true,
    tags: ['premium', 'deep-roster', 'football', 'keeper-leagues'],
  },

  COMPACT_6_SPOT: {
    id: 'compact-6-spot',
    name: '6-Spot Compact',
    description: 'Budget-friendly option for casual players',
    category: 'compact',
    layout: {
      id: 'football-6-compact',
      name: 'Compact Football 6-Spot',
      description: 'Essential positions only',
      sport: 'football',
      gridColumns: 3,
      gridRows: 2,
      slots: [
        { id: 'qb', position: 'QB', x: 0, y: 0, size: 'standard', isRequired: true, priority: 10 },
        { id: 'rb', position: 'RB', x: 1, y: 0, size: 'standard', isRequired: true, priority: 9 },
        { id: 'wr', position: 'WR', x: 2, y: 0, size: 'standard', isRequired: true, priority: 8 },
        { id: 'flex', position: 'FLEX', x: 0, y: 1, size: 'standard', isRequired: true, priority: 7 },
        { id: 'te', position: 'TE', x: 1, y: 1, size: 'standard', isRequired: true, priority: 6 },
        { id: 'k-def', position: 'K', x: 2, y: 1, size: 'standard', isRequired: true, priority: 4 },
      ],
    },
    basePrice: 59.99,
    dimensions: { width: 9, height: 6, unit: 'inches' },
    maxCards: 6,
    targetAudience: ['budget-conscious', 'small-spaces', 'casual-fans'],
    popularityRank: 4,
    isRecommended: false,
    tags: ['budget', 'compact', 'football', 'starter'],
  },

  DYNASTY_15_SPOT: {
    id: 'dynasty-15-spot',
    name: '15-Spot Dynasty',
    description: 'Ultimate display for dynasty leagues and collectors',
    category: 'elite',
    layout: {
      id: 'football-15-dynasty',
      name: 'Dynasty Football 15-Spot',
      description: 'Maximum roster display with bench depth',
      sport: 'football',
      gridColumns: 6,
      gridRows: 3,
      specialLayout: 'standard',
      slots: [
        { id: 'qb1', position: 'QB', x: 0, y: 0, size: 'standard', isRequired: true, priority: 10 },
        { id: 'qb2', position: 'QB', x: 1, y: 0, size: 'standard', isRequired: false, priority: 6 },
        { id: 'rb1', position: 'RB', x: 2, y: 0, size: 'standard', isRequired: true, priority: 9 },
        { id: 'rb2', position: 'RB', x: 3, y: 0, size: 'standard', isRequired: true, priority: 8 },
        { id: 'rb3', position: 'RB', x: 4, y: 0, size: 'standard', isRequired: false, priority: 5 },
        { id: 'wr1', position: 'WR', x: 5, y: 0, size: 'standard', isRequired: true, priority: 9 },
        { id: 'wr2', position: 'WR', x: 0, y: 1, size: 'standard', isRequired: true, priority: 8 },
        { id: 'wr3', position: 'WR', x: 1, y: 1, size: 'standard', isRequired: true, priority: 7 },
        { id: 'wr4', position: 'WR', x: 2, y: 1, size: 'standard', isRequired: false, priority: 6 },
        { id: 'flex1', position: 'FLEX', x: 3, y: 1, size: 'standard', isRequired: true, priority: 7 },
        { id: 'flex2', position: 'FLEX', x: 4, y: 1, size: 'standard', isRequired: false, priority: 5 },
        { id: 'te1', position: 'TE', x: 5, y: 1, size: 'standard', isRequired: true, priority: 6 },
        { id: 'te2', position: 'TE', x: 0, y: 2, size: 'standard', isRequired: false, priority: 4 },
        { id: 'k', position: 'K', x: 1, y: 2, size: 'standard', isRequired: true, priority: 3 },
        { id: 'def', position: 'DEF/ST', x: 2, y: 2, size: 'standard', isRequired: true, priority: 4 },
      ],
    },
    basePrice: 179.99,
    dimensions: { width: 18, height: 12, unit: 'inches' },
    maxCards: 15,
    targetAudience: ['dynasty-leagues', 'collectors', 'serious-players'],
    popularityRank: 3,
    isRecommended: true,
    tags: ['elite', 'dynasty', 'football', 'collector', 'premium'],
  },

  // Basketball Configuration
  NBA_8_SPOT: {
    id: 'nba-8-spot',
    name: '8-Spot NBA',
    description: 'Standard NBA fantasy basketball layout',
    category: 'standard',
    layout: {
      id: 'basketball-8-standard',
      name: 'Standard Basketball 8-Spot',
      description: 'NBA starting lineup plus utilities',
      sport: 'basketball',
      gridColumns: 3,
      gridRows: 3,
      slots: [
        { id: 'pg', position: 'PG', x: 0, y: 0, size: 'standard', isRequired: true, priority: 10 },
        { id: 'sg', position: 'SG', x: 1, y: 0, size: 'standard', isRequired: true, priority: 9 },
        { id: 'sf', position: 'SF', x: 2, y: 0, size: 'standard', isRequired: true, priority: 8 },
        { id: 'pf', position: 'PF', x: 0, y: 1, size: 'standard', isRequired: true, priority: 8 },
        { id: 'c', position: 'C', x: 1, y: 1, size: 'standard', isRequired: true, priority: 8 },
        { id: 'util1', position: 'UTIL', x: 2, y: 1, size: 'standard', isRequired: true, priority: 6 },
        { id: 'util2', position: 'UTIL', x: 0, y: 2, size: 'standard', isRequired: true, priority: 5 },
        { id: 'bench', position: 'BENCH', x: 1, y: 2, size: 'standard', isRequired: false, priority: 3 },
      ],
    },
    basePrice: 79.99,
    dimensions: { width: 11, height: 8, unit: 'inches' },
    maxCards: 8,
    targetAudience: ['basketball-fans', 'nba-fantasy', 'multi-sport'],
    popularityRank: 5,
    isRecommended: true,
    tags: ['basketball', 'nba', 'standard', 'multi-sport'],
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function calculatePricing(
  combination: PlaqueCombination,
  material: Material,
  style: FrameStyle,
  discounts: { preOrder?: number; bulk?: number; loyalty?: number } = {}
): PricingCalculation {
  const basePrice = combination.basePrice;
  const materialMultiplier = material.multiplier;
  const styleModifier = style.priceModifier;
  
  // Size modifier based on category
  const sizeModifiers = {
    compact: 0.8,
    standard: 1.0,
    premium: 1.2,
    elite: 1.5,
  };
  const sizeModifier = sizeModifiers[combination.category];
  
  const subtotal = (basePrice * materialMultiplier * sizeModifier) + styleModifier;
  
  // Apply discounts
  let totalDiscount = 0;
  if (discounts.preOrder) totalDiscount += discounts.preOrder;
  if (discounts.bulk) totalDiscount += discounts.bulk;
  if (discounts.loyalty) totalDiscount += discounts.loyalty;
  
  const finalPrice = subtotal * (1 - totalDiscount / 100);
  const savings = subtotal - finalPrice;
  
  return {
    basePrice,
    materialMultiplier,
    styleModifier,
    sizeModifier,
    subtotal,
    discounts,
    finalPrice: Math.round(finalPrice * 100) / 100,
    savings: savings > 0 ? Math.round(savings * 100) / 100 : undefined,
  };
}

export function getRecommendedCombinations(
  sport?: Sport,
  budget?: number,
  category?: PlaqueCombination['category']
): PlaqueCombination[] {
  let combinations = Object.values(PLAQUE_COMBINATIONS);
  
  if (sport) {
    combinations = combinations.filter(c => c.layout.sport === sport);
  }
  
  if (budget) {
    combinations = combinations.filter(c => c.basePrice <= budget);
  }
  
  if (category) {
    combinations = combinations.filter(c => c.category === category);
  }
  
  return combinations
    .sort((a, b) => a.popularityRank - b.popularityRank)
    .slice(0, 6);
}

export function getCombinationById(id: string): PlaqueCombination | undefined {
  return PLAQUE_COMBINATIONS[id];
}

export function getAvailableMaterials(): Material[] {
  return Object.values(MATERIALS).filter(m => m.isAvailable);
}

export function getAvailableStyles(): FrameStyle[] {
  return Object.values(FRAME_STYLES).filter(s => s.isAvailable);
}

// =============================================================================
// PACKAGE CONFIGURATIONS
// =============================================================================

export interface PlaquePackage {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  combination: PlaqueCombination;
  material: Material;
  style: FrameStyle;
  includes: string[];
  isPopular?: boolean;
  savings?: number;
}

export const PLAQUE_PACKAGES: Record<string, PlaquePackage> = {
  STARTER_PACK: {
    id: 'starter-pack',
    name: 'The Starter Pack',
    description: 'Perfect introduction to custom roster frames',
    price: 79.99,
    combination: PLAQUE_COMBINATIONS.CLASSIC_9_SPOT,
    material: MATERIALS.WOOD_BROWN,
    style: FRAME_STYLES.CLASSIC,
    includes: [
      '9-Spot Classic layout',
      'Wood Brown material',
      'Standard positions',
      'Basic assembly',
    ],
    isPopular: true,
  },
  
  CHAMPIONSHIP_EDITION: {
    id: 'championship-edition',
    name: 'The Championship Edition',
    description: 'Celebrate your fantasy success in style',
    price: 149.99,
    originalPrice: 169.98,
    combination: PLAQUE_COMBINATIONS.PREMIUM_12_SPOT,
    material: MATERIALS.PREMIUM_GLASS,
    style: FRAME_STYLES.CHAMPIONSHIP,
    includes: [
      '12-Spot Premium layout',
      'Premium Glass material',
      'Championship frame style',
      'Gold accent package',
      'Premium assembly',
    ],
    savings: 19.99,
  },
}; 