// eBay API Service - Integration with eBay marketplace for card listings

export interface EBayCard {
  ebayItemId: string;
  title: string;
  playerName?: string;
  year?: number;
  brand?: string;
  series?: string;
  condition?: string;
  currentPrice: number;
  buyItNowPrice?: number;
  listingUrl: string;
  imageUrls: string[];
  seller: {
    username: string;
    feedbackScore: number;
    feedbackPercentage: number;
  };
  location: string;
  endTime: string;
  listingType: 'Auction' | 'FixedPrice' | 'BuyItNow';
  categoryId: string;
  description?: string;
  shipping?: {
    cost: number;
    expedited: boolean;
    international: boolean;
  };
}

export interface EBaySearchParams {
  keywords: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string[];
  sortOrder?: 'BestMatch' | 'CurrentPriceHighest' | 'PricePlusShippingLowest' | 'EndTimeSoonest';
  limit?: number;
  page?: number;
}

export interface EBaySearchResponse {
  items: EBayCard[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  hasMore: boolean;
}

class EBayAPIService {
  private appId: string;
  private devId: string;
  private certId: string;
  private environment: 'sandbox' | 'production';
  private baseUrl: string;
  private accessToken?: string;
  private tokenExpiry?: Date;

  constructor() {
    this.appId = process.env.EBAY_APP_ID || '';
    this.devId = process.env.EBAY_DEV_ID || '';
    this.certId = process.env.EBAY_CERT_ID || '';
    this.environment = (process.env.EBAY_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox';
    
    this.baseUrl = this.environment === 'sandbox' 
      ? process.env.EBAY_SANDBOX_BASE_URL || 'https://api.sandbox.ebay.com'
      : process.env.EBAY_PRODUCTION_BASE_URL || 'https://api.ebay.com';

    if (!this.appId || !this.devId || !this.certId) {
      throw new Error('eBay API credentials are required');
    }
  }

  /**
   * Get OAuth access token for eBay API calls
   */
  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const credentials = Buffer.from(`${this.appId}:${this.certId}`).toString('base64');
      
      const response = await fetch(`${this.baseUrl}/identity/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${credentials}`,
        },
        body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope',
      });

