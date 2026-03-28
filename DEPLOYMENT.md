# Vercel Deployment Guide

## Quick Deploy

### Option 1: Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub

2. Click **"Add New Project"**

3. Import your GitHub repository: `vedant713/ai-job-search-companion`

4. Configure environment variables (see below)

5. Click **"Deploy"**

### Option 2: Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Link project
vercel link

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Environment Variables Required

Set these in Vercel Dashboard → Project Settings → Environment Variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Google Gemini AI API key | `AIzaSy...` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key | `eyJhbG...` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | `GOCSPX-...` |
| `GOOGLE_REDIRECT_URI` | OAuth callback URL | `https://your-domain.vercel.app/api/email/callback` |

### For Local Mode Only (No Supabase)

If using local SQLite mode only, you only need:
- `GEMINI_API_KEY`

## Build Settings

- **Framework**: Next.js (auto-detected)
- **Build Command**: `npm run build`
- **Output Directory**: `.next` (auto-detected)
- **Node Version**: 18.x (auto-detected from package.json)

## Post-Deployment

1. **Update OAuth Redirect URI**: After first deploy, update `GOOGLE_REDIRECT_URI` with your Vercel domain

2. **Database Setup**: 
   - For cloud mode: Ensure Supabase database is migrated (`supabase-schema.sql`)
   - For local mode: SQLite will auto-create `local.db`

3. **Test Features**:
   - Dashboard analytics
   - AI chat assistant
   - Email import (if OAuth configured)
   - Application tracking

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Run `npm run build` locally to test

### API Routes Not Working
- Verify environment variables are set (not just `NEXT_PUBLIC_*`)
- Check Vercel function logs

### SQLite Errors (Local Mode)
- Ensure `local.db` has write permissions
- Check Vercel serverless function timeout (max 10s on free tier)

## Vercel Configuration

See `vercel.json` for:
- Region selection (default: `iad1` - US East)
- Environment variable references
- Build/install commands

## Useful Commands

```bash
# View deployment logs
vercel logs

# List deployments
vercel ls

# Remove deployment
vercel rm <deployment-url>

# Pull environment variables from Vercel
vercel env pull
```

## Links

- [Vercel Next.js Docs](https://vercel.com/docs/frameworks/nextjs)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)
