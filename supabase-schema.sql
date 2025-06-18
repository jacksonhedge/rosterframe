-- Supabase Schema for Roster Frame Fantasy Football Data
-- Run this in your Supabase SQL editor to create the tables

-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security (RLS) for all tables
-- You can customize these policies based on your needs

-- 1. Leagues table - stores basic league information
CREATE TABLE leagues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_id VARCHAR(50) NOT NULL,
  league_name VARCHAR(255) NOT NULL,
  season VARCHAR(4) NOT NULL,
  sport VARCHAR(20) NOT NULL DEFAULT 'nfl',
  total_rosters INTEGER NOT NULL,
  scoring_settings JSONB,
  roster_positions TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint to prevent duplicate leagues per season
  UNIQUE(league_id, season)
);

-- 2. User Teams table - stores user information per league
CREATE TABLE user_teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_db_id UUID NOT NULL,
  league_id VARCHAR(50) NOT NULL,
  user_id VARCHAR(50) NOT NULL,
  username VARCHAR(100) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  team_name VARCHAR(255),
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Foreign key reference to leagues using UUID
  FOREIGN KEY (league_db_id) REFERENCES leagues(id) ON DELETE CASCADE,
  
  -- Unique constraint to prevent duplicate users per league
  UNIQUE(league_db_id, user_id)
);

-- 3. Rosters table - stores roster information
CREATE TABLE rosters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_db_id UUID NOT NULL,
  league_id VARCHAR(50) NOT NULL,
  user_id VARCHAR(50) NOT NULL,
  roster_id INTEGER NOT NULL,
  starters TEXT[] DEFAULT '{}',
  players TEXT[] DEFAULT '{}',
  points DECIMAL(8,2) DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  ties INTEGER DEFAULT 0,
  waiver_position INTEGER,
  waiver_budget_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Foreign key references using UUID
  FOREIGN KEY (league_db_id) REFERENCES leagues(id) ON DELETE CASCADE,
  FOREIGN KEY (league_db_id, user_id) REFERENCES user_teams(league_db_id, user_id) ON DELETE CASCADE,
  
  -- Unique constraint to prevent duplicate rosters per league
  UNIQUE(league_db_id, roster_id)
);

-- 4. League Outcomes table - stores championship and final results
CREATE TABLE league_outcomes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_db_id UUID NOT NULL,
  league_id VARCHAR(50) NOT NULL,
  season VARCHAR(4) NOT NULL,
  champion_user_id VARCHAR(50),
  champion_roster_id INTEGER,
  champion_points DECIMAL(8,2),
  runner_up_user_id VARCHAR(50),
  runner_up_roster_id INTEGER,
  highest_scorer_user_id VARCHAR(50),
  highest_scorer_points DECIMAL(8,2),
  playoff_structure JSONB,
  final_standings JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Foreign key reference to leagues using UUID
  FOREIGN KEY (league_db_id) REFERENCES leagues(id) ON DELETE CASCADE,
  
  -- Unique constraint to prevent duplicate outcomes per league/season
  UNIQUE(league_db_id, season)
);

-- 5. Players table - stores player information (optional, for player details)
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  position VARCHAR(10) NOT NULL,
  team VARCHAR(10),
  position_rank INTEGER,
  depth_chart_position INTEGER,
  status VARCHAR(50),
  sport VARCHAR(20) NOT NULL DEFAULT 'nfl',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX idx_leagues_league_id_season ON leagues(league_id, season);
CREATE INDEX idx_user_teams_league_id ON user_teams(league_id);
CREATE INDEX idx_user_teams_user_id ON user_teams(user_id);
CREATE INDEX idx_rosters_league_id ON rosters(league_id);
CREATE INDEX idx_rosters_user_id ON rosters(user_id);
CREATE INDEX idx_league_outcomes_league_id ON league_outcomes(league_id);
CREATE INDEX idx_players_player_id ON players(player_id);
CREATE INDEX idx_players_position ON players(position);

-- Triggers to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_leagues_updated_at BEFORE UPDATE ON leagues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_teams_updated_at BEFORE UPDATE ON user_teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rosters_updated_at BEFORE UPDATE ON rosters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_league_outcomes_updated_at BEFORE UPDATE ON league_outcomes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (uncomment these if you want to enable RLS)
-- ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_teams ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE rosters ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE league_outcomes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (customize based on your authentication needs)
-- Create policies that allow all operations for now (modify as needed)
-- CREATE POLICY "Allow all operations on leagues" ON leagues FOR ALL USING (true);
-- CREATE POLICY "Allow all operations on user_teams" ON user_teams FOR ALL USING (true);
-- CREATE POLICY "Allow all operations on rosters" ON rosters FOR ALL USING (true);
-- CREATE POLICY "Allow all operations on league_outcomes" ON league_outcomes FOR ALL USING (true);
-- CREATE POLICY "Allow all operations on players" ON players FOR ALL USING (true);

