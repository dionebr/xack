#!/bin/bash

# Cleanup Old Machines Script
# Stops machines running for more than 2 hours

echo "🧹 Cleaning up old machine instances..."

# Get instances older than 2 hours
mysql -u root -p'XackDB2026!@#' xack_platform -N -e "
SELECT user_id, machine_id, container_name 
FROM user_machine_instances 
WHERE status = 'running' 
AND started_at < DATE_SUB(NOW(), INTERVAL 2 HOUR);
" | while read user_id machine_id container_name; do
    echo "Stopping old instance: $container_name (running > 2h)"
    docker-compose -p "$container_name" down 2>/dev/null
    
    # Update database
    mysql -u root -p'XackDB2026!@#' xack_platform << EOF
UPDATE user_machine_instances 
SET status = 'stopped', stopped_at = NOW()
WHERE container_name = '$container_name';
EOF
done

# Remove dangling containers
echo "Removing dangling containers..."
docker container prune -f

echo "✅ Cleanup complete!"
