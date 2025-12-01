@echo off
echo Building Angular application for production with AWS backend...

cd /d "%~dp0"

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

echo Building for production...
npm run build -- --configuration=production

echo Build completed successfully!
echo Output directory: dist/front-kata/browser
echo The frontend is configured to use AWS backend: http://back-kata-alb-2058729206.us-east-1.elb.amazonaws.com
pause