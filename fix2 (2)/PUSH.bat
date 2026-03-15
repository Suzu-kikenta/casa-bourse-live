@echo off
cd /d "C:\Users\SAMI\casa-bourse"
copy /Y "%~dp0App.jsx" "src\App.jsx"
git add src\App.jsx
git commit -m "redesign: new Overview layout, tab sidebars, KPI strip, Bonds/Commodities pages, tight tables, unique ticker"
git push vercel main --force
git push origin main --force
echo === Done ===
pause
