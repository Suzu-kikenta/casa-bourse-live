@echo off
cd /d "C:\Users\SAMI\casa-bourse"
copy /Y "%~dp0App.jsx" "src\App.jsx"
git add src\App.jsx
git commit -m "redesign: Morocco-first Overview with MASI hero, session countdown, gainers/losers, watchlist"
git push vercel main --force
git push origin main --force
echo === Done ===
pause
