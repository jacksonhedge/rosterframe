import { createClient } from '@supabase/supabase-js';
import {
  Card,
  Player,
  CardSet,
  CardManufacturer,
  Team,
  Sport,
  Position,
  GradingCompany,
  CardInstance,
  CardMarketData,
  CardSearchFilters,
  CardSearchResult,
  CreateCardInput,
  CreatePlayerInput,
  CreateCardSetInput,
  CreateCardInstanceInput,
  UpdateMarketDataInput,
  CardStats,
  SellerProfile,
  SellerRating,
  CardListing,
  Transaction,
  ListingOffer,
  ListingFavorite,
  CreateSellerProfileInput,
  CreateCardListingInput,
  CreateSellerRatingInput,
  CreateListingOfferInput,
  CreateTransactionInput,
  MarketplaceSearchFilters,
  MarketplaceSearchResult,
  SellerSearchFilters
} from './card-types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export class CardService {
  private static instance: CardService;
  private supabase;

  constructor() {
    this.supabase = supabaseUrl && supabaseKey 
      ? createClient(supabaseUrl, supabaseKey)
      : null;
  }

  public static getInstance(): CardService {
    if (!CardService.instance) {
      CardService.instance = new CardService();
    }
    return CardService.instance;
  }

  private isConfigured(): boolean {
    return !!this.supabase;
  }

  private getSupabase() {
    if (!this.supabase) {
      throw new Error('Supabase not configured - check environment variables');
    }
    return this.supabase;
  }

  public getSupabaseClient() {
    return this.getSupabase();
  }

  // Reference Data Methods

  async getSports(): Promise<Sport[]> {
    if (!this.isConfigured()) {
      return [];
    }

    const { data, error } = await this.getSupabase()
      .from('sports')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  async getPositions(sportId?: string): Promise<Position[]> {
    if (!this.isConfigured()) {
      return [];
    }

    let query = this.getSupabase()
      .from('positions')
      .select(`
        *,
        sport:sports(*)
      `)
      .order('name');

    if (sportId) {
      query = query.eq('sport_id', sportId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getTeams(sportId?: string): Promise<Team[]> {
    if (!this.isConfigured()) {
      return [];
    }

    let query = this.getSupabase()
      .from('card_teams')
      .select(`
        *,
        sport:card_sports(*)
      `)
      .eq('active', true)
      .order('name');

    if (sportId) {
      query = query.eq('sport_id', sportId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getManufacturers(): Promise<CardManufacturer[]> {
    if (!this.isConfigured()) {
      return [];
    }

    const { data, error } = await this.getSupabase()
      .from('card_manufacturers')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  async getGradingCompanies(): Promise<GradingCompany[]> {
    if (!this.isConfigured()) {
      return [];
    }

    const { data, error } = await this.getSupabase()
      .from('grading_companies')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  // Player Methods

  async createPlayer(playerData: CreatePlayerInput): Promise<Player> {
    const { data, error } = await this.getSupabase()
      .from('card_players')
      .insert(playerData)
      .select(`
        *,
        sport:card_sports(*),
        position:card_positions(*)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async getPlayers(sportId?: string, searchTerm?: string): Promise<Player[]> {
    if (!this.isConfigured()) {
      return [];
    }

    let query = this.getSupabase()
      .from('card_players')
      .select(`
        *,
        sport:card_sports(*),
        position:card_positions(*)
      `)
      .order('name');

    if (sportId) {
      query = query.eq('sport_id', sportId);
    }

    if (searchTerm) {
      query = query.ilike('name', `%${searchTerm}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getPlayer(id: string): Promise<Player | null> {
    if (!this.isConfigured()) {
      return null;
    }

    const { data, error } = await this.getSupabase()
      .from('card_players')
      .select(`
        *,
        sport:card_sports(*),
        position:card_positions(*)
      `)
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  }

  // Card Set Methods

  async createCardSet(setData: CreateCardSetInput): Promise<CardSet> {
    const { data, error } = await this.supabase
      .from('card_sets')
      .insert(setData)
      .select(`
        *,
        manufacturer:card_manufacturers(*),
        sport:card_sports(*)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async getCardSets(filters?: { 
    sportId?: string; 
    manufacturerId?: string; 
    year?: number;
    searchTerm?: string;
  }): Promise<CardSet[]> {
    let query = this.supabase
      .from('card_sets')
      .select(`
        *,
        manufacturer:card_manufacturers(*),
        sport:card_sports(*)
      `)
      .order('year', { ascending: false });

    if (filters?.sportId) {
      query = query.eq('sport_id', filters.sportId);
    }

    if (filters?.manufacturerId) {
      query = query.eq('manufacturer_id', filters.manufacturerId);
    }

    if (filters?.year) {
      query = query.eq('year', filters.year);
    }

    if (filters?.searchTerm) {
      query = query.ilike('name', `%${filters.searchTerm}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getCardSet(id: string): Promise<CardSet | null> {
    const { data, error } = await this.supabase
      .from('card_sets')
      .select(`
        *,
        manufacturer:card_manufacturers(*),
        sport:card_sports(*)
      `)
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  }

  // Card Methods

  async createCard(cardData: CreateCardInput): Promise<Card> {
    const { data, error } = await this.supabase
      .from('cards')
      .insert(cardData)
      .select(`
        *,
        player:card_players(
          *,
          sport:card_sports(*),
          position:card_positions(*)
        ),
        set:card_sets(
          *,
          manufacturer:card_manufacturers(*),
          sport:card_sports(*)
        ),
        team:card_teams(*)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async searchCards(filters: CardSearchFilters, page: number = 1, limit: number = 20): Promise<CardSearchResult> {
    let query = this.supabase
      .from('cards')
      .select(`
        *,
        player:card_players(
          *,
          sport:card_sports(*),
          position:card_positions(*)
        ),
        set:card_sets(
          *,
          manufacturer:card_manufacturers(*),
          sport:card_sports(*)
        ),
        team:card_teams(*)
      `, { count: 'exact' });

    // Apply filters
    if (filters.sport) {
      query = query.eq('player.sport.abbreviation', filters.sport);
    }

    if (filters.player_name) {
      query = query.ilike('player.name', `%${filters.player_name}%`);
    }

    if (filters.team) {
      query = query.eq('team.abbreviation', filters.team);
    }

    if (filters.year) {
      query = query.eq('set.year', filters.year);
    }

    if (filters.manufacturer) {
      query = query.eq('set.manufacturer.abbreviation', filters.manufacturer);
    }

    if (filters.set_name) {
      query = query.ilike('set.name', `%${filters.set_name}%`);
    }

    if (filters.card_type) {
      query = query.eq('card_type', filters.card_type);
    }

    if (filters.rookie_card !== undefined) {
      query = query.eq('rookie_card', filters.rookie_card);
    }

    // Pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      cards: data || [],
      total_count: count || 0,
      filters_applied: filters
    };
  }

  async getCard(id: string): Promise<Card | null> {
    const { data, error } = await this.supabase
      .from('cards')
      .select(`
        *,
        player:card_players(
          *,
          sport:card_sports(*),
          position:card_positions(*)
        ),
        set:card_sets(
          *,
          manufacturer:card_manufacturers(*),
          sport:card_sports(*)
        ),
        team:card_teams(*)
      `)
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  }

  async getCardsByPlayer(playerId: string): Promise<Card[]> {
    const { data, error } = await this.supabase
      .from('cards')
      .select(`
        *,
        player:card_players(*),
        set:card_sets(
          *,
          manufacturer:card_manufacturers(*)
        ),
        team:card_teams(*)
      `)
      .eq('player_id', playerId)
      .order('set.year', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getCardsBySet(setId: string): Promise<Card[]> {
    const { data, error } = await this.supabase
      .from('cards')
      .select(`
        *,
        player:card_players(
          *,
          position:card_positions(*)
        ),
        set:card_sets(*),
        team:card_teams(*)
      `)
      .eq('set_id', setId)
      .order('card_number');

    if (error) throw error;
    return data || [];
  }

  // Card Instance Methods

  async createCardInstance(instanceData: CreateCardInstanceInput): Promise<CardInstance> {
    const { data, error } = await this.supabase
      .from('card_instances')
      .insert(instanceData)
      .select(`
        *,
        card:cards(
          *,
          player:card_players(*),
          set:card_sets(*)
        ),
        grading_company:grading_companies(*)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async getCardInstances(cardId: string): Promise<CardInstance[]> {
    const { data, error } = await this.supabase
      .from('card_instances')
      .select(`
        *,
        card:cards(
          *,
          player:card_players(*),
          set:card_sets(*)
        ),
        grading_company:grading_companies(*)
      `)
      .eq('card_id', cardId)
      .order('grade', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Market Data Methods

  async updateMarketData(marketData: UpdateMarketDataInput): Promise<CardMarketData> {
    const { data, error } = await this.supabase
      .from('card_market_data')
      .upsert({
        ...marketData,
        updated_at: new Date().toISOString()
      })
      .select(`
        *,
        card:cards(
          *,
          player:card_players(*),
          set:card_sets(*)
        ),
        grading_company:grading_companies(*)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async getMarketData(cardId: string, gradeFilter?: number): Promise<CardMarketData[]> {
    let query = this.supabase
      .from('card_market_data')
      .select(`
        *,
        card:cards(
          *,
          player:card_players(*),
          set:card_sets(*)
        ),
        grading_company:grading_companies(*)
      `)
      .eq('card_id', cardId)
      .order('updated_at', { ascending: false });

    if (gradeFilter !== undefined) {
      query = query.eq('grade', gradeFilter);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  // Statistics and Analytics

  async getCardStats(): Promise<CardStats> {
    // Get total counts
    const [cardsCount, playersCount, setsCount] = await Promise.all([
      this.supabase.from('cards').select('id', { count: 'exact', head: true }),
      this.supabase.from('card_players').select('id', { count: 'exact', head: true }),
      this.supabase.from('card_sets').select('id', { count: 'exact', head: true })
    ]);

    // Get most valuable card
    const { data: mostValuableCard } = await this.supabase
      .from('card_market_data')
      .select(`
        *,
        card:cards(
          *,
          player:card_players(*),
          set:card_sets(*)
        )
      `)
      .order('current_market_value', { ascending: false })
      .limit(1)
      .single();

    // Get average market value
    const { data: avgValue } = await this.supabase
      .from('card_market_data')
      .select('current_market_value')
      .not('current_market_value', 'is', null);

    const averageMarketValue = avgValue && avgValue.length > 0 
      ? avgValue.reduce((sum, item) => sum + (item.current_market_value || 0), 0) / avgValue.length 
      : 0;

    return {
      total_cards: cardsCount.count || 0,
      total_players: playersCount.count || 0,
      total_sets: setsCount.count || 0,
      average_market_value: averageMarketValue,
      most_valuable_card: mostValuableCard?.card || null,
      trending_cards: [] // TODO: Implement trending logic
    };
  }

  async getTrendingCards(limit: number = 10): Promise<Card[]> {
    const { data, error } = await this.supabase
      .from('card_market_data')
      .select(`
        *,
        card:cards(
          *,
          player:card_players(*),
          set:card_sets(*)
        )
      `)
      .eq('price_trend', 'up')
      .order('sales_volume_30d', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data?.map(item => item.card).filter(Boolean) || [];
  }

  async getRookieCards(sportId?: string, limit: number = 20): Promise<Card[]> {
    let query = this.supabase
      .from('cards')
      .select(`
        *,
        player:card_players(
          *,
          sport:card_sports(*),
          position:card_positions(*)
        ),
        set:card_sets(
          *,
          manufacturer:card_manufacturers(*)
        ),
        team:card_teams(*)
      `)
      .eq('rookie_card', true)
      .order('set.year', { ascending: false })
      .limit(limit);

    if (sportId) {
      query = query.eq('player.sport_id', sportId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  // Utility Methods

  formatPrice(price: number | null | undefined): string {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  formatGrade(grade: number | null | undefined, gradingCompany?: GradingCompany): string {
    if (!grade) return 'Ungraded';
    return `${grade}${gradingCompany ? ` (${gradingCompany.abbreviation})` : ''}`;
  }

  getCardDisplayName(card: Card): string {
    const year = card.set?.year || '';
    const setName = card.set?.name || '';
    const playerName = card.player?.name || '';
    const cardNumber = card.card_number;
    
    return `${year} ${setName} ${playerName} #${cardNumber}`;
  }

  getRarityColor(rarityLevel: number): string {
    const colors = [
      '#9CA3AF', // 1-2: Gray (Common/Uncommon)
      '#9CA3AF',
      '#10B981', // 3-4: Green (Semi-Rare/Rare)
      '#10B981',
      '#3B82F6', // 5-6: Blue (Very Rare/Super Rare)
      '#3B82F6',
      '#8B5CF6', // 7-8: Purple (Ultra Rare/Legendary)
      '#8B5CF6',
      '#F59E0B', // 9: Orange (Mythic)
      '#EF4444'  // 10: Red (One-of-One)
    ];
    return colors[Math.min(rarityLevel - 1, colors.length - 1)] || colors[0];
  }

  getGradeColor(grade: number): string {
    if (grade >= 9.5) return '#10B981'; // Green for mint
    if (grade >= 8.5) return '#3B82F6'; // Blue for near mint
    if (grade >= 7) return '#F59E0B';   // Orange for good
    return '#EF4444'; // Red for poor
  }

  // Marketplace Methods

  // Seller Profile Methods
  async createSellerProfile(profileData: CreateSellerProfileInput): Promise<SellerProfile> {
    const { data, error } = await this.supabase
      .from('seller_profiles')
      .insert(profileData)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async getSellerProfile(id: string): Promise<SellerProfile | null> {
    const { data, error } = await this.supabase
      .from('seller_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;

    // Get average rating
    const { data: ratingsData } = await this.supabase
      .from('seller_ratings')
      .select('rating')
      .eq('seller_id', id);

    if (ratingsData && ratingsData.length > 0) {
      const averageRating = ratingsData.reduce((sum, r) => sum + r.rating, 0) / ratingsData.length;
      data.average_rating = Math.round(averageRating * 10) / 10;
      data.total_ratings = ratingsData.length;
    } else {
      data.average_rating = 0;
      data.total_ratings = 0;
    }

    return data;
  }

  async getSellerByUsername(username: string): Promise<SellerProfile | null> {
    const { data, error } = await this.supabase
      .from('seller_profiles')
      .select('*')
      .eq('username', username)
      .single();

    if (error) return null;
    return data;
  }

  async searchSellers(filters: SellerSearchFilters): Promise<SellerProfile[]> {
    let query = this.supabase
      .from('seller_profiles')
      .select('*')
      .eq('is_active', true)
      .order('total_sales', { ascending: false });

    if (filters.username) {
      query = query.ilike('username', `%${filters.username}%`);
    }

    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }

    if (filters.verification_status) {
      query = query.eq('verification_status', filters.verification_status);
    }

    if (filters.min_sales) {
      query = query.gte('total_sales', filters.min_sales);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  // Seller Rating Methods
  async createSellerRating(ratingData: CreateSellerRatingInput): Promise<SellerRating> {
    const { data, error } = await this.supabase
      .from('seller_ratings')
      .insert(ratingData)
      .select(`
        *,
        seller:seller_profiles(*),
        reviewer:seller_profiles(*)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async getSellerRatings(sellerId: string): Promise<SellerRating[]> {
    const { data, error } = await this.supabase
      .from('seller_ratings')
      .select(`
        *,
        reviewer:seller_profiles(*)
      `)
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Card Listing Methods
  async createCardListing(listingData: CreateCardListingInput): Promise<CardListing> {
    const { data, error } = await this.supabase
      .from('card_listings')
      .insert(listingData)
      .select(`
        *,
        seller:seller_profiles(*),
        card_instance:card_instances(
          *,
          card:cards(
            *,
            player:card_players(*),
            set:card_sets(*)
          ),
          grading_company:grading_companies(*)
        )
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async searchMarketplace(
    filters: MarketplaceSearchFilters, 
    page: number = 1, 
    limit: number = 20
  ): Promise<MarketplaceSearchResult> {
    let query = this.supabase
      .from('card_listings')
      .select(`
        *,
        seller:seller_profiles(*),
        card_instance:card_instances(
          *,
          card:cards(
            *,
            player:card_players(
              *,
              sport:card_sports(*)
            ),
            set:card_sets(
              *,
              manufacturer:card_manufacturers(*)
            ),
            team:card_teams(*)
          ),
          grading_company:grading_companies(*)
        )
      `, { count: 'exact' })
      .eq('listing_status', 'active');

    // Apply filters
    if (filters.sport) {
      query = query.eq('card_instance.card.player.sport.abbreviation', filters.sport);
    }

    if (filters.player_name) {
      query = query.ilike('card_instance.card.player.name', `%${filters.player_name}%`);
    }

    if (filters.min_price) {
      query = query.gte('asking_price', filters.min_price);
    }

    if (filters.max_price) {
      query = query.lte('asking_price', filters.max_price);
    }

    if (filters.verified_sellers_only) {
      query = query.eq('seller.verification_status', 'verified');
    }

    if (filters.accepts_offers !== undefined) {
      query = query.eq('accepts_offers', filters.accepts_offers);
    }

    // Apply sorting
    switch (filters.sort_by) {
      case 'price_low':
        query = query.order('asking_price', { ascending: true });
        break;
      case 'price_high':
        query = query.order('asking_price', { ascending: false });
        break;
      case 'newest':
        query = query.order('listed_at', { ascending: false });
        break;
      case 'ending_soon':
        query = query.order('expires_at', { ascending: true });
        break;
      default:
        query = query.order('listed_at', { ascending: false });
    }

    // Pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      listings: data || [],
      total_count: count || 0,
      filters_applied: filters
    };
  }

  async getCardListing(id: string): Promise<CardListing | null> {
    const { data, error } = await this.supabase
      .from('card_listings')
      .select(`
        *,
        seller:seller_profiles(*),
        card_instance:card_instances(
          *,
          card:cards(
            *,
            player:card_players(*),
            set:card_sets(*),
            team:card_teams(*)
          ),
          grading_company:grading_companies(*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) return null;

    // Increment view count
    await this.supabase
      .from('card_listings')
      .update({ views_count: data.views_count + 1 })
      .eq('id', id);

    return data;
  }

  async getSellerListings(sellerId: string, status?: string): Promise<CardListing[]> {
    let query = this.supabase
      .from('card_listings')
      .select(`
        *,
        card_instance:card_instances(
          *,
          card:cards(
            *,
            player:card_players(*),
            set:card_sets(*)
          )
        )
      `)
      .eq('seller_id', sellerId)
      .order('listed_at', { ascending: false });

    if (status) {
      query = query.eq('listing_status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  // Transaction Methods
  async createTransaction(transactionData: CreateTransactionInput): Promise<Transaction> {
    const { data, error } = await this.supabase
      .from('transactions')
      .insert(transactionData)
      .select(`
        *,
        listing:card_listings(*),
        buyer:seller_profiles(*),
        seller:seller_profiles(*)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async getSellerTransactions(sellerId: string, type: 'buyer' | 'seller' = 'seller'): Promise<Transaction[]> {
    const column = type === 'buyer' ? 'buyer_id' : 'seller_id';
    
    const { data, error } = await this.supabase
      .from('transactions')
      .select(`
        *,
        listing:card_listings(
          *,
          card_instance:card_instances(
            *,
            card:cards(
              *,
              player:card_players(*)
            )
          )
        ),
        buyer:seller_profiles(*),
        seller:seller_profiles(*)
      `)
      .eq(column, sellerId)
      .order('transaction_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Listing Offer Methods
  async createListingOffer(offerData: CreateListingOfferInput): Promise<ListingOffer> {
    const { data, error } = await this.supabase
      .from('listing_offers')
      .insert(offerData)
      .select(`
        *,
        listing:card_listings(*),
        buyer:seller_profiles(*)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async getListingOffers(listingId: string): Promise<ListingOffer[]> {
    const { data, error } = await this.supabase
      .from('listing_offers')
      .select(`
        *,
        buyer:seller_profiles(*)
      `)
      .eq('listing_id', listingId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Utility Methods for Marketplace
  getVerificationBadge(status: string): { color: string; label: string; icon: string } {
    switch (status) {
      case 'verified':
        return { color: '#10B981', label: 'Verified', icon: '✓' };
      case 'pending':
        return { color: '#F59E0B', label: 'Pending', icon: '⏳' };
      default:
        return { color: '#6B7280', label: 'Unverified', icon: '?' };
    }
  }

  getListingStatusColor(status: string): string {
    switch (status) {
      case 'active': return '#10B981';
      case 'sold': return '#6B7280';
      case 'paused': return '#F59E0B';
      case 'expired': return '#EF4444';
      default: return '#9CA3AF';
    }
  }

  calculateSellerRating(ratings: SellerRating[]): { average: number; total: number; breakdown: Record<number, number> } {
    if (ratings.length === 0) {
      return { average: 0, total: 0, breakdown: {} };
    }

    const breakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;

    ratings.forEach(rating => {
      sum += rating.rating;
      breakdown[rating.rating]++;
    });

    return {
      average: Math.round((sum / ratings.length) * 10) / 10,
      total: ratings.length,
      breakdown
    };
  }
}

// Export the class, not an instance
export default CardService; 