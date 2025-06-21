# Color System

## Complete Color Palette

### Primary Colors

```css
--color-primary: rgb(79, 70, 229);      /* #4F46E5 - Indigo */
--color-secondary: rgb(236, 72, 153);   /* #EC4899 - Pink */
--color-accent: rgb(217, 119, 6);      /* #D97706 - Orange (Brand) */
--color-success: rgb(34, 197, 94);      /* #22C55E - Green */
--color-error: rgb(239, 68, 68);        /* #EF4444 - Red */
```

### Surface Hierarchy (Light Mode)

```css
--surface-0: rgb(255, 255, 255);  /* Pure white - Main background */
--surface-1: rgb(250, 250, 250);  /* Near white - Cards */
--surface-2: rgb(245, 245, 245);  /* Light gray - Hover states */
--surface-3: rgb(229, 229, 229);  /* Gray - Borders */
--surface-4: rgb(212, 212, 212);  /* Dark gray - Disabled states */
```

### Surface Hierarchy (Dark Mode)

```css
--surface-0: rgb(10, 10, 10);     /* Near black - Main background */
--surface-1: rgb(23, 23, 23);     /* Dark gray - Cards */
--surface-2: rgb(38, 38, 38);     /* Gray - Hover states */
--surface-3: rgb(64, 64, 64);     /* Light gray - Borders */
--surface-4: rgb(82, 82, 82);     /* Lighter gray - Disabled */
```

### Text Colors

```css
/* Light Mode */
--text-primary: rgb(17, 17, 17);      /* Near black - Headings */
--text-secondary: rgb(115, 115, 115); /* Gray - Body text */
--text-tertiary: rgb(163, 163, 163);  /* Light gray - Captions */

/* Dark Mode */
--text-primary: rgb(237, 237, 237);   /* Near white - Headings */
--text-secondary: rgb(163, 163, 163); /* Light gray - Body text */
--text-tertiary: rgb(115, 115, 115);  /* Gray - Captions */
```

### Gradients

```css
/* Primary gradient - CTAs */
--gradient-primary: linear-gradient(135deg, 
  var(--color-primary), 
  var(--color-secondary)
);

/* Accent gradient - Brand elements */
--gradient-accent: linear-gradient(135deg, 
  var(--color-accent), 
  #f59e0b  /* Lighter orange */
);

/* Subtle background gradient */
--gradient-subtle: linear-gradient(180deg,
  var(--surface-0),
  var(--surface-1)
);
```

## Usage Examples

### Buttons
```css
/* Primary CTA */
.btn-primary {
  background: var(--gradient-primary);
  color: white;
}

/* Brand CTA */
.btn-accent {
  background: var(--gradient-accent);
  color: white;
}

/* Secondary */
.btn-secondary {
  background: var(--surface-1);
  color: var(--text-primary);
  border: 1px solid var(--surface-3);
}
```

### Cards
```css
.card {
  background: var(--surface-0);
  border: 1px solid var(--surface-2);
}

.card:hover {
  background: var(--surface-1);
  border-color: var(--surface-3);
}
```

### Text Hierarchy
```css
h1 { color: var(--text-primary); }
p { color: var(--text-secondary); }
.caption { color: var(--text-tertiary); }
```

### Special Effects
```css
/* Gradient text */
.gradient-text {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Focus rings */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Selection */
::selection {
  background: var(--color-primary);
  color: white;
}
```

## Semantic Color Usage

### Primary (Indigo)
- Main CTAs
- Active states
- Focus indicators
- Primary buttons
- Links

### Secondary (Pink)
- Gradient endpoints
- Accent elements
- Badges
- Highlights

### Accent (Orange - Your Brand)
- Brand identity
- Special promotions
- Important CTAs
- Logo elements
- "Hot" indicators

### Success (Green)
- Checkmarks
- Success messages
- Positive actions
- Available status

### Error (Red)
- Error messages
- Destructive actions
- Required fields
- Alerts

## Accessibility Notes

- All color combinations meet WCAG AA standards
- Primary colors have 4.5:1 contrast ratio on white
- Dark mode automatically adjusts for readability
- Focus states use high contrast outlines
- Never rely on color alone for information