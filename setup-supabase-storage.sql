-- Setup Supabase Storage for Card Images
-- Run this in your Supabase SQL editor

-- Create the card-images storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('card-images', 'card-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for the card-images bucket
-- Allow public read access to card images
CREATE POLICY "Public read access for card images" ON storage.objects
  FOR SELECT USING (bucket_id = 'card-images');

-- Allow authenticated users to upload card images
CREATE POLICY "Authenticated users can upload card images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'card-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to update their own card images
CREATE POLICY "Authenticated users can update card images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'card-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete card images (optional - for admin use)
CREATE POLICY "Authenticated users can delete card images" ON storage.objects
  FOR DELETE USING (bucket_id = 'card-images' AND auth.role() = 'authenticated'); 