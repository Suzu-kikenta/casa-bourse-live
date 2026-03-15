@echo off
cd /d "C:\Users\SAMI\casa-bourse"
copy /Y "%~dp0App.jsx" "src\App.jsx"
git add src\App.jsx
git commit -m "fix: WorldClock above tabs, correct sticky order"
git push vercel main --force
git push origin main --force
echo === Done ===
pause
