# Build Session Management & Email Integration

## Overview
This guide explains the session persistence and email features for the build-and-buy page.

## Session Management Features

### Auto-Save
- User progress is automatically saved every 500ms (debounced)
- Saves: team name, plaque selection, roster, card selections, current step
- Sessions expire after 7 days of inactivity

### Session Recovery
- When users return, they see a "Welcome Back!" modal
- Shows what was saved and when
- Options to continue or start fresh

### Multi-Tab Sync
- Changes in one tab automatically sync to other tabs
- Prevents data loss from multiple open tabs

## Email Integration in Builder

### How It Works
1. User builds their plaque configuration
2. Live preview generates automatically
3. "Email This Preview" button appears
4. User can send preview to themselves or others

### Email Features
- Captures current preview image
- Includes team name and configuration
- Allows custom message
- Professional HTML template

## Implementation Plan

### 1. Update build-and-buy page with session management:

```typescript
// Add to build-and-buy/page.tsx
import { sessionManager } from '@/app/lib/session-manager';
import SessionRecovery from '@/app/components/SessionRecovery';
import LivePlaquePreviewWithEmail from '@/app/components/LivePlaquePreviewWithEmail';

// In component:
useEffect(() => {
  // Save session on changes
  sessionManager.saveSession({
    teamName,
    selectedPlaque,
    rosterPositions,
    selectedCards,
    currentStep,
    selectedSport
  });
}, [teamName, selectedPlaque, rosterPositions, selectedCards, currentStep]);

// Handle session recovery
const handleSessionRestore = (session: BuildSession) => {
  setTeamName(session.teamName);
  setSelectedPlaque(session.selectedPlaque);
  setRosterPositions(session.rosterPositions);
  setSelectedCards(session.selectedCards);
  setCurrentStep(session.currentStep);
  setSelectedSport(session.selectedSport);
};
```

### 2. Replace LivePlaquePreview with enhanced version:

```typescript
// Replace:
<LivePlaquePreview ... />

// With:
<LivePlaquePreviewWithEmail ... />
```

### 3. Add session recovery modal:

```typescript
<SessionRecovery
  onRestore={handleSessionRestore}
  onDismiss={() => sessionManager.clearSession()}
/>
```

## Benefits

### For Users:
- Never lose progress if browser crashes
- Can come back days later and continue
- Email previews to share with friends/family
- Multi-device support (via email)

### For Business:
- Reduced cart abandonment
- Better user experience
- Email addresses for marketing
- Increased conversions

## Testing

### Session Persistence:
1. Start building a plaque
2. Close browser/tab
3. Return to page
4. Should see recovery modal

### Email Feature:
1. Build plaque with cards
2. Click "Email This Preview"
3. Send to yourself
4. Check email arrives

## Privacy Considerations
- Sessions stored in localStorage (client-side only)
- No server-side tracking without consent
- Email addresses only used for requested emails
- Clear session option always available