-- Fix missing plaques table
CREATE TABLE IF NOT EXISTS plaques (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  type VARCHAR NOT NULL, -- '8-spot', '10-spot'
  material VARCHAR NOT NULL, -- 'Dark Maple Wood', 'Clear Plaque', 'Black Marble'
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  image_url VARCHAR,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default plaque inventory
INSERT INTO plaques (name, type, material, price, stock_quantity, image_url, description) VALUES 
('Dark Maple Wood 8-Spot', '8-spot', 'Dark Maple Wood', 129.99, 50, '/images/DarkMapleWood1.png', 'Premium dark maple wood finish with 8 card slots'),
('Clear Plaque 8-Spot', '8-spot', 'Clear Plaque', 149.99, 30, '/images/ClearPlaque8.png', 'Crystal clear acrylic with front/back card display'),
('Black Marble 8-Spot', '8-spot', 'Black Marble', 159.99, 25, '/images/BlackMarble8.png', 'Elegant black marble finish'),
('Premium 10-Spot Plaque', '10-spot', 'Dark Maple Wood', 179.99, 20, '/images/Plaque10Spots.png', 'Large format 10-card display plaque')
ON CONFLICT DO NOTHING;

-- Fix the search ordering issue
-- This creates a function to handle the search ordering properly
CREATE OR REPLACE FUNCTION search_cards(query_text TEXT, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  player_name TEXT,
  set_name TEXT,
  manufacturer_name TEXT,
  year INTEGER,
  card_front_image_url TEXT,
  card_back_image_url TEXT,
  rookie_card BOOLEAN,
  rarity_level INTEGER
) 
LANGUAGE SQL AS $$
  SELECT 
    c.id,
    p.name as player_name,
    s.name as set_name,
    m.name as manufacturer_name,
    s.year,
    c.card_front_image_url,
    c.card_back_image_url,
    c.rookie_card,
    c.rarity_level
  FROM cards c
  LEFT JOIN card_players p ON c.player_id = p.id
  LEFT JOIN card_sets s ON c.set_id = s.id
  LEFT JOIN card_manufacturers m ON s.manufacturer_id = m.id
  WHERE 
    p.name ILIKE '%' || query_text || '%'
    OR s.name ILIKE '%' || query_text || '%'
    OR m.name ILIKE '%' || query_text || '%'
  ORDER BY 
    CASE WHEN p.name ILIKE query_text || '%' THEN 1 ELSE 2 END,
    p.name ASC
  LIMIT limit_count;
$$; 