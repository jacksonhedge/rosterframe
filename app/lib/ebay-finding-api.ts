// eBay Finding API Service - Public API for searching eBay listings without authentication

export interface FindingAPIItem {
  itemId: string;
  title: string;
  viewItemURL: string;
  galleryURL?: string;
  pictureURLLarge?: string;
  pictureURLSuperSize?: string;
  currentPrice: {
    value: string;
    currencyId: string;
  };
  sellingStatus: {
    currentPrice: {
      value: string;
      currencyId: string;
    };
    sellingState: string;
    timeLeft?: string;
    bidCount?: string;
  };
  listingInfo: {
    startTime: string;
    endTime: string;
    listingType: string;
    buyItNowAvailable?: string;
  };
  primaryCategory: {
    categoryId: string;
    categoryName: string;
  };
  condition?: {
    conditionId: string;
    conditionDisplayName: string;
  };
  sellerInfo: {
    sellerUserName: string;
    feedbackScore: string;
    positiveFeedbackPercent: string;
  };
  shippingInfo?: {
    shippingServiceCost?: {
      value: string;
      currencyId: string;
    };
    shippingType: string;
    shipToLocations: string;
  };
  location?: string;
  country?: string;
}

export interface FindingAPIResponse {
  findItemsAdvancedResponse: [{
    ack: string[];
    version: string[];
    timestamp: string[];
    searchResult: [{
      '@count': string;
      item?: FindingAPIItem[];
    }];
    paginationOutput: [{
      pageNumber: string[];
      entriesPerPage: string[];
      totalPages: string[];
      totalEntries: string[];
    }];
    itemSearchURL?: string[];
    errorMessage?: [{
      error: [{
        errorId: string[];
        domain: string[];
        severity: string[];
        category: string[];
        message: string[];
      }];
    }];
  }];
}

class EBayFindingAPIService {
  private readonly FINDING_API_URL = 'https://svcs.ebay.com/services/search/FindingService/v1';
  
  // Get App ID dynamically for server-side usage
  private getAppId(): string {
    return process.env.EBAY_APP_ID || '';
  }

