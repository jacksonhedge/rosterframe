# Roster Frame Production Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Variables
Ensure all environment variables are set in your hosting platform:

```env
# Supabase (Already have these)
NEXT_PUBLIC_SUPABASE_URL=https://wdwbkuhanclpkbgxgwdg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Stripe (LIVE KEYS - Add these in your hosting platform)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key
STRIPE_SECRET_KEY=sk_live_your_secret_key

# Resend Email
RESEND_API_KEY=re_34zRDLEb_DTPjLyC1TxbXSVzCAbwNLhcW

# eBay (if needed)
EBAY_APP_ID=your_production_app_id
EBAY_DEV_ID=your_dev_id
EBAY_CERT_ID=your_cert_id
EBAY_ENVIRONMENT=production
```

### 2. Database Setup
Run these SQL scripts in Supabase:

1. **Promo Code Tracking** - `/supabase/promo_codes.sql`
2. **Metal Engraving** - Create engravings table if needed

### 3. Security Checklist
- [ ] All API keys are in environment variables (never in code)
- [ ] Stripe webhook endpoint is secured
- [ ] CORS is properly configured
- [ ] Rate limiting is implemented
- [ ] Input validation on all forms

### 4. Performance Optimizations
- [ ] Images are optimized
- [ ] Next.js Image component is used
- [ ] API routes have proper caching
- [ ] Database queries are optimized

## Deployment Options

### Option 1: Vercel (Recommended)
1. Push code to GitHub
2. Connect GitHub repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Option 2: Netlify
1. Push code to GitHub
2. Connect to Netlify
3. Add environment variables
4. Set build command: `npm run build`
5. Set publish directory: `.next`

### Option 3: Custom Server
1. Build locally: `npm run build`
2. Upload to server
3. Set up PM2 or similar
4. Configure Nginx/Apache
5. Set up SSL certificate

## Post-Deployment Tasks

1. **Test Payment Flow**
   - Create a real order with a small amount
   - Verify Stripe webhook works
   - Check email notifications

2. **Monitor**
   - Set up error tracking (Sentry)
   - Monitor Supabase usage
   - Track Stripe transactions

3. **Backups**
   - Enable Supabase automatic backups
   - Export critical data regularly

## Domain Setup
1. Add custom domain in hosting platform
2. Update DNS records
3. Enable SSL certificate
4. Add domain to Stripe settings

## Important URLs
- Stripe Dashboard: https://dashboard.stripe.com
- Supabase Dashboard: https://app.supabase.com
- Domain Registrar: [Your registrar]

## Emergency Contacts
- Stripe Support: https://support.stripe.com
- Supabase Support: https://supabase.com/support
- Your Email: [Your email]