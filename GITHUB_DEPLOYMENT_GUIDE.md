# GitHub Deployment Guide for RosterFrame

You have several options for deploying through GitHub:

## Option 1: Vercel + GitHub Integration (Recommended)

This is the easiest and most powerful option for Next.js apps.

### Steps:

1. **Connect GitHub to Vercel**
   - Go to https://vercel.com/new
   - Click "Import Git Repository"
   - Connect your GitHub account
   - Select `jacksonhedge/rosterframe` repository

2. **Configure Project**
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Add Environment Variables**
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will provide you with URLs like:
     - `rosterframe.vercel.app`
     - `rosterframe-git-main.vercel.app`
     - `rosterframe-jacksonhedge.vercel.app`

5. **Automatic Deployments**
   - Every push to `main` will trigger a new deployment
   - Pull requests get preview deployments

### Benefits:
- Zero configuration
- Automatic HTTPS
- Global CDN
- Preview deployments for PRs
- Built-in analytics
- Serverless functions support

## Option 2: GitHub Actions + Vercel (Using workflow file)

I've created `.github/workflows/deploy.yml` for you.

### Setup:

1. **Get Vercel Tokens**
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Login to Vercel
   vercel login

   # Link your project
   vercel link

   # Get your token
   vercel tokens create github-actions
   ```

2. **Add GitHub Secrets**
   Go to your repo Settings > Secrets > Actions and add:
   - `VERCEL_TOKEN`: Your Vercel token
   - `VERCEL_ORG_ID`: Found in `.vercel/project.json`
   - `VERCEL_PROJECT_ID`: Found in `.vercel/project.json`

3. **Push to GitHub**
   ```bash
   git add .github/workflows/deploy.yml
   git commit -m "Add GitHub Actions deployment"
   git push origin main
   ```

## Option 3: Deploy to GitHub Pages (Static Export Only)

⚠️ **Note**: This option has limitations for Next.js apps with dynamic features.

### Limitations:
- No API routes
- No dynamic routes
- No server-side rendering
- No middleware

If you still want to proceed:

1. **Update `next.config.ts`**:
   ```typescript
   const nextConfig = {
     output: 'export',
     images: {
       unoptimized: true,
     },
   };
   ```

2. **Create GitHub Pages workflow**:
   ```yaml
   name: Deploy to GitHub Pages
   
   on:
     push:
       branches: [ main ]
   
   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: 18
         - run: npm ci
         - run: npm run build
         - uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./out
   ```

## Option 4: Other Platforms via GitHub

### Netlify
1. Connect GitHub repo at https://app.netlify.com
2. Auto-deploys on push
3. Similar features to Vercel

### Railway
1. Connect at https://railway.app
2. Great for full-stack apps
3. Includes database hosting

### Render
1. Connect at https://render.com
2. Good for web services
3. Free tier available

## Recommended: Option 1 (Vercel + GitHub Integration)

For your Next.js app with API routes and dynamic features, Vercel is the best choice:

1. **Go to**: https://vercel.com/new
2. **Import**: `jacksonhedge/rosterframe`
3. **Add env vars**
4. **Deploy**

Your app will be live at a URL like:
- `rosterframe.vercel.app`

And will auto-deploy whenever you push to GitHub!

## Current Domain

Once deployed, you'll get:
- Production: `your-project.vercel.app`
- Preview: `your-project-git-branch.vercel.app`

You can also add a custom domain later in Vercel settings.

---

**Need help?** The Vercel + GitHub integration (Option 1) is the easiest and most powerful for your Next.js app!