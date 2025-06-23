// Mock eBay data for development/sandbox testing

export const mockEbayCards = [
  {
    id: 'mock-1',
    ebayItemId: 'v1|123456789|0',
    title: '2023 Patrick Mahomes Panini Prizm #15 PSA 10 Kansas City Chiefs',
    name: '2023 Patrick Mahomes Panini Prizm #15',
    playerName: 'Patrick Mahomes',
    year: 2023,
    brand: 'Panini',
    series: 'Prizm',
    condition: 'Mint',
    price: 125.00,
    currentPrice: 125.00,
    rarity: 'rare',
    imageUrl: 'https://i.ebayimg.com/images/g/mockAAOSwPatrickMahomes1/s-l1600.jpg',
    imageUrls: ['https://i.ebayimg.com/images/g/mockAAOSwPatrickMahomes1/s-l1600.jpg'],
    listingUrl: 'https://www.ebay.com/itm/mock-patrick-mahomes-1',
    seller: {
      username: 'sportscards_elite',
      feedbackScore: 2547,
      feedbackPercentage: 99.8
    },
    shipping: 4.99
  },
  {
    id: 'mock-2',
    ebayItemId: 'v1|223456789|0',
    title: '2020 Patrick Mahomes Topps Chrome Refractor #10 BGS 9.5',
    name: '2020 Patrick Mahomes Topps Chrome Refractor',
    playerName: 'Patrick Mahomes',
    year: 2020,
    brand: 'Topps',
    series: 'Chrome Refractor',
    condition: 'Near Mint/Mint',
    price: 89.99,
    currentPrice: 89.99,
    rarity: 'rare',
    imageUrl: 'https://i.ebayimg.com/images/g/mockAAOSwPatrickMahomes2/s-l1600.jpg',
    imageUrls: ['https://i.ebayimg.com/images/g/mockAAOSwPatrickMahomes2/s-l1600.jpg'],
    listingUrl: 'https://www.ebay.com/itm/mock-patrick-mahomes-2',
    seller: {
      username: 'certified_cards',
      feedbackScore: 5421,
      feedbackPercentage: 100.0
    },
    shipping: 3.99
  },
  {
    id: 'mock-3',
    ebayItemId: 'v1|323456789|0',
    title: '2022 Patrick Mahomes Donruss Optic Silver Prizm #KC1',
    name: '2022 Patrick Mahomes Donruss Optic Silver',
    playerName: 'Patrick Mahomes',
    year: 2022,
    brand: 'Donruss',
    series: 'Optic Silver Prizm',
    condition: 'Mint',
    price: 45.00,
    currentPrice: 45.00,
    rarity: 'common',
    imageUrl: 'https://i.ebayimg.com/images/g/mockAAOSwPatrickMahomes3/s-l1600.jpg',
    imageUrls: ['https://i.ebayimg.com/images/g/mockAAOSwPatrickMahomes3/s-l1600.jpg'],
    listingUrl: 'https://www.ebay.com/itm/mock-patrick-mahomes-3',
    seller: {
      username: 'kc_collectibles',
      feedbackScore: 892,
      feedbackPercentage: 98.5
    },
    shipping: 2.99
  },
  {
    id: 'mock-4',
    ebayItemId: 'v1|423456789|0',
    title: '2017 Patrick Mahomes Rookie Card Score #403 RC Chiefs',
    name: '2017 Patrick Mahomes Score Rookie Card',
    playerName: 'Patrick Mahomes',
    year: 2017,
    brand: 'Score',
    series: 'Rookie',
    condition: 'Near Mint',
    price: 35.00,
    currentPrice: 35.00,
    rarity: 'common',
    imageUrl: 'https://i.ebayimg.com/images/g/mockAAOSwPatrickMahomes4/s-l1600.jpg',
    imageUrls: ['https://i.ebayimg.com/images/g/mockAAOSwPatrickMahomes4/s-l1600.jpg'],
    listingUrl: 'https://www.ebay.com/itm/mock-patrick-mahomes-4',
    seller: {
      username: 'rookie_cards_shop',
      feedbackScore: 3214,
      feedbackPercentage: 99.2
    },
    shipping: 0.99
  },
  {
    id: 'mock-5',
    ebayItemId: 'v1|523456789|0',
    title: '2018 Patrick Mahomes Panini Select Concourse Level #88',
    name: '2018 Patrick Mahomes Panini Select',
    playerName: 'Patrick Mahomes',
    year: 2018,
    brand: 'Panini',
    series: 'Select',
    condition: 'Mint',
    price: 28.50,
    currentPrice: 28.50,
    rarity: 'common',
    imageUrl: 'https://i.ebayimg.com/images/g/mockAAOSwPatrickMahomes5/s-l1600.jpg',
    imageUrls: ['https://i.ebayimg.com/images/g/mockAAOSwPatrickMahomes5/s-l1600.jpg'],
    listingUrl: 'https://www.ebay.com/itm/mock-patrick-mahomes-5',
    seller: {
      username: 'gridiron_gems',
      feedbackScore: 1876,
      feedbackPercentage: 99.9
    },
    shipping: 3.50
  },
  {
    id: 'mock-6',
    ebayItemId: 'v1|623456789|0',
    title: '2021 Patrick Mahomes Mosaic Silver Prizm #250 PSA 9',
    name: '2021 Patrick Mahomes Mosaic Silver Prizm',
    playerName: 'Patrick Mahomes',
    year: 2021,
    brand: 'Panini',
    series: 'Mosaic Silver Prizm',
    condition: 'Mint',
    price: 75.00,
    currentPrice: 75.00,
    rarity: 'rare',
    imageUrl: 'https://i.ebayimg.com/images/g/mockAAOSwPatrickMahomes6/s-l1600.jpg',
    imageUrls: ['https://i.ebayimg.com/images/g/mockAAOSwPatrickMahomes6/s-l1600.jpg'],
    listingUrl: 'https://www.ebay.com/itm/mock-patrick-mahomes-6',
    seller: {
      username: 'graded_sports',
      feedbackScore: 7865,
      feedbackPercentage: 100.0
    },
    shipping: 5.00
  }
];

