# 🚀 Roster Frame - Product Roadmap & Backend Services

A comprehensive roadmap for building a full-scale e-commerce platform with custom plaques, inventory management, and marketplace functionality.

## 🎯 **Vision Statement**

Transform Roster Frame from a custom plaque builder into a comprehensive fantasy sports merchandise platform with:
- **Custom Plaque Creation** (current)
- **Card Inventory & Marketplace** (planned)
- **Order Management System** (planned)
- **Multi-vendor Marketplace** (future)

---

## 📋 **Phase 1: Foundation (Current - Q1 2025)**

### ✅ **Completed Features**
- [x] Custom plaque builder with 5-step flow
- [x] Stripe payment integration
- [x] Pre-order system with 15% discount
- [x] Dynamic pricing and card selection
- [x] Responsive UI with brown/gold theme

### 🔧 **Current Technical Stack**
- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Payments**: Stripe integration with payment intents
- **Hosting**: Vercel (recommended)
- **State Management**: React useState/useContext

---

## 🏗️ **Phase 2: Backend Infrastructure (Q1-Q2 2025)**

### 🎯 **Goals**
- Implement robust order management
- Add inventory tracking system
- Create admin dashboard
- Set up database architecture

### 🔧 **Recommended Tech Stack**

#### **Database & Backend**
```typescript
// Option A: Supabase (Recommended for speed)
- PostgreSQL database with real-time subscriptions
- Row Level Security (RLS) for data protection
- Built-in authentication and APIs
- File storage for card images

// Option B: Custom Backend
- Node.js/Express API
- PostgreSQL with Prisma ORM
- AWS RDS or PlanetScale
- Redis for caching
```

#### **Core Services**
- **Order Management Service**: Track orders from creation to delivery
- **Inventory Service**: Real-time stock tracking for cards and plaques
- **Payment Service**: Enhanced Stripe integration with webhooks
- **Notification Service**: Email/SMS updates for customers

### 📊 **Database Schema Design**

```sql
-- Orders Table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(20) UNIQUE NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  team_name VARCHAR(100) NOT NULL,
  status ORDER_STATUS NOT NULL DEFAULT 'pending',
  is_pre_order BOOLEAN DEFAULT false,
  is_gift BOOLEAN DEFAULT false,
  subtotal DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_intent_id VARCHAR(255),
  expected_delivery DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Order Items Table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  item_type ITEM_TYPE NOT NULL, -- 'plaque' or 'card'
  item_id UUID NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL
);

-- Plaques Table
CREATE TABLE plaques (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  material VARCHAR(50) NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2) NOT NULL,
  price_per_slot DECIMAL(10,2) NOT NULL,
  is_available BOOLEAN DEFAULT true,
  estimated_production_days INTEGER DEFAULT 7
);

-- Cards Inventory Table
CREATE TABLE cards_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  brand VARCHAR(50) NOT NULL,
  card_type VARCHAR(50) NOT NULL, -- 'rookie', 'premium', etc.
  condition VARCHAR(20) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity_available INTEGER NOT NULL DEFAULT 0,
  sku VARCHAR(50) UNIQUE NOT NULL,
  image_urls TEXT[],
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Customer Roster Cards (Custom Orders)
CREATE TABLE custom_roster_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  position VARCHAR(20) NOT NULL,
  player_name VARCHAR(100) NOT NULL,
  selected_card_type VARCHAR(50) NOT NULL,
  price DECIMAL(10,2) NOT NULL
);
```

### 🔄 **API Endpoints**

```typescript
// Order Management
POST   /api/orders              // Create new order
GET    /api/orders/:id          // Get order details
PUT    /api/orders/:id/status   // Update order status
GET    /api/orders/customer/:email // Get customer orders

// Inventory Management
GET    /api/inventory/cards     // Get available cards
POST   /api/inventory/cards     // Add new card to inventory
PUT    /api/inventory/cards/:id // Update card inventory
GET    /api/inventory/plaques   // Get plaque options

// Marketplace
GET    /api/marketplace/cards   // Browse marketplace cards
GET    /api/marketplace/search  // Search cards by player/year
GET    /api/marketplace/featured // Get featured cards

// Admin Dashboard
GET    /api/admin/orders        // Admin order management
GET    /api/admin/inventory     // Inventory overview
GET    /api/admin/analytics     // Sales analytics
```

---

## 🛒 **Phase 3: Marketplace & Inventory (Q2-Q3 2025)**

### 🎯 **Marketplace Features**

#### **Card Depository System**
```typescript
interface DepositoryCard {
  id: string;
  player: string;
  year: number;
  brand: string;
  cardNumber: string;
  condition: 'mint' | 'near_mint' | 'excellent' | 'good';
  price: number;
  quantityInStock: number;
  acquisitionCost: number;
  profitMargin: number;
  images: string[];
  isAuthenticated: boolean;
  certificationNumber?: string;
}
```

#### **Inventory Management Dashboard**
- **Real-time Stock Levels**: Track card quantities
- **Automated Reorder Points**: Alert when stock is low
- **Profit Margin Tracking**: Monitor card profitability
- **Acquisition Logs**: Track where cards were purchased
- **Condition Verification**: Photo documentation system

#### **Enhanced Customer Experience**
- **Browse Physical Cards**: Cards you have in stock
- **Custom Plaque Builder**: Existing functionality
- **Hybrid Orders**: Mix custom and in-stock cards
- **Wishlist System**: Customers can save desired cards
- **Price Alerts**: Notify when wishlist cards are available

### 🔍 **Search & Discovery**
```typescript
// Advanced Search Features
interface SearchFilters {
  player?: string;
  team?: string;
  year?: number[];
  priceRange?: [number, number];
  condition?: string[];
  brand?: string[];
  cardType?: string[];
  inStock?: boolean;
}
```

