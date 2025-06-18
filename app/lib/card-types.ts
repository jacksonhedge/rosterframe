// Sports Card Database Types

export interface Sport {
  id: string;
  name: string;
  abbreviation: string;
  created_at: string;
}

export interface Position {
  id: string;
  sport_id: string;
  name: string;
  abbreviation: string;
  created_at: string;
  sport?: Sport;
}

export interface Team {
  id: string;
  sport_id: string;
  name: string;
  city?: string;
  abbreviation?: string;
  founded_year?: number;
  active: boolean;
  colors?: string[];
  logo_url?: string;
  created_at: string;
  sport?: Sport;
}

export interface Player {
  id: string;
  name: string;
  sport_id: string;
  position_id?: string;
  team_id?: string;
  birth_date?: string;
  debut_date?: string;
  retirement_date?: string;
  active: boolean;
  stats?: Record<string, any>;
  achievements?: string[];
  created_at: string;
  sport?: Sport;
  position?: Position;
  team?: Team;
}

export interface CardManufacturer {
  id: string;
  name: string;
  abbreviation?: string;
  founded_year?: number;
  description?: string;
  created_at: string;
}

export interface CardSet {
  id: string;
  manufacturer_id: string;
  sport_id: string;
  name: string;
  year: number;
  total_cards?: number;
  set_type?: string; // 'base', 'insert', 'premium', etc.
  series_name?: string;
  significance_level: number; // 1-10 scale
  description?: string;
  release_date?: string;
  created_at: string;
  manufacturer?: CardManufacturer;
  sport?: Sport;
}

export interface GradingCompany {
  id: string;
  name: string;
  abbreviation: string;
  max_grade: number;
  grade_scale: string; // '1-10', '1-100', etc.
  established_year?: number;
  created_at: string;
}

export interface Card {
  id: string;
  player_id: string;
  set_id: string;
  team_id?: string;
  card_number: string;
  card_type: string; // 'base', 'insert', 'parallel', 'autograph', 'memorabilia', 'patch'
  print_run?: number;
  serial_number?: number;
  rookie_card: boolean;
  error_card: boolean;
  error_description?: string;
  variations?: string[];
  rarity_level: number; // 1-10 scale
  subset_name?: string;
  card_front_image_url?: string;
  card_back_image_url?: string;
  created_at: string;
  player?: Player;
  set?: CardSet;
  team?: Team;
}

export interface GradeDetails {
  centering?: number;
  corners?: number;
  edges?: number;
  surface?: number;
}

export interface CardInstance {
  id: string;
  card_id: string;
  grading_company_id?: string;
  grade?: number;
  grade_details?: GradeDetails;
  condition_description?: string; // For raw cards
  certification_number?: string;
  grading_date?: string;
  notes?: string;
  authenticated: boolean;
  created_at: string;
  card?: Card;
  grading_company?: GradingCompany;
}

export interface CardMarketData {
  id: string;
  card_id: string;
  grading_company_id?: string;
  grade?: number;
  current_market_value?: number;
  last_sale_price?: number;
  last_sale_date?: string;
  population_count?: number;
  price_trend?: 'up' | 'down' | 'stable';
  sales_volume_30d?: number;
  average_price_30d?: number;
  highest_sale?: number;
  lowest_sale?: number;
  data_source?: string; // 'ebay', 'pwcc', 'goldin', etc.
  updated_at: string;
  created_at: string;
  card?: Card;
  grading_company?: GradingCompany;
}

export interface SellerProfile {
  id: string;
  user_id?: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  phone?: string;
  email?: string;
  verification_status: 'unverified' | 'pending' | 'verified';
  verification_documents?: string[];
  total_sales: number;
  total_purchases: number;
  join_date: string;
  last_active: string;
  is_active: boolean;
  created_at: string;
  // Computed fields
  average_rating?: number;
  total_ratings?: number;
}

export interface SellerRating {
  id: string;
  seller_id: string;
  reviewer_id: string;
  transaction_id?: string;
  rating: number; // 1-5
  review_text?: string;
  communication_rating?: number; // 1-5
  shipping_speed_rating?: number; // 1-5
  item_condition_rating?: number; // 1-5
  would_buy_again?: boolean;
  created_at: string;
  seller?: SellerProfile;
  reviewer?: SellerProfile;
}

