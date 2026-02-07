
-- XACK Cybersecurity Platform - Database Schema
-- DBMS: MySQL 8.0+

CREATE DATABASE IF NOT EXISTS xack_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE xack_platform;

-- 1. USERS & AUTHENTICATION
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255) DEFAULT 'https://picsum.photos/seed/user/200/200',
    rank_title VARCHAR(50) DEFAULT 'Novice Operative',
    total_xp INT DEFAULT 0,
    level INT DEFAULT 1,
    bio TEXT,
    invite_code VARCHAR(20),
    is_admin BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. LABS & MACHINES
CREATE TABLE machines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    difficulty ENUM('Easy', 'Medium', 'Hard', 'Insane') NOT NULL,
    os ENUM('Linux', 'Windows', 'Android', 'Other') NOT NULL,
    xp_reward INT NOT NULL,
    base_points INT NOT NULL,
    ip_address VARCHAR(45),
    image_url VARCHAR(255),
    icon_name VARCHAR(50) DEFAULT 'terminal',
    description TEXT,
    creator_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 3. FLAGS (User and Root for each machine)
CREATE TABLE flags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    machine_id INT NOT NULL,
    type ENUM('User', 'Root', 'Secret') NOT NULL,
    flag_hash VARCHAR(255) NOT NULL, -- SHA256 of the flag string
    points INT NOT NULL,
    FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE
);

-- 4. USER PROGRESS & SUBMISSIONS
CREATE TABLE user_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    flag_id INT NOT NULL,
    submitted_flag VARCHAR(255) NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (flag_id) REFERENCES flags(id) ON DELETE CASCADE
);

CREATE TABLE user_machine_status (
    user_id INT NOT NULL,
    machine_id INT NOT NULL,
    progress INT DEFAULT 0, -- 0 to 100
    user_flag_captured BOOLEAN DEFAULT FALSE,
    root_flag_captured BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    PRIMARY KEY (user_id, machine_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE
);

-- 5. BADGES & ACHIEVEMENTS
CREATE TABLE badges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_name VARCHAR(50),
    rarity ENUM('Common', 'Rare', 'Epic', 'Legendary') DEFAULT 'Common'
);

CREATE TABLE user_badges (
    user_id INT NOT NULL,
    badge_id INT NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, badge_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE
);

-- 6. ARENA 1V1
CREATE TABLE arena_matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    machine_id INT NOT NULL,
    player_a_id INT NOT NULL,
    player_b_id INT NOT NULL,
    status ENUM('Searching', 'Live', 'Finished', 'Canceled') DEFAULT 'Live',
    player_a_progress INT DEFAULT 0,
    player_b_progress INT DEFAULT 0,
    winner_id INT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP NULL,
    FOREIGN KEY (machine_id) REFERENCES machines(id),
    FOREIGN KEY (player_a_id) REFERENCES users(id),
    FOREIGN KEY (player_b_id) REFERENCES users(id),
    FOREIGN KEY (winner_id) REFERENCES users(id)
);

-- 7. LEARNING PATHS (ACADEMY)
CREATE TABLE learning_paths (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    difficulty ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Beginner',
    image_url VARCHAR(255),
    estimated_duration VARCHAR(50)
);

CREATE TABLE learning_modules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    path_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    content_markdown TEXT,
    order_index INT NOT NULL,
    FOREIGN KEY (path_id) REFERENCES learning_paths(id) ON DELETE CASCADE
);

-- 8. NOTIFICATIONS & SOCIAL
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('System', 'Social', 'Rank', 'Challenge') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority ENUM('low', 'medium', 'high') DEFAULT 'low',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action_text VARCHAR(255) NOT NULL,
    points_change VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 9. BILLING & SUBSCRIPTIONS
CREATE TABLE subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    plan_name ENUM('Operative', 'Vanguard', 'Nightfall') NOT NULL,
    status ENUM('Active', 'Canceled', 'Past Due', 'Expired') DEFAULT 'Active',
    next_renewal_at TIMESTAMP,
    stripe_subscription_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- INITIAL SEED DATA
INSERT INTO badges (name, description, icon_name, rarity) VALUES 
('First Blood', 'First to capture a flag on a newly released machine.', 'military_tech', 'Epic'),
('Pwnage Master', 'Capture 100 Root flags.', 'workspace_premium', 'Legendary'),
('Ghost in the Shell', 'Capture a flag without being detected by the sandbox IDS.', 'visibility_off', 'Rare');

INSERT INTO machines (name, difficulty, os, xp_reward, base_points, ip_address, image_url) VALUES 
('Reader', 'Easy', 'Linux', 200, 20, '10.10.11.243', 'https://picsum.photos/seed/reader/600/300'),
('Vault-X', 'Hard', 'Linux', 800, 50, '10.10.11.100', 'https://picsum.photos/seed/vault/600/300');

-- END OF SCHEMA
