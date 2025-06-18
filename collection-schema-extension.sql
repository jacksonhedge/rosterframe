-- Collection Tracking Extension for Sports Cards Database
-- Add this to your existing Supabase schema

-- Target players table - players you want to collect
CREATE TABLE IF NOT EXISTS target_players (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sleeper_player_id TEXT NOT NULL,
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    team TEXT,
    fantasy_positions TEXT[],
    
    -- Collection status
    collection_status TEXT DEFAULT 'wanted' CHECK (collection_status IN ('wanted', 'owned', 'multiple', 'not_interested')),
    priority_level INTEGER DEFAULT 3 CHECK (priority_level BETWEEN 1 AND 5),
    
    -- Roster analytics
    total_leagues_rostered INTEGER DEFAULT 0,
    roster_percentage DECIMAL(5,2) DEFAULT 0,
    leagues_rostered_in TEXT[],
    
    -- Collection details
    cards_owned INTEGER DEFAULT 0,
    cards_wanted INTEGER DEFAULT 0,
    target_card_types TEXT[],
    max_budget_per_card DECIMAL(10,2) DEFAULT 0,
    
    -- Player metadata
    is_rookie BOOLEAN DEFAULT FALSE,
    breakout_candidate BOOLEAN DEFAULT FALSE,
    injury_risk BOOLEAN DEFAULT FALSE,
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(sleeper_player_id)
);

-- Player collection items table - specific cards owned/wanted
CREATE TABLE IF NOT EXISTS player_collection_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    target_player_id UUID REFERENCES target_players(id) ON DELETE CASCADE,
    card_id UUID REFERENCES cards(id),
    card_instance_id UUID REFERENCES card_instances(id),
    
    -- Manual entry for cards not in database yet
    manual_entry JSONB,
    
    status TEXT DEFAULT 'wanted' CHECK (status IN ('owned', 'watching', 'bidding', 'ordered', 'wanted')),
    acquisition_date DATE,
    purchase_price DECIMAL(10,2),
    purchase_source TEXT,
    condition TEXT,
    grade DECIMAL(3,1),
    grading_company TEXT,
    
    storage_location TEXT,
    estimated_value DECIMAL(10,2),
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Roster analysis cache table - to avoid re-calculating frequently
CREATE TABLE IF NOT EXISTS roster_analysis_cache (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sleeper_player_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    team TEXT,
    fantasy_positions TEXT[],
    total_leagues INTEGER DEFAULT 0,
    leagues_rostered_in TEXT[],
    roster_percentage DECIMAL(5,2) DEFAULT 0,
    is_rookie BOOLEAN DEFAULT FALSE,
    estimated_value_tier TEXT DEFAULT 'medium' CHECK (estimated_value_tier IN ('elite', 'high', 'medium', 'low', 'dart_throw')),
    last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_target_players_sleeper_id ON target_players(sleeper_player_id);
CREATE INDEX IF NOT EXISTS idx_target_players_status ON target_players(collection_status);
CREATE INDEX IF NOT EXISTS idx_target_players_priority ON target_players(priority_level);
CREATE INDEX IF NOT EXISTS idx_target_players_position ON target_players(position);
CREATE INDEX IF NOT EXISTS idx_target_players_roster_pct ON target_players(roster_percentage);

CREATE INDEX IF NOT EXISTS idx_collection_items_target_player ON player_collection_items(target_player_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_status ON player_collection_items(status);
CREATE INDEX IF NOT EXISTS idx_collection_items_acquisition_date ON player_collection_items(acquisition_date);

CREATE INDEX IF NOT EXISTS idx_roster_cache_sleeper_id ON roster_analysis_cache(sleeper_player_id);
CREATE INDEX IF NOT EXISTS idx_roster_cache_position ON roster_analysis_cache(position);
CREATE INDEX IF NOT EXISTS idx_roster_cache_roster_pct ON roster_analysis_cache(roster_percentage);
CREATE INDEX IF NOT EXISTS idx_roster_cache_last_calculated ON roster_analysis_cache(last_calculated);

-- Triggers to update updated_at columns
CREATE TRIGGER update_target_players_updated_at 
    BEFORE UPDATE ON target_players 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collection_items_updated_at 
    BEFORE UPDATE ON player_collection_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update target player stats when collection items change
CREATE OR REPLACE FUNCTION update_target_player_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update cards_owned and cards_wanted counts
    UPDATE target_players 
    SET 
        cards_owned = (
            SELECT COUNT(*) 
            FROM player_collection_items 
            WHERE target_player_id = COALESCE(NEW.target_player_id, OLD.target_player_id)
            AND status = 'owned'
        ),
        cards_wanted = (
            SELECT COUNT(*) 
            FROM player_collection_items 
            WHERE target_player_id = COALESCE(NEW.target_player_id, OLD.target_player_id)
            AND status IN ('wanted', 'watching', 'bidding', 'ordered')
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.target_player_id, OLD.target_player_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update target player stats
CREATE TRIGGER update_target_player_stats_trigger
    AFTER INSERT OR UPDATE OR DELETE ON player_collection_items
    FOR EACH ROW EXECUTE FUNCTION update_target_player_stats();

-- View for collection dashboard
CREATE VIEW collection_dashboard AS
SELECT 
    tp.*,
    -- Collection item details
    json_agg(
        CASE 
            WHEN pci.id IS NOT NULL THEN
                json_build_object(
                    'id', pci.id,
                    'status', pci.status,
                    'acquisition_date', pci.acquisition_date,
                    'purchase_price', pci.purchase_price,
                    'purchase_source', pci.purchase_source,
                    'condition', pci.condition,
                    'grade', pci.grade,
                    'grading_company', pci.grading_company,
                    'storage_location', pci.storage_location,
                    'estimated_value', pci.estimated_value,
                    'notes', pci.notes,
                    'card_id', pci.card_id,
                    'manual_entry', pci.manual_entry
                )
            ELSE NULL
        END
    ) FILTER (WHERE pci.id IS NOT NULL) AS collection_items
FROM target_players tp
LEFT JOIN player_collection_items pci ON tp.id = pci.target_player_id
GROUP BY tp.id, tp.sleeper_player_id, tp.name, tp.position, tp.team, tp.fantasy_positions, 
         tp.collection_status, tp.priority_level, tp.total_leagues_rostered, tp.roster_percentage,
         tp.leagues_rostered_in, tp.cards_owned, tp.cards_wanted, tp.target_card_types,
         tp.max_budget_per_card, tp.is_rookie, tp.breakout_candidate, tp.injury_risk,
         tp.notes, tp.created_at, tp.updated_at; 