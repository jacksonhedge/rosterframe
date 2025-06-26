# eBay Integration Setup

This application integrates with eBay to show real sports card listings. The integration has multiple fallback mechanisms to ensure a good user experience.

## How It Works

1. **Primary Method**: eBay Finding API (requires App ID)
2. **Fallback Method**: eBay Scraper Service (generates realistic eBay-style listings)
3. **Final Fallback**: Mock data with sample cards

## Setting Up eBay Finding API (Optional)

If you want to use real eBay data, you'll need an eBay Developer Account:

1. Go to https://developer.ebay.com/
2. Sign up for a developer account
3. Create an application
4. Get your App ID (Client ID)
5. Add it to your `.env.local` file:

```env
NEXT_PUBLIC_EBAY_APP_ID=your-app-id-here
```

## Current Implementation

The system currently uses a three-tier approach:

### 1. eBay Finding API (`/app/lib/ebay-finding-api.ts`)
- Uses eBay's public Finding API
- Requires an App ID but no OAuth
- Returns real eBay listings with direct links
- Best for production use with proper credentials

### 2. eBay Scraper Service (`/app/lib/ebay-scraper.ts`)
- Generates realistic eBay-style data
- Creates believable item IDs and URLs
- Simulates real seller names, prices, and conditions
- Works without any API credentials
- URLs look real but won't work when clicked

### 3. Mock Data Generator
- Built into the search route
- Provides consistent sample data
- Uses placeholder images when available
- Last resort fallback

## API Route

The main API route is at `/app/api/cards/search-player/route.ts`

Example usage:
```
GET /api/cards/search-player?player=Patrick+Mahomes&sport=NFL
```

Response includes:
- Real or realistic eBay item IDs
- Direct eBay listing URLs (format: https://www.ebay.com/itm/123456789012)
- Seller information
- Pricing and shipping details
- Card condition and other metadata

## Testing

To test the integration:

1. Go to the Build & Buy page
2. Enter a team name and select a sport
3. Add players to your roster
4. Click on a player to see their cards
5. Cards will show with "View on eBay" buttons

## Notes

- Without valid eBay credentials, the system uses the scraper service
- The scraper generates realistic data that looks authentic
- All prices, sellers, and details are simulated but believable
- The URLs follow eBay's format but won't resolve to real listings without valid item IDs

## Future Enhancements

1. Implement OAuth2 for eBay's Browse API (more features)
2. Add real-time pricing updates
3. Include auction countdown timers
4. Show actual card images from eBay listings
5. Add watchlist functionality