-- COMPLETE DATABASE SETUP FOR ROSTER FRAME CARD SYSTEM
-- This script will completely set up your database from scratch
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing conflicting views/tables if they exist
DROP VIEW IF EXISTS card_sports CASCADE;
DROP VIEW IF EXISTS card_players CASCADE;
DROP VIEW IF EXISTS card_positions CASCADE;
DROP VIEW IF EXISTS card_teams CASCADE;

-- Drop and recreate tables to ensure clean setup
DROP TABLE IF EXISTS card_market_data CASCADE;
DROP TABLE IF EXISTS card_instances CASCADE;
DROP TABLE IF EXISTS cards CASCADE;
DROP TABLE IF EXISTS card_sets CASCADE;
DROP TABLE IF EXISTS players CASCADE;
DROP TABLE IF EXISTS positions CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS card_manufacturers CASCADE;
DROP TABLE IF EXISTS grading_companies CASCADE;
DROP TABLE IF EXISTS sports CASCADE;

-- Create core reference tables
CREATE TABLE sports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    abbreviation TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE positions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sport_id UUID REFERENCES sports(id),
    name TEXT NOT NULL,
    abbreviation TEXT NOT NULL,
    UNIQUE(sport_id, abbreviation),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE teams (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sport_id UUID REFERENCES sports(id),
    name TEXT NOT NULL,
    city TEXT,
    abbreviation TEXT,
    founded_year INTEGER,
    active BOOLEAN DEFAULT TRUE,
    colors TEXT[],
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(sport_id, abbreviation)
);

