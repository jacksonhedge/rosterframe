// eBay API utilities for fetching sports cards
// Uses eBay's Browse API for searching card listings

export interface EbayCard {
  id: string;
  name: string;
  year: number;
  brand: string;
  series: string;
  price: number;
  rarity: 'common' | 'rare' | 'legendary';
  imageUrl: string;
  condition?: string;
  seller?: string;
  shipping?: number;
  listingUrl?: string;
}

export interface EbaySearchResponse {
  href: string;
  total: number;
  next?: string;
  limit: number;
  offset: number;
  itemSummaries?: EbayItemSummary[];
}

export interface EbayItemSummary {
  itemId: string;
  title: string;
  price: {
    value: string;
    currency: string;
  };
  condition?: string;
  categories?: Array<{
    categoryId: string;
    categoryName: string;
  }>;
  image?: {
    imageUrl: string;
  };
  seller?: {
    username: string;
    feedbackPercentage: string;
    feedbackScore: number;
  };
  shippingOptions?: Array<{
    shippingCost: {
      value: string;
      currency: string;
    };
    type: string;
  }>;
  itemWebUrl: string;
  itemLocation?: {
    country: string;
  };
}

// Cache for storing fetched cards to avoid repeated API calls
const cardsCache = new Map<string, EbayCard[]>();

/**
 * Search for sports cards on eBay for a specific player
 */
export async function searchEbayCards(playerName: string): Promise<EbayCard[]> {
  const cacheKey = `ebay_${playerName.toLowerCase()}`;
  
  if (cardsCache.has(cacheKey)) {
    return cardsCache.get(cacheKey)!;
  }

  try {
    // For now, we'll return mock data that simulates eBay API responses
    // In production, you would replace this with actual eBay API calls
    const mockCards = generateMockEbayCards(playerName);
    
    cardsCache.set(cacheKey, mockCards);
    return mockCards;
    
    // TODO: Replace with actual eBay API integration
    // const ebayCards = await fetchFromEbayAPI(playerName);
    // return ebayCards;
    
  } catch (error) {
    console.error('Error fetching cards from eBay:', error);
    return [];
  }
}

/**
 * Generate mock eBay card data for development
 * This simulates what real eBay API responses would look like
 */
function generateMockEbayCards(playerName: string): EbayCard[] {
  const currentYear = new Date().getFullYear();
  const brands = ['Panini', 'Topps', 'Score', 'Select', 'Prizm', 'Donruss', 'Leaf'];
  const series = ['Base', 'Chrome', 'Prizm', 'Select', 'Optic', 'Prestige', 'Absolute'];
  const conditions = ['Mint', 'Near Mint', 'Excellent', 'Very Good', 'Good'];
  const sellers = ['SportsCardsPro', 'CardCentral', 'PremiumCards', 'QuickShip Cards', 'Elite Collectibles', 'Card Exchange'];

  const cards: EbayCard[] = [];

  // Generate 8-12 realistic card listings
  const numCards = Math.floor(Math.random() * 5) + 8; // 8-12 cards

  for (let i = 0; i < numCards; i++) {
    const year = currentYear - Math.floor(Math.random() * 3); // Last 3 years
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const seriesName = series[Math.floor(Math.random() * series.length)];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    const seller = sellers[Math.floor(Math.random() * sellers.length)];
    
    // Price logic based on brand and condition
    let basePrice = 4.99;
    if (brand === 'Panini' || brand === 'Topps') basePrice = 8.99;
    if (seriesName === 'Prizm' || seriesName === 'Select') basePrice = 12.99;
    if (condition === 'Mint') basePrice *= 1.3;
    if (condition === 'Near Mint') basePrice *= 1.1;
    
    // Add some randomness to pricing
    const price = Math.round((basePrice + (Math.random() * 10 - 5)) * 100) / 100;
    
    // Determine rarity based on price and brand
    let rarity: 'common' | 'rare' | 'legendary' = 'common';
    if (price > 15) rarity = 'legendary';
    else if (price > 8) rarity = 'rare';

    // Shipping cost (sometimes free)
    const shipping = Math.random() > 0.3 ? Math.round((Math.random() * 5 + 2.99) * 100) / 100 : 0;

    cards.push({
      id: `ebay-${playerName.toLowerCase().replace(/\s+/g, '-')}-${i}`,
      name: playerName,
      year,
      brand,
      series: seriesName,
      price: Math.max(price, 1.99), // Minimum price
      rarity,
      imageUrl: `/cards/${brand.toLowerCase()}-${seriesName.toLowerCase()}.jpg`,
      condition,
      seller,
      shipping: shipping > 0 ? shipping : undefined,
      listingUrl: `https://ebay.com/itm/mock-listing-${i}`,
    });
  }

  // Sort by price (ascending) to show cheapest options first
  return cards.sort((a, b) => {
    const totalA = a.price + (a.shipping || 0);
    const totalB = b.price + (b.shipping || 0);
    return totalA - totalB;
  });
}

