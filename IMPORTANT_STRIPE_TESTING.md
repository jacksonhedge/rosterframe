# ⚠️ IMPORTANT: Stripe Testing Setup

## You're Currently Using LIVE Keys!

Your `.env.local` has **LIVE** Stripe keys which will charge real credit cards. For testing, you should use **TEST** keys first.

## Quick Setup for Testing

### 1. Get Your Test Keys
1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your **test** keys (they start with `pk_test_` and `sk_test_`)

### 2. Update Your .env.local
Replace your current keys with test keys:
```
# For TESTING - use these first!
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### 3. Set Up Webhook for Local Testing
```bash
# Install Stripe CLI if you haven't
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret (starts with `whsec_`) to your `.env.local`:
```
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 4. Test Cards
Use these test card numbers:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Requires Auth**: 4000 0025 0000 3155

Use any future expiry date and any 3-digit CVC.

## Testing Workflow

1. Start your dev server: `npm run dev`
2. In another terminal: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
3. Go to http://localhost:3000/build-and-buy
4. Complete a test purchase
5. Check:
   - Stripe Dashboard (test mode) for payment
   - Supabase orders table for new order
   - Terminal for webhook logs
   - Email inbox for confirmation

## When to Use Live Keys

Only switch to live keys when:
- ✅ All testing is complete
- ✅ Webhook handling is verified
- ✅ Email sending works
- ✅ Order flow is perfect
- ✅ You're ready to accept real payments

## Current Status
- Database: ✅ Ready
- Email: ✅ Configured (but domain not fully verified)
- Stripe: ⚠️ Using LIVE keys (switch to TEST for development)