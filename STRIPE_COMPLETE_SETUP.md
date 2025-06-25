# Complete Stripe Integration Setup for RosterFrame

## Overview
This guide covers the complete Stripe payment integration for RosterFrame, including payment collection, order management, webhooks, and post-payment workflows.

## What's Been Built

### 1. Payment Infrastructure
- ✅ **Payment Form Component** (`/app/components/StripePaymentForm.tsx`)
  - Stripe Elements integration for secure card collection
  - Real-time validation and error handling
  - Order summary display
  - Support for pre-order discounts and promo codes

- ✅ **Payment Intent API** (`/app/api/create-payment-intent/route.ts`)
  - Creates Stripe payment intents
  - Creates order records in database
  - Handles both test and production modes

- ✅ **Webhook Handler** (`/app/api/webhooks/stripe/route.ts`)
  - Processes payment confirmations
  - Updates order status
  - Handles refunds
  - Tracks status history

### 2. Database Schema
- ✅ **Orders Table** (`/orders-table-schema.sql`)
  - Complete order tracking
  - Payment and fulfillment status
  - Customer information
  - Shipping details
  - Order items support

- ✅ **Supporting Tables**
  - Order status history
  - Order communications
  - Promo codes and usage tracking

### 3. User Experience Pages
- ✅ **Success Page** (`/app/order-success/page.tsx`)
  - Order confirmation display
  - Next steps information
  - Order details summary

- ✅ **Cancel Page** (`/app/order-cancel/page.tsx`)
  - Abandoned cart recovery
  - Feedback collection
  - Special offers to complete order

## Setup Instructions

### 1. Database Setup

Run the orders table schema in your Supabase SQL editor:
```bash
# Navigate to your Supabase project
# Go to SQL Editor
# Paste and run the contents of orders-table-schema.sql
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and add your keys:
```bash
cp .env.example .env.local
```

Required Stripe variables:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Webhook Setup

#### Local Development:
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

#### Production:
1. Go to Stripe Dashboard > Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events:
   - payment_intent.succeeded
   - payment_intent.payment_failed
   - checkout.session.completed
   - charge.refunded

### 4. Testing the Integration

1. **Test Payment Flow:**
```bash
# Use test card numbers
4242 4242 4242 4242 # Success
4000 0000 0000 0002 # Decline
```

2. **Verify Order Creation:**
- Check Supabase orders table after payment
- Verify order status updates via webhooks

3. **Test Webhook Events:**
```bash
stripe trigger payment_intent.succeeded
```

## Payment Flow

1. **Customer Journey:**
   - Customer builds plaque → Enters payment info → Submits payment
   - Redirected to success page → Receives confirmation email

2. **Backend Flow:**
   - Payment intent created → Order record created
   - Payment processed → Webhook received
   - Order status updated → Email sent

## Next Steps

### Immediate TODOs:
1. **Email Integration**
   - Set up email service (Nodemailer/Resend)
   - Create email templates
   - Update webhook handler to send emails

2. **Order Management Dashboard**
   - Admin interface for viewing orders
   - Order status management
   - Shipping/tracking updates

3. **Production Readiness**
   - Add proper error logging
   - Implement retry logic for webhooks
   - Set up monitoring/alerts

### Future Enhancements:
1. **Advanced Features**
   - Subscription support
   - Saved payment methods
   - Multiple currency support
   - Tax calculations

2. **Analytics**
   - Conversion tracking
   - Revenue reporting
   - Customer lifetime value

## Troubleshooting

### Common Issues:

1. **"Order data is required" error**
   - Ensure StripePaymentForm is passing orderData
   - Check all required fields are present

2. **Webhook not updating orders**
   - Verify webhook secret is correct
   - Check Stripe webhook logs
   - Ensure orders table exists

3. **Payment succeeds but no order created**
   - Check Supabase connection
   - Verify table permissions
   - Check API logs for errors

### Debug Commands:
```bash
# View webhook attempts
stripe webhooks list

# Replay failed webhooks
stripe events resend evt_...

# Check local webhook logs
stripe listen --print-json
```

## Security Considerations

1. **Always verify webhook signatures**
2. **Use HTTPS in production**
3. **Implement rate limiting**
4. **Sanitize user inputs**
5. **Store minimal sensitive data**
6. **Enable Supabase RLS when ready**

## Support

For issues or questions:
- Check Stripe documentation: https://stripe.com/docs
- Review Supabase guides: https://supabase.com/docs
- Contact support: support@rosterframe.com