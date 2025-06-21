-- Initialize essential sports and card data for Roster Frame
-- Run this in your Supabase SQL editor after running the main schema

-- Insert basic sports
INSERT INTO sports (name, abbreviation) VALUES 
('National Football League', 'NFL'),
('National Basketball Association', 'NBA'),
('Major League Baseball', 'MLB'),
('National Hockey League', 'NHL')
ON CONFLICT (abbreviation) DO NOTHING;

-- Insert common card manufacturers
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

-- Insert common grading companies
INSERT INTO grading_companies (name, abbreviation, max_grade, grade_scale) VALUES 
('Professional Sports Authenticator', 'PSA', 10.0, '1-10'),
('Beckett Grading Services', 'BGS', 10.0, '1-10'),
('Sportscard Guaranty Corporation', 'SGC', 10.0, '1-10')
ON CONFLICT (abbreviation) DO NOTHING;

-- Insert NFL teams
DO $$
DECLARE 
    nfl_sport_id UUID;
BEGIN
    -- Get NFL sport ID
    SELECT id INTO nfl_sport_id FROM sports WHERE abbreviation = 'NFL';
    
    -- Insert NFL teams
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
    
    -- Insert NFL positions
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