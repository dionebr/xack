-- Fix user_machine_instances schema for API compatibility
USE xack_platform;

-- 1. Modify machine_id to be INT (if it was VARCHAR) to match machines.id
ALTER TABLE user_machine_instances MODIFY COLUMN machine_id INT NOT NULL;

-- 2. Ensure status enum matches what the API expects ('starting', 'running', 'stopped', 'error')
-- Table definition already has this correct, but let's be safe.
ALTER TABLE user_machine_instances MODIFY COLUMN status ENUM('starting', 'running', 'stopped', 'error') DEFAULT 'starting';

-- 3. Add Foreign Key if missing (and clean up any bad data first)
DELETE FROM user_machine_instances WHERE machine_id NOT IN (SELECT id FROM machines);
ALTER TABLE user_machine_instances ADD CONSTRAINT fk_umi_machine FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE;

-- 4. Verify activities table schema for join
-- Ensure user_id and machine_id are INTs and indexed
ALTER TABLE activities ADD COLUMN machine_id INT AFTER user_id;
ALTER TABLE activities ADD CONSTRAINT fk_activities_machine FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE SET NULL;
