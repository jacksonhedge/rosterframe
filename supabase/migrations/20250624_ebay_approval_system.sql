-- Add approval fields to ebay_listings table
ALTER TABLE ebay_listings
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_by TEXT,
ADD COLUMN IF NOT EXISTS approval_notes TEXT,
ADD COLUMN IF NOT EXISTS affiliate_url TEXT;

-- Create index for faster filtering by approval status
CREATE INDEX IF NOT EXISTS idx_ebay_listings_approval_status ON ebay_listings(approval_status);

-- Create settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update existing ebay_listings to have pending status
UPDATE ebay_listings 
SET approval_status = 'pending' 
WHERE approval_status IS NULL;

-- Create a view for approved eBay cards that are visible to users
CREATE OR REPLACE VIEW public_ebay_cards AS
SELECT 
  el.id,
  el.ebay_item_id,
  el.title,
  el.player_name,
  el.year,
  el.brand,
  el.our_price as price,
  el.shipping_cost,
  el.image_urls,
  CASE 
    WHEN s.value->>'enabled' = 'true' AND s.value->>'campaignId' IS NOT NULL THEN
      el.affiliate_url
    ELSE 
      el.listing_url
  END as listing_url,
  el.seller_username,
  el.seller_feedback_percentage,
  el.condition,
  el.listing_type,
  el.end_time,
  el.current_bid,
  el.bid_count
FROM ebay_listings el
LEFT JOIN settings s ON s.key = 'ebay_affiliate_config'
WHERE el.approval_status = 'approved' 
  AND el.is_active = true;

-- Grant read access to authenticated users
GRANT SELECT ON public_ebay_cards TO authenticated;

-- Add RLS policy for public view
ALTER TABLE ebay_listings ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY "Admin full access to ebay_listings" ON ebay_listings
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Regular users can only see approved cards through the view
CREATE POLICY "Users can view approved ebay cards" ON ebay_listings
  FOR SELECT USING (approval_status = 'approved' AND is_active = true);

COMMENT ON VIEW public_ebay_cards IS 'Public view of approved eBay cards with affiliate links when configured';