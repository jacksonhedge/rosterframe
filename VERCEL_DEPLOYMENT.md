# Vercel Deployment Steps

## 1. Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with your GitHub account
3. Click "New Project"
4. Import your `jacksonhedge/rosterframe` repository

## 2. Configure Environment Variables

In Vercel project settings, add these environment variables:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://wdwbkuhanclpkbgxgwdg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[Your Supabase anon key]
SUPABASE_SERVICE_ROLE_KEY=[Your Supabase service role key]

# Stripe (Your LIVE keys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51RADm3GCEQehRVO2NF5SSf5tEECZw9Fy2WWh0AFbvOgft1SywjCvwn0jziLG02olZueJtFeQxN1pSxkfUYcrUTBF00opHgJXne
STRIPE_SECRET_KEY=[Your secret key - keep this secure!]

# Resend
RESEND_API_KEY=re_34zRDLEb_DTPjLyC1TxbXSVzCAbwNLhcW
RESEND_FROM_EMAIL=noreply@send.rosterframe.com

# eBay (if needed - add your production keys)
EBAY_APP_ID=your_ebay_app_id
EBAY_DEV_ID=your_ebay_dev_id
EBAY_CERT_ID=your_ebay_cert_id
EBAY_ENVIRONMENT=production
```

## 3. Deploy Settings

- **Framework Preset**: Next.js (auto-detected)
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

## 4. Deploy

Click "Deploy" and wait for the build to complete.

## 5. Post-Deployment

1. **Set up custom domain** (if you have one):
   - Go to Settings → Domains
   - Add your domain
   - Update DNS records

2. **Configure Stripe webhook**:
   - Go to Stripe Dashboard → Webhooks
   - Add endpoint: `https://your-domain.vercel.app/api/webhooks/stripe`
   - Select events to listen for

3. **Run Supabase migrations**:
   - Go to Supabase Dashboard → SQL Editor
   - Run the SQL from `/supabase/promo_codes.sql`
   - Run the SQL from `/supabase/migrations/create_referrals_table.sql`

## 6. Test Production

1. Visit your live URL
2. Test with promo code: ROSTERTEST
3. Complete a $1 test purchase
4. Check Stripe Dashboard for payment
5. Check Supabase for promo code tracking
6. Visit `/test-emails` to test email functionality
7. Verify order confirmation email is sent after purchase

## Your URLs will be:
- Production: `https://rosterframe.vercel.app` (or your custom domain)
- Preview: `https://rosterframe-git-[branch]-[username].vercel.app`

## Monitoring
- Vercel Dashboard: Check function logs
- Stripe Dashboard: Monitor payments
- Supabase Dashboard: Check database usage