---

## 🏪 **Phase 4: Multi-Vendor Marketplace (Q4 2025)**

### 🎯 **Vendor Platform Features**

#### **Vendor Onboarding**
- **Application Process**: Vet quality sellers
- **Commission Structure**: 10-15% marketplace fee
- **Quality Standards**: Card condition requirements
- **Shipping Integration**: Unified shipping experience

#### **Vendor Dashboard**
- **Inventory Management**: Upload and manage listings
- **Order Processing**: Fulfillment workflow
- **Analytics**: Sales performance metrics
- **Payment Management**: Automatic payouts

#### **Customer Benefits**
- **Larger Selection**: Access to multiple vendors
- **Competitive Pricing**: Market-driven prices
- **Quality Assurance**: Roster Frame verification
- **Unified Experience**: Single checkout process

---

## 📊 **Phase 5: Advanced Features (2026)**

### 🤖 **AI & Automation**
- **Price Optimization**: Dynamic pricing based on market data
- **Card Recognition**: AI-powered card identification
- **Demand Forecasting**: Predict popular cards
- **Personalized Recommendations**: ML-based suggestions

### 📱 **Mobile App**
- **Native iOS/Android Apps**: Enhanced mobile experience
- **Barcode Scanning**: Quick card lookup
- **Push Notifications**: Order updates and deals
- **Offline Browsing**: Cache for better performance

### 🌐 **Marketplace Expansion**
- **International Shipping**: Global marketplace
- **Multi-Currency Support**: Local pricing
- **Regional Inventory**: Localized stock
- **Payment Methods**: Local payment options

---

## 🔧 **Implementation Strategy**

### **Phase 2 Implementation Plan**

#### **Week 1-2: Database Setup**
```bash
# 1. Set up Supabase project
npm install @supabase/supabase-js
npm install @supabase/auth-helpers-nextjs

# 2. Create database schema
# Execute SQL schema from above

# 3. Set up environment variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### **Week 3-4: Order Management**
- Create order creation API
- Integrate with existing Stripe flow
- Add order status tracking
- Build customer order history

#### **Week 5-6: Admin Dashboard**
- Create admin authentication
- Build order management interface
- Add inventory overview
- Implement basic analytics

#### **Week 7-8: Inventory System**
- Card inventory CRUD operations
- Stock level tracking
- Image upload system
- Search functionality

### **Quick Wins (First Sprint)**
1. **Database Migration**: Move existing orders to structured DB
2. **Order Tracking**: Add order status to existing flow
3. **Admin Panel**: Basic order management interface
4. **Inventory Preview**: Simple card browsing page

---

## 💰 **Revenue Projections**

### **Phase 2 (Backend + Admin)**
- **Custom Plaques**: $50-150 per order
- **Order Volume**: 100-300 orders/month
- **Monthly Revenue**: $5K-45K

### **Phase 3 (Marketplace)**
- **Card Sales**: $10-500 per card
- **Inventory Investment**: $10K-50K initial stock
- **Marketplace Commission**: 10-15% on vendor sales
- **Monthly Revenue**: $15K-80K

### **Phase 4 (Multi-Vendor)**
- **Platform Commission**: $5K-25K/month
- **Listing Fees**: $1K-5K/month
- **Premium Features**: $2K-10K/month
- **Monthly Revenue**: $25K-150K

---

## 🛠️ **Technical Recommendations**

### **Immediate Next Steps (Phase 2)**

1. **Choose Backend Solution**
   ```typescript
   // Recommended: Supabase for rapid development
   // Alternative: Custom Node.js + PostgreSQL
   ```

2. **Set Up Project Structure**
   ```
   /lib
     /database     # Database utilities
     /services     # Business logic
     /types        # TypeScript definitions
   /pages/api      # API routes
   /components/admin # Admin dashboard
   ```

3. **Database Schema Implementation**
   - Start with core tables (orders, order_items, plaques)
   - Add inventory tables in sprint 2
   - Marketplace tables in sprint 3

4. **Admin Dashboard MVP**
   - Order list and details view
   - Status update functionality
   - Basic inventory management

### **Technology Stack Evolution**

```typescript
// Current Stack
Frontend: Next.js + React + TypeScript
Payments: Stripe
Hosting: Vercel

// Phase 2 Addition
Database: Supabase (PostgreSQL)
Authentication: Supabase Auth
File Storage: Supabase Storage
Real-time: Supabase Realtime

// Phase 3 Addition
Search: Algolia or PostgreSQL Full-Text
Image Processing: Cloudinary
Email: SendGrid or Resend
Analytics: PostHog or Mixpanel

// Phase 4 Addition
Queue System: Inngest or Bull
Monitoring: Sentry
CDN: Cloudflare
Cache: Redis
```

---

## 📈 **Success Metrics**

### **Phase 2 KPIs**
- Order processing time: < 2 minutes
- Database query performance: < 500ms
- Admin task completion: 50% faster
- Customer satisfaction: > 4.5/5

### **Phase 3 KPIs**
- Inventory turnover: 4-6x annually
- Search conversion rate: > 15%
- Average order value: +30%
- Customer retention: > 60%

### **Phase 4 KPIs**
- Vendor acquisition: 50+ quality sellers
- Marketplace GMV: $500K+ monthly
- Platform commission: $50K+ monthly
- Customer lifetime value: +50%

---

🚀 **Ready to transform Roster Frame into the ultimate fantasy sports marketplace!**

This roadmap provides a clear path from your current custom plaque system to a comprehensive marketplace platform. Each phase builds on the previous one, ensuring steady growth and manageable complexity.

**Next Step**: Choose your backend solution and implement Phase 2 database infrastructure. 