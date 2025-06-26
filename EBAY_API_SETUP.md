# eBay API Setup Guide

## Overview
The eBay integration allows you to search for real sports cards from eBay and add them to your inventory. Currently, the system is using mock data as a fallback when eBay API credentials are not configured.

## Current Status
- **Mock Data Mode**: The system is currently showing sample card data
- **Direct Links**: Each card has a simulated eBay item link that looks like a real listing
- **Real Images**: Using actual player card images where available

## Setting Up Real eBay Integration

### 1. Get eBay Developer Account
1. Go to https://developer.ebay.com/
2. Sign up for a developer account
3. Create an application in the eBay Developers Program

### 2. Get Your API Credentials
From your eBay developer dashboard, get:
- App ID (Client ID)
- Dev ID
- Cert ID (Client Secret)

### 3. Configure Environment Variables
Add these to your `.env.local`:
```
EBAY_APP_ID=your-app-id-here
EBAY_DEV_ID=your-dev-id-here
EBAY_CERT_ID=your-cert-id-here
EBAY_ENVIRONMENT=production
EBAY_PRODUCTION_BASE_URL=https://api.ebay.com
```

### 4. Enable Finding API
In your eBay application settings:
1. Enable "Finding API"
2. Set proper OAuth scopes
3. Configure redirect URLs if needed

## How It Works Now (Mock Mode)

When eBay API is not configured, the system:
1. Generates realistic card data based on the player name
2. Creates varied card types (Base, Chrome, Rookie, Autograph, etc.)
3. Assigns realistic prices based on card rarity
4. Provides mock eBay item URLs that look like real listings
5. Shows actual player images where available

## Mock Data Features
- **8 different card variations** per player search
- **Realistic pricing** based on card type
- **Multiple sellers** with feedback scores
- **Auction and Buy It Now** listing types
- **Shipping costs** calculated randomly

## Troubleshooting

### "View on eBay" Links Not Working
- In mock mode, the links are simulated eBay item IDs
- They won't lead to actual listings
- This is expected behavior without real eBay API credentials

### No Real Card Images
- The system uses placeholder images for most cards
- Only certain popular players have actual card images
- With real eBay API, actual listing images will be displayed

### To Test with Real Data
1. Configure eBay API credentials
2. Restart the development server
3. Search for players - you'll see real eBay listings
4. Links will go to actual eBay items

## Benefits of Real Integration
- Live pricing from actual eBay listings
- Real card images
- Direct links to purchase cards
- Current availability status
- Actual seller information
- Real-time auction data