-- Formatted NFL Players from Draft Data
-- Extract from fantasy draft data: Player Name, Position, Team

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

    -- Insert Running Backs
    INSERT INTO players (name, sport_id, position_id, active, stats) VALUES
    ('Bijan Robinson', nfl_sport_id, rb_position_id, true, '{"team": "ATL", "draft_rank": "RB1"}'),
    ('Jahmyr Gibbs', nfl_sport_id, rb_position_id, true, '{"team": "DET", "draft_rank": "RB2"}'),
    ('Saquon Barkley', nfl_sport_id, rb_position_id, true, '{"team": "PHI", "draft_rank": "RB3"}'),
    ('Ashton Jeanty', nfl_sport_id, rb_position_id, true, '{"team": "LV", "draft_rank": "RB4"}'),
    ('De''Von Achane', nfl_sport_id, rb_position_id, true, '{"team": "MIA", "draft_rank": "RB5"}'),
    ('Derrick Henry', nfl_sport_id, rb_position_id, true, '{"team": "BAL", "draft_rank": "RB8"}'),
    ('Josh Jacobs', nfl_sport_id, rb_position_id, true, '{"team": "GB", "draft_rank": "RB9"}'),
    ('Bucky Irving', nfl_sport_id, rb_position_id, true, '{"team": "TB", "draft_rank": "RB10"}'),
    ('Kyren Williams', nfl_sport_id, rb_position_id, true, '{"team": "LAR", "draft_rank": "RB11"}'),
    ('James Cook', nfl_sport_id, rb_position_id, true, '{"team": "BUF", "draft_rank": "RB12"}'),
    ('Joe Mixon', nfl_sport_id, rb_position_id, true, '{"team": "HOU", "draft_rank": "RB13"}'),
    ('Chase Brown', nfl_sport_id, rb_position_id, true, '{"team": "CIN", "draft_rank": "RB14"}'),
    ('Kenneth Walker III', nfl_sport_id, rb_position_id, true, '{"team": "SEA", "draft_rank": "RB15"}'),
    ('Omarion Hampton', nfl_sport_id, rb_position_id, true, '{"team": "LAC", "draft_rank": "RB16"}'),
    ('Breece Hall', nfl_sport_id, rb_position_id, true, '{"team": "NYJ", "draft_rank": "RB17"}'),
    ('Chuba Hubbard', nfl_sport_id, rb_position_id, true, '{"team": "CAR", "draft_rank": "RB18"}'),
    ('D''Andre Swift', nfl_sport_id, rb_position_id, true, '{"team": "CHI", "draft_rank": "RB19"}'),
    ('Alvin Kamara', nfl_sport_id, rb_position_id, true, '{"team": "NO", "draft_rank": "RB20"}'),
    ('David Montgomery', nfl_sport_id, rb_position_id, true, '{"team": "DET", "draft_rank": "RB21"}'),
    ('Quinshon Judkins', nfl_sport_id, rb_position_id, true, '{"team": "CLE", "draft_rank": "RB22"}'),
    ('James Conner', nfl_sport_id, rb_position_id, true, '{"team": "ARI", "draft_rank": "RB23"}'),
    ('Aaron Jones Sr.', nfl_sport_id, rb_position_id, true, '{"team": "MIN", "draft_rank": "RB24"}'),
    ('Tony Pollard', nfl_sport_id, rb_position_id, true, '{"team": "TEN", "draft_rank": "RB25"}'),
    ('RJ Harvey', nfl_sport_id, rb_position_id, true, '{"team": "DEN", "draft_rank": "RB26"}'),
    ('Kaleb Johnson', nfl_sport_id, rb_position_id, true, '{"team": "PIT", "draft_rank": "RB27"}'),
    ('TreVeyon Henderson', nfl_sport_id, rb_position_id, true, '{"team": "NE", "draft_rank": "RB28"}'),
    ('Isiah Pacheco', nfl_sport_id, rb_position_id, true, '{"team": "KC", "draft_rank": "RB29"}'),
    ('Javonte Williams', nfl_sport_id, rb_position_id, true, '{"team": "DAL", "draft_rank": "RB30"}'),
    ('J.K. Dobbins', nfl_sport_id, rb_position_id, true, '{"team": "DEN", "draft_rank": "RB31"}'),
    ('Brian Robinson Jr.', nfl_sport_id, rb_position_id, true, '{"team": "WSH", "draft_rank": "RB32"}'),
    ('Tyrone Tracy Jr.', nfl_sport_id, rb_position_id, true, '{"team": "NYG", "draft_rank": "RB33"}'),
    ('Jaylen Warren', nfl_sport_id, rb_position_id, true, '{"team": "PIT", "draft_rank": "RB34"}'),
    ('Cam Skattebo', nfl_sport_id, rb_position_id, true, '{"team": "NYG", "draft_rank": "RB35"}');

    -- Insert Wide Receivers
    INSERT INTO players (name, sport_id, position_id, active, stats) VALUES
    ('Ja''Marr Chase', nfl_sport_id, wr_position_id, true, '{"team": "CIN", "draft_rank": "WR1"}'),
    ('Justin Jefferson', nfl_sport_id, wr_position_id, true, '{"team": "MIN", "draft_rank": "WR2"}'),
    ('Puka Nacua', nfl_sport_id, wr_position_id, true, '{"team": "LAR", "draft_rank": "WR3"}'),
    ('CeeDee Lamb', nfl_sport_id, wr_position_id, true, '{"team": "DAL", "draft_rank": "WR4"}'),
    ('Amon-Ra St. Brown', nfl_sport_id, wr_position_id, true, '{"team": "DET", "draft_rank": "WR5"}'),
    ('Malik Nabers', nfl_sport_id, wr_position_id, true, '{"team": "NYG", "draft_rank": "WR6"}'),
    ('Nico Collins', nfl_sport_id, wr_position_id, true, '{"team": "HOU", "draft_rank": "WR7"}'),
    ('Brian Thomas Jr.', nfl_sport_id, wr_position_id, true, '{"team": "JAX", "draft_rank": "WR8"}'),
    ('A.J. Brown', nfl_sport_id, wr_position_id, true, '{"team": "PHI", "draft_rank": "WR9"}'),
    ('Drake London', nfl_sport_id, wr_position_id, true, '{"team": "ATL", "draft_rank": "WR10"}'),
    ('Ladd McConkey', nfl_sport_id, wr_position_id, true, '{"team": "LAC", "draft_rank": "WR11"}'),
    ('Tyreek Hill', nfl_sport_id, wr_position_id, true, '{"team": "MIA", "draft_rank": "WR12"}'),
    ('Davante Adams', nfl_sport_id, wr_position_id, true, '{"team": "LAR", "draft_rank": "WR13"}'),
    ('Tee Higgins', nfl_sport_id, wr_position_id, true, '{"team": "CIN", "draft_rank": "WR14"}'),
    ('Jaxon Smith-Njigba', nfl_sport_id, wr_position_id, true, '{"team": "SEA", "draft_rank": "WR15"}'),
    ('Mike Evans', nfl_sport_id, wr_position_id, true, '{"team": "TB", "draft_rank": "WR16"}'),
    ('Terry McLaurin', nfl_sport_id, wr_position_id, true, '{"team": "WSH", "draft_rank": "WR17"}'),
    ('Rashee Rice', nfl_sport_id, wr_position_id, true, '{"team": "KC", "draft_rank": "WR18"}'),
    ('Marvin Harrison Jr.', nfl_sport_id, wr_position_id, true, '{"team": "ARI", "draft_rank": "WR19"}'),
    ('Garrett Wilson', nfl_sport_id, wr_position_id, true, '{"team": "NYJ", "draft_rank": "WR20"}'),
    ('DK Metcalf', nfl_sport_id, wr_position_id, true, '{"team": "PIT", "draft_rank": "WR21"}'),
    ('DJ Moore', nfl_sport_id, wr_position_id, true, '{"team": "CHI", "draft_rank": "WR22"}'),
    ('Courtland Sutton', nfl_sport_id, wr_position_id, true, '{"team": "DEN", "draft_rank": "WR23"}'),
    ('Xavier Worthy', nfl_sport_id, wr_position_id, true, '{"team": "KC", "draft_rank": "WR24"}'),
    ('Jaylen Waddle', nfl_sport_id, wr_position_id, true, '{"team": "MIA", "draft_rank": "WR25"}'),
    ('Zay Flowers', nfl_sport_id, wr_position_id, true, '{"team": "BAL", "draft_rank": "WR26"}'),
    ('George Pickens', nfl_sport_id, wr_position_id, true, '{"team": "DAL", "draft_rank": "WR27"}'),
    ('DeVonta Smith', nfl_sport_id, wr_position_id, true, '{"team": "PHI", "draft_rank": "WR28"}'),
    ('Calvin Ridley', nfl_sport_id, wr_position_id, true, '{"team": "TEN", "draft_rank": "WR29"}'),
    ('Jameson Williams', nfl_sport_id, wr_position_id, true, '{"team": "DET", "draft_rank": "WR30"}'),
    ('Rome Odunze', nfl_sport_id, wr_position_id, true, '{"team": "CHI", "draft_rank": "WR31"}'),
    ('Jordan Addison', nfl_sport_id, wr_position_id, true, '{"team": "MIN", "draft_rank": "WR32"}'),
    ('Travis Hunter', nfl_sport_id, wr_position_id, true, '{"team": "JAX", "draft_rank": "WR33"}'),
    ('Matthew Golden', nfl_sport_id, wr_position_id, true, '{"team": "GB", "draft_rank": "WR34"}'),
    ('Tetairoa McMillan', nfl_sport_id, wr_position_id, true, '{"team": "CAR", "draft_rank": "WR35"}'),
    ('Jerry Jeudy', nfl_sport_id, wr_position_id, true, '{"team": "CLE", "draft_rank": "WR36"}');

    -- Insert Quarterbacks
    INSERT INTO players (name, sport_id, position_id, active, stats) VALUES
    ('Lamar Jackson', nfl_sport_id, qb_position_id, true, '{"team": "BAL", "draft_rank": "QB1"}'),
    ('Josh Allen', nfl_sport_id, qb_position_id, true, '{"team": "BUF", "draft_rank": "QB2"}'),
    ('Jayden Daniels', nfl_sport_id, qb_position_id, true, '{"team": "WSH", "draft_rank": "QB3"}'),
    ('Jalen Hurts', nfl_sport_id, qb_position_id, true, '{"team": "PHI", "draft_rank": "QB4"}'),
    ('Joe Burrow', nfl_sport_id, qb_position_id, true, '{"team": "CIN", "draft_rank": "QB5"}'),
    ('Baker Mayfield', nfl_sport_id, qb_position_id, true, '{"team": "TB", "draft_rank": "QB6"}'),
    ('Bo Nix', nfl_sport_id, qb_position_id, true, '{"team": "DEN", "draft_rank": "QB7"}'),
    ('Patrick Mahomes', nfl_sport_id, qb_position_id, true, '{"team": "KC", "draft_rank": "QB8"}'),
    ('Brock Purdy', nfl_sport_id, qb_position_id, true, '{"team": "SF", "draft_rank": "QB9"}'),
    ('Kyler Murray', nfl_sport_id, qb_position_id, true, '{"team": "ARI", "draft_rank": "QB10"}'),
    ('Justin Fields', nfl_sport_id, qb_position_id, true, '{"team": "NYJ", "draft_rank": "QB11"}'),
    ('Caleb Williams', nfl_sport_id, qb_position_id, true, '{"team": "CHI", "draft_rank": "QB12"}'),
    ('Justin Herbert', nfl_sport_id, qb_position_id, true, '{"team": "LAC", "draft_rank": "QB13"}'),
    ('Dak Prescott', nfl_sport_id, qb_position_id, true, '{"team": "DAL", "draft_rank": "QB14"}'),
    ('Drake Maye', nfl_sport_id, qb_position_id, true, '{"team": "NE", "draft_rank": "QB15"}'),
    ('C.J. Stroud', nfl_sport_id, qb_position_id, true, '{"team": "HOU", "draft_rank": "QB16"}'),
    ('Jordan Love', nfl_sport_id, qb_position_id, true, '{"team": "GB", "draft_rank": "QB17"}'),
    ('Jared Goff', nfl_sport_id, qb_position_id, true, '{"team": "DET", "draft_rank": "QB18"}'),
    ('J.J. McCarthy', nfl_sport_id, qb_position_id, true, '{"team": "MIN", "draft_rank": "QB19"}');

    -- Insert Tight Ends
    INSERT INTO players (name, sport_id, position_id, active, stats) VALUES
    ('Brock Bowers', nfl_sport_id, te_position_id, true, '{"team": "LV", "draft_rank": "TE1"}'),
    ('Trey McBride', nfl_sport_id, te_position_id, true, '{"team": "ARI", "draft_rank": "TE2"}'),
    ('George Kittle', nfl_sport_id, te_position_id, true, '{"team": "SF", "draft_rank": "TE3"}'),
    ('Sam LaPorta', nfl_sport_id, te_position_id, true, '{"team": "DET", "draft_rank": "TE4"}'),
    ('Travis Kelce', nfl_sport_id, te_position_id, true, '{"team": "KC", "draft_rank": "TE5"}'),
    ('T.J. Hockenson', nfl_sport_id, te_position_id, true, '{"team": "MIN", "draft_rank": "TE6"}'),
    ('Mark Andrews', nfl_sport_id, te_position_id, true, '{"team": "BAL", "draft_rank": "TE7"}'),
    ('David Njoku', nfl_sport_id, te_position_id, true, '{"team": "CLE", "draft_rank": "TE8"}'),
    ('Evan Engram', nfl_sport_id, te_position_id, true, '{"team": "DEN", "draft_rank": "TE9"}'),
    ('Jonnu Smith', nfl_sport_id, te_position_id, true, '{"team": "MIA", "draft_rank": "TE10"}'),
    ('Colston Loveland', nfl_sport_id, te_position_id, true, '{"team": "CHI", "draft_rank": "TE11"}'),
    ('Tyler Warren', nfl_sport_id, te_position_id, true, '{"team": "IND", "draft_rank": "TE12"}'),
    ('Tucker Kraft', nfl_sport_id, te_position_id, true, '{"team": "GB", "draft_rank": "TE13"}'),
    ('Dallas Goedert', nfl_sport_id, te_position_id, true, '{"team": "PHI", "draft_rank": "TE14"}'),
    ('Hunter Henry', nfl_sport_id, te_position_id, true, '{"team": "NE", "draft_rank": "TE15"}'),
    ('Dalton Kincaid', nfl_sport_id, te_position_id, true, '{"team": "BUF", "draft_rank": "TE16"}'),
    ('Kyle Pitts', nfl_sport_id, te_position_id, true, '{"team": "ATL", "draft_rank": "TE17"}'),
    ('Isaiah Likely', nfl_sport_id, te_position_id, true, '{"team": "BAL", "draft_rank": "TE18"}'),
    ('Jake Ferguson', nfl_sport_id, te_position_id, true, '{"team": "DAL", "draft_rank": "TE19"}');

    -- Insert Kickers
    INSERT INTO players (name, sport_id, position_id, active, stats) VALUES
    ('Jake Bates', nfl_sport_id, k_position_id, true, '{"team": "DET", "draft_rank": "K1"}'),
    ('Brandon Aubrey', nfl_sport_id, k_position_id, true, '{"team": "DAL", "draft_rank": "K2"}'),
    ('Cameron Dicker', nfl_sport_id, k_position_id, true, '{"team": "LAC", "draft_rank": "K3"}'),
    ('Chase McLaughlin', nfl_sport_id, k_position_id, true, '{"team": "TB", "draft_rank": "K4"}'),
    ('Ka''imi Fairbairn', nfl_sport_id, k_position_id, true, '{"team": "HOU", "draft_rank": "K5"}'),
    ('Tyler Loop', nfl_sport_id, k_position_id, true, '{"team": "BAL", "draft_rank": "K6"}'),
    ('Tyler Bass', nfl_sport_id, k_position_id, true, '{"team": "BUF", "draft_rank": "K7"}'),
    ('Jason Sanders', nfl_sport_id, k_position_id, true, '{"team": "MIA", "draft_rank": "K8"}'),
    ('Wil Lutz', nfl_sport_id, k_position_id, true, '{"team": "DEN", "draft_rank": "K9"}'),
    ('Jake Elliott', nfl_sport_id, k_position_id, true, '{"team": "PHI", "draft_rank": "K10"}'),
    ('Harrison Butker', nfl_sport_id, k_position_id, true, '{"team": "KC", "draft_rank": "K11"}'),
    ('Cairo Santos', nfl_sport_id, k_position_id, true, '{"team": "CHI", "draft_rank": "K12"}');

END $$;

-- Verify the insertion
SELECT 
    p.name,
    pos.abbreviation as position,
    p.stats->'team' as team,
    p.stats->'draft_rank' as draft_rank
FROM players p
JOIN positions pos ON p.position_id = pos.id
JOIN sports s ON p.sport_id = s.id
WHERE s.abbreviation = 'NFL'
ORDER BY 
    CASE pos.abbreviation
        WHEN 'QB' THEN 1
        WHEN 'RB' THEN 2
        WHEN 'WR' THEN 3
        WHEN 'TE' THEN 4
        WHEN 'K' THEN 5
        ELSE 6
    END,
    p.name; 