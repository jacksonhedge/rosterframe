-- Create football players table for storing scraped data
CREATE TABLE IF NOT EXISTS football_players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  position VARCHAR(50),
  years_active VARCHAR(100),
  college VARCHAR(255),
  height VARCHAR(20),
  weight VARCHAR(20),
  birth_date VARCHAR(100),
  profile_url TEXT,
  letter CHAR(1) GENERATED ALWAYS AS (UPPER(SUBSTRING(name, 1, 1))) STORED,
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, years_active) -- Prevent exact duplicates
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_football_players_name ON football_players(name);
CREATE INDEX IF NOT EXISTS idx_football_players_position ON football_players(position);
CREATE INDEX IF NOT EXISTS idx_football_players_letter ON football_players(letter);
CREATE INDEX IF NOT EXISTS idx_football_players_years ON football_players(years_active);

-- Create RLS policies
ALTER TABLE football_players ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read
CREATE POLICY "Allow authenticated users to read football players" ON football_players
  FOR SELECT
  TO authenticated
  USING (true);

-- Only allow service role to insert/update/delete
CREATE POLICY "Only service role can modify football players" ON football_players
  FOR ALL
  TO service_role
  USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_football_players_updated_at 
  BEFORE UPDATE ON football_players 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create view for player statistics
CREATE OR REPLACE VIEW football_players_stats AS
SELECT 
  letter,
  COUNT(*) as player_count,
  COUNT(DISTINCT position) as position_count,
  MIN(scraped_at) as first_scraped,
  MAX(scraped_at) as last_scraped
FROM football_players
GROUP BY letter
ORDER BY letter;