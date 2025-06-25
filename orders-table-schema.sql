-- Orders table for RosterFrame - tracks plaque orders and payment status
-- This integrates with Stripe for payment processing

-- Orders table - main order tracking
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Stripe integration
    stripe_payment_intent_id TEXT UNIQUE NOT NULL,
    stripe_checkout_session_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    
    -- Order details
    order_number TEXT UNIQUE NOT NULL, -- Human-readable order number like ORD-2025-001234
    customer_email TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    
    -- Plaque configuration
    plaque_type TEXT NOT NULL CHECK (plaque_type IN ('wood', 'glass', 'acrylic')),
    plaque_size TEXT NOT NULL CHECK (plaque_size IN ('small', 'medium', 'large')),
    engraving_text TEXT,
    gift_packaging BOOLEAN DEFAULT FALSE,
    
    -- Fantasy league data
    league_data JSONB NOT NULL, -- Stores the complete league/roster data
    selected_players JSONB NOT NULL, -- Array of selected player IDs and positions
    
    -- Pricing
    subtotal DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    discount_code TEXT,
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'usd',
    
    -- Order status
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN (
        'pending', 'processing', 'succeeded', 'failed', 'canceled', 'refunded', 'partial_refund'
    )),
    fulfillment_status TEXT DEFAULT 'pending' CHECK (fulfillment_status IN (
        'pending', 'processing', 'printed', 'shipped', 'delivered', 'returned', 'canceled'
    )),
    
    -- Shipping information
    shipping_address JSONB NOT NULL, -- {line1, line2, city, state, postal_code, country}
    shipping_method TEXT DEFAULT 'standard',
    tracking_number TEXT,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    
    -- Production details
    production_notes TEXT,
    preview_image_url TEXT, -- URL to the generated preview image
    print_file_url TEXT, -- URL to the print-ready file
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}' -- For any additional data we need to store
);

-- Order status history - tracks all status changes
CREATE TABLE IF NOT EXISTS order_status_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    status_type TEXT NOT NULL CHECK (status_type IN ('payment', 'fulfillment')),
    old_status TEXT,
    new_status TEXT NOT NULL,
    changed_by TEXT, -- Could be 'system', 'admin', or user email
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items - for future expansion when selling individual cards
CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('plaque', 'card', 'accessory')),
    item_id UUID, -- References cards(id) or other product tables
    item_name TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer communications - tracks emails and messages
CREATE TABLE IF NOT EXISTS order_communications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    communication_type TEXT NOT NULL CHECK (communication_type IN (
        'order_confirmation', 'payment_receipt', 'shipping_notification', 
        'delivery_confirmation', 'customer_inquiry', 'support_response'
    )),
    subject TEXT,
    body TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    email_provider_id TEXT, -- ID from email service provider
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Promo codes table (if not already exists)
CREATE TABLE IF NOT EXISTS promo_codes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10,2) NOT NULL,
    minimum_order_amount DECIMAL(10,2),
    usage_limit INTEGER,
    times_used INTEGER DEFAULT 0,
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Promo code usage tracking
CREATE TABLE IF NOT EXISTS promo_code_usage (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    promo_code_id UUID REFERENCES promo_codes(id),
    order_id UUID REFERENCES orders(id),
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(promo_code_id, order_id)
);

-- Indexes for performance
CREATE INDEX idx_orders_stripe_payment_intent_id ON orders(stripe_payment_intent_id);
CREATE INDEX idx_orders_stripe_checkout_session_id ON orders(stripe_checkout_session_id);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_fulfillment_status ON orders(fulfillment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_communications_order_id ON order_communications(order_id);
CREATE INDEX idx_promo_codes_code ON promo_codes(code);

-- Triggers to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promo_codes_updated_at BEFORE UPDATE ON promo_codes 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    sequence_part TEXT;
    new_order_number TEXT;
BEGIN
    year_part := TO_CHAR(NOW(), 'YYYY');
    
    -- Get the next sequence number for this year
    SELECT LPAD((COUNT(*) + 1)::TEXT, 6, '0')
    INTO sequence_part
    FROM orders
    WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
    
    new_order_number := 'ORD-' || year_part || '-' || sequence_part;
    
    RETURN new_order_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate order numbers
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number_trigger
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION set_order_number();

-- Sample view for order management dashboard
CREATE OR REPLACE VIEW order_dashboard_view AS
SELECT 
    o.id,
    o.order_number,
    o.customer_name,
    o.customer_email,
    o.plaque_type,
    o.total_amount,
    o.payment_status,
    o.fulfillment_status,
    o.created_at,
    o.paid_at,
    o.shipped_at,
    pc.code as promo_code,
    COUNT(DISTINCT oi.id) as item_count
FROM orders o
LEFT JOIN promo_code_usage pcu ON pcu.order_id = o.id
LEFT JOIN promo_codes pc ON pc.id = pcu.promo_code_id
LEFT JOIN order_items oi ON oi.order_id = o.id
GROUP BY 
    o.id, o.order_number, o.customer_name, o.customer_email,
    o.plaque_type, o.total_amount, o.payment_status,
    o.fulfillment_status, o.created_at, o.paid_at, o.shipped_at, pc.code;

-- RLS Policies (uncomment when ready to enable)
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE order_communications ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE promo_code_usage ENABLE ROW LEVEL SECURITY;

-- Example RLS policy for orders (customers can only see their own orders)
-- CREATE POLICY "Customers can view own orders" ON orders
-- FOR SELECT USING (auth.jwt() ->> 'email' = customer_email);

-- Admin users can see all orders (implement based on your auth setup)
-- CREATE POLICY "Admins can manage all orders" ON orders
-- FOR ALL USING (auth.jwt() ->> 'role' = 'admin');