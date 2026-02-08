#!/bin/bash

# Start Machine Script
# Usage: ./start-machine.sh <machine_id> <user_id> <category>

MACHINE_ID=$1
USER_ID=$2
CATEGORY=$3

if [ -z "$MACHINE_ID" ] || [ -z "$USER_ID" ] || [ -z "$CATEGORY" ]; then
    echo "Usage: ./start-machine.sh <machine_id> <user_id> <category>"
    exit 1
fi

MACHINE_PATH="/opt/xack/machines/${CATEGORY}/${MACHINE_ID}"
CONTAINER_NAME="${MACHINE_ID}-user-${USER_ID}"

# Check if machine exists
if [ ! -d "$MACHINE_PATH" ]; then
    echo "❌ Machine not found: $MACHINE_PATH"
    exit 1
fi

# Check if already running
if docker ps | grep -q "$CONTAINER_NAME"; then
    echo "⚠️  Machine already running for user $USER_ID"
    docker ps | grep "$CONTAINER_NAME"
    exit 0
fi

# Assign dynamic port
PORT=$((8000 + USER_ID))

echo "🚀 Starting machine: $MACHINE_ID for user $USER_ID"
echo "   Category: $CATEGORY"
echo "   Port: $PORT"

cd "$MACHINE_PATH"

# Start with docker-compose
export USER_ID=$USER_ID
export PORT=$PORT

docker-compose -p "${CONTAINER_NAME}" up -d

if [ $? -eq 0 ]; then
    echo "✅ Machine started successfully!"
    echo "   Access URL: http://localhost:$PORT"
    echo "   Container: $CONTAINER_NAME"
    
    # Register in database
    mysql -u root -p'XackDB2026!@#' xack_platform << EOF
INSERT INTO user_machine_instances (user_id, machine_id, container_name, ip_address, port, status, started_at)
VALUES ($USER_ID, '$MACHINE_ID', '$CONTAINER_NAME', 'localhost', $PORT, 'running', NOW())
ON DUPLICATE KEY UPDATE 
    container_name = '$CONTAINER_NAME',
    port = $PORT,
    status = 'running',
    started_at = NOW();
EOF
    
else
    echo "❌ Failed to start machine"
    exit 1
fi
