import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: Request) {
  try {
    // Check if the table exists
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'engraving_configurations')
      .single();

    if (tableError || !tables) {
      return NextResponse.json({ 
        tableExists: false,
        message: 'Table engraving_configurations does not exist. Please run the SQL script in Supabase.',
        sqlScript: `
-- Create table for saving engraving configurations
CREATE TABLE IF NOT EXISTS engraving_configurations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
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
  session_id TEXT
);

-- Create indexes
CREATE INDEX idx_engraving_configurations_session_id ON engraving_configurations(session_id);
CREATE INDEX idx_engraving_configurations_created_at ON engraving_configurations(created_at DESC);

-- Enable RLS with simple policy
ALTER TABLE engraving_configurations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations" ON engraving_configurations FOR ALL USING (true) WITH CHECK (true);
        `
      });
    }

    return NextResponse.json({ 
      tableExists: true,
      message: 'Table exists and is ready to use'
    });
  } catch (error) {
    console.error('Error checking table:', error);
    return NextResponse.json({ 
      error: 'Failed to check table status',
      details: error 
    }, { status: 500 });
  }
}