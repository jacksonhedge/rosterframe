-- Create promo_code_usage table to track when promo codes are used
CREATE TABLE IF NOT EXISTS promo_code_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  promo_code VARCHAR(50) NOT NULL,
  order_id VARCHAR(255),
  payment_intent_id VARCHAR(255),
  team_name VARCHAR(255),
  customer_email VARCHAR(255),
  original_amount DECIMAL(10, 2),
  discounted_amount DECIMAL(10, 2),
  savings_amount DECIMAL(10, 2),
  plaque_type VARCHAR(50),
  plaque_style VARCHAR(100),
  num_positions INTEGER,
  num_cards INTEGER,
  is_gift BOOLEAN DEFAULT false,
  session_id VARCHAR(255),
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

-- Create index for faster queries
CREATE INDEX idx_promo_code_usage_code ON promo_code_usage(promo_code);
CREATE INDEX idx_promo_code_usage_created_at ON promo_code_usage(created_at);
CREATE INDEX idx_promo_code_usage_session ON promo_code_usage(session_id);

-- Create a view for promo code analytics
CREATE VIEW promo_code_analytics AS
SELECT 
  promo_code,
  COUNT(*) as total_uses,
  SUM(savings_amount) as total_savings,
  AVG(savings_amount) as avg_savings,
  MIN(created_at) as first_used,
  MAX(created_at) as last_used,
  COUNT(DISTINCT session_id) as unique_users
FROM promo_code_usage
GROUP BY promo_code;

-- Enable RLS
ALTER TABLE promo_code_usage ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting (anyone can insert their own usage)
CREATE POLICY "Allow anonymous promo code tracking" ON promo_code_usage
  FOR INSERT WITH CHECK (true);

-- Create policy for admin to view all
CREATE POLICY "Admin can view all promo code usage" ON promo_code_usage
  FOR SELECT USING (true); -- You might want to restrict this to admin users