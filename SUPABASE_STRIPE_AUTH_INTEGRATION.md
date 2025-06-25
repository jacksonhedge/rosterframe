# Supabase Auth + Stripe Integration Guide

## Overview
This guide explains how to enhance the current Stripe integration with Supabase Auth for user accounts and customer management.

## Current State
- ✅ Orders are tracked by email
- ✅ One-time payments work perfectly
- ❌ No user accounts
- ❌ No order history for customers
- ❌ No saved payment methods

## Option 1: Add Basic User Accounts (Recommended)

### 1. Create Profiles Table
```sql
-- User profiles linked to Supabase Auth
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  stripe_customer_id TEXT UNIQUE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Link existing orders to users (optional)
ALTER TABLE orders ADD COLUMN user_id UUID REFERENCES profiles(id);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can only see their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

### 2. Update Order Flow
```typescript
// In create-payment-intent route
import { createServerClient } from '@supabase/ssr';

// Check if user is logged in
const supabase = createServerClient(cookies());
const { data: { user } } = await supabase.auth.getUser();

// If logged in, link to their Stripe customer
if (user) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single();

  // Create or retrieve Stripe customer
  let stripeCustomerId = profile?.stripe_customer_id;
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_uid: user.id }
    });
    stripeCustomerId = customer.id;
    
    // Save to profile
    await supabase
      .from('profiles')
      .update({ stripe_customer_id: stripeCustomerId })
      .eq('id', user.id);
  }

  // Include in payment intent
  paymentIntent = await stripe.paymentIntents.create({
    customer: stripeCustomerId,
    // ... rest of config
  });
}
```

### 3. Add Order History Page
```typescript
// app/account/orders/page.tsx
export default async function OrderHistory() {
  const supabase = createServerClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect('/login');
  
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
    
  return (
    <div>
      <h1>Your Orders</h1>
      {/* Display order history */}
    </div>
  );
}
```

## Option 2: Full Supabase Billing Portal (For Subscriptions)

If you plan to add subscription products:

### 1. Install Supabase Stripe Integration
```bash
# Use Supabase CLI
supabase functions new handle-stripe-webhook
```

### 2. Set up Billing Tables
```sql
-- From Supabase's stripe-sync template
CREATE TABLE customers (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  stripe_customer_id TEXT UNIQUE
);

CREATE TABLE products (
  id TEXT PRIMARY KEY,
  active BOOLEAN,
  name TEXT,
  description TEXT,
  image TEXT,
  metadata JSONB
);

CREATE TABLE prices (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES products(id),
  active BOOLEAN,
  currency TEXT,
  unit_amount BIGINT,
  interval TEXT,
  interval_count INTEGER
);

CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  status TEXT,
  price_id TEXT REFERENCES prices(id),
  quantity INTEGER,
  cancel_at_period_end BOOLEAN,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  canceled_at TIMESTAMP WITH TIME ZONE
);
```

### 3. Sync Products from Stripe
Use Supabase's Edge Function to sync Stripe data.

## Option 3: Hybrid Approach (Best of Both)

Keep your current one-time payment system and add:

1. **Optional user accounts** - Let customers create accounts after purchase
2. **Guest checkout** - Continue allowing purchases without accounts
3. **Order lookup** - Let guests view orders with order number + email
4. **Account benefits** - Save addresses, view history, faster checkout

### Implementation Steps:

1. **Add "Create Account" on success page**
```typescript
// In order-success/page.tsx
if (!user && order) {
  return (
    <div>
      <h3>Create an account to:</h3>
      <ul>
        <li>Track your orders</li>
        <li>Save your details for faster checkout</li>
        <li>Get exclusive offers</li>
      </ul>
      <button onClick={createAccountWithOrder}>
        Create Account
      </button>
    </div>
  );
}
```

2. **Link existing order to new account**
```typescript
async function createAccountWithOrder() {
  const { data, error } = await supabase.auth.signUp({
    email: order.customer_email,
    password: userPassword,
  });
  
  if (data.user) {
    // Link the order to the new user
    await supabase
      .from('orders')
      .update({ user_id: data.user.id })
      .eq('id', order.id);
  }
}
```

## Recommendations

For RosterFrame, I recommend:

1. **Keep the current system** for its simplicity
2. **Add optional accounts** after purchase (Hybrid Approach)
3. **Only implement full auth** if you plan to:
   - Offer subscriptions
   - Save payment methods
   - Build customer loyalty features
   - Need detailed customer analytics

The current email-based system works well for one-time purchases and keeps the checkout process simple!