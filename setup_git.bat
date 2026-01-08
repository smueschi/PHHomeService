@echo off
echo Initializing Git Repository for PHHomeService...

REM Check if git is installed
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo Git is not found in your PATH. Please install Git and try again.
    pause
    exit /b
)

git init
git add .
git commit -m "Initial commit - PHHomeService platform"
git remote add origin https://github.com/smueschi/PHHomeService.git
git branch -M main
echo.
echo Pushing to GitHub... (You may be asked to sign in)
git push -u origin main

echo.
echo git setup complete!
pause
