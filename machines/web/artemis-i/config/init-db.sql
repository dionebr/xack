-- ARTEMIS I Monitoring Database

CREATE TABLE IF NOT EXISTS sensors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sensor_name VARCHAR(100) NOT NULL,
    location VARCHAR(200),
    status ENUM('online', 'offline', 'maintenance') DEFAULT 'online',
    last_reading DECIMAL(10,2),
    last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    role ENUM('viewer', 'operator', 'admin') DEFAULT 'viewer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    log_level ENUM('INFO', 'WARNING', 'ERROR', 'CRITICAL') DEFAULT 'INFO',
    message TEXT,
    source VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS secrets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    key_name VARCHAR(100) NOT NULL,
    key_value TEXT NOT NULL,
    access_level ENUM('public', 'user', 'admin', 'root') DEFAULT 'public'
);

-- Inserir dados de exemplo
INSERT INTO sensors (sensor_name, location, status, last_reading) VALUES
('Temperature Sensor A1', 'Server Room', 'online', 22.5),
('Humidity Sensor B2', 'Data Center', 'online', 45.2),
('Pressure Sensor C3', 'Main Hall', 'maintenance', 1013.25),
('Motion Detector D4', 'Entrance', 'online', 0);

-- Usuários (senha: admin123 para todos, hash MD5 simples para CTF)
INSERT INTO users (username, password, email, role) VALUES
('admin', '0192023a7bbd73250516f069df18b500', 'admin@uhclabs.com', 'admin'),
('operator', '0192023a7bbd73250516f069df18b500', 'operator@uhclabs.com', 'operator'),
('viewer', '0192023a7bbd73250516f069df18b500', 'viewer@uhclabs.com', 'viewer');

-- Logs do sistema
INSERT INTO system_logs (log_level, message, source) VALUES
('INFO', 'System initialized successfully', 'core'),
('WARNING', 'Sensor C3 entered maintenance mode', 'sensor_monitor'),
('INFO', 'User admin logged in', 'auth'),
('ERROR', 'Failed authentication attempt from 192.168.1.100', 'auth');

-- Secrets (FLAGS)
INSERT INTO secrets (key_name, key_value, access_level) VALUES
('API_PUBLIC_KEY', 'XACK{f3d4b2a1c9e8d7f6a5b4c3d2e1f0a9b8}', 'public'),
('USER_TOKEN', 'XACK{a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4}', 'user'),
('ADMIN_SECRET', 'XACK{c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0}', 'admin'),
('ROOT_MASTER_KEY', 'XACK{e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6}', 'root');
