@echo off
echo === Drahmi One-Click Fix ===
cd /d "C:\Users\SAMI\casa-bourse"

echo Replacing src\App.jsx with fixed version...
copy /Y "%~dp0App.jsx" "src\App.jsx"

echo Committing...
git add src\App.jsx
git commit -m "fix: complete App.jsx - WorldClock, Arabic title, yellow tabs, 11 tabs"

echo Pushing...
git push vercel main --force
git push origin main --force

echo.
echo === DONE! Check Netlify in 2 minutes ===
echo https://jovial-begonia-6733e7.netlify.app/
pause
