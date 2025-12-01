@echo off
echo Starting Angular development server...
echo Backend API URL: http://localhost:8080
echo Frontend will be available at: http://localhost:4200

cd /d "%~dp0"

if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

echo Starting development server...
npm run start

pause