export interface CardListing {
  id: string;
  seller_id: string;
  card_instance_id: string;
  title: string;
  description?: string;
  asking_price: number;
  condition_notes?: string;
  listing_images?: string[];
  shipping_cost: number;
  shipping_methods?: string[];
  accepts_offers: boolean;
  minimum_offer?: number;
  listing_status: 'active' | 'sold' | 'paused' | 'expired';
  views_count: number;
  favorites_count: number;
  listed_at: string;
  expires_at?: string;
  sold_at?: string;
  sold_price?: number;
  created_at: string;
  updated_at: string;
  seller?: SellerProfile;
  card_instance?: CardInstance;
}

export interface Transaction {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  final_price: number;
  shipping_cost: number;
  total_amount: number;
  payment_method?: string;
  payment_status: 'pending' | 'paid' | 'refunded' | 'failed';
  shipping_status: 'not_shipped' | 'shipped' | 'delivered' | 'returned';
  tracking_number?: string;
  shipping_address?: any; // JSONB
  transaction_date: string;
  shipped_date?: string;
  delivered_date?: string;
  notes?: string;
  created_at: string;
  listing?: CardListing;
  buyer?: SellerProfile;
  seller?: SellerProfile;
}

export interface ListingFavorite {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
  listing?: CardListing;
}

export interface ListingOffer {
  id: string;
  listing_id: string;
  buyer_id: string;
  offer_amount: number;
  message?: string;
  offer_status: 'pending' | 'accepted' | 'declined' | 'withdrawn' | 'expired';
  expires_at?: string;
  responded_at?: string;
  created_at: string;
  listing?: CardListing;
  buyer?: SellerProfile;
}

export interface UserCollection {
  id: string;
  user_id: string;
  card_instance_id: string;
  acquisition_date?: string;
  acquisition_price?: number;
  acquisition_source?: string;
  notes?: string;
  for_sale: boolean;
  asking_price?: number;
  created_at: string;
  card_instance?: CardInstance;
}

// API Response Types
export interface CardSearchFilters {
  sport?: string;
  player_name?: string;
  team?: string;
  year?: number;
  manufacturer?: string;
  set_name?: string;
  card_type?: string;
  rookie_card?: boolean;
  graded_only?: boolean;
  min_grade?: number;
  max_grade?: number;
  min_price?: number;
  max_price?: number;
}

export interface CardSearchResult {
  cards: Card[];
  total_count: number;
  filters_applied: CardSearchFilters;
}

export interface PopularCard {
  card: Card;
  market_data: CardMarketData;
  recent_sales: number;
  price_change_percentage: number;
}

export interface CardStats {
  total_cards: number;
  total_players: number;
  total_sets: number;
  average_market_value: number;
  most_valuable_card: Card | null;
  trending_cards: PopularCard[];
}

// Form/Input Types
export interface CreateCardInput {
  player_id: string;
  set_id: string;
  team_id?: string;
  card_number: string;
  card_type: string;
  print_run?: number;
  serial_number?: number;
  rookie_card: boolean;
  error_card: boolean;
  error_description?: string;
  variations?: string[];
  rarity_level: number;
  subset_name?: string;
  card_front_image_url?: string;
  card_back_image_url?: string;
}

export interface CreatePlayerInput {
  name: string;
  sport_id: string;
  position_id?: string;
  birth_date?: string;
  debut_date?: string;
  retirement_date?: string;
  active: boolean;
  stats?: Record<string, any>;
  achievements?: string[];
}

export interface CreateCardSetInput {
  manufacturer_id: string;
  sport_id: string;
  name: string;
  year: number;
  total_cards?: number;
  set_type?: string;
  series_name?: string;
  significance_level: number;
  description?: string;
  release_date?: string;
}

export interface CreateCardInstanceInput {
  card_id: string;
  grading_company_id?: string;
  grade?: number;
  grade_details?: GradeDetails;
  condition_description?: string;
  certification_number?: string;
  grading_date?: string;
  notes?: string;
  authenticated: boolean;
}

