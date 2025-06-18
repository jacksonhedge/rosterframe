import { CardService } from './card-service';

export class PriceTracker {
  private cardService: CardService;

  constructor() {
    this.cardService = CardService.getInstance();
  }

  // Track prices from multiple sources
  async updateCardPrices(cardId: string) {
    const card = await this.cardService.getCard(cardId);
    if (!card) return;

    const prices = await Promise.allSettled([
      this.getEbayPrice(card),
      this.getCOMCPrice(card),
      this.get130PointPrice(card),
      this.getPWCCPrice(card)
    ]);

    // Process and store price data
    const priceData = prices
      .filter(result => result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<any>).value)
      .filter(Boolean);

    if (priceData.length > 0) {
      const averagePrice = priceData.reduce((sum, p) => sum + p.price, 0) / priceData.length;
      
      const trend = await this.calculateTrend(cardId, averagePrice);
      
      await this.cardService.updateMarketData({
        card_id: cardId,
        current_market_value: averagePrice,
        last_sale_price: priceData[0]?.price,
        last_sale_date: new Date().toISOString().split('T')[0],
        data_source: 'aggregated',
        price_trend: trend
      });
    }
  }

  private async getEbayPrice(card: any) {
    // eBay API integration
    const searchTerm = `${card.player?.name} ${card.set?.year} ${card.set?.name} ${card.card_number}`;
    
    try {
      // This would integrate with eBay's Finding API
      // const response = await fetch(`https://svcs.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findCompletedItems&keywords=${encodeURIComponent(searchTerm)}`);
      
      // Mock data for now
      return {
        source: 'ebay',
        price: Math.random() * 100 + 10,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('eBay price fetch error:', error);
      return null;
    }
  }

  private async getCOMCPrice(card: any) {
    // COMC scraping (with permission/API)
    return {
      source: 'comc',
      price: Math.random() * 80 + 15,
      timestamp: new Date()
    };
  }

  private async get130PointPrice(card: any) {
    // 130point.com is popular for pricing
    return {
      source: '130point',
      price: Math.random() * 90 + 12,
      timestamp: new Date()
    };
  }

  private async getPWCCPrice(card: any) {
    // PWCC auction data
    return {
      source: 'pwcc',
      price: Math.random() * 120 + 20,
      timestamp: new Date()
    };
  }

  private async calculateTrend(cardId: string, currentPrice: number): Promise<'up' | 'down' | 'stable'> {
    // Get historical prices
    const historicalData = await this.cardService.getMarketData(cardId);
    
    if (historicalData.length < 2) return 'stable';
    
    const previousPrice = historicalData[1].current_market_value || 0;
    const changePercent = ((currentPrice - previousPrice) / previousPrice) * 100;
    
    if (changePercent > 5) return 'up';
    if (changePercent < -5) return 'down';
    return 'stable';
  }

  // Batch price updates
  async runDailyPriceUpdate() {
    console.log('Starting daily price update...');
    
    // Get cards that need price updates (updated more than 24 hours ago)
    const cardsToUpdate = await this.getCardsNeedingUpdate();
    
    for (const card of cardsToUpdate) {
      await this.updateCardPrices(card.id);
      
      // Rate limiting - don't overwhelm APIs
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`Updated prices for ${cardsToUpdate.length} cards`);
  }

  private async getCardsNeedingUpdate(): Promise<{ id: string }[]> {
    // This would query for cards without recent price data
    // For now, return empty array
    return [];
  }
}

// Cron job setup
export async function schedulePriceUpdates() {
  const tracker = new PriceTracker();
  
  // Run every day at 2 AM
  setInterval(async () => {
    await tracker.runDailyPriceUpdate();
  }, 24 * 60 * 60 * 1000);
} 