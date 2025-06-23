# Saved Preview Image Display Update

## Changes Made

### 1. Admin Preview Maker (/app/admin/preview-maker/page.tsx)
- Updated the Selected Plaque section to check for and display saved preview images
- The `getSavedPreviewForPlaque` function checks localStorage for saved previews
- If a saved preview exists, it displays that instead of the generic plaque image
- Card overlay is hidden when using saved preview (since the preview already includes cards)

### 2. Build-and-Buy Page (/app/build-and-buy/page.tsx)
- Added `getSavedPreviewForPlaque` helper function
- Updated plaque options to check for saved preview images before using default images
- Each plaque style now shows its saved preview if available

### 3. LivePlaquePreview Component (/app/components/LivePlaquePreview.tsx)
- Added `getSavedPreviewForPlaque` helper function
- Checks for saved preview on component mount
- Falls back to saved preview when no cards are selected
- Empty plaque view now shows saved preview if available

## How It Works

1. When you generate a preview in the admin panel, it saves to localStorage:
   ```javascript
   {
     plaqueType: "10",
     plaqueStyle: "dark-maple-wood",
     imageUrl: "/uploads/previews/[id].png",
     timestamp: "2025-06-21T17:11:47.355Z",
     isBackView: false
   }
   ```

2. The saved preview is automatically used in:
   - Selected Plaque display (admin preview maker)
   - Plaque selection cards (build-and-buy page)
   - Live preview component (when no cards selected)

## Testing

To test the saved previews, run this in your browser console:
```javascript
// Check what previews are saved
const savedPreviews = JSON.parse(localStorage.getItem('savedPreviews') || '[]');
console.log('Saved Previews:', savedPreviews);
```

## Notes

- Saved previews are stored per plaque type and style combination
- Clear plaque can have separate front/back view previews
- The preview images already include the card overlays, so no additional overlay is needed