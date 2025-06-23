// Card Inventory Data
// This file contains the card inventory with actual card images

export interface InventoryCard {
  id: string;
  playerName: string;
  position: string;
  team?: string;
  year: number;
  brand: string;
  series: string;
  cardNumber?: string;
  condition: string;
  price: number;
  imageUrl: string;
  backImageUrl?: string;
  inStock: boolean;
  quantity: number;
  rarity: 'common' | 'rare' | 'legendary';
  rookieCard: boolean;
  notes?: string;
}

export const cardInventory: InventoryCard[] = [
  // Score Cards from CamScanner
  {
    id: 'mahomes-score-2023',
    playerName: 'Patrick Mahomes',
    position: 'Quarterback',
    team: 'Kansas City Chiefs',
    year: 2023,
    brand: 'Score',
    series: 'Base',
    cardNumber: '250',
    condition: 'Near Mint',
    price: 19.99,
    imageUrl: '/images/cards/PatrickMahomesScore.jpg',
    inStock: true,
    quantity: 1,
    rarity: 'rare',
    rookieCard: false,
    notes: 'Super Bowl MVP - Premium QB card'
  },
  {
    id: 'aubrey-score-2023',
    playerName: 'Brandon Aubrey',
    position: 'Kicker',
    team: 'Dallas Cowboys',
    year: 2023,
    brand: 'Score',
    series: 'Base',
    cardNumber: '189',
    condition: 'Near Mint',
    price: 8.99,
    imageUrl: '/images/cards/BrandonAubreyScore.jpg',
    inStock: true,
    quantity: 1,
    rarity: 'common',
    rookieCard: true,
    notes: 'Rookie kicker - Perfect for fantasy teams'
  },
  {
    id: 'likely-score-2023',
    playerName: 'Isaiah Likely',
    position: 'Tight End',
    team: 'Baltimore Ravens',
    year: 2023,
    brand: 'Score',
    series: 'Base',
    cardNumber: '142',
    condition: 'Near Mint',
    price: 12.99,
    imageUrl: '/images/cards/IsiahLikelyScore.jpg',
    inStock: true,
    quantity: 1,
    rarity: 'common',
    rookieCard: false,
    notes: 'Rising star TE'
  },
  {
    id: 'waddle-score-2023',
    playerName: 'Jaylen Waddle',
    position: 'Wide Receiver',
    team: 'Miami Dolphins',
    year: 2023,
    brand: 'Score',
    series: 'Base',
    cardNumber: '78',
    condition: 'Near Mint',
    price: 15.99,
    imageUrl: '/images/cards/JaylenWaddleScore.jpg',
    inStock: true,
    quantity: 1,
    rarity: 'rare',
    rookieCard: false,
    notes: 'Elite WR - Speed demon'
  },
  {
    id: 'stbrown-score-2023',
    playerName: 'Amon-Ra St. Brown',
    position: 'Wide Receiver',
    team: 'Detroit Lions',
    year: 2023,
    brand: 'Score',
    series: 'Base',
    cardNumber: '95',
    condition: 'Near Mint',
    price: 17.99,
    imageUrl: '/images/cards/AmonRaStBrownScore.jpg',
    inStock: true,
    quantity: 1,
    rarity: 'rare',
    rookieCard: false,
    notes: 'PPR fantasy beast'
  },
  {
    id: 'godwin-score-2023',
    playerName: 'Chris Godwin',
    position: 'Wide Receiver',
    team: 'Tampa Bay Buccaneers',
    year: 2023,
    brand: 'Score',
    series: 'Base',
    cardNumber: '167',
    condition: 'Near Mint',
    price: 14.99,
    imageUrl: '/images/cards/ChrisGodwinScore.jpg',
    inStock: true,
    quantity: 1,
    rarity: 'common',
    rookieCard: false,
    notes: 'Reliable WR option'
  },
  {
    id: 'taylor-score-2023',
    playerName: 'Jonathan Taylor',
    position: 'Running Back',
    team: 'Indianapolis Colts',
    year: 2023,
    brand: 'Score',
    series: 'Base',
    cardNumber: '45',
    condition: 'Near Mint',
    price: 18.99,
    imageUrl: '/images/cards/JonathanTaylorScore.jpg',
    inStock: true,
    quantity: 1,
    rarity: 'rare',
    rookieCard: false,
    notes: 'Elite RB when healthy'
  },
  {
    id: 'gibson-score-2023',
    playerName: 'Antonio Gibson',
    position: 'Running Back',
    team: 'Washington Commanders',
    year: 2023,
    brand: 'Score',
    series: 'Base',
    cardNumber: '203',
    condition: 'Near Mint',
    price: 10.99,
    imageUrl: '/images/cards/AntonioGibsonScore.jpg',
    inStock: true,
    quantity: 1,
    rarity: 'common',
    rookieCard: false,
    notes: 'Versatile RB/WR'
  }
];

// Helper function to get cards by player name
export function getCardsByPlayer(playerName: string): InventoryCard[] {
  return cardInventory.filter(card => 
    card.playerName.toLowerCase().includes(playerName.toLowerCase())
  );
}

// Helper function to get available cards for roster building
export function getAvailableCards(): InventoryCard[] {
  return cardInventory.filter(card => card.inStock && card.quantity > 0);
}

// Helper function to get card by ID
export function getCardById(id: string): InventoryCard | undefined {
  return cardInventory.find(card => card.id === id);
}