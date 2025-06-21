# RosterFrame Project Updates & Requirements
**Date: December 20, 2024**
**Project: RosterFrame - Sports Card Plaque Builder**

## 🎯 Priority 1: Stripe Integration

### Current Status
- Basic Stripe setup exists in `/app/lib/stripe.ts`
- Checkout sessions can be created
- Missing full payment flow implementation

### Required Updates

#### 1.1 Complete Payment Flow
- [ ] Implement checkout page at `/app/checkout`
- [ ] Add cart functionality to collect selected plaques/cards
- [ ] Create success/cancel pages for payment flow
- [ ] Implement webhook handler for order fulfillment
- [ ] Add order confirmation emails

#### 1.2 Stripe Product Management
- [ ] Create Stripe products for each plaque type:
  - Dark Maple Wood (4-10 card variants)
  - Clear Plaque (4-10 card variants)
  - Black Marble (4-10 card variants)
- [ ] Set up dynamic pricing based on card count
- [ ] Add shipping calculations

#### 1.3 Database Integration
- [ ] Create orders table in Supabase
- [ ] Store order details after successful payment
- [ ] Link orders to user accounts
- [ ] Track order status (pending, processing, shipped, delivered)

#### 1.4 Implementation Steps
```typescript
// 1. Update checkout route (/app/api/checkout/route.ts)
// 2. Add order creation after payment
// 3. Implement webhook handler (/app/api/webhooks/stripe/route.ts)
// 4. Create order management in admin panel
```

## 🃏 Priority 2: Card Inventory System

### Current Status
- Basic card storage in Supabase exists
- Can upload card images
- Limited card data structure

### Required Updates

#### 2.1 Enhanced Card Database Schema
```sql
-- Enhance cards table
ALTER TABLE cards ADD COLUMN IF NOT EXISTS 
  sport VARCHAR(50),
  team VARCHAR(100),
  card_number VARCHAR(50),
  parallel_type VARCHAR(100),
  print_run INTEGER,
  condition VARCHAR(20),
  purchase_price DECIMAL(10,2),
  market_value DECIMAL(10,2),
  quantity_available INTEGER DEFAULT 1,
  location VARCHAR(200),
  notes TEXT,
  graded BOOLEAN DEFAULT false,
  grade_company VARCHAR(50),
  grade_value VARCHAR(20),
  ebay_item_id VARCHAR(100),
  date_acquired DATE,
  sold BOOLEAN DEFAULT false,
  sold_date DATE,
  sold_price DECIMAL(10,2);

-- Create card categories table
CREATE TABLE card_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  sport VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create inventory movements table
CREATE TABLE inventory_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_id UUID REFERENCES cards(id),
  movement_type VARCHAR(50), -- 'in', 'out', 'adjustment'
  quantity INTEGER,
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);
```

#### 2.2 Card Management Features
- [ ] Bulk card import from CSV/Excel
- [ ] Barcode/QR code generation for inventory tracking
- [ ] Card grading integration
- [ ] Price tracking from major marketplaces
- [ ] Low stock alerts
- [ ] Card location management (box/binder tracking)

#### 2.3 Admin Interface Updates
- [ ] Enhanced card search with filters
- [ ] Bulk edit capabilities
- [ ] Print inventory reports
- [ ] Card movement history
- [ ] Analytics dashboard:
  - Total inventory value
  - Top performers
  - Recent acquisitions
  - Sales history

#### 2.4 Integration Points
- [ ] eBay API integration for listing/pricing
- [ ] COMC (Check Out My Cards) integration
- [ ] Beckett pricing integration
- [ ] PSA/BGS population reports

## 📦 Priority 3: Order Management System

### Required Features
- [ ] Order tracking interface
- [ ] Shipping label generation
- [ ] Customer communication system
- [ ] Return/refund handling
- [ ] Production queue management

## 🎨 Priority 4: Preview Enhancement

### Current Improvements Made
- ✅ Larger selected plaque preview
- ✅ Card overlay on plaque backgrounds
- ✅ Complete layout saving with card positions

### Additional Improvements Needed
- [ ] Multiple preview angles (3D view)
- [ ] Zoom functionality
- [ ] Print-ready PDF generation
- [ ] AR preview (mobile)
- [ ] Social media share images

## 🛠️ Priority 5: Production Tools

### Required Features
- [ ] Production queue dashboard
- [ ] Print layouts for workshop
- [ ] Material inventory tracking
- [ ] Quality control checklist
- [ ] Shipping integration

## 📊 Priority 6: Analytics & Reporting

### Required Features
- [ ] Sales analytics dashboard
- [ ] Popular configurations tracking
- [ ] Customer insights
- [ ] Inventory turnover reports
- [ ] Financial reporting

## 🔐 Priority 7: Security & Performance

### Required Updates
- [ ] Implement proper authentication
- [ ] Role-based access control
- [ ] API rate limiting
- [ ] Image optimization pipeline
- [ ] CDN integration for card images

## 📱 Priority 8: Mobile Optimization

### Required Updates
- [ ] Responsive preview maker
- [ ] Mobile-friendly admin panel
- [ ] Touch-optimized card selection
- [ ] Mobile payment flow

## 🚀 Implementation Timeline

### Phase 1 (Week 1-2): Stripe Integration
- Set up products and pricing
- Implement checkout flow
- Create order management

### Phase 2 (Week 3-4): Card Inventory
- Enhance database schema
- Build inventory management UI
- Import existing cards

### Phase 3 (Week 5-6): Order Processing
- Production queue system
- Shipping integration
- Customer communications

### Phase 4 (Week 7-8): Polish & Launch
- Mobile optimization
- Performance improvements
- Security audit
- Beta testing

## 💻 Technical Debt to Address
- [ ] Add TypeScript types for all components
- [ ] Implement proper error handling
- [ ] Add comprehensive testing suite
- [ ] Set up CI/CD pipeline
- [ ] Document API endpoints
- [ ] Create deployment guide

## 📝 Next Immediate Steps

1. **Set up Stripe products** (1 day)
2. **Create checkout flow** (2 days)
3. **Build order database** (1 day)
4. **Import card inventory** (2 days)
5. **Test payment flow** (1 day)

## 🔧 Development Environment Setup

```bash
# Required environment variables
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
```

## 📧 Contact for Questions
**Email:** jacksonfitzgerald25@gmail.com
**Project:** RosterFrame
**Repository:** https://github.com/jacksonhedge/rosterframe

---

*This document outlines the complete roadmap for RosterFrame development. Priority should be given to Stripe integration for monetization, followed by robust inventory management for scaling operations.*