      if (!response.ok) {
        throw new Error(`eBay OAuth failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      
      // Set expiry to 5 minutes before actual expiry for safety
      const expirySeconds = data.expires_in - 300;
      this.tokenExpiry = new Date(Date.now() + (expirySeconds * 1000));

      return this.accessToken;
    } catch (error) {
      console.error('eBay OAuth error:', error);
      throw new Error('Failed to authenticate with eBay API');
    }
  }

  /**
   * Search for sports cards on eBay
   */
  async searchCards(params: EBaySearchParams): Promise<EBaySearchResponse> {
    try {
      const token = await this.getAccessToken();
      
      // Build search query with sports card focus
      const keywords = this.buildSportsCardQuery(params.keywords);
             const searchParams = new URLSearchParams({
         q: keywords,
         category_ids: params.categoryId || '212', // Sports Trading Cards category
         limit: (params.limit || 50).toString(),
         offset: (((params.page || 1) - 1) * (params.limit || 50)).toString(),
         filter: this.buildFilters(params),
         sort: params.sortOrder || 'BestMatch',
       });

      const response = await fetch(
        `${this.baseUrl}/buy/browse/v1/item_summary/search?${searchParams}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`eBay search failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseSearchResponse(data, params);

    } catch (error) {
      console.error('eBay search error:', error);
      throw new Error(`Failed to search eBay: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get detailed item information
   */
  async getItemDetails(itemId: string): Promise<EBayCard | null> {
    try {
      const token = await this.getAccessToken();
      
      const response = await fetch(
        `${this.baseUrl}/buy/browse/v1/item/${itemId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`eBay item details failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseItemDetails(data);

    } catch (error) {
      console.error('eBay item details error:', error);
      return null;
    }
  }

  /**
   * Build sports card specific search query
   */
  private buildSportsCardQuery(keywords: string): string {
    const sportCardTerms = ['card', 'rookie', 'trading card', 'sports card'];
    const hasCardTerm = sportCardTerms.some(term => 
      keywords.toLowerCase().includes(term.toLowerCase())
    );
    
    if (!hasCardTerm) {
      return `${keywords} trading card`;
    }
    
    return keywords;
  }

  /**
   * Build eBay API filters
   */
  private buildFilters(params: EBaySearchParams): string {
    const filters: string[] = [];
    
    if (params.minPrice) {
      filters.push(`price:[${params.minPrice}..${params.maxPrice || '*'}]`);
    }
    
    if (params.condition && params.condition.length > 0) {
      const conditionFilter = params.condition.map(c => `"${c}"`).join(',');
      filters.push(`conditionIds:{${conditionFilter}}`);
    }
    
    // Filter for listings with images
    filters.push('pictureURLSuperSize:true');
    
    // Filter for US listings only
    filters.push('itemLocationCountry:US');
    
    return filters.join(',');
  }

  /**
   * Parse eBay search response into our format
   */
  private parseSearchResponse(data: any, params: EBaySearchParams): EBaySearchResponse {
    const items: EBayCard[] = (data.itemSummaries || []).map((item: any) => 
      this.parseItemSummary(item)
    ).filter(Boolean);

    return {
      items,
      totalItems: data.total || 0,
      totalPages: Math.ceil((data.total || 0) / (params.limit || 50)),
      currentPage: params.page || 1,
      hasMore: (data.next || null) !== null,
    };
  }

  /**
   * Parse individual item from search results
   */
  private parseItemSummary(item: any): EBayCard | null {
    try {
      const price = item.price?.value ? parseFloat(item.price.value) : 0;
      const buyItNowPrice = item.buyItNowPrice?.value ? parseFloat(item.buyItNowPrice.value) : undefined;

      return {
        ebayItemId: item.itemId,
        title: item.title || '',
        playerName: this.extractPlayerName(item.title || ''),
        year: this.extractYear(item.title || ''),
        brand: this.extractBrand(item.title || ''),
        condition: item.condition || 'Unknown',
        currentPrice: price,
        buyItNowPrice,
        listingUrl: item.itemWebUrl || '',
        imageUrls: item.image?.imageUrl ? [item.image.imageUrl] : [],
        seller: {
          username: item.seller?.username || '',
          feedbackScore: item.seller?.feedbackScore || 0,
          feedbackPercentage: item.seller?.feedbackPercentage || 0,
        },
        location: item.itemLocation?.city || '',
        endTime: item.itemEndDate || '',
        listingType: this.determineListingType(item),
        categoryId: item.categories?.[0]?.categoryId || '',
                 shipping: {
           cost: parseFloat(item.shippingOptions?.[0]?.shippingCost?.value || '0'),
           expedited: item.shippingOptions?.[0]?.expeditedShipping || false,
           international: item.shippingOptions?.[0]?.globalShipping || false,
         },
      };
    } catch (error) {
      console.error('Error parsing eBay item:', error);
      return null;
    }
  }

  /**
   * Parse detailed item response
   */
  private parseItemDetails(data: any): EBayCard {
    const summary = this.parseItemSummary(data);
    if (!summary) {
      throw new Error('Failed to parse eBay item details');
    }

    // Add additional details from full item response
    return {
      ...summary,
      description: data.description || '',
      imageUrls: data.image?.imageUrl ? [data.image.imageUrl] : 
                 data.additionalImages?.map((img: any) => img.imageUrl) || [],
      series: this.extractSeries(data.title || '', data.description || ''),
    };
  }

  /**
   * Extract player name from title using common patterns
   */
  private extractPlayerName(title: string): string | undefined {
    // Common patterns for player names in card titles
    const patterns = [
      /^([A-Z][a-z]+ [A-Z][a-z]+)/,  // First Last at start
      /(\b[A-Z][a-z]+ [A-Z][a-z]+\b)/, // First Last anywhere
    ];

    for (const pattern of patterns) {
      const match = title.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    
    return undefined;
  }

  /**
   * Extract year from title
   */
  private extractYear(title: string): number | undefined {
    const yearMatch = title.match(/\b(19|20)\d{2}\b/);
    return yearMatch ? parseInt(yearMatch[0]) : undefined;
  }

  /**
   * Extract brand from title
   */
  private extractBrand(title: string): string | undefined {
    const brands = ['Panini', 'Topps', 'Upper Deck', 'Bowman', 'Donruss', 'Fleer', 'Score', 'Leaf'];
    const titleLower = title.toLowerCase();
    
    for (const brand of brands) {
      if (titleLower.includes(brand.toLowerCase())) {
        return brand;
      }
    }
    
    return undefined;
  }

  /**
   * Extract series/set from title and description
   */
  private extractSeries(title: string, description: string): string | undefined {
    const text = `${title} ${description}`.toLowerCase();
    const series = ['prizm', 'chrome', 'select', 'optic', 'mosaic', 'base', 'rookie', 'auto', 'patch'];
    
    for (const set of series) {
      if (text.includes(set)) {
        return set.charAt(0).toUpperCase() + set.slice(1);
      }
    }
    
    return undefined;
  }

  /**
   * Determine listing type from item data
   */
  private determineListingType(item: any): 'Auction' | 'FixedPrice' | 'BuyItNow' {
    if (item.buyItNowAvailable) return 'BuyItNow';
    if (item.bidCount && item.bidCount > 0) return 'Auction';
    return 'FixedPrice';
  }

  /**
   * Calculate our price with markup
   */
  calculateOurPrice(ebayPrice: number): number {
    const markupPercentage = parseFloat(process.env.EBAY_MARKUP_PERCENTAGE || '25');
    const markup = ebayPrice * (markupPercentage / 100);
    return Math.round((ebayPrice + markup) * 100) / 100;
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const token = await this.getAccessToken();
      return {
        success: true,
        message: `Successfully connected to eBay ${this.environment} API`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to connect to eBay API: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
}

// Export singleton instance
export const ebayAPI = new EBayAPIService();
export default ebayAPI; 