# Preview Display Debug Guide

## What's Been Updated

1. **Selected Plaque Section (Large Preview)**
   - Now checks localStorage for saved previews
   - Shows "Using Saved Preview" badge when displaying saved image
   - Uses cache-busting query parameter (?t=) to force refresh
   - Falls back to default image if saved preview fails to load

2. **Plaque Grid Items (Small Previews)**
   - All small plaque items now check for saved previews
   - Green dot indicator shows when using saved preview
   - Updates automatically when new preview is generated

3. **Debug Component**
   - Added SavedPreviewDebug component (bottom left corner)
   - Shows all saved previews in localStorage
   - Updates every second to show current state

## How to Test

1. Open the admin preview maker page
2. Select a plaque configuration (e.g., 4 cards, Dark Maple Wood)
3. Add some test cards
4. Assign cards to positions
5. Click "Generate Preview"
6. Check:
   - The Generated Previews section shows the new preview
   - The Selected Plaque section should update to show the same image
   - The small grid item for that configuration should show a green dot
   - The debug panel (bottom left) should show the saved preview

## Troubleshooting

If previews aren't showing:

1. **Check Console** - Look for any error messages about images failing to load
2. **Check Debug Panel** - Verify the preview is actually saved in localStorage
3. **Check Image URLs** - Make sure the preview image URLs are accessible
4. **Clear Cache** - Try hard refresh (Cmd+Shift+R on Mac)
5. **Check localStorage** - In console, run:
   ```javascript
   JSON.parse(localStorage.getItem('savedPreviews'))
   ```

## Key Points

- Saved previews are matched by: plaqueType (e.g., "4"), plaqueStyle (e.g., "dark-maple-wood"), and isBackView
- Images use cache-busting to force updates
- The preview image already includes the cards, so no overlay is needed when using saved preview
- The same image file is used in all locations (Selected Plaque, grid items, build-and-buy)