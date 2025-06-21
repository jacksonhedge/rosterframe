# 🗓️ Thursday To-Do List - Roster Frame Testing & Expansion

## 🎯 **Priority 1: Test eBay Marketplace Integration**

### **Environment Setup & Testing**
- [ ] **Add eBay credentials** to `.env.local` file
- [ ] **Run eBay schema** extension in Supabase
- [ ] **Test eBay API connection** at `/admin/ebay`
- [ ] **Test unified search** at `/marketplace` page
- [ ] **Verify seamless integration** - customers see unified inventory

### **Business Model Validation**
- [ ] **Test search for popular players** (Tom Brady, Patrick Mahomes, etc.)
- [ ] **Verify pricing markup** is applied correctly (25% default)
- [ ] **Check quality filters** - only good sellers/conditions show
- [ ] **Test customer experience** - no eBay branding visible
- [ ] **Verify availability indicators** - "In Stock" vs "Available"

---

## 🎯 **Priority 2: Fix Current Database Issues**

### **Database & API Fixes**
- [ ] **Fix Supabase Key Error** - Player search API failing
  - Error: `supabaseKey is required` in `/api/admin/players/search`
  - Check environment variables in `.env.local`
  - Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly

- [ ] **Fix Query Syntax Errors** - Search ordering issues
  - Error: `unexpected "n" expecting "asc", "desc", "nullsfirst" or "nullslast"`
  - Fix ordering syntax in player search API
  - Update `card_players.name.asc` to proper Supabase syntax

- [ ] **Create Missing Tables** - Plaques table doesn't exist
  - Error: `relation "public.plaques" does not exist`
  - Run database setup script for plaques table
  - Fix admin plaques page functionality

- [ ] **Fix League Management Errors** - Table relationship issues
  - Error: Foreign key relationship between 'admin_leagues' and 'admin_sports' not found
  - Update table names or create proper relationships

---

## 🃏 **Priority 2: Test Card Back Functionality**

### **Card Scanner Testing**
- [ ] **Test front/back image capture** with phone camera
- [ ] **Verify dual image upload** works properly
- [ ] **Test file upload option** for both front and back images
- [ ] **Check image storage** in Supabase Storage bucket
- [ ] **Validate form submission** with both images

### **Preview Maker Testing**
- [ ] **Test Clear Plaque** with card back option
- [ ] **Verify front/back toggle** functionality
- [ ] **Generate previews** with card backs displayed
- [ ] **Test all three plaque options**:
  - Dark Maple Wood ($129.99)
  - Clear Plaque ($149.99) - with back option
  - Black Marble ($159.99)

### **Inventory Integration**
- [ ] **Test player search** with card back images
- [ ] **Verify autocomplete** shows both front/back data
- [ ] **Check inventory display** includes back images
- [ ] **Test search integration** in Preview Maker

---

## 🏀⚾ **Priority 3: Add Multi-Sport Support**

### **Database Schema Updates**
- [ ] **Add Baseball sport data**:
  - MLB teams (30 teams)
  - Positions: P, C, 1B, 2B, 3B, SS, LF, CF, RF, DH
  - American League / National League divisions

- [ ] **Add Basketball sport data**:
  - NBA teams (30 teams)  
  - Positions: PG, SG, SF, PF, C
  - Eastern Conference / Western Conference divisions

### **Scanner Updates**
- [ ] **Update team dropdown** to include MLB and NBA teams
- [ ] **Add position options** for baseball and basketball
- [ ] **Update card brands** for baseball (Topps, Panini, etc.)
- [ ] **Test sport-specific scanning** workflow

### **Admin Interface Updates**
- [ ] **Create sports management** interface
- [ ] **Add team management** functionality  
- [ ] **Update league management** for multi-sport
- [ ] **Test sport filtering** in inventory

---

## 💰 **Priority 4: Stripe Integration Setup**