  /**
   * Search for sports cards on eBay using the Finding API
   */
  async searchCards(params: {
    keywords: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    sortOrder?: string;
    limit?: number;
    page?: number;
  }): Promise<{
    items: any[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
  }> {
    // Check if we have a valid App ID
    const appId = this.getAppId();
    if (!appId) {
      console.warn('eBay App ID not configured. Using mock data fallback.');
      throw new Error('eBay API credentials not configured');
    }
    
    console.log('Using eBay App ID:', appId.substring(0, 8) + '...');
    
    try {
      const url = new URL(this.FINDING_API_URL);
      
      // Set required parameters
      url.searchParams.set('OPERATION-NAME', 'findItemsAdvanced');
      url.searchParams.set('SERVICE-VERSION', '1.0.0');
      url.searchParams.set('SECURITY-APPNAME', appId);
      url.searchParams.set('RESPONSE-DATA-FORMAT', 'JSON');
      url.searchParams.set('REST-PAYLOAD', '');
      
      // Set search parameters
      url.searchParams.set('keywords', params.keywords);
      url.searchParams.set('paginationInput.entriesPerPage', (params.limit || 20).toString());
      url.searchParams.set('paginationInput.pageNumber', (params.page || 1).toString());
      
      // Category for Sports Trading Cards
      if (params.categoryId) {
        url.searchParams.set('categoryId', params.categoryId);
      } else {
        url.searchParams.set('categoryId', '212'); // Sports Trading Cards
      }
      
      // Price filter
      let filterIndex = 0;
      if (params.minPrice !== undefined) {
        url.searchParams.set(`itemFilter(${filterIndex}).name`, 'MinPrice');
        url.searchParams.set(`itemFilter(${filterIndex}).value`, params.minPrice.toString());
        filterIndex++;
      }
      
      if (params.maxPrice !== undefined) {
        url.searchParams.set(`itemFilter(${filterIndex}).name`, 'MaxPrice');
        url.searchParams.set(`itemFilter(${filterIndex}).value`, params.maxPrice.toString());
        filterIndex++;
      }
      
      // Only show items with gallery images
      url.searchParams.set(`itemFilter(${filterIndex}).name`, 'HideDuplicateItems');
      url.searchParams.set(`itemFilter(${filterIndex}).value`, 'true');
      filterIndex++;
      
      // Sort order
      const sortOrderMap: Record<string, string> = {
        'BestMatch': 'BestMatch',
        'CurrentPriceHighest': 'CurrentPriceHighest',
        'PricePlusShippingLowest': 'PricePlusShippingLowest',
        'EndTimeSoonest': 'EndTimeSoonest'
      };
      url.searchParams.set('sortOrder', sortOrderMap[params.sortOrder || 'BestMatch'] || 'BestMatch');
      
      // Output selector for additional data
      url.searchParams.set('outputSelector(0)', 'SellerInfo');
      url.searchParams.set('outputSelector(1)', 'PictureURLLarge');
      url.searchParams.set('outputSelector(2)', 'PictureURLSuperSize');
      url.searchParams.set('outputSelector(3)', 'ConditionHistogram');
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`eBay Finding API error: ${response.status} ${response.statusText}`);
      }
      
      const data: FindingAPIResponse = await response.json();
      
      // Check for API errors
      const apiResponse = data.findItemsAdvancedResponse[0];
      if (apiResponse.ack[0] !== 'Success' && apiResponse.errorMessage) {
        const error = apiResponse.errorMessage[0].error[0];
        const errorId = error.errorId[0];
        const errorMessage = error.message[0];
        
        // Check for rate limit error
        if (errorId === '10001' && errorMessage.includes('exceeded the number of times')) {
          console.warn('eBay API rate limit reached. Using fallback data.');
          throw new Error('RATE_LIMIT_EXCEEDED');
        }
        
        throw new Error(`eBay API Error: ${errorMessage}`);
      }
      
      // Parse the response
      const searchResult = apiResponse.searchResult[0];
      const paginationOutput = apiResponse.paginationOutput[0];
      
      const items = (searchResult.item || []).map(item => this.transformItem(item));
      
      return {
        items,
        totalItems: parseInt(paginationOutput.totalEntries[0] || '0'),
        totalPages: parseInt(paginationOutput.totalPages[0] || '0'),
        currentPage: parseInt(paginationOutput.pageNumber[0] || '1')
      };
      
    } catch (error) {
      console.error('eBay Finding API error:', error);
      throw error;
    }
  }
  
  /**
   * Transform Finding API item to our format
   */
  private transformItem(item: FindingAPIItem): any {
    const price = parseFloat(item.sellingStatus.currentPrice.value);
    const shippingCost = item.shippingInfo?.shippingServiceCost?.value 
      ? parseFloat(item.shippingInfo.shippingServiceCost.value) 
      : 0;
    
    // Get the best available image
    const imageUrl = item.pictureURLSuperSize || 
                     item.pictureURLLarge || 
                     item.galleryURL || 
                     '';
    
    return {
      ebayItemId: item.itemId,
      title: item.title,
      currentPrice: price,
      listingUrl: item.viewItemURL,
      imageUrls: imageUrl ? [imageUrl] : [],
      seller: {
        username: item.sellerInfo.sellerUserName,
        feedbackScore: parseInt(item.sellerInfo.feedbackScore),
        feedbackPercentage: parseFloat(item.sellerInfo.positiveFeedbackPercent)
      },
      location: item.location || item.country || 'Unknown',
      endTime: item.listingInfo.endTime,
      listingType: this.determineListingType(item.listingInfo),
      categoryId: item.primaryCategory.categoryId,
      condition: item.condition?.conditionDisplayName || 'Not specified',
      shipping: {
        cost: shippingCost,
        expedited: false,
        international: item.shippingInfo?.shipToLocations === 'Worldwide'
      },
      bids: item.sellingStatus.bidCount ? parseInt(item.sellingStatus.bidCount) : undefined,
      timeLeft: item.sellingStatus.timeLeft
    };
  }
  
  /**
   * Determine listing type from item data
   */
  private determineListingType(listingInfo: FindingAPIItem['listingInfo']): 'Auction' | 'FixedPrice' | 'BuyItNow' {
    const listingType = listingInfo.listingType.toLowerCase();
    
    if (listingType.includes('auction')) {
      return 'Auction';
    } else if (listingType.includes('fixedprice') || listingType.includes('storefixedprice')) {
      return 'FixedPrice';
    } else if (listingInfo.buyItNowAvailable === 'true') {
      return 'BuyItNow';
    }
    
    return 'FixedPrice';
  }
}

// Export singleton instance
export const ebayFindingAPI = new EBayFindingAPIService();