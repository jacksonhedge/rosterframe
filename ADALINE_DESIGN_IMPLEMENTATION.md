# Adaline Design Implementation Plan for Roster Frame

## Current State Analysis
- **Framework**: Next.js 15.3.3 with Tailwind CSS v4
- **Fonts**: Using Geist Sans and Geist Mono
- **Colors**: Basic light/dark theme (#ffffff/#0a0a0a backgrounds)
- **Theme Color**: Orange (#d97706) - sports/fantasy theme

## Implementation Phases

### Phase 1: Design System Foundation
1. Update color system with Adaline-inspired palette
2. Implement typography scale and font system
3. Set up CSS variables and design tokens
4. Create spacing and sizing system

### Phase 2: Component Library
1. Create reusable button components
2. Build card components with hover effects
3. Design navigation with scroll behavior
4. Implement form components

### Phase 3: Layout & Animation
1. Add scroll-triggered animations
2. Implement sticky navigation
3. Create hero sections with parallax
4. Add page transitions

### Phase 4: Page-Specific Enhancements
1. Enhance homepage with scroll effects
2. Update product pages with modern layout
3. Improve admin interface
4. Polish marketplace experience

## File Structure Plan
```
app/
├── styles/
│   ├── design-system.css    # Core design tokens
│   ├── animations.css       # Scroll and transition effects
│   └── components.css       # Reusable component styles
├── components/
│   ├── ui/                  # Updated UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Navigation.tsx
│   └── animations/          # Animation wrappers
│       ├── ScrollFade.tsx
│       └── Parallax.tsx
└── hooks/
    └── useScrollAnimation.ts # Scroll effect hooks
```

## Key Design Changes

### 1. Color System Update
From simple black/white to nature-inspired palette:
- Primary: Indigo/Purple gradient
- Secondary: Coral/Pink accents
- Surface levels: 5 shades of gray
- Keep orange (#d97706) as brand accent

### 2. Typography Enhancement
- Replace Arial with Inter (like Adaline)
- Implement responsive font sizing
- Add limited but clear size scale
- Use font weights for hierarchy

### 3. Spacing & Layout
- Implement 4px base unit system
- Use consistent spacing scale
- Add container max-widths
- Create responsive grid system

### 4. Animation Strategy
- Intersection Observer for reveals
- Smooth scroll behavior
- Subtle hover states
- Performance-optimized transforms

## Next Steps
1. Back up current styles
2. Create new design system CSS
3. Update globals.css
4. Implement scroll animations
5. Update components progressively