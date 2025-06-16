# Assets Organization

## Folder Structure

### `/public/images/`
- **General images** for the application
- Product photos, hero images, backgrounds, etc.

### `/public/images/icons/`
- **Icons and small graphics**
- UI icons, logos, favicons, etc.
- Recommended formats: SVG, PNG, ICO

### `/public/assets/`
- **Other static assets**
- Documents, fonts, audio files, etc.

## Usage in Next.js

Access these assets in your components using:

```jsx
// For images
<img src="/images/hero-image.jpg" alt="Hero" />

// For icons
<img src="/images/icons/logo.svg" alt="Logo" />

// Using Next.js Image component (recommended)
import Image from 'next/image';

<Image 
  src="/images/icons/logo.svg" 
  alt="Logo"
  width={100}
  height={100}
/>
```

## File Naming Convention

- Use lowercase with hyphens: `team-logo.svg`
- Be descriptive: `plaque-wood-brown.jpg`
- Include size if multiple versions: `logo-small.svg`, `logo-large.svg` 