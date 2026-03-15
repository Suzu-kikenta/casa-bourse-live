@echo off
cd /d "C:\Users\SAMI\casa-bourse"
copy /Y "%~dp0App.jsx" "src\App.jsx"
git add src\App.jsx
git commit -m "feat: FX card grid with sparklines, H/L, performance bar chart"
git push vercel main --force
git push origin main --force
echo === Done ===
pause
