-- Insert Card Sets and Individual Cards for NFL Players
-- This creates the actual trading cards associated with the players

DO $$
DECLARE
    nfl_sport_id UUID;
    topps_id UUID;
    panini_id UUID;
    bowman_id UUID;
    ud_id UUID;
    
    -- Card Set IDs
    topps_2024_id UUID;
    panini_2024_id UUID;
    bowman_2024_id UUID;
    topps_chrome_2024_id UUID;
    panini_prizm_2024_id UUID;
    topps_2023_id UUID;
    panini_2023_id UUID;
    
BEGIN
    -- Get sport and manufacturer IDs
    SELECT id INTO nfl_sport_id FROM sports WHERE abbreviation = 'NFL';
    
    -- Get or insert manufacturers
    INSERT INTO card_manufacturers (name, abbreviation, founded_year) VALUES 
    ('Topps', 'TOPPS', 1938),
    ('Panini', 'PANINI', 1961),
    ('Bowman', 'BOWMAN', 1948),
    ('Upper Deck', 'UD', 1988)
    ON CONFLICT (name) DO NOTHING;
    
    SELECT id INTO topps_id FROM card_manufacturers WHERE name = 'Topps';
    SELECT id INTO panini_id FROM card_manufacturers WHERE name = 'Panini';
    SELECT id INTO bowman_id FROM card_manufacturers WHERE name = 'Bowman';
    SELECT id INTO ud_id FROM card_manufacturers WHERE name = 'Upper Deck';
    
    -- Insert Card Sets for 2024 season
    INSERT INTO card_sets (manufacturer_id, sport_id, name, year, total_cards, set_type, series_name, significance_level, description, release_date) VALUES
    (topps_id, nfl_sport_id, 'Topps NFL', 2024, 440, 'base', 'Base Series', 3, 'Standard 2024 NFL base set', '2024-08-01'),
    (panini_id, nfl_sport_id, 'Panini NFL', 2024, 400, 'base', 'Base Series', 3, 'Standard 2024 NFL base set', '2024-08-15'),
    (bowman_id, nfl_sport_id, 'Bowman NFL', 2024, 300, 'base', 'Base Series', 2, '2024 NFL rookie focus set', '2024-09-01'),
    (topps_id, nfl_sport_id, 'Topps Chrome NFL', 2024, 220, 'premium', 'Chrome Series', 4, 'Premium chrome finish cards', '2024-10-01'),
    (panini_id, nfl_sport_id, 'Panini Prizm NFL', 2024, 300, 'premium', 'Prizm Series', 5, 'High-end prismatic cards', '2024-11-01'),
    (topps_id, nfl_sport_id, 'Topps NFL', 2023, 440, 'base', 'Base Series', 3, 'Standard 2023 NFL base set', '2023-08-01'),
    (panini_id, nfl_sport_id, 'Panini NFL', 2023, 400, 'base', 'Base Series', 3, 'Standard 2023 NFL base set', '2023-08-15');
    
    -- Get set IDs
    SELECT id INTO topps_2024_id FROM card_sets WHERE manufacturer_id = topps_id AND name = 'Topps NFL' AND year = 2024;
    SELECT id INTO panini_2024_id FROM card_sets WHERE manufacturer_id = panini_id AND name = 'Panini NFL' AND year = 2024;
    SELECT id INTO bowman_2024_id FROM card_sets WHERE manufacturer_id = bowman_id AND name = 'Bowman NFL' AND year = 2024;
    SELECT id INTO topps_chrome_2024_id FROM card_sets WHERE manufacturer_id = topps_id AND name = 'Topps Chrome NFL' AND year = 2024;
    SELECT id INTO panini_prizm_2024_id FROM card_sets WHERE manufacturer_id = panini_id AND name = 'Panini Prizm NFL' AND year = 2024;
    SELECT id INTO topps_2023_id FROM card_sets WHERE manufacturer_id = topps_id AND name = 'Topps NFL' AND year = 2023;
    SELECT id INTO panini_2023_id FROM card_sets WHERE manufacturer_id = panini_id AND name = 'Panini NFL' AND year = 2023;
    
    -- Insert cards for top QBs
    INSERT INTO cards (player_id, set_id, card_number, card_type, rookie_card, rarity_level, condition, notes) 
    SELECT p.id, topps_2024_id, '1', 'base', false, 3, 'Mint', 'MVP candidate quarterback'
    FROM players p WHERE p.name = 'Lamar Jackson';
    
    INSERT INTO cards (player_id, set_id, card_number, card_type, rookie_card, rarity_level, condition, notes) 
    SELECT p.id, panini_prizm_2024_id, '2', 'premium', false, 4, 'Mint', 'Prizm refractor parallel'
    FROM players p WHERE p.name = 'Josh Allen';
    
    INSERT INTO cards (player_id, set_id, card_number, card_type, rookie_card, rarity_level, condition, notes) 
    SELECT p.id, topps_chrome_2024_id, '15', 'premium', false, 4, 'Near Mint', 'Chrome technology'
    FROM players p WHERE p.name = 'Patrick Mahomes';
    
    INSERT INTO cards (player_id, set_id, card_number, card_type, rookie_card, rarity_level, condition, notes) 
    SELECT p.id, bowman_2024_id, '101', 'base', true, 5, 'Mint', 'Rookie of the Year candidate'
    FROM players p WHERE p.name = 'Jayden Daniels';
    
    INSERT INTO cards (player_id, set_id, card_number, card_type, rookie_card, rarity_level, condition, notes) 
    SELECT p.id, bowman_2024_id, '102', 'base', true, 5, 'Mint', 'First overall pick rookie'
    FROM players p WHERE p.name = 'Caleb Williams';
    
    -- Insert cards for top RBs
    INSERT INTO cards (player_id, set_id, card_number, card_type, rookie_card, rarity_level, condition, notes) 
    SELECT p.id, panini_2024_id, '25', 'base', false, 4, 'Mint', 'Elite rushing talent'
    FROM players p WHERE p.name = 'Bijan Robinson';
    
    INSERT INTO cards (player_id, set_id, card_number, card_type, rookie_card, rarity_level, condition, notes) 
    SELECT p.id, topps_2024_id, '33', 'base', false, 4, 'Mint', 'Dual-threat superstar'
    FROM players p WHERE p.name = 'Christian McCaffrey';
    
    INSERT INTO cards (player_id, set_id, card_number, card_type, rookie_card, rarity_level, condition, notes) 
    SELECT p.id, panini_prizm_2024_id, '44', 'premium', false, 4, 'Mint', 'Eagles powerhouse'
    FROM players p WHERE p.name = 'Saquon Barkley';
    
    INSERT INTO cards (player_id, set_id, card_number, card_type, rookie_card, rarity_level, condition, notes) 
    SELECT p.id, topps_chrome_2024_id, '55', 'premium', false, 3, 'Near Mint', 'Speed demon'
    FROM players p WHERE p.name = 'De''Von Achane';
    
    -- Insert cards for top WRs
    INSERT INTO cards (player_id, set_id, card_number, card_type, rookie_card, rarity_level, condition, notes) 
    SELECT p.id, panini_prizm_2024_id, '10', 'premium', false, 5, 'Mint', 'Elite route runner'
    FROM players p WHERE p.name = 'Ja''Marr Chase';
    
    INSERT INTO cards (player_id, set_id, card_number, card_type, rookie_card, rarity_level, condition, notes) 
    SELECT p.id, topps_2024_id, '11', 'base', false, 5, 'Mint', 'Griddy king'
    FROM players p WHERE p.name = 'Justin Jefferson';
    
    INSERT INTO cards (player_id, set_id, card_number, card_type, rookie_card, rarity_level, condition, notes) 
    SELECT p.id, panini_2024_id, '88', 'base', false, 4, 'Mint', 'Star receiver'
    FROM players p WHERE p.name = 'CeeDee Lamb';
    
    INSERT INTO cards (player_id, set_id, card_number, card_type, rookie_card, rarity_level, condition, notes) 
    SELECT p.id, topps_chrome_2024_id, '14', 'premium', false, 4, 'Mint', 'Sun God himself'
    FROM players p WHERE p.name = 'Amon-Ra St. Brown';
    
    INSERT INTO cards (player_id, set_id, card_number, card_type, rookie_card, rarity_level, condition, notes) 
    SELECT p.id, bowman_2024_id, '150', 'base', true, 5, 'Mint', 'Rookie sensation'
    FROM players p WHERE p.name = 'Malik Nabers';
    
    INSERT INTO cards (player_id, set_id, card_number, card_type, rookie_card, rarity_level, condition, notes) 
    SELECT p.id, bowman_2024_id, '151', 'base', true, 5, 'Mint', 'Arizona rookie star'
    FROM players p WHERE p.name = 'Marvin Harrison Jr.';
    
    INSERT INTO cards (player_id, set_id, card_number, card_type, rookie_card, rarity_level, condition, notes) 
    SELECT p.id, bowman_2024_id, '152', 'base', true, 4, 'Mint', 'Bears rookie WR'
    FROM players p WHERE p.name = 'Rome Odunze';
    
    INSERT INTO cards (player_id, set_id, card_number, card_type, rookie_card, rarity_level, condition, notes) 
    SELECT p.id, topps_chrome_2024_id, '99', 'premium', false, 4, 'Mint', 'Speed kills'
    FROM players p WHERE p.name = 'Tyreek Hill';
    
    INSERT INTO cards (player_id, set_id, card_number, card_type, rookie_card, rarity_level, condition, notes) 
    SELECT p.id, bowman_2024_id, '200', 'base', true, 4, 'Mint', 'Chiefs speedster rookie'
    FROM players p WHERE p.name = 'Xavier Worthy';
    
    -- Insert cards for top TEs
    INSERT INTO cards (player_id, set_id, card_number, card_type, rookie_card, rarity_level, condition, notes) 
    SELECT p.id, panini_prizm_2024_id, '87', 'premium', false, 5, 'Mint', 'Tight end legend'
    FROM players p WHERE p.name = 'Travis Kelce';
    
    INSERT INTO cards (player_id, set_id, card_number, card_type, rookie_card, rarity_level, condition, notes) 
    SELECT p.id, topps_2024_id, '85', 'base', false, 4, 'Mint', 'Niners tight end'
    FROM players p WHERE p.name = 'George Kittle';
    
    INSERT INTO cards (player_id, set_id, card_number, card_type, rookie_card, rarity_level, condition, notes) 
    SELECT p.id, bowman_2024_id, '300', 'base', true, 5, 'Mint', 'Raiders rookie TE sensation'
    FROM players p WHERE p.name = 'Brock Bowers';
    
    INSERT INTO cards (player_id, set_id, card_number, card_type, rookie_card, rarity_level, condition, notes) 
    SELECT p.id, panini_2024_id, '89', 'base', false, 3, 'Mint', 'Cardinals tight end'
    FROM players p WHERE p.name = 'Trey McBride';
    
    -- Insert some autograph and memorabilia cards for stars
    INSERT INTO cards (player_id, set_id, card_number, card_type, rookie_card, rarity_level, condition, notes, serial_number, print_run) 
    SELECT p.id, panini_prizm_2024_id, 'A-PM', 'autograph', false, 8, 'Mint', 'On-card autograph', 15, 99
    FROM players p WHERE p.name = 'Patrick Mahomes';
    
    INSERT INTO cards (player_id, set_id, card_number, card_type, rookie_card, rarity_level, condition, notes, serial_number, print_run) 
    SELECT p.id, topps_chrome_2024_id, 'M-JJ', 'memorabilia', false, 7, 'Mint', 'Game-used jersey patch', 47, 149
    FROM players p WHERE p.name = 'Justin Jefferson';
    
    INSERT INTO cards (player_id, set_id, card_number, card_type, rookie_card, rarity_level, condition, notes, serial_number, print_run) 
    SELECT p.id, panini_prizm_2024_id, 'A-TK', 'autograph', false, 8, 'Mint', 'Signed card', 23, 75
    FROM players p WHERE p.name = 'Travis Kelce';
    
    -- Insert some 2023 cards for established players
    INSERT INTO cards (player_id, set_id, card_number, card_type, rookie_card, rarity_level, condition, notes) 
    SELECT p.id, topps_2023_id, '1', 'base', false, 3, 'Near Mint', '2023 base card'
    FROM players p WHERE p.name = 'Josh Allen';
    
    INSERT INTO cards (player_id, set_id, card_number, card_type, rookie_card, rarity_level, condition, notes) 
    SELECT p.id, panini_2023_id, '25', 'base', false, 4, 'Mint', '2023 base card'
    FROM players p WHERE p.name = 'Derrick Henry';
    
    INSERT INTO cards (player_id, set_id, card_number, card_type, rookie_card, rarity_level, condition, notes) 
    SELECT p.id, topps_2023_id, '88', 'base', false, 4, 'Mint', '2023 base card'
    FROM players p WHERE p.name = 'Mike Evans';

