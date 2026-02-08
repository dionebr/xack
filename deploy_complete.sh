#!/bin/bash

# Complete VPS Deployment Script
# Run this on VPS to setup everything

set -e

echo "=== XACK Complete Deployment ==="

# 1. Pull latest code
echo "[1/6] Pulling latest code..."
cd /opt/xack
git pull origin master

# 2. Install MySQL, PHP, phpMyAdmin
echo "[2/6] Installing MySQL, PHP, phpMyAdmin..."
sed -i 's/\r$//' /opt/xack/setup_backend.sh
chmod +x /opt/xack/setup_backend.sh
/opt/xack/setup_backend.sh

# 3. Import database schema
echo "[3/6] Importing database schema..."
mysql -u root -p'XackDB2026!@#' xack_platform < /opt/xack/database.sql

# 4. Install backend dependencies
echo "[4/6] Installing backend dependencies..."
cd /opt/xack/backend
npm install

# 5. Setup PM2 for backend
echo "[5/6] Setting up PM2..."
npm install -g pm2
pm2 delete xack-backend || true
pm2 start server.js --name xack-backend
pm2 save
pm2 startup

# 6. Rebuild frontend
echo "[6/6] Rebuilding frontend..."
cd /opt/xack
npm run build
systemctl restart nginx

echo "✅ Deployment Complete!"
echo "Frontend: http://${SERVER_IP}"
echo "phpMyAdmin: http://${SERVER_IP}/phpmyadmin"
echo "API: http://${SERVER_IP}/api/health"
