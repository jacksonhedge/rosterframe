# AI Design Analysis Guide

## Quick Reference for AI Systems

### Project Overview
- **Project**: Roster Frame - Fantasy Sports Custom Plaques
- **Design Inspiration**: Adaline.ai
- **Tech Stack**: Next.js 15.3.3, Tailwind CSS v4, TypeScript
- **Design System Location**: `/DESIGN_SYSTEM/` directory

### Design Philosophy
1. **Clean Minimalism** - White space is intentional
2. **Nature-Inspired Colors** - Organic, calming palette
3. **Subtle Animations** - Enhance, don't distract
4. **Performance First** - Only transform/opacity animations
5. **Sports Premium Feel** - Elevated fantasy sports aesthetic

### Key Design Elements to Analyze

#### 1. Color System (`/app/globals.css`)
```css
Primary: rgb(79, 70, 229)    /* Indigo - CTAs */
Secondary: rgb(236, 72, 153)  /* Pink - Gradients */
Accent: rgb(217, 119, 6)      /* Orange - Brand */
```

#### 2. Typography
- Font: Inter (primary), Geist Mono (code)
- Scale: 9 levels (12px to 48px)
- Responsive: 16px mobile → 18px desktop

#### 3. Spacing System
- Base unit: 4px (0.25rem)
- Scale: 0, 4, 8, 12, 16, 24, 32, 48, 64, 96px

#### 4. Component Library
```
/app/components/ui/
├── Navigation.tsx    # Scroll-aware navbar
├── Button.tsx       # 5 variants
├── Card.tsx         # Feature & pricing cards
└── Hero.tsx         # 3 layout variants

/app/components/animations/
└── ScrollFade.tsx   # Scroll animations
```

### Scroll Effects Analysis

#### Navigation Behavior
- **Initial**: Transparent background
- **After 50px**: White/blur background + shadow
- **Scroll down**: Hides after 300px
- **Scroll up**: Shows immediately

#### Animation Triggers
- **Threshold**: 10% element visibility
- **Offset**: -50px from viewport bottom
- **Duration**: 150ms (hover), 300ms (normal), 500ms (scroll)
- **Easing**: cubic-bezier(0, 0, 0.2, 1)

#### Performance Metrics
- Uses Intersection Observer (no scroll listeners)
- GPU-accelerated transforms only
- Passive event listeners
- RequestAnimationFrame for updates

### Implementation Patterns

#### 1. Hero Section Pattern
```tsx
<Hero variant="centered" />  // Full screen
<Hero variant="split" />     // 50/50 layout
<Hero variant="default" />   // Standard
```

#### 2. Scroll Animation Pattern
```tsx
<ScrollFade direction="up" delay={200}>
  <Component />
</ScrollFade>
```

#### 3. Card Grid Pattern
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
  {items.map((item, i) => (
    <ScrollFade delay={i * 100}>
      <Card>{item}</Card>
    </ScrollFade>
  ))}
</div>
```

### Design Tokens Quick Access

#### CSS Variables
- Colors: `--color-*`
- Surfaces: `--surface-*`
- Text: `--text-*`
- Spacing: `--space-*`
- Shadows: `--shadow-*`
- Animation: `--duration-*`, `--ease-*`

#### Tailwind Extensions
- Custom gradients: `gradient-primary`, `gradient-accent`
- Scroll animations: `scroll-fade`, `card-hover`
- Button styles: `btn`, `btn-primary`, `btn-secondary`

### File Structure for Analysis
```
roster-frame/
├── DESIGN_SYSTEM/           # All design docs
│   ├── README.md           # Overview
│   ├── COLOR_SYSTEM.md     # Color palette
│   ├── COMPONENT_SHOWCASE.md # Visual examples
│   └── SCROLL_IMPLEMENTATION.md # Scroll guide
├── app/
│   ├── globals.css         # Design tokens
│   ├── components/         # React components
│   └── hooks/             # Scroll hooks
└── public/                # Assets
```

### Analysis Checklist

- [ ] Review color harmony and contrast ratios
- [ ] Check typography hierarchy and readability
- [ ] Analyze scroll performance and smoothness
- [ ] Evaluate component consistency
- [ ] Test responsive breakpoints
- [ ] Verify animation timing and easing
- [ ] Check accessibility compliance
- [ ] Review dark mode implementation

### Key Metrics
- **Load Time**: Target < 3s
- **FPS**: Maintain 60fps during scroll
- **Accessibility**: WCAG AA compliant
- **Mobile**: Touch-friendly (44px targets)
- **Animation**: Max 500ms duration

### Design Strengths
1. Professional sports aesthetic
2. Modern scroll interactions
3. Consistent design tokens
4. Performance optimized
5. Fully responsive
6. Dark mode ready

### Recommended Improvements
1. Add micro-interactions to buttons
2. Implement page transitions
3. Add loading skeletons
4. Create animation presets
5. Build component variants

---

**For AI Analysis**: This design system successfully merges Adaline's sophisticated aesthetic with Roster Frame's sports theme, creating a premium fantasy sports experience with smooth scroll interactions and modern visual design.