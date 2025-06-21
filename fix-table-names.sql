-- Quick fix: Create views to match what CardService expects
-- Run this AFTER running cards-only-schema.sql and init-sports-data.sql

-- Create views with the names CardService expects
CREATE OR REPLACE VIEW card_sports AS SELECT * FROM sports;
CREATE OR REPLACE VIEW card_players AS SELECT * FROM players;
CREATE OR REPLACE VIEW card_positions AS SELECT * FROM positions;
CREATE OR REPLACE VIEW card_teams AS SELECT * FROM teams;

-- Grant necessary permissions on views
GRANT ALL ON card_sports TO authenticated;
GRANT ALL ON card_players TO authenticated;
GRANT ALL ON card_positions TO authenticated;
GRANT ALL ON card_teams TO authenticated;

-- Also grant on the underlying tables
GRANT ALL ON sports TO authenticated;
GRANT ALL ON players TO authenticated;
GRANT ALL ON positions TO authenticated;
GRANT ALL ON teams TO authenticated;
GRANT ALL ON cards TO authenticated;
GRANT ALL ON card_sets TO authenticated;
GRANT ALL ON card_manufacturers TO authenticated;
GRANT ALL ON grading_companies TO authenticated;
GRANT ALL ON card_instances TO authenticated;
GRANT ALL ON card_market_data TO authenticated; 