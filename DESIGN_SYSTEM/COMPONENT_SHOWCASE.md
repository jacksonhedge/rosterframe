# Component Showcase

## Visual Component Examples with Code

### 1. Navigation Bar with Scroll Effects

```tsx
// Sticky navigation that changes on scroll
<Navigation 
  logo="Roster Frame"
  links={[
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/about', label: 'About' },
  ]}
/>
```

**Features:**
- Transparent → White background on scroll
- Blur backdrop filter when scrolled
- Hides on scroll down, shows on scroll up
- Gradient logo text when scrolled
- Underline animation on hover

### 2. Hero Sections

#### Centered Hero (Full Screen)
```tsx
<Hero
  variant="centered"
  title="Create Your Fantasy Legacy"
  subtitle="PREMIUM SPORTS PLAQUES"
  description="Transform your championship roster into a stunning display piece"
  primaryAction={{ text: "Start Building", href: "/build" }}
  secondaryAction={{ text: "View Gallery", href: "/gallery" }}
>
  <img src="/hero-product.png" alt="Product showcase" />
</Hero>
```

#### Split Hero (50/50 Layout)
```tsx
<Hero
  variant="split"
  title="Premium Materials, Legendary Results"
  description="Choose from Wood, Glass, or Acrylic finishes"
  primaryAction={{ text: "Shop Now" }}
  image={{ 
    src: "/product-samples.jpg", 
    alt: "Material samples" 
  }}
/>
```

### 3. Scroll Animations

#### Fade In on Scroll
```tsx
<ScrollFade direction="up" delay={0}>
  <h2>This fades in from below</h2>
</ScrollFade>

<ScrollFade direction="left" delay={200}>
  <p>This slides in from the right after 200ms</p>
</ScrollFade>
```

#### Staggered List Animation
```tsx
<StaggeredContainer staggerDelay={100}>
  <Card>Item 1 - appears first</Card>
  <Card>Item 2 - appears 100ms later</Card>
  <Card>Item 3 - appears 200ms later</Card>
</StaggeredContainer>
```

### 4. Button Variants

```tsx
// Primary gradient button
<Button variant="primary" size="lg">
  Get Started
</Button>

// Secondary bordered button
<Button variant="secondary">
  Learn More
</Button>

// Accent orange gradient (your brand)
<Button variant="accent">
  Shop Now
</Button>

// Ghost button (transparent)
<Button variant="ghost" icon={<ArrowIcon />}>
  View All
</Button>

// Loading state
<Button loading>
  Processing...
</Button>
```

### 5. Card Components

#### Feature Card
```tsx
<FeatureCard
  icon={<TrophyIcon />}
  title="Championship Quality"
  description="Museum-grade materials and craftsmanship for your winning roster"
/>
```

#### Pricing Card
```tsx
<PricingCard
  title="Professional"
  price="$199"
  period="/plaque"
  highlighted={true}
  features={[
    "Premium Wood Frame",
    "9 Card Display",
    "Custom Engraving",
    "UV Protection Glass",
    "Free Shipping"
  ]}
  buttonText="Order Now"
/>
```

### 6. Visual Effects

#### Gradient Text
```html
<h1 className="gradient-text">
  Championship Collection
</h1>
```

#### Card Hover Effect
```tsx
<div className="card-hover">
  Hover to see lift effect + shadow
</div>
```

#### Pulse Animation
```tsx
<div className="pulse">
  Limited Time Offer
</div>
```

### 7. Complete Page Example

```tsx
export default function HomePage() {
  return (
    <>
      <Navigation />
      
      <Hero
        variant="centered"
        title="Your Fantasy Team Immortalized"
        subtitle="ROSTER FRAME"
        description="Premium plaques for serious fantasy players"
        primaryAction={{ text: "Build Your Frame", href: "/builder" }}
      />

      <section className="py-24">
        <div className="container">
          <ScrollFade>
            <h2 className="text-4xl font-bold text-center mb-12">
              Why Choose Roster Frame?
            </h2>
          </ScrollFade>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollFade delay={0}>
              <FeatureCard
                title="Premium Materials"
                description="Wood, Glass, and Acrylic options"
              />
            </ScrollFade>
            
            <ScrollFade delay={100}>
              <FeatureCard
                title="Custom Design"
                description="Your team, your way"
              />
            </ScrollFade>
            
            <ScrollFade delay={200}>
              <FeatureCard
                title="Fast Shipping"
                description="2-week turnaround"
              />
            </ScrollFade>
          </div>
        </div>
      </section>
    </>
  );
}
```

## Animation Timing Reference

- **Fast**: 150ms - Hover states, small transitions
- **Normal**: 300ms - Most animations
- **Slow**: 500ms - Page transitions, scroll reveals

## Color Usage

- **Primary** (Indigo): CTAs, links, focus states
- **Secondary** (Pink): Gradient accents
- **Accent** (Orange #d97706): Brand identity, special CTAs
- **Surface 0-4**: Background layers, cards, borders

## Responsive Behavior

All components automatically adapt:
- **Mobile**: Stack vertically, larger touch targets
- **Tablet**: 2-column grids, medium spacing
- **Desktop**: Full layouts, hover states enabled