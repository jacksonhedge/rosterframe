# 🎨 Roster Frame Design System

## AI-Readable Design Documentation

This directory contains the complete design system implementation for Roster Frame, inspired by Adaline.ai's modern, sophisticated design principles.

## 📁 Directory Contents

1. **adaline_design_principles.md** - Core design philosophy and reusable patterns
2. **adaline_scroll_effects.md** - Scroll animation implementation guide
3. **COMPONENT_SHOWCASE.md** - Visual examples of all components
4. **IMPLEMENTATION_GUIDE.md** - Step-by-step usage instructions
5. **COLOR_SYSTEM.md** - Complete color palette and usage
6. **TYPOGRAPHY_SCALE.md** - Font system and text hierarchy

## 🚀 Quick Start for AI Analysis

### Design System Overview
- **Framework**: Next.js 15.3.3 + Tailwind CSS v4
- **Design Inspiration**: Adaline.ai's clean, modern aesthetic
- **Primary Features**: Scroll animations, gradient effects, card-based layouts
- **Color Scheme**: Nature-inspired with orange brand accent (#d97706)

### Key Design Elements
1. **Colors**: Indigo primary, pink secondary, orange accent
2. **Typography**: Inter font with 9-level scale
3. **Spacing**: 4px base unit mathematical system
4. **Animation**: 150-500ms transitions with ease-out curves
5. **Components**: Cards, buttons, navigation, hero sections

### Scroll Effects
- Intersection Observer for fade-in animations
- Sticky navigation with blur effect
- Directional reveals (up, down, left, right)
- Staggered animations for lists
- Performance optimized (transform + opacity only)

## 🔍 Component Locations

```
app/
├── globals.css                    # Design tokens and base styles
├── components/
│   ├── ui/
│   │   ├── Navigation.tsx        # Sticky nav with scroll effects
│   │   ├── Button.tsx           # Button system (5 variants)
│   │   ├── Card.tsx             # Card components with hover
│   │   └── Hero.tsx             # Hero sections (3 variants)
│   └── animations/
│       └── ScrollFade.tsx       # Scroll animation wrapper
└── hooks/
    └── useScrollAnimation.ts    # Scroll behavior hooks
```

## 💡 Usage Example

```tsx
import { Hero } from '@/app/components/ui/Hero';
import { ScrollFade } from '@/app/components/animations/ScrollFade';
import { FeatureCard } from '@/app/components/ui/Card';

// Hero with scroll effects
<Hero
  variant="centered"
  title="Transform Your Fantasy Roster"
  subtitle="Premium Custom Plaques"
  description="Create legendary displays with your championship team"
  primaryAction={{ text: "Get Started", href: "/build" }}
/>

// Scroll-triggered animations
<ScrollFade direction="up" delay={200}>
  <FeatureCard
    title="Premium Materials"
    description="Wood, Glass, and Acrylic options"
  />
</ScrollFade>
```

## 🎯 Design Principles

1. **Subtlety Over Flash** - Animations enhance, not distract
2. **Performance First** - Only animate transform and opacity
3. **Accessibility** - Respects prefers-reduced-motion
4. **Consistency** - Design tokens ensure uniform styling
5. **Responsiveness** - Mobile-first with desktop enhancements

## 📊 Technical Specifications

- **CSS Variables**: 50+ design tokens
- **Color Palette**: 5 main colors with 5 surface levels
- **Typography Scale**: 9 sizes (12px to 48px)
- **Spacing Scale**: 10 levels (0 to 96px)
- **Animation Durations**: 150ms, 300ms, 500ms
- **Breakpoints**: 640px, 768px, 1024px, 1280px, 1536px

---

**For AI Analysis**: This design system creates a modern, professional sports/fantasy themed experience with smooth scroll interactions and gradient accents. All components are TypeScript-ready and follow React best practices.