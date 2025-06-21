-- Clean Sports Cards Database Schema for Roster Frame
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sports reference table
CREATE TABLE IF NOT EXISTS sports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    abbreviation TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Positions reference table
CREATE TABLE IF NOT EXISTS positions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sport_id UUID REFERENCES sports(id),
    name TEXT NOT NULL,
    abbreviation TEXT NOT NULL,
    UNIQUE(sport_id, abbreviation),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teams reference table
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

-- Card manufacturers table
CREATE TABLE IF NOT EXISTS card_manufacturers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    abbreviation TEXT,
    founded_year INTEGER,
    description TEXT,
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
    set_type TEXT DEFAULT 'base',
    series_name TEXT,
    significance_level INTEGER DEFAULT 1,
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
    grade_scale TEXT DEFAULT '1-10',
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

-- Card instances (individual physical cards)
CREATE TABLE IF NOT EXISTS card_instances (
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

-- Card market data
CREATE TABLE IF NOT EXISTS card_market_data (
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

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cards_player_id ON cards(player_id);
CREATE INDEX IF NOT EXISTS idx_cards_set_id ON cards(set_id);
CREATE INDEX IF NOT EXISTS idx_cards_team_id ON cards(team_id);
CREATE INDEX IF NOT EXISTS idx_cards_rookie_card ON cards(rookie_card);
CREATE INDEX IF NOT EXISTS idx_card_instances_card_id ON card_instances(card_id);
CREATE INDEX IF NOT EXISTS idx_card_instances_grade ON card_instances(grade);
CREATE INDEX IF NOT EXISTS idx_card_market_data_card_id ON card_market_data(card_id);
CREATE INDEX IF NOT EXISTS idx_players_sport_id ON players(sport_id);
CREATE INDEX IF NOT EXISTS idx_teams_sport_id ON teams(sport_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_card_market_data_updated_at 
    BEFORE UPDATE ON card_market_data 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 