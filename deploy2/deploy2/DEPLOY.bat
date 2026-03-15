@echo off
echo === Drahmi API Fix ===
echo.
cd /d "%~dp0.."

echo Copying netlify function files...
if not exist netlify\functions mkdir netlify\functions
copy /Y "%~dp0netlify\functions\market.js" "netlify\functions\market.js"
copy /Y "%~dp0netlify.toml" "netlify.toml"

echo Committing...
git add netlify/functions/market.js netlify.toml
git commit -m "fix: add Netlify serverless function for /api/market"

echo Pushing...
git push vercel main --force
git push origin main --force

echo.
echo === Done! All tabs should now have data ===
pause
