@echo off
cd /d "C:\Users\SAMI\casa-bourse"

echo === Copying files for Cloudflare ===

REM Copy App.jsx
copy /Y "%~dp0App.jsx" "src\App.jsx"

REM Create functions/api directory
if not exist "functions\api" mkdir "functions\api"

REM Copy Cloudflare function
copy /Y "%~dp0functions\api\market.js" "functions\api\market.js"

REM Remove netlify.toml (not needed for CF)
REM Keep it for now in case you switch back

git add src\App.jsx functions\api\market.js
git commit -m "feat: Cloudflare Pages - new API function + redesigned UI"
git push vercel main --force
git push origin main --force

echo.
echo === Done! Now go to pages.cloudflare.com and connect your repo ===
echo Connect: morocco-market-clean OR casa-bourse-live
echo Build command: npm run build
echo Output dir: dist
pause