END $$;

-- Add market data for some cards
INSERT INTO card_market_data (card_id, current_market_value, last_sale_price, last_sale_date, data_source, price_trend) 
SELECT c.id, 25.00, 22.50, '2024-12-01', 'ebay', 'up'
FROM cards c 
JOIN players p ON c.player_id = p.id 
WHERE p.name = 'Patrick Mahomes' AND c.card_type = 'premium';

INSERT INTO card_market_data (card_id, current_market_value, last_sale_price, last_sale_date, data_source, price_trend) 
SELECT c.id, 350.00, 320.00, '2024-11-28', 'goldin', 'stable'
FROM cards c 
JOIN players p ON c.player_id = p.id 
WHERE p.name = 'Patrick Mahomes' AND c.card_type = 'autograph';

INSERT INTO card_market_data (card_id, current_market_value, last_sale_price, last_sale_date, data_source, price_trend) 
SELECT c.id, 45.00, 41.00, '2024-11-30', 'ebay', 'up'
FROM cards c 
JOIN players p ON c.player_id = p.id 
WHERE p.name = 'Caleb Williams' AND c.rookie_card = true;

INSERT INTO card_market_data (card_id, current_market_value, last_sale_price, last_sale_date, data_source, price_trend) 
SELECT c.id, 65.00, 58.00, '2024-11-29', 'pwcc', 'up'
FROM cards c 
JOIN players p ON c.player_id = p.id 
WHERE p.name = 'Malik Nabers' AND c.rookie_card = true;

-- Verify the cards were created
SELECT 
    p.name as player_name,
    cs.name as card_set,
    cs.year,
    c.card_number,
    c.card_type,
    c.rookie_card,
    c.rarity_level,
    c.condition,
    cmd.current_market_value
FROM cards c
JOIN players p ON c.player_id = p.id
JOIN card_sets cs ON c.set_id = cs.id
LEFT JOIN card_market_data cmd ON c.id = cmd.card_id
ORDER BY p.name, cs.year, c.card_type; 