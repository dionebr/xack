CREATE DATABASE IF NOT EXISTS challenge_db;
USE challenge_db;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert admin user (vulnerable to SQL injection)
INSERT INTO users (username, password, role) VALUES 
('admin', 'admin123', 'admin'),
('guest', 'guest', 'user');

-- Table with the user flag
CREATE TABLE secrets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100),
    content TEXT,
    for_role VARCHAR(20)
);

INSERT INTO secrets (title, content, for_role) VALUES 
('User Flag', 'XACK{a1b2c3d4e5f6789012345678901234ab}', 'admin'),
('Welcome Message', 'Welcome to the challenge!', 'user');
