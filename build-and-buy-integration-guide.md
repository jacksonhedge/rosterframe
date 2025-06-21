# Build-and-Buy Integration Guide

## Current State
The build-and-buy page currently supports 8-slot plaques. Here's how to integrate the new 4-10 card configurations:

## Required Updates

### 1. Update Plaque Selection (Step 1)
Replace the current plaque options with dynamic options similar to admin:

```typescript
// In build-and-buy/page.tsx
const plaqueOptions = [
  // 4-card plaques
  { id: 'dark-maple-4', slots: 4, material: 'Dark Maple Wood', price: 109.99 },
  { id: 'clear-4', slots: 4, material: 'Clear Plaque', price: 123.99, hasBackOption: true },
  { id: 'marble-4', slots: 4, material: 'Black Marble', price: 137.99 },
  // ... repeat for 5, 6, 7, 8, 9, 10 slots
];
```

### 2. Update Position Management (Step 2)
Make roster positions dynamic based on selected plaque:

```typescript
const getDefaultPositions = (sport: string, slotCount: number) => {
  if (sport === 'NFL') {
    switch(slotCount) {
      case 4: return ['QB', 'RB', 'WR1', 'WR2'];
      case 5: return ['QB', 'RB', 'WR1', 'WR2', 'TE'];
      // ... etc
    }
  }
  // Similar for other sports
};
```

### 3. Update LivePlaquePreview Component
- Pass plaqueType as '4' | '5' | '6' | '7' | '8' | '9' | '10'
- Component already supports dynamic types

### 4. Update Price Calculations
```typescript
const calculateTotalPrice = () => {
  const basePrice = selectedPlaque?.price || 129.99;
  const cardsTotal = Object.values(selectedCards).reduce(
    (sum, card) => sum + card.price + (card.shipping || 0), 
    0
  );
  // ... rest of calculation
};
```

## Migration Steps

1. **Add Slot Selection UI**
   - Add buttons/tabs to select number of slots (4-10)
   - Filter plaque materials based on selected slot count

2. **Update State Management**
   - Change `rosterPositions` to be dynamic based on slot count
   - Update `selectedPlaque` to include slot count

3. **Modify Card Selection**
   - Ensure "I have my own" and "Search eBay" work with all slot counts
   - Update auto-loading behavior for different position counts

4. **Update Order Summary**
   - Show selected slot count in purchase summary
   - Ensure pricing reflects correct plaque configuration

## Benefits for Users

1. **Flexibility**: Choose plaque size based on collection size
2. **Cost Options**: Smaller plaques for budget-conscious users
3. **Growth Path**: Start with 4 cards, upgrade to larger plaques later
4. **Sport-Specific**: Different sizes work better for different sports

## Example User Flow

1. User selects sport (NFL)
2. User selects plaque size (6 cards)
3. Available materials shown with pricing
4. User picks Clear Plaque ($135.99)
5. 6 position slots appear (QB, RB, WR1, WR2, TE, K)
6. User fills positions with players
7. For Clear Plaque, option to show card backs
8. Preview updates with 6-card layout
9. Proceed to purchase

## Testing Checklist

- [ ] All slot counts (4-10) selectable
- [ ] Correct positions appear for each count
- [ ] Preview shows correct layout
- [ ] Pricing updates correctly
- [ ] Clear Plaque front/back toggle works
- [ ] Order summary shows all details
- [ ] Mobile responsive for all layouts