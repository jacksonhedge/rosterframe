-- Create referrals table to track referral emails sent
CREATE TABLE IF NOT EXISTS referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_email TEXT,
  sender_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  referral_code TEXT NOT NULL UNIQUE,
  discount_amount DECIMAL(10, 2) DEFAULT 10.00,
  message TEXT,
  status TEXT DEFAULT 'sent', -- sent, claimed, expired
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  claimed_at TIMESTAMPTZ,
  order_id UUID REFERENCES orders(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_referrals_referral_code ON referrals(referral_code);
CREATE INDEX idx_referrals_recipient_email ON referrals(recipient_email);
CREATE INDEX idx_referrals_sender_email ON referrals(sender_email);
CREATE INDEX idx_referrals_status ON referrals(status);

-- Add RLS policies
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view their own referrals
CREATE POLICY "Users can view their own referrals" ON referrals
  FOR SELECT
  USING (auth.email() = sender_email OR auth.email() = recipient_email);

-- Allow service role to manage all referrals
CREATE POLICY "Service role can manage all referrals" ON referrals
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Create a function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at
CREATE TRIGGER update_referrals_updated_at
  BEFORE UPDATE ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add columns to orders table to track order confirmation emails
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS confirmation_email_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS confirmation_email_sent_at TIMESTAMPTZ;