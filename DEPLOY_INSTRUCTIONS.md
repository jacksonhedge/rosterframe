# RosterFrame Deployment Instructions

This document contains detailed instructions for deploying the RosterFrame application to production.

## Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- Vercel account (recommended) or other hosting platform
- Access to all required API keys and environment variables

## Environment Variables

Before deploying, ensure you have all required environment variables configured:

### Required Variables

```env
# eBay API Configuration
EBAY_APP_ID=your_ebay_app_id
EBAY_DEV_ID=your_ebay_dev_id
EBAY_CERT_ID=your_ebay_cert_id
EBAY_ENVIRONMENT=PRODUCTION
EBAY_REDIRECT_URI=your_redirect_uri
EBAY_API_ENDPOINT=https://api.ebay.com

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key

# Email Service (Resend)
RESEND_API_KEY=your_resend_api_key

# Application Settings
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Deployment Options

### Option 1: Deploy to Vercel (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Build the project locally** to verify it compiles:
   ```bash
   npm run build
   ```

3. **Deploy to Vercel**:
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Select your Vercel account
   - Link to existing project or create new
   - Configure project settings

4. **Configure Environment Variables** in Vercel:
   - Go to your project dashboard on vercel.com
   - Navigate to Settings → Environment Variables
   - Add all variables from the .env.local file
   - Ensure they're set for Production environment

5. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

### Option 2: Manual Deployment

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Start the production server**:
   ```bash
   npm run start
   ```

3. **Configure your hosting platform**:
   - Set Node.js version to 18.x or higher
   - Set build command: `npm run build`
   - Set start command: `npm run start`
   - Configure all environment variables

## Post-Deployment Checklist

- [ ] Verify all environment variables are correctly set
- [ ] Test eBay API integration
- [ ] Test Supabase database connection
- [ ] Test Stripe payment processing (use test mode first)
- [ ] Test email sending functionality
- [ ] Check that all images and assets load correctly
- [ ] Verify the announcement bar and side banners display properly
- [ ] Test responsive design on mobile devices
- [ ] Monitor error logs for any issues

## Deployment Configuration Details

### vercel.json Configuration
The project includes a `vercel.json` file with:
- Public deployment setting
- API route runtime configuration
- URL rewrite rules

### Build Output
- Next.js generates optimized production build in `.next` directory
- Static assets are automatically optimized
- API routes are converted to serverless functions

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Ensure all dependencies are installed: `npm install`
   - Review build logs for specific errors

2. **Environment Variable Issues**
   - Verify all required variables are set
   - Check for typos in variable names
   - Ensure values don't contain invalid characters

3. **API Connection Errors**
   - Verify API endpoints are correct for production
   - Check API keys and credentials
   - Ensure CORS settings allow your domain

4. **Performance Issues**
   - Enable caching headers for static assets
   - Use CDN for images and media files
   - Monitor serverless function execution times

## Monitoring and Maintenance

1. **Set up monitoring**:
   - Use Vercel Analytics for performance metrics
   - Monitor API usage and rate limits
   - Set up error tracking (e.g., Sentry)

2. **Regular maintenance**:
   - Keep dependencies updated
   - Monitor security advisories
   - Review and rotate API keys periodically

## Rollback Procedure

If issues occur after deployment:

1. **Using Vercel**:
   ```bash
   vercel rollback
   ```

2. **Manual rollback**:
   - Deploy previous commit hash
   - Restore previous environment variable values
   - Clear CDN cache if applicable

## Contact and Support

For deployment issues or questions:
- Check Vercel documentation: https://vercel.com/docs
- Review Next.js deployment guide: https://nextjs.org/docs/deployment
- Contact team lead for environment variable access

---

Last updated: [Current Date]
Version: 1.0