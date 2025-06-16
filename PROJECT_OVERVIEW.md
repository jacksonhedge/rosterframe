# Roster Frame - Project Overview

## 🎯 What is Roster Frame?

**Roster Frame** is a Next.js web application that helps fantasy sports enthusiasts create custom display frames featuring their fantasy team players. Users can build personalized frames by selecting frame types, entering their team roster, choosing player cards to purchase, and completing their order all in one place.

## 🏗️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Runtime**: React 19
- **Development**: Node.js with Turbopack

## 📁 Project Structure

```
roster-frame/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Homepage with hero section
│   ├── layout.tsx         # Root layout component
│   ├── globals.css        # Global Tailwind styles
│   └── build-and-buy/     # Frame builder feature
│       └── page.tsx       # Main customization interface
├── public/                # Static assets
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── next.config.ts         # Next.js configuration
```

## 🚀 Key Features

### 🏠 Homepage (`/`)
- Hero section explaining the service
- Feature highlights (Custom Frames, Fantasy Teams, All-in-One Shopping)
- Call-to-action to start building frames

### 🛠️ Frame Builder (`/build-and-buy`)
- **Step 1**: Frame selection (Standard $79.99 or Premium $119.99)
- **Step 2**: Fantasy team information input
- **Step 3**: Individual player card selection ($4.99 each)
- Live order summary with pricing
- Checkout integration (Stripe ready)

## 🎨 Design System

- **Color Scheme**: Blue primary (`blue-600`), gray neutrals
- **Typography**: System fonts with Geist optimization
- **Layout**: Responsive grid system with Tailwind breakpoints
- **Components**: Card-based UI with consistent spacing
- **Navigation**: Clean header with brand and primary CTA

## 🔧 Development Commands

```bash
npm run dev        # Start development server with Turbopack
npm run build      # Create production build
npm run start      # Start production server
npm run lint       # Run ESLint
```

## 📊 Current Status

### ✅ Completed
- Basic project setup with Next.js 15 + TypeScript
- Homepage with marketing content and navigation
- Frame builder UI with 3-step process
- Responsive design with Tailwind CSS
- Client-side state management for form data

### 🚧 In Progress / TODO

#### Core API Integrations (Priority 1)
- **NFL Player Data API**: Real-time player information, positions, team affiliations
- **Sports Card Marketplace API**: Card inventory, pricing, availability from vendors
- **Stripe MCP Server**: Payment processing with support for complex orders
- **Backend API**: Order processing, user management, plaque customization

#### Enhanced User Experience (Priority 2)
- **Position-by-Position Builder**: Guided roster creation with individual card selection
- **Dynamic Plaque Selection**: Size-based plaque options matching roster count
- **Live Preview System**: Real-time plaque visualization as users build
- **Card Comparison Tools**: Side-by-side card viewing and selection

#### Supporting Features (Priority 3)
- User authentication and profiles
- Order management and tracking system
- Admin panel for inventory and order management
- Analytics dashboard for business insights

## 🎯 Target Users

- **Fantasy Sports Players**: Football and baseball fantasy league participants
- **Sports Card Collectors**: People who want to display their collections
- **Gift Buyers**: Those looking for unique sports-themed gifts
- **League Champions**: Winners wanting to commemorate their victory

## 💰 Business Model

- **Frame Sales**: $79.99 (Standard) / $119.99 (Premium)
- **Card Sales**: $4.99 per player card
- **Bundle Deals**: Frame + cards in single purchase
- **Custom Options**: Potential for personalization upgrades

## 🔄 Enhanced Workflow

### User Journey
1. **User visits homepage** → Learns about service
2. **Clicks "Build and Buy"** → Enters frame builder
3. **Inputs roster size** → System suggests appropriate plaque options
4. **Selects plaque style** → Chooses design and layout
5. **Position-by-position building**:
   - Enter player name for each position
   - NFL API validates player and suggests team/position
   - Cards API fetches available cards for that player
   - User selects preferred card from marketplace
   - Live preview updates with selected card
6. **Reviews complete plaque** → Sees final design and pricing
7. **Completes checkout** → Stripe processes payment
8. **Order fulfillment** → Plaque manufacturing and shipping

### Technical Data Flow
```
User Input (Player Name) 
    ↓
NFL Player API (Validation & Info)
    ↓
Cards Marketplace API (Available Cards)
    ↓
User Selection (Specific Card)
    ↓
Live Preview Update (Plaque Visualization)
    ↓
Stripe Payment Processing
    ↓
Order Management System
```

## 🔗 External Integrations & APIs

### Essential Integrations
- **NFL Player Data API** 
  - Player names, positions, team affiliations
  - Real-time roster updates and player status
  - Suggested for: ESPN API, NFL.com API, or SportsData.io

- **Sports Card Marketplace API**
  - Card inventory from multiple vendors
  - Real-time pricing and availability
  - Card images, descriptions, and rarity information
  - Integration with: COMC, eBay, PWCC, or custom card vendors

- **Stripe MCP Server**
  - Secure payment processing for complex orders
  - Support for multiple line items (plaque + individual cards)
  - Subscription billing for premium features
  - Webhook handling for order status updates

### Supporting Integrations
- **Shipping APIs**: Order fulfillment and tracking
- **Email Service**: Order confirmations, shipping updates, and marketing
- **Image Processing**: Card image optimization and plaque previews
- **Analytics**: User behavior tracking and conversion optimization

## 📈 Future Enhancements

- Mobile app version
- Social sharing features
- League integration (ESPN, Yahoo Fantasy)
- Advanced customization options
- Subscription service for regular updates
- Analytics dashboard for users

---

*This overview provides a snapshot of the Roster Frame project. For detailed development guidelines, see `PROJECT_RULES.md`.* 