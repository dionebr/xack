-- Execute this with: mysql -u root -p < backend/setup_db_user.sql

CREATE DATABASE IF NOT EXISTS xack_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'xack_user'@'localhost' IDENTIFIED BY 'XackUser2026!@#';
GRANT ALL PRIVILEGES ON xack_platform.* TO 'xack_user'@'localhost';
FLUSH PRIVILEGES;

-- Verify
SELECT user, host FROM mysql.user WHERE user = 'xack_user';
