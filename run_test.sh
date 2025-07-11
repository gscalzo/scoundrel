#!/bin/bash

# Quick test script for weapon stack visualization
echo "🎮 Starting Weapon Stack Visualization Test..."

# Check if server is already running
if lsof -i :8000 > /dev/null 2>&1; then
    echo "✅ Server already running on port 8000"
else
    echo "🚀 Starting local server on port 8000..."
    # Try Python 3 first, then Python 2, then npx
    if command -v python3 > /dev/null 2>&1; then
        python3 -m http.server 8000 > /dev/null 2>&1 &
        SERVER_PID=$!
        echo "📊 Started server with Python 3 (PID: $SERVER_PID)"
    elif command -v python > /dev/null 2>&1; then
        python -m SimpleHTTPServer 8000 > /dev/null 2>&1 &
        SERVER_PID=$!
        echo "📊 Started server with Python 2 (PID: $SERVER_PID)"
    elif command -v npx > /dev/null 2>&1; then
        npx http-server -p 8000 > /dev/null 2>&1 &
        SERVER_PID=$!
        echo "📊 Started server with npx (PID: $SERVER_PID)"
    else
        echo "❌ No suitable server found. Please install Python or Node.js."
        exit 1
    fi
    
    # Wait for server to start
    sleep 2
fi

echo ""
echo "🔧 Test Instructions:"
echo "1. Open your browser and navigate to:"
echo "   http://localhost:8000/test_stack.html"
echo ""
echo "2. Click the test buttons to see weapon stack visualization:"
echo "   • 'Test Normal Stack' - Shows progressive stacking of 4 monsters"
echo "   • 'Test Overflow Stack' - Shows overflow indicator for 7 monsters"
echo "   • 'Clear Test' - Resets the test"
echo ""
echo "3. Expected behavior:"
echo "   • Weapon appears as base layer (fully visible)"
echo "   • Monsters stack on top with progressive offsets"
echo "   • Each monster partially covers the previous one"
echo "   • Overflow shows '+2' indicator when more than 5 monsters"
echo ""
echo "4. To test the full game:"
echo "   http://localhost:8000/index.html"
echo ""

# Check if we can open the browser automatically
if command -v open > /dev/null 2>&1; then
    echo "🌐 Opening test page in browser..."
    open "http://localhost:8000/test_stack.html"
elif command -v xdg-open > /dev/null 2>&1; then
    echo "🌐 Opening test page in browser..."
    xdg-open "http://localhost:8000/test_stack.html"
else
    echo "💡 Please manually open: http://localhost:8000/test_stack.html"
fi

echo ""
echo "⏹️  Press Ctrl+C to stop the server when finished testing"

# Keep script running if we started the server
if [ ! -z "$SERVER_PID" ]; then
    trap "kill $SERVER_PID 2>/dev/null; echo '🛑 Server stopped'" EXIT
    wait
fi