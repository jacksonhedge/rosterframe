# Scroll Effects Implementation Guide

## Overview
The scroll system creates a dynamic, engaging user experience through subtle animations and interactions triggered by scroll position.

## Core Implementation

### 1. Intersection Observer Hook
Located at: `/app/hooks/useScrollAnimation.ts`

```tsx
// Basic usage
const [ref, isInView] = useScrollAnimation({
  threshold: 0.1,      // Trigger when 10% visible
  rootMargin: '-50px', // Offset trigger point
  triggerOnce: true    // Only animate once
});

return <div ref={ref} className={isInView ? 'visible' : 'hidden'}>
```

### 2. Navigation Scroll Behavior

```tsx
// Navbar that responds to scroll
import { Navigation } from '@/app/components/ui/Navigation';

// Features:
// - Transparent initially
// - White/blur background after 50px scroll
// - Hides on scroll down (after 300px)
// - Shows on scroll up
// - Smooth transitions
```

**CSS Classes Applied:**
- Initial: `bg-transparent`
- Scrolled: `bg-white/95 backdrop-blur-md shadow-lg`
- Hidden: `-translate-y-full`

### 3. Scroll-Triggered Animations

#### Fade In Animation
```tsx
<ScrollFade direction="up" delay={200}>
  <h2>This content fades in from below</h2>
</ScrollFade>
```

**Directions:**
- `up` - Slides up (default)
- `down` - Slides down
- `left` - Slides from right
- `right` - Slides from left

#### Staggered Animations
```tsx
<StaggeredContainer staggerDelay={100}>
  <Card>First item (0ms delay)</Card>
  <Card>Second item (100ms delay)</Card>
  <Card>Third item (200ms delay)</Card>
</StaggeredContainer>
```

### 4. CSS Implementation

#### Scroll Snap (Full Page Sections)
```css
/* Container */
.scroll-container {
  scroll-snap-type: y mandatory;
  overflow-y: scroll;
  height: 100vh;
}

/* Sections */
.scroll-section {
  scroll-snap-align: start;
  height: 100vh;
}
```

#### Performance-Optimized Animations
```css
.scroll-fade {
  opacity: 0;
  transform: translateY(20px);
  transition: all 500ms cubic-bezier(0, 0, 0.2, 1);
  will-change: transform, opacity; /* Hardware acceleration */
}

.scroll-fade.in-view {
  opacity: 1;
  transform: translateY(0);
}
```

### 5. Parallax Effects

```tsx
// Simple parallax container
<div className="relative overflow-hidden">
  <div 
    className="absolute inset-0 -z-10"
    style={{
      transform: `translateY(${scrollY * 0.5}px)`
    }}
  >
    <img src="/background.jpg" alt="" />
  </div>
  <div className="relative z-10">
    {/* Content */}
  </div>
</div>
```

## Advanced Patterns

### 1. Progress Indicator
```tsx
const scrollProgress = (scrollY / (documentHeight - windowHeight)) * 100;

<div 
  className="fixed top-0 left-0 h-1 bg-gradient-primary"
  style={{ width: `${scrollProgress}%` }}
/>
```

### 2. Reveal on Scroll with Different Triggers
```tsx
// Early trigger for important content
<ScrollFade rootMargin="100px">
  <ImportantSection />
</ScrollFade>

// Late trigger for decorative elements
<ScrollFade threshold={0.5} rootMargin="-100px">
  <DecorativeElement />
</ScrollFade>
```

### 3. Directional Scroll Detection
```tsx
const { isScrollingUp, scrollSpeed } = useScrollDirection();

// Apply different animations based on direction
<div className={isScrollingUp ? 'slide-up' : 'slide-down'}>
```

## Performance Best Practices

### 1. Use CSS-Only When Possible
```css
/* Prefer this */
.element {
  transform: translateY(20px);
  opacity: 0;
}

/* Over this */
.element {
  position: relative;
  top: 20px;
}
```

### 2. Debounce Scroll Events
```tsx
useEffect(() => {
  let ticking = false;
  
  const handleScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        // Update animations
        ticking = false;
      });
      ticking = true;
    }
  };
  
  window.addEventListener('scroll', handleScroll, { passive: true });
}, []);
```

### 3. Batch DOM Updates
```tsx
// Good - Single reflow
elements.forEach(el => {
  el.style.transform = `translateY(${offset}px)`;
});

// Bad - Multiple reflows
elements.forEach(el => {
  el.style.top = `${el.offsetTop + offset}px`;
});
```

## Common Scroll Patterns

### 1. Hero Section with Scroll Indicator
```tsx
<section className="h-screen relative">
  <Hero content />
  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
    <ChevronDownIcon />
  </div>
</section>
```

### 2. Feature Cards Grid
```tsx
<div className="grid grid-cols-3 gap-8">
  {features.map((feature, i) => (
    <ScrollFade key={i} delay={i * 100}>
      <FeatureCard {...feature} />
    </ScrollFade>
  ))}
</div>
```

### 3. Timeline/Process Steps
```tsx
<div className="relative">
  {/* Vertical line */}
  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300" />
  
  {steps.map((step, i) => (
    <ScrollFade key={i} direction="right" delay={i * 150}>
      <div className="flex items-center mb-12">
        <div className="w-16 h-16 rounded-full bg-primary" />
        <div className="ml-8">{step.content}</div>
      </div>
    </ScrollFade>
  ))}
</div>
```

## Accessibility Considerations

### 1. Respect Motion Preferences
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### 2. Keyboard Navigation
```tsx
// Ensure scroll-triggered content is keyboard accessible
<div 
  ref={ref}
  tabIndex={0}
  onFocus={() => setIsInView(true)}
>
```

### 3. Screen Reader Announcements
```tsx
<div role="status" aria-live="polite" className="sr-only">
  {isInView && "New content is now visible"}
</div>
```

## Testing Scroll Effects

1. **Performance**: Use Chrome DevTools Performance tab
2. **Smoothness**: Test at 60fps on various devices
3. **Accessibility**: Test with keyboard navigation
4. **Cross-browser**: Verify in Safari, Firefox, Edge
5. **Mobile**: Test touch scrolling behavior