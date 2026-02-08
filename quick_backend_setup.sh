#!/bin/bash
set -e

echo "=== Checking MySQL ==="
if ! command -v mysql &> /dev/null; then
    echo "Installing MySQL..."
    apt install -y mysql-server
else
    echo "MySQL already installed, skipping..."
fi

echo "=== Configuring MySQL ==="
mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'XackDB2026!@#';" 2>/dev/null || echo "Root user already configured"
mysql -u root -p'XackDB2026!@#' -e "CREATE DATABASE IF NOT EXISTS xack_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p'XackDB2026!@#' -e "CREATE USER IF NOT EXISTS 'xack_user'@'localhost' IDENTIFIED BY 'XackUser2026!@#';" 2>/dev/null || echo "User already exists"
mysql -u root -p'XackDB2026!@#' -e "GRANT ALL PRIVILEGES ON xack_platform.* TO 'xack_user'@'localhost';"
mysql -u root -p'XackDB2026!@#' -e "FLUSH PRIVILEGES;"

echo "=== Importing Database Schema ==="
mysql -u root -p'XackDB2026!@#' xack_platform < /opt/xack/database.sql

echo "=== Installing Backend Dependencies ==="
cd /opt/xack/backend
npm install

echo "=== Starting Backend API with PM2 ==="
npm install -g pm2 2>/dev/null || echo "PM2 already installed"
pm2 delete xack-backend 2>/dev/null || true
pm2 start server.js --name xack-backend
pm2 save
pm2 startup systemd -u root --hp /root

echo "=== Checking Status ==="
pm2 list
sleep 2
curl http://localhost:3001/api/health || echo "API not responding yet"

echo "✅ Backend Setup Complete!"
