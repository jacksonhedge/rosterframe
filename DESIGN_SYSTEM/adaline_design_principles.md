# Adaline.ai Design Principles & Reusable Components

## Core Design Philosophy
Adaline uses a sophisticated, nature-inspired design system with a focus on:
- **Clean minimalism** with purposeful white space
- **Nature-inspired color palettes** (Pebble, Meadow, Terracotta, Desert, Azure)
- **Professional tech aesthetic** with subtle gradients and animations
- **Mobile-first responsive design** with 12 breakpoints

## Key Design Principles to Incorporate

### 1. **Color System**
```css
/* Nature-inspired palette approach */
--color-primary: rgb(79, 70, 229);    /* Indigo/Purple */
--color-secondary: rgb(236, 72, 153); /* Pink */
--color-accent: rgb(59, 130, 246);    /* Blue */

/* Surface hierarchy */
--surface-0: rgb(255, 255, 255);      /* White */
--surface-1: rgb(250, 250, 250);      /* Near white */
--surface-2: rgb(245, 245, 245);      /* Light gray */
--surface-3: rgb(229, 229, 229);      /* Gray */
--surface-4: rgb(212, 212, 212);      /* Dark gray */
```

### 2. **Typography System**
```css
/* Font stack */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Responsive base font */
font-size: 16px; /* Mobile */
font-size: 18px; /* Tablet+ */

/* Limited scale */
--text-xs: 0.75rem;   /* 12px */
--text-sm: 0.875rem;  /* 14px */
--text-base: 1rem;    /* 16px */
--text-lg: 1.125rem;  /* 18px */
--text-xl: 1.25rem;   /* 20px */
```

### 3. **Spacing System**
```css
/* Base unit approach */
--space-unit: 0.25rem; /* 4px */

/* Common spacing */
--space-4: 1rem;   /* 16px */
--space-8: 2rem;   /* 32px */
--space-12: 3rem;  /* 48px */
--space-16: 4rem;  /* 64px */
--space-24: 6rem;  /* 96px */
```

### 4. **Layout Patterns**

#### Hero Section
```html
<section class="hero">
  <div class="container mx-auto px-4 py-24">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div class="hero-content">
        <h1 class="text-5xl font-bold mb-6">Main Headline</h1>
        <p class="text-xl text-gray-600 mb-8">Supporting description</p>
        <div class="flex gap-4">
          <button class="btn-primary">Get Started</button>
          <button class="btn-secondary">Learn More</button>
        </div>
      </div>
      <div class="hero-visual">
        <img src="product-shot.png" alt="Product" />
      </div>
    </div>
  </div>
</section>
```

#### Feature Grid
```html
<section class="features py-24">
  <div class="container mx-auto px-4">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div class="feature-card p-8 bg-surface-1 rounded-xl">
        <div class="icon mb-4"><!-- Icon --></div>
        <h3 class="text-xl font-semibold mb-2">Feature Title</h3>
        <p class="text-gray-600">Feature description</p>
      </div>
    </div>
  </div>
</section>
```

### 5. **Component Patterns**

#### Buttons
```css
.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 150ms ease-out;
}

.btn-primary {
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: white;
}

.btn-secondary {
  background: var(--surface-1);
  border: 1px solid var(--surface-3);
  color: var(--text-primary);
}
```

#### Cards
```css
.card {
  background: var(--surface-0);
  border: 1px solid var(--surface-2);
  border-radius: 0.75rem;
  padding: 2rem;
  transition: transform 150ms ease-out;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}
```

### 6. **Animation Principles**
- **Subtle transitions**: 150ms duration for most interactions
- **Ease-out timing**: Natural deceleration
- **Micro-animations**: Small hover states, not distracting
- **Performance first**: Transform and opacity only

### 7. **Responsive Design**
```css
/* Mobile-first breakpoints */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

## Implementation Tips

1. **Start with the color system** - Define CSS variables for consistency
2. **Use consistent spacing** - Stick to the 4px base unit system
3. **Keep typography simple** - Limited font sizes create hierarchy
4. **Focus on white space** - Let the design breathe
5. **Gradient accents** - Use sparingly for CTAs and highlights
6. **Subtle animations** - Enhance, don't distract
7. **Test responsively** - Design mobile-first, enhance for desktop

## Tools to Consider
- **Tailwind CSS**: Adaline uses a customized version
- **CSS Variables**: For dynamic theming
- **Grid + Flexbox**: For modern layouts
- **Inter Font**: Free, professional typeface
- **Heroicons/Tabler Icons**: For consistent iconography