// Function to get mock cards for a player
export function getMockCardsForPlayer(playerName: string) {
  const searchTerm = playerName.toLowerCase();
  
  // For Patrick Mahomes, return our mock data
  if (searchTerm.includes('mahomes') || searchTerm.includes('patrick')) {
    return mockEbayCards;
  }
  
  // For other players, generate some random mock data
  const brands = ['Topps', 'Panini', 'Donruss', 'Upper Deck', 'Bowman'];
  const series = ['Base', 'Chrome', 'Prizm', 'Select', 'Optic', 'Rookie'];
  const conditions = ['Mint', 'Near Mint', 'Excellent'];
  
  return Array.from({ length: 6 }, (_, i) => {
    const year = 2018 + Math.floor(Math.random() * 6);
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const seriesType = series[Math.floor(Math.random() * series.length)];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    const price = Math.floor(Math.random() * 150) + 10;
    
    return {
      id: `mock-gen-${i}`,
      ebayItemId: `v1|9${i}23456789|0`,
      title: `${year} ${playerName} ${brand} ${seriesType} #${Math.floor(Math.random() * 300)}`,
      name: `${year} ${playerName} ${brand} ${seriesType}`,
      playerName: playerName,
      year: year,
      brand: brand,
      series: seriesType,
      condition: condition,
      price: price,
      currentPrice: price,
      rarity: price > 50 ? 'rare' : 'common',
      imageUrl: `https://i.ebayimg.com/images/g/mockAAOSw${playerName.replace(/\s/g, '')}${i}/s-l1600.jpg`,
      imageUrls: [`https://i.ebayimg.com/images/g/mockAAOSw${playerName.replace(/\s/g, '')}${i}/s-l1600.jpg`],
      listingUrl: `https://www.ebay.com/itm/mock-${playerName.toLowerCase().replace(/\s/g, '-')}-${i}`,
      seller: {
        username: `cards_seller_${i}`,
        feedbackScore: Math.floor(Math.random() * 5000) + 100,
        feedbackPercentage: 98 + Math.random() * 2
      },
      shipping: Math.floor(Math.random() * 5) + 1
    };
  });
}