CREATE TABLE card_manufacturers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    abbreviation TEXT,
    founded_year INTEGER,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE grading_companies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    abbreviation TEXT UNIQUE NOT NULL,
    max_grade DECIMAL DEFAULT 10.0,
    grade_scale TEXT DEFAULT '1-10',
    established_year INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE players (
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

CREATE TABLE card_sets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    manufacturer_id UUID REFERENCES card_manufacturers(id),
    sport_id UUID REFERENCES sports(id),
    name TEXT NOT NULL,
    year INTEGER NOT NULL,
    total_cards INTEGER,
    set_type TEXT DEFAULT 'base',
    series_name TEXT,
    significance_level INTEGER DEFAULT 1,
    description TEXT,
    release_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE cards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    player_id UUID REFERENCES players(id),
    set_id UUID REFERENCES card_sets(id),
    team_id UUID REFERENCES teams(id),
    card_number TEXT NOT NULL,
    card_type TEXT NOT NULL DEFAULT 'base',
    print_run INTEGER,
    serial_number INTEGER,
    rookie_card BOOLEAN DEFAULT FALSE,
    error_card BOOLEAN DEFAULT FALSE,
    error_description TEXT,
    variations TEXT[],
    rarity_level INTEGER DEFAULT 1,
    subset_name TEXT,
    card_front_image_url TEXT,
    card_back_image_url TEXT,
    condition TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE card_instances (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    card_id UUID REFERENCES cards(id),
    grading_company_id UUID REFERENCES grading_companies(id),
    grade DECIMAL,
    grade_details JSONB,
    condition_description TEXT,
    certification_number TEXT,
    grading_date DATE,
    notes TEXT,
    authenticated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE card_market_data (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    card_id UUID REFERENCES cards(id),
    grading_company_id UUID REFERENCES grading_companies(id),
    grade DECIMAL,
    current_market_value DECIMAL,
    last_sale_price DECIMAL,
    last_sale_date DATE,
    population_count INTEGER,
    price_trend TEXT,
    sales_volume_30d INTEGER,
    average_price_30d DECIMAL,
    highest_sale DECIMAL,
    lowest_sale DECIMAL,
    data_source TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial data
INSERT INTO sports (name, abbreviation) VALUES 
('National Football League', 'NFL'),
('National Basketball Association', 'NBA'),
('Major League Baseball', 'MLB'),
('National Hockey League', 'NHL')
ON CONFLICT (abbreviation) DO NOTHING;

INSERT INTO card_manufacturers (name, abbreviation) VALUES 
('Panini', 'PANINI'),
('Topps', 'TOPPS'),
('Upper Deck', 'UD'),
('Bowman', 'BOWMAN'),
('Donruss', 'DONRUSS'),
('Fleer', 'FLEER'),
('Score', 'SCORE'),
('Leaf', 'LEAF')
ON CONFLICT (name) DO NOTHING;

INSERT INTO grading_companies (name, abbreviation, max_grade, grade_scale) VALUES 
('Professional Sports Authenticator', 'PSA', 10.0, '1-10'),
('Beckett Grading Services', 'BGS', 10.0, '1-10'),
('Sportscard Guaranty Corporation', 'SGC', 10.0, '1-10')
ON CONFLICT (abbreviation) DO NOTHING;

-- Insert NFL teams and positions
DO $$
DECLARE 
    nfl_sport_id UUID;
BEGIN
    SELECT id INTO nfl_sport_id FROM sports WHERE abbreviation = 'NFL';
    
    INSERT INTO teams (sport_id, name, city, abbreviation) VALUES 
    (nfl_sport_id, 'Cardinals', 'Arizona', 'ARI'),
    (nfl_sport_id, 'Falcons', 'Atlanta', 'ATL'),
    (nfl_sport_id, 'Ravens', 'Baltimore', 'BAL'),
    (nfl_sport_id, 'Bills', 'Buffalo', 'BUF'),
    (nfl_sport_id, 'Panthers', 'Carolina', 'CAR'),
    (nfl_sport_id, 'Bears', 'Chicago', 'CHI'),
    (nfl_sport_id, 'Bengals', 'Cincinnati', 'CIN'),
    (nfl_sport_id, 'Browns', 'Cleveland', 'CLE'),
    (nfl_sport_id, 'Cowboys', 'Dallas', 'DAL'),
    (nfl_sport_id, 'Broncos', 'Denver', 'DEN'),
    (nfl_sport_id, 'Lions', 'Detroit', 'DET'),
    (nfl_sport_id, 'Packers', 'Green Bay', 'GB'),
    (nfl_sport_id, 'Texans', 'Houston', 'HOU'),
    (nfl_sport_id, 'Colts', 'Indianapolis', 'IND'),
    (nfl_sport_id, 'Jaguars', 'Jacksonville', 'JAX'),
    (nfl_sport_id, 'Chiefs', 'Kansas City', 'KC'),
    (nfl_sport_id, 'Raiders', 'Las Vegas', 'LV'),
    (nfl_sport_id, 'Chargers', 'Los Angeles', 'LAC'),
    (nfl_sport_id, 'Rams', 'Los Angeles', 'LAR'),
    (nfl_sport_id, 'Dolphins', 'Miami', 'MIA'),
    (nfl_sport_id, 'Vikings', 'Minnesota', 'MIN'),
    (nfl_sport_id, 'Patriots', 'New England', 'NE'),
    (nfl_sport_id, 'Saints', 'New Orleans', 'NO'),
    (nfl_sport_id, 'Giants', 'New York', 'NYG'),
    (nfl_sport_id, 'Jets', 'New York', 'NYJ'),
    (nfl_sport_id, 'Eagles', 'Philadelphia', 'PHI'),
    (nfl_sport_id, 'Steelers', 'Pittsburgh', 'PIT'),
    (nfl_sport_id, '49ers', 'San Francisco', 'SF'),
    (nfl_sport_id, 'Seahawks', 'Seattle', 'SEA'),
    (nfl_sport_id, 'Buccaneers', 'Tampa Bay', 'TB'),
    (nfl_sport_id, 'Titans', 'Tennessee', 'TEN'),
    (nfl_sport_id, 'Commanders', 'Washington', 'WAS')
    ON CONFLICT (sport_id, abbreviation) DO NOTHING;
    
    INSERT INTO positions (sport_id, name, abbreviation) VALUES 
    (nfl_sport_id, 'Quarterback', 'QB'),
    (nfl_sport_id, 'Running Back', 'RB'),
    (nfl_sport_id, 'Wide Receiver', 'WR'),
    (nfl_sport_id, 'Tight End', 'TE'),
    (nfl_sport_id, 'Kicker', 'K'),
    (nfl_sport_id, 'Defense', 'DEF'),
    (nfl_sport_id, 'Offensive Line', 'OL'),
    (nfl_sport_id, 'Defensive Line', 'DL'),
    (nfl_sport_id, 'Linebacker', 'LB'),
    (nfl_sport_id, 'Defensive Back', 'DB')
    ON CONFLICT (sport_id, abbreviation) DO NOTHING;
END $$;

-- Create compatibility views for CardService
CREATE VIEW card_sports AS SELECT * FROM sports;
CREATE VIEW card_players AS SELECT * FROM players;
CREATE VIEW card_positions AS SELECT * FROM positions;
CREATE VIEW card_teams AS SELECT * FROM teams;

-- Set up storage bucket for card images
INSERT INTO storage.buckets (id, name, public)
VALUES ('card-images', 'card-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Public read access for card images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload card images" ON storage.objects;

CREATE POLICY "Public read access for card images" ON storage.objects
  FOR SELECT USING (bucket_id = 'card-images');

CREATE POLICY "Authenticated users can upload card images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'card-images');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_cards_player_id ON cards(player_id);
CREATE INDEX IF NOT EXISTS idx_cards_set_id ON cards(set_id);
CREATE INDEX IF NOT EXISTS idx_cards_team_id ON cards(team_id);
CREATE INDEX IF NOT EXISTS idx_players_sport_id ON players(sport_id);
CREATE INDEX IF NOT EXISTS idx_teams_sport_id ON teams(sport_id);

-- Success message
SELECT 'Database setup complete! NFL sport ID: ' || id as message 
FROM sports WHERE abbreviation = 'NFL'; 