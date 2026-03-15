# Cloudflare Pages Deployment

## Steps:

1. Go to https://pages.cloudflare.com
2. Click "Create a project" → "Connect to Git"
3. Select your repo: morocco-market-clean (or casa-bourse-live)
4. Build settings:
   - Framework: Vite
   - Build command: npm run build
   - Output directory: dist
5. Click "Save and Deploy"

## After first deploy, add Environment Variables:
Go to: Settings → Environment Variables → Add:
- EODHD_API_KEY = (your key)
- DRAHMI_API_KEY = (your key)
- LUZIA_API_KEY = (your key)

## API route:
The file functions/api/market.js automatically becomes:
https://your-site.pages.dev/api/market?tab=overview

## Copy files to your repo:
- Copy functions/ folder to root of casa-bourse repo
- Copy App.jsx to src/App.jsx
