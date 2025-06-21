# Preview Maker Admin Page - Summary

## Completed Features

### 1. **Support for 4-10 Card Layouts**
- Updated `preview-maker.ts` to support plaqueType: '4' | '5' | '6' | '7' | '8' | '9' | '10'
- Created card position coordinates for each layout:
  - 4 cards: Single row layout (4x1)
  - 5 cards: 3-2 layout
  - 6 cards: 3x2 grid
  - 7 cards: 3-3-1 pyramid layout
  - 8 cards: 4x2 grid (original)
  - 9 cards: 3x3 grid
  - 10 cards: 5x2 grid

### 2. **Three Plaque Materials**
- **Dark Maple Wood**: Premium wood finish, base price $89.99 + $5/slot
- **Clear Plaque**: Crystal clear acrylic with front/back option, base price $99.99 + $6/slot
- **Black Marble**: Elegant marble finish, base price $109.99 + $7/slot

### 3. **Enhanced Admin Interface**
- Material filter: All, Dark Maple Wood, Clear Plaque, Black Marble
- Card count filter: All, 4-10 cards
- Visual grid showing all 21 plaque configurations (7 counts × 3 materials)
- Dynamic pricing based on card count and material

### 4. **Card Back Support for Clear Plaque**
- Toggle between showing card fronts or backs
- Only available for Clear Plaque material
- Useful for displaying player statistics on card backs

### 5. **Configuration Management**
- Save current configurations with:
  - Team name
  - Selected plaque type
  - Card assignments
  - Front/back preference
- Load saved configurations
- Delete unwanted configurations
- All stored in localStorage

### 6. **Quick Actions**
- Fill All Slots: Quickly add preset cards to fill all positions
- Auto-Assign All: Automatically assign available cards to positions
- Clear Assignments: Reset all position assignments

### 7. **Visual Preview**
- Card layout preview showing position grid
- Live update as cards are assigned
- Green highlighting for filled positions
- Aspect ratio adjusts based on card count

## Plaque Dimensions by Card Count
- 4 cards: 12" x 8"
- 5-6 cards: 14" x 10"
- 7-9 cards: 16" x 12"
- 10 cards: 18" x 12"

## Position Defaults by Card Count
- **4 cards**: QB, RB, WR1, WR2
- **5 cards**: QB, RB, WR1, WR2, TE
- **6 cards**: QB, RB, WR1, WR2, TE, K
- **7 cards**: QB, RB, WR1, WR2, TE, K, DEF
- **8 cards**: QB, RB, WR1, WR2, TE, K, DEF, FLEX
- **9 cards**: QB, RB1, RB2, WR1, WR2, TE, K, DEF, FLEX
- **10 cards**: QB, RB1, RB2, WR1, WR2, WR3, TE, K, DEF, FLEX

## Usage Instructions

1. **Select Plaque Configuration**
   - Use material and card count filters to narrow options
   - Click on desired plaque configuration

2. **Add Cards**
   - Search for real players from database
   - Use preset cards for testing
   - Upload custom images
   - Use "Fill All Slots" for quick testing

3. **Assign Positions**
   - Select cards from dropdowns for each position
   - Use "Auto-Assign All" to quickly fill positions

4. **Generate Preview**
   - Click "Generate Preview" to create visual
   - Save configuration for later use

5. **For Clear Plaque**
   - Toggle between front/back card display
   - Useful for showing player statistics

## Notes
- Currently using 8-spot plaque images as placeholders for all configurations
- Actual plaque background images for 4, 5, 6, 7, 9, and 10 spots would need to be created
- Preview generation API endpoint handles all card counts dynamically
- Saved configurations persist in browser localStorage