/**
 * Actual eBay API integration (to be implemented)
 * This is where you would make real API calls to eBay
 */
async function fetchFromEbayAPI(playerName: string): Promise<EbayCard[]> {
  // TODO: Implement actual eBay API integration
  // This would require:
  // 1. eBay Developer Account & API Keys
  // 2. OAuth 2.0 authentication
  // 3. Browse API calls
  // 4. Proper error handling and rate limiting
  
  const EBAY_API_BASE = 'https://api.ebay.com/buy/browse/v1';
  const EBAY_APP_ID = process.env.EBAY_APP_ID; // Set in environment variables
  
  if (!EBAY_APP_ID) {
    throw new Error('eBay API credentials not configured');
  }

  const searchQuery = encodeURIComponent(`${playerName} football card`);
  const categoryId = '213'; // Sports Trading Cards category
  
  const url = `${EBAY_API_BASE}/item_summary/search?q=${searchQuery}&category_ids=${categoryId}&limit=20&sort=price&filter=deliveryCountry:US,conditionIds:{1000|1500|2000|2500|3000}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${EBAY_APP_ID}`, // In production, use OAuth token
        'Content-Type': 'application/json',
        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
      },
    });

    if (!response.ok) {
      throw new Error(`eBay API error: ${response.status}`);
    }

    const data: EbaySearchResponse = await response.json();
    
    if (!data.itemSummaries) {
      return [];
    }

    // Convert eBay API response to our card format
    return data.itemSummaries.map((item, index) => convertEbayItemToCard(item, playerName, index));
    
  } catch (error) {
    console.error('eBay API request failed:', error);
    throw error;
  }
}

/**
 * Convert eBay API item to our card format
 */
function convertEbayItemToCard(item: EbayItemSummary, playerName: string, index: number): EbayCard {
  // Extract card info from title using common patterns
  const title = item.title.toLowerCase();
  
  // Extract year (look for 4-digit years)
  const yearMatch = title.match(/\b(20\d{2})\b/);
  const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();
  
  // Extract brand (common card brands)
  const brands = ['panini', 'topps', 'score', 'select', 'prizm', 'donruss', 'leaf'];
  const brand = brands.find(b => title.includes(b)) || 'Unknown';
  
  // Extract series/set
  const series = ['base', 'chrome', 'prizm', 'select', 'optic', 'prestige', 'absolute'];
  const seriesName = series.find(s => title.includes(s)) || 'Base';
  
  // Determine rarity based on price
  const price = parseFloat(item.price.value);
  let rarity: 'common' | 'rare' | 'legendary' = 'common';
  if (price > 20) rarity = 'legendary';
  else if (price > 10) rarity = 'rare';

  // Extract shipping cost
  const shippingCost = item.shippingOptions?.[0]?.shippingCost?.value;
  const shipping = shippingCost ? parseFloat(shippingCost) : undefined;

  return {
    id: item.itemId,
    name: playerName,
    year,
    brand: brand.charAt(0).toUpperCase() + brand.slice(1),
    series: seriesName.charAt(0).toUpperCase() + seriesName.slice(1),
    price,
    rarity,
    imageUrl: item.image?.imageUrl || '/cards/default.jpg',
    condition: item.condition || 'Used',
    seller: item.seller?.username,
    shipping,
    listingUrl: item.itemWebUrl,
  };
}

/**
 * Get eBay OAuth token (for production use)
 */
async function getEbayOAuthToken(): Promise<string> {
  // TODO: Implement OAuth flow for eBay API
  // This would handle getting and refreshing access tokens
  throw new Error('eBay OAuth not yet implemented');
} 