export interface UpdateMarketDataInput {
  card_id: string;
  grading_company_id?: string;
  grade?: number;
  current_market_value?: number;
  last_sale_price?: number;
  last_sale_date?: string;
  population_count?: number;
  price_trend?: 'up' | 'down' | 'stable';
  sales_volume_30d?: number;
  average_price_30d?: number;
  highest_sale?: number;
  lowest_sale?: number;
  data_source?: string;
}

// Marketplace Form Types
export interface CreateSellerProfileInput {
  username: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  phone?: string;
  email?: string;
}

export interface CreateCardListingInput {
  seller_id: string;
  card_instance_id: string;
  title: string;
  description?: string;
  asking_price: number;
  condition_notes?: string;
  listing_images?: string[];
  shipping_cost: number;
  shipping_methods?: string[];
  accepts_offers: boolean;
  minimum_offer?: number;
  expires_at?: string;
}

export interface CreateSellerRatingInput {
  seller_id: string;
  reviewer_id: string;
  transaction_id?: string;
  rating: number;
  review_text?: string;
  communication_rating?: number;
  shipping_speed_rating?: number;
  item_condition_rating?: number;
  would_buy_again?: boolean;
}

export interface CreateListingOfferInput {
  listing_id: string;
  buyer_id: string;
  offer_amount: number;
  message?: string;
  expires_at?: string;
}

export interface CreateTransactionInput {
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  final_price: number;
  shipping_cost: number;
  total_amount: number;
  payment_method?: string;
  shipping_address?: any;
}

// Search and Filter Types
export interface MarketplaceSearchFilters {
  sport?: string;
  player_name?: string;
  team?: string;
  year?: number;
  manufacturer?: string;
  set_name?: string;
  card_type?: string;
  rookie_card?: boolean;
  min_price?: number;
  max_price?: number;
  condition?: string;
  graded_only?: boolean;
  min_grade?: number;
  max_grade?: number;
  seller_rating?: number;
  verified_sellers_only?: boolean;
  location?: string;
  accepts_offers?: boolean;
  sort_by?: 'price_low' | 'price_high' | 'newest' | 'ending_soon' | 'most_watched';
}

export interface SellerSearchFilters {
  username?: string;
  location?: string;
  verification_status?: 'unverified' | 'pending' | 'verified';
  min_rating?: number;
  min_sales?: number;
}

export interface MarketplaceSearchResult {
  listings: CardListing[];
  total_count: number;
  filters_applied: MarketplaceSearchFilters;
}

// Utility Types
export type CardType = 'base' | 'insert' | 'parallel' | 'autograph' | 'memorabilia' | 'patch';
export type SetType = 'base' | 'insert' | 'premium' | 'hobby' | 'retail';
export type PriceTrend = 'up' | 'down' | 'stable';
export type DataSource = 'ebay' | 'pwcc' | 'goldin' | 'heritage' | 'manual';
export type VerificationStatus = 'unverified' | 'pending' | 'verified';
export type ListingStatus = 'active' | 'sold' | 'paused' | 'expired';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';
export type ShippingStatus = 'not_shipped' | 'shipped' | 'delivered' | 'returned';
export type OfferStatus = 'pending' | 'accepted' | 'declined' | 'withdrawn' | 'expired';

// Constants
export const CARD_TYPES: { value: CardType; label: string }[] = [
  { value: 'base', label: 'Base Card' },
  { value: 'insert', label: 'Insert Card' },
  { value: 'parallel', label: 'Parallel Card' },
  { value: 'autograph', label: 'Autograph Card' },
  { value: 'memorabilia', label: 'Memorabilia Card' },
  { value: 'patch', label: 'Patch Card' },
];

export const SET_TYPES: { value: SetType; label: string }[] = [
  { value: 'base', label: 'Base Set' },
  { value: 'insert', label: 'Insert Set' },
  { value: 'premium', label: 'Premium Set' },
  { value: 'hobby', label: 'Hobby Exclusive' },
  { value: 'retail', label: 'Retail Exclusive' },
];

