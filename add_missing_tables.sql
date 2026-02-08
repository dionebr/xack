-- Add Missing Tables to Production Database
USE xack_platform;

-- Create user_flags table (tracks which flags users have captured)
CREATE TABLE IF NOT EXISTS user_flags (
    user_id INT NOT NULL,
    flag_id INT NOT NULL,
    captured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, flag_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (flag_id) REFERENCES flags(id) ON DELETE CASCADE,
    INDEX idx_user_flags_user (user_id),
    INDEX idx_user_flags_flag (flag_id)
);

-- Verify table was created
SELECT 'user_flags table created successfully' as status;
