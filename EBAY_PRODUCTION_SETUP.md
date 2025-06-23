# Setting Up eBay Production API

## Step 1: Get Your Production Credentials

1. Go to: https://developer.ebay.com/my/keys
2. Click on the **"Production"** tab (NOT Sandbox)
3. Copy your production keys:
   - App ID (starts with your username, but NO "SBX" in it)
   - Dev ID 
   - Cert ID

## Step 2: Update .env.local

Replace the sandbox credentials in your `.env.local` file:

```bash
# Change from sandbox:
EBAY_ENVIRONMENT=sandbox

# To production:
EBAY_ENVIRONMENT=production
```

And update all three keys to your production keys (no "SBX" in them).

## Step 3: Restart Your Dev Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## Important Notes:

- **Production API has rate limits**: Be careful not to make too many requests
- **Real money**: If you plan to actually purchase cards through the API, it will use real money
- **API costs**: eBay may charge for API usage above certain limits

## Testing Real Data

Once updated, go to http://localhost:3000/test-ebay and search for "Patrick Mahomes" - you should see REAL eBay listings with:
- Actual card images
- Current prices
- Real seller information
- Live auction data

## Troubleshooting

If you still see mock data after switching:
1. Check the console for "Environment: 🌐 PRODUCTION" (not sandbox)
2. Make sure all 3 credentials are updated
3. Clear your browser cache
4. Check for any OAuth errors in the console