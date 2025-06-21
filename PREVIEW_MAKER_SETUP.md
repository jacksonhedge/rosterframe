# Preview Maker Setup Guide

## Overview
The Preview Maker module generates high-quality compiled images of custom plaques with player cards positioned correctly over the plaque backgrounds. It can email these images to customers or allow them to download directly.

## Features
- ✅ **Image Composition**: Combines plaque backgrounds with player card images
- ✅ **Real Player Cards**: Fetches actual card images from your backend
- ✅ **Email Integration**: Sends beautiful HTML emails with preview images
- ✅ **Download Functionality**: Direct download of compiled images
- ✅ **Placeholder Generation**: Creates styled placeholder cards when images aren't available
- ✅ **Team Name Overlay**: Adds team name to the final image

## Required Environment Variables

Create a `.env.local` file in your project root with these variables:

```bash
# Email Configuration (required for email functionality)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password-here
SMTP_FROM=noreply@rosterframe.com

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Gmail Setup (Recommended)
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password: Google Account → Security → App passwords
3. Use the generated 16-character password as `SMTP_PASS`

### Alternative Email Providers
- **SendGrid**: Use `smtp.sendgrid.net` with API key as password
- **Mailgun**: Use `smtp.mailgun.org` with your credentials
- **AWS SES**: Use `email-smtp.region.amazonaws.com`

## File Structure

```
app/
├── lib/
│   └── preview-maker.ts          # Main service class
├── api/
│   └── preview/
│       ├── generate/
│       │   └── route.ts          # Image generation endpoint
│       ├── email/
│       │   └── route.ts          # Email sending endpoint
│       └── [previewId]/
│           ├── route.ts          # Fetch preview metadata
│           └── download/
│               └── route.ts      # Download compiled image
└── components/
    ├── PlaquePreview.tsx         # Real-time preview component
    └── PreviewGenerator.tsx      # Final image generation UI
```

## How It Works

### 1. Image Generation Process
1. **Load Background**: Uses your `Plaque8Spots.png` or `Plaque10Spots.png` images
2. **Position Cards**: Overlays player card images at precise coordinates
3. **Add Effects**: Applies shadows, rarity indicators, and styling
4. **Team Name**: Adds team name overlay at the bottom
5. **Save & Serve**: Stores image and metadata for download/email

### 2. Card Positioning
- **8-spot plaque**: 4x2 grid layout (1200x900px final image)
- **10-spot plaque**: 5x2 grid layout (1400x900px final image)
- Coordinates are precisely calculated for perfect alignment

### 3. Email Template
- Professional HTML email with inline CSS
- Embedded plaque preview image
- Player details and pricing breakdown
- Call-to-action button to complete order
- Branded styling matching your site

## Usage in Build-and-Buy Flow

The Preview Generator appears automatically in the card selection step when all cards are selected:

```tsx
{canProceedToPurchase() && (
  <PreviewGenerator
    teamName={teamName}
    plaqueType="8"
    plaqueStyle="Wood Brown"
    selectedCards={selectedCards}
    rosterPositions={rosterPositions}
  />
)}
```

## API Endpoints

### POST `/api/preview/generate`
Generates a compiled plaque image.

**Request Body:**
```json
{
  "plaqueType": "8",
  "plaqueStyle": "wood-brown",
  "teamName": "Championship Squad",
  "playerCards": [
    {
      "id": "1",
      "playerName": "Patrick Mahomes",
      "position": "Quarterback",
      "year": 2023,
      "brand": "Panini",
      "series": "Rookie Card",
      "imageUrl": "https://...",
      "rarity": "legendary",
      "price": 45.99,
      "shipping": 4.99
    }
  ]
}
```

**Response:**
```json
{
  "previewId": "123e4567-e89b-12d3-a456-426614174000",
  "imageUrl": "/uploads/previews/123e4567-e89b-12d3-a456-426614174000.png",
  "downloadUrl": "/api/preview/123e4567-e89b-12d3-a456-426614174000/download",
  "createdAt": "2024-01-15T10:30:00Z",
  "configuration": { ... }
}
```

### POST `/api/preview/email`
Sends preview image via email.

**Request Body:**
```json
{
  "previewId": "123e4567-e89b-12d3-a456-426614174000",
  "customerEmail": "customer@example.com",
  "teamName": "Championship Squad",
  "customerName": "John Doe"
}
```

### GET `/api/preview/[previewId]`
Retrieves preview metadata.

### GET `/api/preview/[previewId]/download`
Downloads the compiled image file.

## File Storage

### Development
- Images stored in `public/uploads/previews/`
- Metadata stored as JSON files alongside images
- Accessible via direct URL paths

### Production Recommendations
- Use cloud storage (AWS S3, Google Cloud Storage, etc.)
- Implement cleanup job to remove old previews
- Consider CDN for faster image delivery
- Add database storage for metadata instead of JSON files

## Dependencies Installed

The following packages have been added to your project:
- `canvas` - For image composition and rendering
- `uuid` - For generating unique preview IDs
- `nodemailer` - For sending emails
- `@types/uuid` - TypeScript types for UUID
- `@types/nodemailer` - TypeScript types for Nodemailer

## Testing

1. **Start your dev server**: `npm run dev`
2. **Go to build-and-buy**: Navigate to `/build-and-buy`
3. **Complete the flow**: Add team name, select plaque, add players, select cards
4. **Generate preview**: Click "Generate High-Quality Preview"
5. **Test email**: Enter your email and click "Email Preview"
6. **Test download**: Click "Download Image"

## Troubleshooting

### Image Generation Fails
- Check that your plaque images exist in `public/images/`
- Verify Canvas library installation: `npm list canvas`
- Check server logs for specific errors

### Email Not Sending
- Verify environment variables are set correctly
- Test SMTP credentials with a simple email client
- Check Gmail App Password if using Gmail
- Look for authentication errors in logs

### Missing Player Images
- The system gracefully handles missing images with styled placeholders
- Placeholder cards show player name, year, brand, series, and price
- Consider implementing fallback image URLs for production

## Next Steps

1. **Set up environment variables** for email functionality
2. **Test the complete flow** from card selection to email delivery
3. **Customize email template** with your branding
4. **Implement cloud storage** for production deployment
5. **Add database integration** for preview metadata storage
6. **Set up cleanup jobs** to manage storage usage

## Support

The Preview Maker module is fully integrated and ready to use. The real-time preview shows users what they're building, while the final generated image provides a high-quality representation perfect for sharing or saving. 