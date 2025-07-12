#!/bin/bash

echo "Starting Scoundrel game server..."

# Kill any existing server on port 8000
echo "Checking for existing server on port 8000..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || true

# Signal handler to clean up when script is interrupted
cleanup() {
    echo ""
    echo "Shutting down server..."
    if [ ! -z "$SERVER_PID" ]; then
        kill $SERVER_PID 2>/dev/null
    fi
    # Kill any remaining processes on port 8000
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
    echo "Server stopped. Goodbye!"
    exit 0
}

# Set up signal traps
trap cleanup SIGINT SIGTERM

# Function to open browser
open_browser() {
    echo "Waiting for server to start..."
    sleep 2
    echo "Opening browser..."
    if command -v open &>/dev/null; then
        # macOS
        open http://localhost:8000
    elif command -v xdg-open &>/dev/null; then
        # Linux
        xdg-open http://localhost:8000
    elif command -v start &>/dev/null; then
        # Windows
        start http://localhost:8000
    else
        echo "Could not detect how to open browser automatically."
        echo "Please open http://localhost:8000 in your browser manually."
    fi
}

# Check if Python 3 is available
if command -v python3 &>/dev/null; then
    echo "Starting server with Python 3..."
    # Start server in background and open browser
    python3 -m http.server 8000 &
    SERVER_PID=$!
    open_browser
    echo "Server is running with PID: $SERVER_PID"
    echo "Press Ctrl+C to stop the server and exit."
    wait $SERVER_PID
# Check if Python 2 is available
elif command -v python &>/dev/null; then
    echo "Starting server with Python 2..."
    # Start server in background and open browser
    python -m SimpleHTTPServer 8000 &
    SERVER_PID=$!
    open_browser
    echo "Server is running with PID: $SERVER_PID"
    echo "Press Ctrl+C to stop the server and exit."
    wait $SERVER_PID
# Try with npx
elif command -v npx &>/dev/null; then
    echo "Starting server with npx..."
    # Start server in background and open browser
    npx http-server -p 8000 &
    SERVER_PID=$!
    open_browser
    echo "Server is running with PID: $SERVER_PID"
    echo "Press Ctrl+C to stop the server and exit."
    wait $SERVER_PID
else
    echo "Error: Couldn't find Python or npx to start a local server."
    echo "Please install Python or Node.js to use this script."
    exit 1
fi
