-- Insert Sample NFL Players into card_players table
-- Run this in your Supabase SQL editor

-- Get sport and position IDs for reference
DO $$
DECLARE
    nfl_sport_id UUID;
    qb_position_id UUID;
    rb_position_id UUID;
    wr_position_id UUID;
    te_position_id UUID;
    k_position_id UUID;
    def_position_id UUID;
BEGIN
    -- Get NFL sport ID
    SELECT id INTO nfl_sport_id FROM sports WHERE abbreviation = 'NFL';
    
    -- Get position IDs
    SELECT id INTO qb_position_id FROM positions WHERE sport_id = nfl_sport_id AND abbreviation = 'QB';
    SELECT id INTO rb_position_id FROM positions WHERE sport_id = nfl_sport_id AND abbreviation = 'RB';
    SELECT id INTO wr_position_id FROM positions WHERE sport_id = nfl_sport_id AND abbreviation = 'WR';
    SELECT id INTO te_position_id FROM positions WHERE sport_id = nfl_sport_id AND abbreviation = 'TE';
    SELECT id INTO k_position_id FROM positions WHERE sport_id = nfl_sport_id AND abbreviation = 'K';
    SELECT id INTO def_position_id FROM positions WHERE sport_id = nfl_sport_id AND abbreviation = 'DEF';

    -- Insert popular NFL quarterbacks
    INSERT INTO players (name, sport_id, position_id, birth_date, debut_date, active, stats) VALUES
    ('Josh Allen', nfl_sport_id, qb_position_id, '1996-05-21', '2018-01-01', true, 
     '{"seasons": 6, "passing_yards": 20000, "touchdowns": 150, "team": "BUF"}'),
    ('Patrick Mahomes', nfl_sport_id, qb_position_id, '1995-09-17', '2017-01-01', true,
     '{"seasons": 7, "passing_yards": 25000, "touchdowns": 180, "super_bowls": 2, "team": "KC"}'),
    ('Lamar Jackson', nfl_sport_id, qb_position_id, '1997-01-07', '2018-01-01', true,
     '{"seasons": 6, "passing_yards": 15000, "rushing_yards": 5000, "mvp": 1, "team": "BAL"}'),
    ('Dak Prescott', nfl_sport_id, qb_position_id, '1993-07-29', '2016-01-01', true,
     '{"seasons": 8, "passing_yards": 22000, "touchdowns": 160, "team": "DAL"}'),
    ('Joe Burrow', nfl_sport_id, qb_position_id, '1996-12-10', '2020-01-01', true,
     '{"seasons": 4, "passing_yards": 15000, "touchdowns": 100, "team": "CIN"}');

    -- Insert popular running backs
    INSERT INTO players (name, sport_id, position_id, birth_date, debut_date, active, stats) VALUES
    ('Christian McCaffrey', nfl_sport_id, rb_position_id, '1996-06-07', '2017-01-01', true,
     '{"seasons": 7, "rushing_yards": 6000, "receiving_yards": 3500, "touchdowns": 60, "team": "SF"}'),
    ('Derrick Henry', nfl_sport_id, rb_position_id, '1994-01-04', '2016-01-01', true,
     '{"seasons": 8, "rushing_yards": 9000, "touchdowns": 90, "rushing_titles": 2, "team": "TEN"}'),
    ('Nick Chubb', nfl_sport_id, rb_position_id, '1995-12-27', '2018-01-01', true,
     '{"seasons": 6, "rushing_yards": 6500, "touchdowns": 50, "team": "CLE"}'),
    ('Dalvin Cook', nfl_sport_id, rb_position_id, '1995-08-10', '2017-01-01', true,
     '{"seasons": 7, "rushing_yards": 7000, "touchdowns": 55, "team": "NYJ"}'),
    ('Josh Jacobs', nfl_sport_id, rb_position_id, '1998-02-11', '2019-01-01', true,
     '{"seasons": 5, "rushing_yards": 5500, "touchdowns": 45, "team": "GB"}');

    -- Insert popular wide receivers
    INSERT INTO players (name, sport_id, position_id, birth_date, debut_date, active, stats) VALUES
    ('Tyreek Hill', nfl_sport_id, wr_position_id, '1994-03-01', '2016-01-01', true,
     '{"seasons": 8, "receiving_yards": 9000, "touchdowns": 65, "speed": "elite", "team": "MIA"}'),
    ('Stefon Diggs', nfl_sport_id, wr_position_id, '1993-11-29', '2015-01-01', true,
     '{"seasons": 9, "receiving_yards": 9500, "touchdowns": 70, "pro_bowls": 4, "team": "BUF"}'),
    ('DeAndre Hopkins', nfl_sport_id, wr_position_id, '1992-06-06', '2013-01-01', true,
     '{"seasons": 11, "receiving_yards": 11000, "touchdowns": 75, "all_pros": 3, "team": "TEN"}'),
    ('Cooper Kupp', nfl_sport_id, wr_position_id, '1993-06-15', '2017-01-01', true,
     '{"seasons": 7, "receiving_yards": 7500, "touchdowns": 55, "super_bowl": 1, "team": "LAR"}'),
    ('CeeDee Lamb', nfl_sport_id, wr_position_id, '1999-04-08', '2020-01-01', true,
     '{"seasons": 4, "receiving_yards": 4500, "touchdowns": 30, "team": "DAL"}'),
    ('Ja''Marr Chase', nfl_sport_id, wr_position_id, '2000-03-01', '2021-01-01', true,
     '{"seasons": 3, "receiving_yards": 3500, "touchdowns": 25, "rookie_record": true, "team": "CIN"}');

    -- Insert popular tight ends
    INSERT INTO players (name, sport_id, position_id, birth_date, debut_date, active, stats) VALUES
    ('Travis Kelce', nfl_sport_id, te_position_id, '1989-10-05', '2013-01-01', true,
     '{"seasons": 11, "receiving_yards": 10000, "touchdowns": 70, "super_bowls": 2, "team": "KC"}'),
    ('George Kittle', nfl_sport_id, te_position_id, '1993-10-09', '2017-01-01', true,
     '{"seasons": 7, "receiving_yards": 5500, "touchdowns": 35, "team": "SF"}'),
    ('Mark Andrews', nfl_sport_id, te_position_id, '1995-09-06', '2018-01-01', true,
     '{"seasons": 6, "receiving_yards": 4500, "touchdowns": 40, "team": "BAL"}'),
    ('T.J. Hockenson', nfl_sport_id, te_position_id, '1997-07-03', '2019-01-01', true,
     '{"seasons": 5, "receiving_yards": 3000, "touchdowns": 25, "team": "MIN"}');

    -- Insert some recent rookies and rising stars
    INSERT INTO players (name, sport_id, position_id, birth_date, debut_date, active, stats) VALUES
    ('Xavier Worthy', nfl_sport_id, wr_position_id, '2003-02-28', '2024-01-01', true,
     '{"seasons": 1, "receiving_yards": 500, "touchdowns": 5, "rookie": true, "team": "KC"}'),
    ('Caleb Williams', nfl_sport_id, qb_position_id, '2002-11-18', '2024-01-01', true,
     '{"seasons": 1, "passing_yards": 2000, "touchdowns": 15, "rookie": true, "team": "CHI"}'),
    ('Marvin Harrison Jr.', nfl_sport_id, wr_position_id, '2002-08-07', '2024-01-01', true,
     '{"seasons": 1, "receiving_yards": 800, "touchdowns": 6, "rookie": true, "team": "ARI"}'),
    ('Rome Odunze', nfl_sport_id, wr_position_id, '2002-06-03', '2024-01-01', true,
     '{"seasons": 1, "receiving_yards": 600, "touchdowns": 4, "rookie": true, "team": "CHI"}'),
    ('Malik Nabers', nfl_sport_id, wr_position_id, '2003-01-28', '2024-01-01', true,
     '{"seasons": 1, "receiving_yards": 700, "touchdowns": 5, "rookie": true, "team": "NYG"}');

END $$;

-- Add some achievements for star players
UPDATE players SET achievements = ARRAY['Super Bowl Champion', 'Pro Bowl', 'All-Pro'] 
WHERE name IN ('Patrick Mahomes', 'Travis Kelce');

UPDATE players SET achievements = ARRAY['MVP', 'Pro Bowl', 'All-Pro']
WHERE name = 'Lamar Jackson';

UPDATE players SET achievements = ARRAY['Offensive Player of the Year', 'All-Pro', 'Pro Bowl']
WHERE name = 'Cooper Kupp';

UPDATE players SET achievements = ARRAY['Offensive Rookie of the Year', 'Pro Bowl']
WHERE name = 'Ja''Marr Chase';

-- Verify the insertion
SELECT 
    p.name,
    s.abbreviation as sport,
    pos.abbreviation as position,
    p.active,
    p.stats->'team' as team
FROM players p
JOIN sports s ON p.sport_id = s.id
JOIN positions pos ON p.position_id = pos.id
WHERE s.abbreviation = 'NFL'
ORDER BY pos.abbreviation, p.name; 