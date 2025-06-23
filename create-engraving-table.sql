-- Create table for saving engraving configurations
CREATE TABLE IF NOT EXISTS engraving_configurations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT, -- Can be null for anonymous saves, or link to auth.users
  text TEXT NOT NULL,
  font_id TEXT NOT NULL,
  font_name TEXT NOT NULL,
  font_size INTEGER NOT NULL,
  position_x DECIMAL(5,2) NOT NULL,
  position_y DECIMAL(5,2) NOT NULL,
  material_id TEXT NOT NULL,
  material_name TEXT NOT NULL,
  plaque_size TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  session_id TEXT -- To group saves by browser session
);

-- Create index for faster queries
CREATE INDEX idx_engraving_configurations_user_id ON engraving_configurations(user_id);
CREATE INDEX idx_engraving_configurations_session_id ON engraving_configurations(session_id);
CREATE INDEX idx_engraving_configurations_created_at ON engraving_configurations(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE engraving_configurations ENABLE ROW LEVEL SECURITY;

-- Create a simple policy to allow all operations for now
CREATE POLICY "Allow all operations on engraving_configurations" ON engraving_configurations
  FOR ALL USING (true) WITH CHECK (true);