### **Pricing Structure**
- [ ] **Define plaque pricing tiers**:
  - Dark Maple Wood: $129.99
  - Clear Plaque: $149.99  
  - Black Marble: $159.99

- [ ] **Set card pricing logic**:
  - Base price by rarity/condition
  - Market value integration
  - Shipping calculations

### **Payment Integration**
- [ ] **Setup Stripe dashboard** 
- [ ] **Create product catalog** in Stripe
- [ ] **Test payment flow** with preview generation
- [ ] **Add order management** functionality
- [ ] **Create invoice generation** system

---

## 🧪 **Priority 5: Real Inventory Testing**

### **Card Scanning Session**
- [ ] **Scan 20+ football cards** with front/back images
- [ ] **Scan 10+ baseball cards** (if available)
- [ ] **Scan 10+ basketball cards** (if available)
- [ ] **Test various conditions** (Mint, Near Mint, etc.)
- [ ] **Try different brands** (Panini, Topps, etc.)

### **Preview Generation Testing**
- [ ] **Create 5+ different team combinations**
- [ ] **Test all plaque types** with real inventory
- [ ] **Generate clear plaque previews** with card backs
- [ ] **Test download functionality**
- [ ] **Verify image quality** and positioning

### **Performance Testing**
- [ ] **Test with large inventory** (50+ cards)
- [ ] **Check search performance** with real data
- [ ] **Verify image loading speed**
- [ ] **Test mobile responsiveness**

---

## 📋 **Completion Checklist**

### **Before End of Day**
- [ ] All database errors resolved
- [ ] Card scanner working with real inventory
- [ ] Multi-sport support functional
- [ ] Preview generation working smoothly
- [ ] Stripe integration foundation ready

### **Documentation Updates**
- [ ] Update README with new features
- [ ] Document multi-sport setup process
- [ ] Create user guide for card scanning
- [ ] Document API endpoints

### **Next Steps Planning**
- [ ] Plan pricing strategy rollout
- [ ] Schedule customer testing session
- [ ] Prepare marketing materials
- [ ] Plan production deployment

---

## 🚨 **Known Issues to Address**

1. **Environment Variables** - Verify all Supabase keys are properly set
2. **Database Schema** - Ensure compatibility views are working
3. **Image Optimization** - Next.js remote image configuration
4. **Search Performance** - Optimize card search queries
5. **Mobile Experience** - Test camera functionality on actual mobile devices

---

## 📞 **Support Resources**

- **Supabase Docs**: https://supabase.com/docs
- **Stripe Docs**: https://stripe.com/docs
- **Next.js Image Docs**: https://nextjs.org/docs/app/api-reference/components/image
- **Database Schema**: `/complete-database-setup.sql`

---

---

## 🎯 **eBay Integration - Abstracted Approach**

### **Customer Experience (Seamless)**
- **Unified Search** - `/marketplace` page shows internal + eBay cards seamlessly
- **No eBay Branding** - Customers see "Available" instead of "From eBay"
- **Consistent Pricing** - Your markup already applied, no eBay price comparison
- **Availability Indicators** - "In Stock" (internal) vs "Available" (eBay sourced)
- **Shipping Transparency** - "Ships 1-2 days" vs "Ships 7-10 days"

### **Admin Experience (Full Control)**
- **Complete Visibility** - `/admin/ebay` shows eBay details, pricing, sellers
- **Quality Filters** - Only 95%+ feedback sellers, good conditions
- **Markup Control** - 25% default, configurable by condition/price
- **Source Tracking** - Know which cards are eBay vs internal
- **Import Management** - Choose which eBay cards to make available

### **Business Model Benefits**
- **Unlimited Inventory** - Access millions of eBay listings
- **Risk Mitigation** - Only purchase after customer orders
- **Profit Margins** - 25% markup + plaque service value
- **Scalability** - Grow inventory without physical storage

---

**Last Updated**: eBay integration ready for testing! 🚀 