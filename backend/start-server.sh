#!/bin/bash
# Start AfriChina Backend with WebSocket support

echo "🚀 Starting AfriChina Backend with WebSocket Support..."
echo "📦 Upload limit: 50MB | Post limit: 128MB | Memory: 256MB"
echo ""

cd "$(dirname "$0")"

# Ensure NODE_PATH is set for ES modules
export NODE_PATH=/usr/local/lib/node_modules

# Start Laravel on port 8000 in background
echo "📡 Starting Laravel API on port 8000..."
php -d upload_max_filesize=50M \
    -d post_max_size=128M \
    -d memory_limit=256M \
    -d max_execution_time=300 \
    artisan serve --host=0.0.0.0 --port=8000 &

LARAVEL_PID=$!

# Wait for Laravel to start
sleep 3

# Start Socket.IO WebSocket bridge on port 5000 in background
echo "🔌 Starting WebSocket Bridge on port 5000..."
node ws-bridge.js &

WS_PID=$!

echo ""
echo "✅ Servers running:"
echo "   - Laravel API: http://localhost:8000"
echo "   - WebSocket:   ws://localhost:5000"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for any process to exit
wait
