@echo off
echo === Drahmi Final Fix ===
cd /d "C:\Users\SAMI\casa-bourse"

echo Running fix script...
python fix_app.py

echo.
echo Committing...
git add src/App.jsx
git commit -m "fix: repair GLOBAL_CSS template literal and stray comments"

echo Pushing...
git push vercel main --force
git push origin main --force

echo.
echo === Done! Check Netlify in 2 minutes ===
pause
