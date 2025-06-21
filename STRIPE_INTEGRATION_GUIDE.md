# Stripe Integration Guide for RosterFrame
**Priority #1 Implementation**

## Quick Start Checklist

### Day 1: Stripe Setup
- [ ] Log into Stripe Dashboard
- [ ] Create Products for each plaque configuration
- [ ] Set up webhook endpoint
- [ ] Add environment variables to Vercel

### Day 2-3: Implementation
- [ ] Create checkout page
- [ ] Implement cart system
- [ ] Build order confirmation flow
- [ ] Test payment processing

### Day 4: Testing
- [ ] Test with Stripe test cards
- [ ] Verify webhook handling
- [ ] Check order creation in database

## Detailed Implementation Steps

### 1. Create Stripe Products

```javascript
// Products to create in Stripe Dashboard:
// Format: [Material] [Card Count] Card Plaque

1. Dark Maple Wood 4 Card Plaque - $109.99
2. Dark Maple Wood 5 Card Plaque - $114.99
3. Dark Maple Wood 6 Card Plaque - $119.99
4. Dark Maple Wood 7 Card Plaque - $124.99
5. Dark Maple Wood 8 Card Plaque - $129.99
6. Dark Maple Wood 9 Card Plaque - $134.99
7. Dark Maple Wood 10 Card Plaque - $139.99

8. Clear Plaque 4 Card Plaque - $123.99
9. Clear Plaque 5 Card Plaque - $129.99
10. Clear Plaque 6 Card Plaque - $135.99
11. Clear Plaque 7 Card Plaque - $141.99
12. Clear Plaque 8 Card Plaque - $147.99
13. Clear Plaque 9 Card Plaque - $153.99
14. Clear Plaque 10 Card Plaque - $159.99

15. Black Marble 4 Card Plaque - $137.99
16. Black Marble 5 Card Plaque - $144.99
17. Black Marble 6 Card Plaque - $151.99
18. Black Marble 7 Card Plaque - $158.99
19. Black Marble 8 Card Plaque - $165.99
20. Black Marble 9 Card Plaque - $172.99
21. Black Marble 10 Card Plaque - $179.99
```

### 2. Update Environment Variables

```bash
# .env.local
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Add to Vercel Environment Variables
```

### 3. Create Checkout API Route

```typescript
// app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { items, customerEmail, previewId } = await req.json();
    
    // Create line items from cart
    const lineItems = items.map((item: any) => ({
      price: item.stripePriceId,
      quantity: 1,
      metadata: {
        plaqueType: item.plaqueType,
        material: item.material,
        previewId: item.previewId
      }
    }));

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_URL}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/build-and-buy`,
      customer_email: customerEmail,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA']
      },
      metadata: {
        previewId: previewId
      }
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
```

### 4. Create Webhook Handler

```typescript
// app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Create order in database
    const { error } = await supabase
      .from('orders')
      .insert({
        stripe_session_id: session.id,
        customer_email: session.customer_email,
        amount_total: session.amount_total,
        status: 'pending',
        shipping_details: session.shipping_details,
        metadata: session.metadata,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Order creation error:', error);
    }

    // Send confirmation email
    // TODO: Implement email sending
  }

  return NextResponse.json({ received: true });
}
```

### 5. Create Orders Table

```sql
-- Run in Supabase SQL Editor
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stripe_session_id VARCHAR(255) UNIQUE NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  amount_total INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  shipping_details JSONB,
  metadata JSONB,
  tracking_number VARCHAR(255),
  shipped_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create order items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  plaque_type VARCHAR(10),
  material VARCHAR(50),
  preview_id UUID,
  preview_data JSONB,
  quantity INTEGER DEFAULT 1,
  price INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Admin can see all orders
CREATE POLICY "Admin can view all orders" ON orders
  FOR ALL USING (auth.role() = 'admin');

-- Customers can see their own orders
CREATE POLICY "Customers can view own orders" ON orders
  FOR SELECT USING (auth.email() = customer_email);
```

### 6. Update Build & Buy Page

```typescript
// Add checkout functionality to existing page
const handleCheckout = async () => {
  try {
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{
          stripePriceId: getStripePriceId(plaqueType, material),
          plaqueType,
          material,
          previewId: generatedPreview?.previewId
        }],
        customerEmail: email,
        previewId: generatedPreview?.previewId
      })
    });

    const { sessionId } = await response.json();
    
    // Redirect to Stripe Checkout
    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
    await stripe?.redirectToCheckout({ sessionId });
  } catch (error) {
    console.error('Checkout error:', error);
  }
};

// Helper function to map products to Stripe price IDs
const getStripePriceId = (plaqueType: string, material: string) => {
  const priceMap: Record<string, string> = {
    'dark-maple-wood-4': 'price_xxx',
    'dark-maple-wood-5': 'price_xxx',
    // ... add all price IDs from Stripe
  };
  
  return priceMap[`${material}-${plaqueType}`];
};
```

### 7. Create Success Page

```typescript
// app/order-success/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function OrderSuccess() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    if (sessionId) {
      // Fetch order details
      fetch(`/api/orders/${sessionId}`)
        .then(res => res.json())
        .then(data => setOrderDetails(data));
    }
  }, [sessionId]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-green-600 mb-4">
        Order Confirmed! 🎉
      </h1>
      <p className="text-lg mb-6">
        Thank you for your order. We'll start crafting your custom plaque right away!
      </p>
      
      {orderDetails && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="font-semibold mb-2">Order Details</h2>
          <p>Order ID: {orderDetails.id}</p>
          <p>Email: {orderDetails.customer_email}</p>
          <p>Total: ${(orderDetails.amount_total / 100).toFixed(2)}</p>
        </div>
      )}
      
      <div className="mt-6">
        <h3 className="font-semibold mb-2">What's Next?</h3>
        <ol className="list-decimal list-inside space-y-2">
          <li>You'll receive an order confirmation email</li>
          <li>We'll craft your custom plaque (3-5 business days)</li>
          <li>You'll get tracking info when it ships</li>
        </ol>
      </div>
    </div>
  );
}
```

## Testing Checklist

### Test Cards
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0000 0000 3220
```

### Test Scenarios
- [ ] Single plaque purchase
- [ ] Different shipping addresses
- [ ] Card decline handling
- [ ] Webhook processing
- [ ] Order creation in database
- [ ] Email confirmation

## Go-Live Checklist
- [ ] Switch to live Stripe keys
- [ ] Update webhook endpoint in Stripe
- [ ] Test with real card (small amount)
- [ ] Monitor first few orders
- [ ] Set up Stripe notifications

---

**Need help?** Email jacksonfitzgerald25@gmail.com