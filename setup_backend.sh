#!/bin/bash

# Backend Infrastructure Setup Script
# Installs MySQL, PHP, phpMyAdmin on Ubuntu VPS

set -e

echo "Starting Backend Infrastructure Setup..."

# 1. Install MySQL Server
echo "Installing MySQL Server..."
apt install -y mysql-server

# Secure MySQL installation (automated)
mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'XackDB2026!@#';"
mysql -e "DELETE FROM mysql.user WHERE User='';"
mysql -e "DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');"
mysql -e "DROP DATABASE IF EXISTS test;"
mysql -e "DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';"
mysql -e "FLUSH PRIVILEGES;"

# Create database and user
echo "Creating xack_platform database..."
mysql -u root -p'XackDB2026!@#' <<EOF
CREATE DATABASE IF NOT EXISTS xack_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'xack_user'@'localhost' IDENTIFIED BY 'XackUser2026!@#';
GRANT ALL PRIVILEGES ON xack_platform.* TO 'xack_user'@'localhost';
FLUSH PRIVILEGES;
EOF

# 2. Install PHP and extensions
echo "Installing PHP and extensions..."
apt install -y php8.3-fpm php8.3-mysql php8.3-cli php8.3-common php8.3-mbstring php8.3-xml php8.3-curl

# 3. Install phpMyAdmin (non-interactive)
echo "Installing phpMyAdmin..."
export DEBIAN_FRONTEND=noninteractive
debconf-set-selections <<< "phpmyadmin phpmyadmin/dbconfig-install boolean true"
debconf-set-selections <<< "phpmyadmin phpmyadmin/app-password-confirm password XackDB2026!@#"
debconf-set-selections <<< "phpmyadmin phpmyadmin/mysql/admin-pass password XackDB2026!@#"
debconf-set-selections <<< "phpmyadmin phpmyadmin/mysql/app-pass password XackDB2026!@#"
debconf-set-selections <<< "phpmyadmin phpmyadmin/reconfigure-webserver multiselect"
apt install -y phpmyadmin

# Configure phpMyAdmin with Nginx
echo "Configuring phpMyAdmin..."
ln -sf /usr/share/phpmyadmin /var/www/html/phpmyadmin

# Update Nginx config to support PHP
cat > /etc/nginx/sites-available/xack <<EOF
server {
  listen 80 default_server;
  server_name _;

  root /opt/xack/dist;
  index index.html;

  location / {
    try_files \$uri /index.html;
  }

  # phpMyAdmin
  location /phpmyadmin {
    root /usr/share;
    index index.php;
    location ~ ^/phpmyadmin/(.+\.php)$ {
      try_files \$uri =404;
      fastcgi_pass unix:/run/php/php8.3-fpm.sock;
      fastcgi_index index.php;
      fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
      include fastcgi_params;
    }
    location ~* ^/phpmyadmin/(.+\.(jpg|jpeg|gif|css|png|js|ico|html|xml|txt))$ {
      root /usr/share;
    }
  }

  # Backend API
  location /api {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host \$host;
    proxy_cache_bypass \$http_upgrade;
  }
}
EOF

systemctl restart nginx
systemctl restart php8.3-fpm

echo "Backend Infrastructure Setup Complete!"
echo "MySQL root password: XackDB2026!@#"
echo "Database: xack_platform"
echo "DB User: xack_user / XackUser2026!@#"
echo "phpMyAdmin: http://YOUR_IP/phpmyadmin"
