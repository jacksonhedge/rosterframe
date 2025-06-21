-- eBay Integration Schema Extension (FIXED)
-- Adds support for eBay marketplace listings and inventory management

-- eBay Listings Table - Stores cards found on eBay
CREATE TABLE IF NOT EXISTS ebay_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ebay_item_id VARCHAR UNIQUE NOT NULL,
  title VARCHAR NOT NULL,
  player_name VARCHAR,
  card_year INTEGER,
  brand VARCHAR,
  series VARCHAR,
  condition VARCHAR,
  ebay_price DECIMAL(10,2) NOT NULL,
  our_price DECIMAL(10,2) NOT NULL, -- Price with markup
  listing_url VARCHAR NOT NULL,
  image_urls JSON, -- Array of image URLs
  seller_username VARCHAR,
  seller_feedback_score INTEGER DEFAULT 0,
  seller_feedback_percentage DECIMAL(5,2) DEFAULT 0,
  location VARCHAR,
  end_time TIMESTAMP,
  listing_type VARCHAR DEFAULT 'FixedPrice', -- 'Auction', 'FixedPrice', 'BuyItNow'
  category_id VARCHAR,
  description TEXT,
  shipping_cost DECIMAL(8,2) DEFAULT 0,
  expedited_shipping BOOLEAN DEFAULT false,
  international_shipping BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  last_updated TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now()
);

-- Add source tracking to existing cards table
ALTER TABLE cards ADD COLUMN IF NOT EXISTS source VARCHAR DEFAULT 'internal'; -- 'internal', 'ebay'
ALTER TABLE cards ADD COLUMN IF NOT EXISTS ebay_listing_id UUID REFERENCES ebay_listings(id);

-- eBay Search Cache - Cache popular searches to reduce API calls
CREATE TABLE IF NOT EXISTS ebay_search_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_query VARCHAR NOT NULL,
  search_params JSON, -- Store full search parameters
  results JSON, -- Store search results
  total_items INTEGER DEFAULT 0,
  last_updated TIMESTAMP DEFAULT now(),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- eBay API Usage Tracking - Monitor API call usage and rate limiting
CREATE TABLE IF NOT EXISTS ebay_api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint VARCHAR NOT NULL,
  method VARCHAR NOT NULL,
  status_code INTEGER,
  response_time_ms INTEGER,
  error_message TEXT,
  api_calls_remaining INTEGER,
  daily_quota_used INTEGER,
  created_at TIMESTAMP DEFAULT now()
);

-- eBay Import Jobs - Track background sync jobs
CREATE TABLE IF NOT EXISTS ebay_import_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type VARCHAR NOT NULL, -- 'player_search', 'category_sync', 'price_update'
  status VARCHAR DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  search_params JSON,
  items_found INTEGER DEFAULT 0,
  items_imported INTEGER DEFAULT 0,
  items_updated INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

