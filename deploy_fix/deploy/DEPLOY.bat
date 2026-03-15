@echo off
echo === Drahmi Deploy Fix ===
echo.

REM Copy files to correct locations
xcopy /E /Y /I netlify "%~dp0\..\netlify" >nul 2>&1
copy /Y netlify.toml "..\netlify.toml" >nul 2>&1
copy /Y src\App.jsx "..\src\App.jsx" >nul 2>&1

REM Navigate to repo root (assumes this zip was extracted inside casa-bourse)
cd /d "%~dp0\.."

echo Copying files...
xcopy /E /Y "%~dp0netlify" "netlify\" >nul
copy /Y "%~dp0netlify.toml" "netlify.toml" >nul
copy /Y "%~dp0src\App.jsx" "src\App.jsx" >nul

echo Committing...
git add netlify/functions/market.js netlify.toml src/App.jsx
git commit -m "fix: Netlify function for /api/market + restore App.jsx"

echo Pushing...
git push vercel main --force
git push origin main

echo.
echo === Done! Check Netlify dashboard for build status ===
pause
