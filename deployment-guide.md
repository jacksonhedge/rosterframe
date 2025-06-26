# RosterFrame Deployment Guide

## Prerequisites
- Vercel account connected to your GitHub repository
- Production Supabase project
- Production Stripe account
- Resend account with verified domain (send.rosterframe.com)

## Step 1: Add Environment Variables to Vercel

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add the following variables for Production environment:

### Required Variables:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@send.rosterframe.com
NEXT_PUBLIC_APP_URL=https://your-production-url.vercel.app
```

### Optional Variables:
```
SLEEPER_API_BASE_URL=https://api.sleeper.app/v1
EBAY_CLIENT_ID=your-ebay-client-id
EBAY_CLIENT_SECRET=your-ebay-client-secret
ESPN_API_KEY=your-espn-api-key
```

## Step 2: Run Database Migration in Production Supabase

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Create a new query and paste the contents of `orders-table-schema.sql`
4. Review the SQL to ensure it matches your production needs
5. Execute the query to create the tables

## Step 3: Configure Stripe Webhook

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-production-url.vercel.app/api/webhooks/stripe`
3. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
4. Copy the webhook signing secret and add it to Vercel as `STRIPE_WEBHOOK_SECRET`

## Step 4: Deploy to Vercel

### Option A: Automatic Deployment (if connected to GitHub)
- Push your changes to the main branch
- Vercel will automatically deploy

### Option B: Manual Deployment
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Deploy to production
vercel --prod
```

## Step 5: Post-Deployment Verification

1. **Test Email Sending:**
   - Place a test order to verify order confirmation emails
   - Test preview email functionality
   - Test referral email functionality

2. **Test Payment Processing:**
   - Make a test purchase with Stripe test cards
   - Verify order is created in Supabase
   - Confirm webhook is working

3. **Test Gold Plaque Position:**
   - Build a plaque and select different gold positions
   - Verify preview updates correctly
   - Complete purchase with selected position

## Troubleshooting

### Email Issues:
- Verify domain DNS records in Resend dashboard
- Check RESEND_FROM_EMAIL matches verified domain
- Review Resend logs for any sending errors

### Payment Issues:
- Ensure Stripe API version is set to '2025-01-27.acacia'
- Verify webhook endpoint is accessible
- Check Stripe logs for any errors

### Database Issues:
- Verify Supabase connection string is correct
- Check RLS policies if enabled
- Review Supabase logs for any errors

## Monitoring

1. **Vercel Dashboard:**
   - Monitor build logs
   - Check function logs for API errors
   - Review analytics

2. **Supabase Dashboard:**
   - Monitor database usage
   - Check for failed queries
   - Review order creation

3. **Stripe Dashboard:**
   - Monitor payment success rate
   - Check for failed webhooks
   - Review disputes/chargebacks

## Support

For any deployment issues:
1. Check Vercel deployment logs
2. Review browser console for client-side errors
3. Check API function logs in Vercel
4. Verify all environment variables are set correctly