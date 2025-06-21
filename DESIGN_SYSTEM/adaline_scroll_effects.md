# Adaline.ai Scroll Effects & Implementation Guide

Based on the CSS analysis, Adaline uses a sophisticated scroll-based design system. While the exact JavaScript implementation isn't visible in the static files, here's what we can determine and how to recreate similar effects:

## Discovered Scroll Design Patterns

### 1. **CSS Scroll Snap System**
Adaline implements scroll snapping for smooth, controlled scrolling:

```css
/* Scroll snap container */
.scroll-container {
  scroll-snap-type: y mandatory;
  overflow-y: scroll;
  height: 100vh;
}

/* Scroll snap children */
.scroll-section {
  scroll-snap-align: start;
  height: 100vh;
}
```

### 2. **Viewport-Based Sections**
The site uses full viewport heights for dramatic scroll reveals:
- `h-[100vh]` - Full screen sections
- `min-h-[300vh]` - Extended scroll areas for parallax
- `h-[200vh]` - Double-height sections

### 3. **Sticky Navigation Pattern**
```css
.nav-container {
  position: sticky;
  top: 0;
  z-index: 900;
  transition: all 150ms ease-out;
}

/* Scrolled state (add via JS) */
.nav-container.scrolled {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
```

### 4. **Fade-In Animation Classes**
Pre-built opacity and transform classes for scroll animations:

```css
/* Initial state */
.scroll-fade {
  opacity: 0;
  transform: translateY(20px);
  transition: all 800ms cubic-bezier(0, 0, 0.2, 1);
}

/* Visible state */
.scroll-fade.in-view {
  opacity: 1;
  transform: translateY(0);
}
```

### 5. **Parallax Setup**
CSS variables for 3D effects:
```css
:root {
  --perspective-dramatic: 100px;
  --perspective-distant: 1200px;
}

.parallax-container {
  perspective: var(--perspective-distant);
}

.parallax-element {
  transform: translateZ(-1px) scale(2);
}
```

## Implementation Guide

### 1. **Intersection Observer for Scroll Animations**
```javascript
// Scroll reveal animation
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const scrollObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
    }
  });
}, observerOptions);

// Apply to elements
document.querySelectorAll('.scroll-fade').forEach(el => {
  scrollObserver.observe(el);
});
```

### 2. **Sticky Nav with Scroll Detection**
```javascript
let lastScroll = 0;
const nav = document.querySelector('.nav-container');

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  
  // Add scrolled class
  if (currentScroll > 50) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
  
  // Hide/show on scroll direction
  if (currentScroll > lastScroll && currentScroll > 300) {
    nav.style.transform = 'translateY(-100%)';
  } else {
    nav.style.transform = 'translateY(0)';
  }
  
  lastScroll = currentScroll;
});
```

### 3. **Smooth Scroll Sections**
```html
<main class="scroll-container">
  <section class="scroll-section" id="hero">
    <div class="h-screen flex items-center justify-center">
      <h1 class="scroll-fade">Welcome</h1>
    </div>
  </section>
  
  <section class="scroll-section" id="features">
    <div class="h-screen">
      <div class="scroll-fade delay-100">Feature 1</div>
      <div class="scroll-fade delay-200">Feature 2</div>
    </div>
  </section>
</main>
```

### 4. **Staggered Animations**
```css
.delay-100 { transition-delay: 100ms; }
.delay-200 { transition-delay: 200ms; }
.delay-300 { transition-delay: 300ms; }
.delay-400 { transition-delay: 400ms; }
```

### 5. **Performance Optimizations**
```css
/* Use transform and opacity only */
.animate-on-scroll {
  will-change: transform, opacity;
  transform: translateZ(0); /* Hardware acceleration */
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Key Principles from Adaline's Approach

1. **Subtlety**: Animations enhance, not distract
2. **Performance**: Only animate transform and opacity
3. **Timing**: 150-800ms durations with ease-out curves
4. **Accessibility**: Respects prefers-reduced-motion
5. **Mobile-first**: Touch-friendly scroll behaviors

## Modern Scroll Libraries to Consider

If you want to achieve similar effects more easily:
- **Framer Motion**: React-based animation library
- **AOS (Animate On Scroll)**: Simple scroll animations
- **Locomotive Scroll**: Smooth scrolling with parallax
- **GSAP ScrollTrigger**: Professional-grade scroll animations

The key to Adaline's design is restraint - they use scroll effects to guide attention and create flow, not to overwhelm the user.