-- Database Diagnostic Script
-- Run this to see what's currently in your database

-- Check what tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check columns in players table (if it exists)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'players'
ORDER BY ordinal_position;

-- Check columns in sports table (if it exists)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'sports'
ORDER BY ordinal_position;

-- Check if NFL sport exists
SELECT * FROM sports WHERE abbreviation = 'NFL'; 