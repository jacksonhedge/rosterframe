# Deployment Notes - Roster Frame

## Important: Git Integration Fix (June 23, 2025)

### Issue Resolved
The production site (rosterframe.com) was not updating after git pushes because the Git integration between GitHub and Vercel was disconnected.

### Solution Applied
1. **Reconnected Git Integration**:
   - In Vercel Dashboard → Project Settings → Git
   - Connected to `jacksonhedge/rosterframe` repository
   - This enables automatic deployments on every push to main branch

2. **Manual Deployment Command** (backup option):
   ```bash
   npx vercel --prod --yes
   ```

### Current Setup
- **Production Domain**: rosterframe.com
- **GitHub Repo**: jacksonhedge/rosterframe
- **Production Branch**: main
- **Auto-deploy**: Enabled (pushes to main automatically deploy)

### How to Deploy Changes Going Forward

#### Option 1: Automatic Deployment (Recommended)
1. Make your changes locally
2. Commit and push to main branch:
   ```bash
   git add -A
   git commit -m "Your commit message"
   git push origin main
   ```
3. Vercel will automatically build and deploy (takes 2-3 minutes)
4. Check deployment status at: https://vercel.com/jackson-fitzgeralds-projects/roster-frame

#### Option 2: Manual Deployment (if auto-deploy fails)
1. Run in project directory:
   ```bash
   npx vercel --prod --yes
   ```
2. This will deploy current code directly to production

### Verification Steps
After deployment, verify changes are live:
1. Visit rosterframe.com
2. Hard refresh browser (Cmd+Shift+R on Mac, Ctrl+Shift+R on PC)
3. Check footer for version number (currently v4.1-CONNECTED)

### Recent Changes Deployed
- Reduced text sizes throughout the site
- Changed pricing to $1.99 per card slot
- Added team name preview on plaque images
- Made all plaque text black color
- Added dynamic text scaling for longer team names
- Fixed canvas dependency issues for Vercel compatibility
- Fixed eBay API and CardService singleton initialization

### Environment Variables
All required environment variables are set in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`

### Troubleshooting
If deployments aren't working:
1. Check Git integration is still connected in Vercel Settings → Git
2. Ensure you're pushing to the main branch
3. Check Vercel dashboard for build errors
4. Use manual deployment command as fallback
5. Verify domains are correctly assigned in Settings → Domains

### Domain Configuration
- rosterframe.com → Points to Production
- www.rosterframe.com → Points to Production
- Both should show "Valid Configuration" in Vercel

---
Last updated: June 23, 2025