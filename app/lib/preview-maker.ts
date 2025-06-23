// Preview Maker Service - Generates compiled plaque images

export interface PlayerCardData {
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
  shipping?: number;
}

export interface PlaqueConfiguration {
  plaqueType: '4' | '5' | '6' | '7' | '8' | '9' | '10';
  plaqueStyle: string; // 'dark-maple-wood', 'clear-plaque', 'black-marble'
  teamName: string;
  playerCards: PlayerCardData[];
  showCardBacks?: boolean;
  customerEmail?: string;
  layoutAdjustments?: {
    cardSizeAdjustment?: number;
    cardSpacingAdjustment?: number;
    horizontalOffset?: number;
    verticalOffset?: number;
  };
}

export interface CompiledPreview {
  imageUrl?: string;
  htmlUrl?: string;
  downloadUrl: string;
  previewId: string;
  createdAt: string;
  configuration: PlaqueConfiguration;
}

// Card position coordinates for each plaque type (in pixels for final image)
// All use the same base image size but cards are scaled and positioned differently
const CARD_POSITIONS_PIXELS = {
  '4': {
    imageWidth: 1200,
    imageHeight: 900,
    // Larger cards, centered in a single row
    positions: [
      { x: 150, y: 300, width: 220, height: 308 },
      { x: 400, y: 300, width: 220, height: 308 },
      { x: 650, y: 300, width: 220, height: 308 },
      { x: 900, y: 300, width: 220, height: 308 },
    ]
  },
  '5': {
    imageWidth: 1200,
    imageHeight: 900,
    // Medium-large cards in 3-2 layout
    positions: [
      { x: 250, y: 180, width: 200, height: 280 },
      { x: 500, y: 180, width: 200, height: 280 },
      { x: 750, y: 180, width: 200, height: 280 },
      { x: 375, y: 480, width: 200, height: 280 },
      { x: 625, y: 480, width: 200, height: 280 },
    ]
  },
  '6': {
    imageWidth: 1200,
    imageHeight: 900,
    // Medium cards in 3x2 grid
    positions: [
      { x: 250, y: 200, width: 180, height: 252 },
      { x: 500, y: 200, width: 180, height: 252 },
      { x: 750, y: 200, width: 180, height: 252 },
      { x: 250, y: 500, width: 180, height: 252 },
      { x: 500, y: 500, width: 180, height: 252 },
      { x: 750, y: 500, width: 180, height: 252 },
    ]
  },
  '7': {
    imageWidth: 1200,
    imageHeight: 900,
    // Smaller cards in pyramid layout
    positions: [
      { x: 300, y: 120, width: 160, height: 224 },
      { x: 520, y: 120, width: 160, height: 224 },
      { x: 740, y: 120, width: 160, height: 224 },
      { x: 300, y: 370, width: 160, height: 224 },
      { x: 520, y: 370, width: 160, height: 224 },
      { x: 740, y: 370, width: 160, height: 224 },
      { x: 520, y: 620, width: 160, height: 224 },
    ]
  },
  '8': {
    imageWidth: 1200,
    imageHeight: 900,
    // Original size - this is the reference
    positions: [
      { x: 180, y: 135, width: 240, height: 336 },
      { x: 440, y: 135, width: 240, height: 336 },
      { x: 700, y: 135, width: 240, height: 336 },
      { x: 960, y: 135, width: 240, height: 336 },
      { x: 180, y: 513, width: 240, height: 336 },
      { x: 440, y: 513, width: 240, height: 336 },
      { x: 700, y: 513, width: 240, height: 336 },
      { x: 960, y: 513, width: 240, height: 336 },
    ]
  },
  '9': {
    imageWidth: 1200,
    imageHeight: 900,
    // Smaller cards in 3x3 grid
    positions: [
      { x: 270, y: 90, width: 150, height: 210 },
      { x: 480, y: 90, width: 150, height: 210 },
      { x: 690, y: 90, width: 150, height: 210 },
      { x: 270, y: 330, width: 150, height: 210 },
      { x: 480, y: 330, width: 150, height: 210 },
      { x: 690, y: 330, width: 150, height: 210 },
      { x: 270, y: 570, width: 150, height: 210 },
      { x: 480, y: 570, width: 150, height: 210 },
      { x: 690, y: 570, width: 150, height: 210 },
    ]
  },
  '10': {
    imageWidth: 1200,
    imageHeight: 900,
    // Very small cards in 5x2 grid
    positions: [
      { x: 120, y: 200, width: 140, height: 196 },
      { x: 300, y: 200, width: 140, height: 196 },
      { x: 480, y: 200, width: 140, height: 196 },
      { x: 660, y: 200, width: 140, height: 196 },
      { x: 840, y: 200, width: 140, height: 196 },
      { x: 120, y: 450, width: 140, height: 196 },
      { x: 300, y: 450, width: 140, height: 196 },
      { x: 480, y: 450, width: 140, height: 196 },
      { x: 660, y: 450, width: 140, height: 196 },
      { x: 840, y: 450, width: 140, height: 196 },
    ]
  }
};