export const RARITY_LEVELS: { value: number; label: string }[] = [
  { value: 1, label: 'Common (1)' },
  { value: 2, label: 'Uncommon (2)' },
  { value: 3, label: 'Semi-Rare (3)' },
  { value: 4, label: 'Rare (4)' },
  { value: 5, label: 'Very Rare (5)' },
  { value: 6, label: 'Super Rare (6)' },
  { value: 7, label: 'Ultra Rare (7)' },
  { value: 8, label: 'Legendary (8)' },
  { value: 9, label: 'Mythic (9)' },
  { value: 10, label: 'One-of-One (10)' },
];

export const SIGNIFICANCE_LEVELS: { value: number; label: string }[] = [
  { value: 1, label: 'Standard (1)' },
  { value: 2, label: 'Notable (2)' },
  { value: 3, label: 'Popular (3)' },
  { value: 4, label: 'Important (4)' },
  { value: 5, label: 'Significant (5)' },
  { value: 6, label: 'Major (6)' },
  { value: 7, label: 'Iconic (7)' },
  { value: 8, label: 'Legendary (8)' },
  { value: 9, label: 'Historic (9)' },
  { value: 10, label: 'Milestone (10)' },
];

// Marketplace Constants
export const VERIFICATION_STATUSES: { value: VerificationStatus; label: string }[] = [
  { value: 'unverified', label: 'Unverified' },
  { value: 'pending', label: 'Pending Verification' },
  { value: 'verified', label: 'Verified Seller' },
];

export const LISTING_STATUSES: { value: ListingStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'sold', label: 'Sold' },
  { value: 'paused', label: 'Paused' },
  { value: 'expired', label: 'Expired' },
];

export const SHIPPING_METHODS: { value: string; label: string; description: string }[] = [
  { value: 'standard', label: 'Standard Shipping', description: '5-7 business days' },
  { value: 'priority', label: 'Priority Mail', description: '2-3 business days' },
  { value: 'overnight', label: 'Overnight Express', description: '1 business day' },
  { value: 'local-pickup', label: 'Local Pickup', description: 'Arrange pickup in person' },
];

export const PAYMENT_STATUSES: { value: PaymentStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Payment Pending', color: '#F59E0B' },
  { value: 'paid', label: 'Payment Complete', color: '#10B981' },
  { value: 'refunded', label: 'Refunded', color: '#6B7280' },
  { value: 'failed', label: 'Payment Failed', color: '#EF4444' },
];

export const SHIPPING_STATUSES: { value: ShippingStatus; label: string; color: string }[] = [
  { value: 'not_shipped', label: 'Not Shipped', color: '#6B7280' },
  { value: 'shipped', label: 'Shipped', color: '#3B82F6' },
  { value: 'delivered', label: 'Delivered', color: '#10B981' },
  { value: 'returned', label: 'Returned', color: '#EF4444' },
];

export const OFFER_STATUSES: { value: OfferStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending Response', color: '#F59E0B' },
  { value: 'accepted', label: 'Accepted', color: '#10B981' },
  { value: 'declined', label: 'Declined', color: '#EF4444' },
  { value: 'withdrawn', label: 'Withdrawn', color: '#6B7280' },
  { value: 'expired', label: 'Expired', color: '#9CA3AF' },
];

export const MARKETPLACE_SORT_OPTIONS: { value: string; label: string }[] = [
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest Listed' },
  { value: 'ending_soon', label: 'Ending Soon' },
  { value: 'most_watched', label: 'Most Watched' },
];

export const CONDITION_OPTIONS: { value: string; label: string; description: string }[] = [
  { value: 'mint', label: 'Mint', description: 'Perfect condition' },
  { value: 'near_mint', label: 'Near Mint', description: 'Slight imperfections' },
  { value: 'excellent', label: 'Excellent', description: 'Minor wear' },
  { value: 'very_good', label: 'Very Good', description: 'Noticeable wear' },
  { value: 'good', label: 'Good', description: 'Significant wear' },
  { value: 'fair', label: 'Fair', description: 'Heavy wear' },
  { value: 'poor', label: 'Poor', description: 'Damaged' },
]; 