-- Pricing Rules - Configurable markup and pricing logic
CREATE TABLE IF NOT EXISTS ebay_pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name VARCHAR NOT NULL,
  condition_filter VARCHAR, -- 'Mint', 'Near Mint', etc.
  price_range_min DECIMAL(10,2),
  price_range_max DECIMAL(10,2),
  markup_percentage DECIMAL(5,2) DEFAULT 25.00,
  markup_fixed_amount DECIMAL(8,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 1, -- Higher number = higher priority
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ebay_listings_player_name ON ebay_listings(player_name);
CREATE INDEX IF NOT EXISTS idx_ebay_listings_brand_year ON ebay_listings(brand, card_year);
CREATE INDEX IF NOT EXISTS idx_ebay_listings_price ON ebay_listings(ebay_price);
CREATE INDEX IF NOT EXISTS idx_ebay_listings_active ON ebay_listings(is_active);
CREATE INDEX IF NOT EXISTS idx_ebay_listings_last_updated ON ebay_listings(last_updated);

CREATE INDEX IF NOT EXISTS idx_ebay_search_cache_query ON ebay_search_cache(search_query);
CREATE INDEX IF NOT EXISTS idx_ebay_search_cache_expires ON ebay_search_cache(expires_at);

CREATE INDEX IF NOT EXISTS idx_cards_source ON cards(source);
CREATE INDEX IF NOT EXISTS idx_cards_ebay_listing ON cards(ebay_listing_id);

-- Insert default pricing rules
INSERT INTO ebay_pricing_rules (rule_name, condition_filter, markup_percentage, priority)
VALUES 
  ('Mint Cards Premium', 'Mint', 30.00, 5),
  ('Near Mint Cards', 'Near Mint', 25.00, 4),
  ('Excellent Cards', 'Excellent', 22.00, 3),
  ('Good Cards', 'Very Good,Good', 20.00, 2),
  ('Default Markup', NULL, 25.00, 1)
ON CONFLICT DO NOTHING;

-- Function to automatically update our_price based on pricing rules
CREATE OR REPLACE FUNCTION calculate_our_price(
  ebay_price DECIMAL,
  card_condition VARCHAR DEFAULT NULL
) RETURNS DECIMAL AS $$
DECLARE
  rule RECORD;
  markup_percent DECIMAL DEFAULT 25.00;
  markup_fixed DECIMAL DEFAULT 0.00;
BEGIN
  -- Find the best matching pricing rule
  SELECT markup_percentage, markup_fixed_amount
  INTO markup_percent, markup_fixed
  FROM ebay_pricing_rules
  WHERE is_active = true
    AND (condition_filter IS NULL OR card_condition ILIKE '%' || condition_filter || '%')
    AND (price_range_min IS NULL OR ebay_price >= price_range_min)
    AND (price_range_max IS NULL OR ebay_price <= price_range_max)
  ORDER BY priority DESC, condition_filter IS NOT NULL DESC
  LIMIT 1;
  
  -- Apply markup
  RETURN ROUND((ebay_price * (1 + markup_percent / 100.0) + markup_fixed), 2);
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically calculate our_price when ebay_price changes
CREATE OR REPLACE FUNCTION update_ebay_listing_price()
RETURNS TRIGGER AS $$
BEGIN
  NEW.our_price = calculate_our_price(NEW.ebay_price, NEW.condition);
  NEW.last_updated = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ebay_listing_price
  BEFORE INSERT OR UPDATE OF ebay_price, condition
  ON ebay_listings
  FOR EACH ROW
  EXECUTE FUNCTION update_ebay_listing_price();

-- Function to clean up expired search cache
CREATE OR REPLACE FUNCTION cleanup_expired_search_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM ebay_search_cache WHERE expires_at < now();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- View to combine internal and eBay inventory (FIXED - uses created_at instead of updated_at for cards)
CREATE OR REPLACE VIEW unified_card_inventory AS
SELECT 
  id,
  'internal' as source,
  card_front_image_url as image_url,
  NULL as ebay_item_id,
  NULL as listing_url,
  NULL as seller_username,
  NULL as end_time,
  'internal' as listing_type,
  created_at,
  created_at as updated_at  -- FIXED: Use created_at since cards table doesn't have updated_at
FROM cards 
WHERE source = 'internal' OR source IS NULL

UNION ALL

SELECT 
  id,
  'ebay' as source,
  (image_urls->0)::TEXT as image_url,
  ebay_item_id,
  listing_url,
  seller_username,
  end_time,
  listing_type,
  created_at,
  last_updated as updated_at
FROM ebay_listings 
WHERE is_active = true;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'eBay integration schema has been successfully created!';
  RAISE NOTICE 'Tables created: ebay_listings, ebay_search_cache, ebay_api_usage, ebay_import_jobs, ebay_pricing_rules';
  RAISE NOTICE 'Views created: unified_card_inventory';
  RAISE NOTICE 'Functions created: calculate_our_price, cleanup_expired_search_cache';
  RAISE NOTICE 'FIXED: Cards table updated_at issue resolved';
END $$; 