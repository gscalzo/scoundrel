#!/bin/bash

echo "Starting Scoundrel game server..."

# Kill any existing server on port 8000
echo "Checking for existing server on port 8000..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || true

# Check if Python 3 is available
if command -v python3 &>/dev/null; then
    echo "Starting server with Python 3..."
    python3 -m http.server 8000
# Check if Python 2 is available
elif command -v python &>/dev/null; then
    echo "Starting server with Python 2..."
    python -m SimpleHTTPServer 8000
# Try with npx
elif command -v npx &>/dev/null; then
    echo "Starting server with npx..."
    npx http-server -p 8000
else
    echo "Error: Couldn't find Python or npx to start a local server."
    echo "Please install Python or Node.js to use this script."
    exit 1
fi
