#!/bin/bash

# Stop Machine Script
# Usage: ./stop-machine.sh <machine_id> <user_id>

MACHINE_ID=$1
USER_ID=$2

if [ -z "$MACHINE_ID" ] || [ -z "$USER_ID" ]; then
    echo "Usage: ./stop-machine.sh <machine_id> <user_id>"
    exit 1
fi

CONTAINER_NAME="${MACHINE_ID}-user-${USER_ID}"

echo "🛑 Stopping machine: $MACHINE_ID for user $USER_ID"

# Stop and remove containers
docker-compose -p "${CONTAINER_NAME}" down

if [ $? -eq 0 ]; then
    echo "✅ Machine stopped successfully!"
    
    # Update database
    mysql -u root -p'XackDB2026!@#' xack_platform << EOF
UPDATE user_machine_instances 
SET status = 'stopped', stopped_at = NOW()
WHERE user_id = $USER_ID AND machine_id = '$MACHINE_ID';
EOF
    
else
    echo "❌ Failed to stop machine"
    exit 1
fi
