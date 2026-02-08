#!/bin/bash

# Stop Machine Script
# Usage: ./stop-machine.sh <machine_slug> <user_id>

MACHINE_SLUG=$1
USER_ID=$2

if [ -z "$MACHINE_SLUG" ] || [ -z "$USER_ID" ]; then
    echo "Usage: ./stop-machine.sh <machine_slug> <user_id>"
    exit 1
fi

CONTAINER_NAME="${MACHINE_SLUG}-user-${USER_ID}"

# Find machine directory (could be in web/, pwn/, crypto/, etc.)
MACHINE_DIR=$(find /opt/xack/machines -type d -name "$MACHINE_SLUG" | head -n 1)

echo "🛑 Stopping machine: $MACHINE_SLUG for user $USER_ID"

# Check if machine directory exists
if [ -z "$MACHINE_DIR" ] || [ ! -d "$MACHINE_DIR" ]; then
    echo "❌ Machine directory not found for: $MACHINE_SLUG"
    exit 1
fi

echo "📂 Found machine at: $MACHINE_DIR"

# Navigate to machine directory and stop containers
cd "$MACHINE_DIR" || exit 1

docker-compose -p "${CONTAINER_NAME}" down

if [ $? -eq 0 ]; then
    echo "✅ Machine stopped successfully!"

    # Update database (using machine_id as INT, not slug)
    MACHINE_ID=$(mysql -u xack_user -p'XackUser2026!@#' xack_platform -sN -e "SELECT id FROM machines WHERE slug = '$MACHINE_SLUG' LIMIT 1")
    
    if [ -n "$MACHINE_ID" ]; then
        mysql -u xack_user -p'XackUser2026!@#' xack_platform << EOF
UPDATE user_machine_instances
SET status = 'stopped', stopped_at = NOW()
WHERE user_id = $USER_ID AND machine_id = $MACHINE_ID;
EOF
        echo "✅ Database updated"
    else
        echo "⚠️  Warning: Could not find machine ID for slug '$MACHINE_SLUG'"
    fi

else
    echo "❌ Failed to stop machine"
    exit 1
fi
