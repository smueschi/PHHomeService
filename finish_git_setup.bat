@echo off
echo ==========================================
echo      Git Setup: Identity Configuration
echo ==========================================
echo.
echo We need to tell Git who you are before we can commit code.
echo.

set /p email="Enter your email address (e.g. you@gmail.com): "
set /p name="Enter your full name (e.g. Juan dela Cruz): "

echo.
echo Configuring Git...
git config --global user.email "%email%"
git config --global user.name "%name%"

echo.
echo re-attempting commit...
git add .
git commit -m "Initial commit - PHHomeService platform"

echo.
echo Pushing to GitHub...
git branch -M main
git push -u origin main

echo.
echo DONE!
pause
