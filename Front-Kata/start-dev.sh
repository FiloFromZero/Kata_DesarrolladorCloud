#!/bin/bash

echo "Starting Angular development server..."
echo "Backend API URL: http://localhost:8080"
echo "Frontend will be available at: http://localhost:4200"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

echo "Starting development server..."
npm run start