class PreviewMakerService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  }

  /**
   * Generate a compiled plaque preview image
   */
  async generatePreview(config: PlaqueConfiguration): Promise<CompiledPreview> {
    try {
      const response = await fetch('/api/preview/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate preview: ${response.statusText}`);
      }

      const preview = await response.json();
      return preview;
    } catch (error) {
      console.error('Error generating preview:', error);
      throw error;
    }
  }

  /**
   * Send compiled preview to customer email
   */
  async emailPreview(previewId: string, customerEmail: string, teamName: string): Promise<boolean> {
    try {
      const response = await fetch('/api/preview/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          previewId,
          customerEmail,
          teamName,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error emailing preview:', error);
      return false;
    }
  }

  /**
   * Get existing preview by ID
   */
  async getPreview(previewId: string): Promise<CompiledPreview | null> {
    try {
      const response = await fetch(`/api/preview/${previewId}`);
      
      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching preview:', error);
      return null;
    }
  }

  /**
   * Get plaque background image path
   */
  getPlaqueBackgroundPath(plaqueType: '4' | '5' | '6' | '7' | '8' | '9' | '10', style: string): string {
    // For now, always use the same base images regardless of card count
    // The card sizing will create the illusion of different plaque sizes
    const styleMap: Record<string, string> = {
      'dark-maple-wood': '/images/DarkMapleWood1.png',
      'clear-plaque': '/images/ClearPlaque8.png', 
      'black-marble': '/images/BlackMarble8.png'
    };
    
    return styleMap[style] || '/images/DarkMapleWood1.png';
  }

  /**
   * Get card positions for a plaque type
   */
  getCardPositions(plaqueType: '4' | '5' | '6' | '7' | '8' | '9' | '10') {
    return CARD_POSITIONS_PIXELS[plaqueType];
  }

  /**
   * Get saved layout adjustments for a plaque configuration
   */
  getSavedLayoutAdjustments(plaqueType: string, plaqueStyle: string): PlaqueConfiguration['layoutAdjustments'] | null {
    try {
      const savedLayouts = JSON.parse(localStorage.getItem('plaqueLayouts') || '[]');
      
      // Find the most recent saved layout for this plaque type and style
      const matchingLayout = savedLayouts
        .filter((layout: any) => layout.plaqueType === plaqueType && layout.plaqueStyle === plaqueStyle)
        .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
      
      if (matchingLayout) {
        return {
          cardSizeAdjustment: matchingLayout.cardSizeAdjustment || 100,
          cardSpacingAdjustment: matchingLayout.cardSpacingAdjustment || 100,
          horizontalOffset: matchingLayout.horizontalOffset || 0,
          verticalOffset: matchingLayout.verticalOffset || 0
        };
      }
    } catch (error) {
      console.error('Error loading saved layout adjustments:', error);
    }
    return null;
  }

  /**
   * Validate player card data
   */
  validatePlayerCards(cards: PlayerCardData[], plaqueType: '4' | '5' | '6' | '7' | '8' | '9' | '10'): string[] {
    const errors: string[] = [];
    const maxCards = parseInt(plaqueType);

    if (cards.length > maxCards) {
      errors.push(`Too many cards for ${plaqueType}-spot plaque. Maximum: ${maxCards}`);
    }

    cards.forEach((card, index) => {
      if (!card.playerName?.trim()) {
        errors.push(`Card ${index + 1}: Player name is required`);
      }
      if (!card.imageUrl?.trim()) {
        errors.push(`Card ${index + 1}: Card image URL is required`);
      }
      if (card.price < 0) {
        errors.push(`Card ${index + 1}: Price must be positive`);
      }
    });

    return errors;
  }

  /**
   * Calculate total cost for plaque configuration
   */
  calculateTotalCost(config: PlaqueConfiguration, plaquePrice: number): number {
    const cardsCost = config.playerCards.reduce(
      (total, card) => total + card.price + (card.shipping || 0), 
      0
    );
    return plaquePrice + cardsCost;
  }

  /**
   * Generate preview metadata for storage
   */
  generatePreviewMetadata(config: PlaqueConfiguration): object {
    return {
      teamName: config.teamName,
      plaqueType: config.plaqueType,
      plaqueStyle: config.plaqueStyle,
      playerCount: config.playerCards.length,
      totalValue: config.playerCards.reduce((sum, card) => sum + card.price, 0),
      createdAt: new Date().toISOString(),
    };
  }
}

// Export singleton instance
export const previewMaker = new PreviewMakerService();
export default previewMaker; 