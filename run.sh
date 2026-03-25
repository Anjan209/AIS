#!/bin/bash

echo "Starting VACHA SHIELD - Voice Deepfake Detection System"
echo ""
echo "This script will start both the Flask backend and React frontend."
echo "Make sure you have installed all dependencies:"
echo "  - Node.js dependencies: npm install"
echo "  - Python dependencies: pip install -r requirements.txt"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed"
    exit 1
fi

# Check if Node is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    exit 1
fi

echo "Starting Flask backend server..."
python3 server.py &
BACKEND_PID=$!

sleep 2

echo "Starting Vite development server..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "Backend running at: http://localhost:5000"
echo "Frontend running at: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for both processes
wait