-- Create a view for complete league data with all related information
CREATE VIEW league_complete_data AS
SELECT 
  l.*,
  json_agg(DISTINCT ut.*) AS user_teams,
  json_agg(DISTINCT r.*) AS rosters,
  json_agg(DISTINCT lo.*) AS league_outcomes
FROM leagues l
LEFT JOIN user_teams ut ON l.league_id = ut.league_id
LEFT JOIN rosters r ON l.league_id = r.league_id
LEFT JOIN league_outcomes lo ON l.league_id = lo.league_id
GROUP BY l.id, l.league_id, l.league_name, l.season, l.sport, l.total_rosters, l.scoring_settings, l.roster_positions, l.created_at, l.updated_at;

-- Sleeper Integration Tables (existing)
CREATE TABLE IF NOT EXISTS sleeper_users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sleeper_user_id TEXT UNIQUE NOT NULL,
    username TEXT,
    display_name TEXT,
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sleeper_leagues (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sleeper_league_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    season TEXT NOT NULL,
    sport TEXT NOT NULL DEFAULT 'nfl',
    total_rosters INTEGER,
    status TEXT,
    settings JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_teams (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sleeper_user_id TEXT REFERENCES sleeper_users(sleeper_user_id),
    sleeper_league_id TEXT REFERENCES sleeper_leagues(sleeper_league_id),
    roster_id INTEGER,
    team_name TEXT,
    UNIQUE(sleeper_user_id, sleeper_league_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rosters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sleeper_league_id TEXT REFERENCES sleeper_leagues(sleeper_league_id),
    roster_id INTEGER NOT NULL,
    owner_id TEXT,
    players TEXT[],
    starters TEXT[],
    settings JSONB,
    metadata JSONB,
    UNIQUE(sleeper_league_id, roster_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS league_outcomes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sleeper_league_id TEXT REFERENCES sleeper_leagues(sleeper_league_id),
    user_id TEXT,
    rank INTEGER,
    points DECIMAL,
    wins INTEGER,
    losses INTEGER,
    ties INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sports Card Database Tables

-- Card manufacturers table
CREATE TABLE IF NOT EXISTS card_manufacturers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    abbreviation TEXT,
    founded_year INTEGER,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sports and positions reference tables
CREATE TABLE IF NOT EXISTS sports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    abbreviation TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS positions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sport_id UUID REFERENCES sports(id),
    name TEXT NOT NULL,
    abbreviation TEXT NOT NULL,
    UNIQUE(sport_id, abbreviation),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sport_id UUID REFERENCES sports(id),
    name TEXT NOT NULL,
    city TEXT,
    abbreviation TEXT,
    founded_year INTEGER,
    active BOOLEAN DEFAULT TRUE,
    colors TEXT[],
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Players table
CREATE TABLE IF NOT EXISTS players (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    sport_id UUID REFERENCES sports(id),
    position_id UUID REFERENCES positions(id),
    birth_date DATE,
    debut_date DATE,
    retirement_date DATE,
    active BOOLEAN DEFAULT TRUE,
    stats JSONB,
    achievements TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Card sets table
CREATE TABLE IF NOT EXISTS card_sets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    manufacturer_id UUID REFERENCES card_manufacturers(id),
    sport_id UUID REFERENCES sports(id),
    name TEXT NOT NULL,
    year INTEGER NOT NULL,
    total_cards INTEGER,
    set_type TEXT, -- 'base', 'insert', 'premium', etc.
    series_name TEXT,
    significance_level INTEGER DEFAULT 1, -- 1-10 scale for set importance
    description TEXT,
    release_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grading companies table
CREATE TABLE IF NOT EXISTS grading_companies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    abbreviation TEXT UNIQUE NOT NULL,
    max_grade DECIMAL DEFAULT 10.0,
    grade_scale TEXT, -- '1-10', '1-100', etc.
    established_year INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Main cards table
CREATE TABLE IF NOT EXISTS cards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    player_id UUID REFERENCES players(id),
    set_id UUID REFERENCES card_sets(id),
    team_id UUID REFERENCES teams(id),
    card_number TEXT NOT NULL,
    card_type TEXT NOT NULL DEFAULT 'base', -- 'base', 'insert', 'parallel', 'autograph', 'memorabilia', 'patch'
    print_run INTEGER, -- Total cards printed (if known)
    serial_number INTEGER, -- For numbered cards
    rookie_card BOOLEAN DEFAULT FALSE,
    error_card BOOLEAN DEFAULT FALSE,
    error_description TEXT,
    variations TEXT[], -- Different versions of the same card
    rarity_level INTEGER DEFAULT 1, -- 1-10 scale
    subset_name TEXT, -- For special subsets within sets
    card_front_image_url TEXT,
    card_back_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(set_id, card_number, card_type)
);

-- Card conditions and grading
CREATE TABLE IF NOT EXISTS card_instances (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    card_id UUID REFERENCES cards(id),
    grading_company_id UUID REFERENCES grading_companies(id),
    grade DECIMAL,
    grade_details JSONB, -- {"centering": 9, "corners": 9.5, "edges": 9, "surface": 10}
    condition_description TEXT, -- For raw cards
    certification_number TEXT, -- Grading company cert number
    grading_date DATE,
    notes TEXT,
    authenticated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Market data and pricing
CREATE TABLE IF NOT EXISTS card_market_data (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    card_id UUID REFERENCES cards(id),
    grading_company_id UUID REFERENCES grading_companies(id),
    grade DECIMAL,
    current_market_value DECIMAL,
    last_sale_price DECIMAL,
    last_sale_date DATE,
    population_count INTEGER, -- How many exist in this grade
    price_trend TEXT, -- 'up', 'down', 'stable'
    sales_volume_30d INTEGER,
    average_price_30d DECIMAL,
    highest_sale DECIMAL,
    lowest_sale DECIMAL,
    data_source TEXT, -- 'ebay', 'pwcc', 'goldin', etc.
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seller profiles
CREATE TABLE IF NOT EXISTS seller_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID, -- Will reference auth users later
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    location TEXT,
    phone TEXT,
    email TEXT,
    verification_status TEXT DEFAULT 'unverified', -- 'unverified', 'pending', 'verified'
    verification_documents TEXT[], -- URLs to verification documents
    total_sales INTEGER DEFAULT 0,
    total_purchases INTEGER DEFAULT 0,
    join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seller ratings and reviews
CREATE TABLE IF NOT EXISTS seller_ratings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    seller_id UUID REFERENCES seller_profiles(id),
    reviewer_id UUID REFERENCES seller_profiles(id),
    transaction_id UUID, -- Will reference transactions table
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    shipping_speed_rating INTEGER CHECK (shipping_speed_rating >= 1 AND shipping_speed_rating <= 5),
    item_condition_rating INTEGER CHECK (item_condition_rating >= 1 AND item_condition_rating <= 5),
    would_buy_again BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(seller_id, reviewer_id, transaction_id)
);

-- Card marketplace listings
CREATE TABLE IF NOT EXISTS card_listings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    seller_id UUID REFERENCES seller_profiles(id),
    card_instance_id UUID REFERENCES card_instances(id),
    title TEXT NOT NULL,
    description TEXT,
    asking_price DECIMAL NOT NULL,
    condition_notes TEXT,
    listing_images TEXT[], -- URLs to listing photos
    shipping_cost DECIMAL DEFAULT 0,
    shipping_methods TEXT[], -- 'standard', 'priority', 'overnight', 'local-pickup'
    accepts_offers BOOLEAN DEFAULT TRUE,
    minimum_offer DECIMAL,
    listing_status TEXT DEFAULT 'active', -- 'active', 'sold', 'paused', 'expired'
    views_count INTEGER DEFAULT 0,
    favorites_count INTEGER DEFAULT 0,
    listed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    sold_at TIMESTAMP WITH TIME ZONE,
    sold_price DECIMAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User collections (updated)
CREATE TABLE IF NOT EXISTS user_collections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES seller_profiles(id),
    card_instance_id UUID REFERENCES card_instances(id),
    acquisition_date DATE,
    acquisition_price DECIMAL,
    acquisition_source TEXT,
    notes TEXT,
    for_sale BOOLEAN DEFAULT FALSE,
    asking_price DECIMAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    listing_id UUID REFERENCES card_listings(id),
    buyer_id UUID REFERENCES seller_profiles(id),
    seller_id UUID REFERENCES seller_profiles(id),
    final_price DECIMAL NOT NULL,
    shipping_cost DECIMAL DEFAULT 0,
    total_amount DECIMAL NOT NULL,
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'refunded', 'failed'
    shipping_status TEXT DEFAULT 'not_shipped', -- 'not_shipped', 'shipped', 'delivered', 'returned'
    tracking_number TEXT,
    shipping_address JSONB,
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    shipped_date TIMESTAMP WITH TIME ZONE,
    delivered_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Listing favorites/watchlist
CREATE TABLE IF NOT EXISTS listing_favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES seller_profiles(id),
    listing_id UUID REFERENCES card_listings(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, listing_id)
);

-- Offers on listings
CREATE TABLE IF NOT EXISTS listing_offers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    listing_id UUID REFERENCES card_listings(id),
    buyer_id UUID REFERENCES seller_profiles(id),
    offer_amount DECIMAL NOT NULL,
    message TEXT,
    offer_status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'declined', 'withdrawn', 'expired'
    expires_at TIMESTAMP WITH TIME ZONE,
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cards_player_id ON cards(player_id);
CREATE INDEX IF NOT EXISTS idx_cards_set_id ON cards(set_id);
CREATE INDEX IF NOT EXISTS idx_cards_team_id ON cards(team_id);
CREATE INDEX IF NOT EXISTS idx_cards_rookie_card ON cards(rookie_card);
CREATE INDEX IF NOT EXISTS idx_card_instances_card_id ON card_instances(card_id);
CREATE INDEX IF NOT EXISTS idx_card_instances_grade ON card_instances(grade);
CREATE INDEX IF NOT EXISTS idx_card_market_data_card_id ON card_market_data(card_id);
CREATE INDEX IF NOT EXISTS idx_card_market_data_updated_at ON card_market_data(updated_at);
CREATE INDEX IF NOT EXISTS idx_players_sport_id ON players(sport_id);
CREATE INDEX IF NOT EXISTS idx_teams_sport_id ON teams(sport_id);
CREATE INDEX IF NOT EXISTS idx_seller_profiles_username ON seller_profiles(username);
CREATE INDEX IF NOT EXISTS idx_seller_profiles_verification_status ON seller_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_seller_ratings_seller_id ON seller_ratings(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_ratings_rating ON seller_ratings(rating);
CREATE INDEX IF NOT EXISTS idx_card_listings_seller_id ON card_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_card_listings_status ON card_listings(listing_status);
CREATE INDEX IF NOT EXISTS idx_card_listings_price ON card_listings(asking_price);
CREATE INDEX IF NOT EXISTS idx_card_listings_listed_at ON card_listings(listed_at);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_id ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller_id ON transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(payment_status);
CREATE INDEX IF NOT EXISTS idx_listing_favorites_user_id ON listing_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_listing_offers_listing_id ON listing_offers(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_offers_status ON listing_offers(offer_status);

-- Insert initial reference data

-- Sports
INSERT INTO sports (name, abbreviation) VALUES 
('National Football League', 'NFL'),
('Major League Baseball', 'MLB')
ON CONFLICT (name) DO NOTHING;

-- NFL Positions
INSERT INTO positions (sport_id, name, abbreviation) 
SELECT s.id, pos.name, pos.abbreviation
FROM sports s, (VALUES 
    ('Quarterback', 'QB'),
    ('Running Back', 'RB'),
    ('Wide Receiver', 'WR'),
    ('Tight End', 'TE'),
    ('Offensive Line', 'OL'),
    ('Defensive End', 'DE'),
    ('Defensive Tackle', 'DT'),
    ('Linebacker', 'LB'),
    ('Cornerback', 'CB'),
    ('Safety', 'S'),
    ('Kicker', 'K'),
    ('Punter', 'P')
) AS pos(name, abbreviation)
WHERE s.abbreviation = 'NFL'
ON CONFLICT (sport_id, abbreviation) DO NOTHING;

-- MLB Positions
INSERT INTO positions (sport_id, name, abbreviation)
SELECT s.id, pos.name, pos.abbreviation
FROM sports s, (VALUES 
    ('Pitcher', 'P'),
    ('Catcher', 'C'),
    ('First Baseman', '1B'),
    ('Second Baseman', '2B'),
    ('Third Baseman', '3B'),
    ('Shortstop', 'SS'),
    ('Left Fielder', 'LF'),
    ('Center Fielder', 'CF'),
    ('Right Fielder', 'RF'),
    ('Designated Hitter', 'DH')
) AS pos(name, abbreviation)
WHERE s.abbreviation = 'MLB'
ON CONFLICT (sport_id, abbreviation) DO NOTHING;

-- Card Manufacturers
INSERT INTO card_manufacturers (name, abbreviation, founded_year) VALUES 
('Topps', 'TOPPS', 1938),
('Panini', 'PANINI', 1961),
('Upper Deck', 'UD', 1988),
('Bowman', 'BOWMAN', 1948),
('Donruss', 'DONRUSS', 1981),
('Fleer', 'FLEER', 1923),
('Score', 'SCORE', 1988),
('Leaf', 'LEAF', 1948)
ON CONFLICT (name) DO NOTHING;

-- Grading Companies
INSERT INTO grading_companies (name, abbreviation, max_grade, grade_scale, established_year) VALUES 
('Professional Sports Authenticator', 'PSA', 10.0, '1-10', 1991),
('Beckett Grading Services', 'BGS', 10.0, '1-10', 1999),
('Sports Card Guaranty', 'SGC', 10.0, '1-10', 1998),
('Certified Sports Guaranty', 'CSG', 10.0, '1-10', 2020)
ON CONFLICT (name) DO NOTHING; 