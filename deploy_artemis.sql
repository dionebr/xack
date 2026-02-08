USE xack_platform;

-- Inserir máquina (usando ID 3 explicitamente para bater com constants.tsx)
INSERT IGNORE INTO machines (id, name, difficulty, os, xp_reward, base_points, ip_address, image_url) VALUES
(3, 'ARTEMIS I', 'Intermediate', 'Linux', 1000, 100, '10.10.11.50', '/assets/machines/artemis-i.png');

-- Inserir flags
INSERT IGNORE INTO flags (machine_id, type, flag_hash, points) VALUES
(3, 'Public', 'f3d4b2a1c9e8d7f6a5b4c3d2e1f0a9b8', 100),
(3, 'User', 'a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4', 200),
(3, 'Admin', 'c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0', 300),
(3, 'Root', 'e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6', 400);
