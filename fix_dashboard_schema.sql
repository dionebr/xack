-- Fix Dashboard 500 Error Schema Migration
USE xack_platform;

-- 1. Fix 'activities' table missing 'machine_id' column
-- This is likely the main cause of the 500 error (Unknown column 'a.machine_id')
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='xack_platform' AND TABLE_NAME='activities' AND COLUMN_NAME='machine_id');
SET @sql := IF(@exist = 0, 'ALTER TABLE activities ADD COLUMN machine_id INT AFTER user_id', 'SELECT "Column machine_id already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add Foreign Key constraint for safety (only if column exists)
SET @exist_fk := (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA='xack_platform' AND TABLE_NAME='activities' AND CONSTRAINT_NAME='fk_activities_machine');
SET @sql_fk := IF(@exist_fk = 0, 'ALTER TABLE activities ADD CONSTRAINT fk_activities_machine FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE SET NULL', 'SELECT "Constraint fk_activities_machine already exists"');
PREPARE stmt_fk FROM @sql_fk;
EXECUTE stmt_fk;
DEALLOCATE PREPARE stmt_fk;


-- 2. Fix 'user_machine_instances' table 'machine_id' type (VARCHAR -> INT)
-- First check if it's already INT
SET @is_int := (SELECT IF(DATA_TYPE = 'int', 1, 0) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='xack_platform' AND TABLE_NAME='user_machine_instances' AND COLUMN_NAME='machine_id');

-- Only run conversion if it's NOT int
SET @sql_convert := IF(@is_int = 0, 
    'ALTER TABLE user_machine_instances MODIFY COLUMN machine_id INT NOT NULL', 
    'SELECT "machine_id is already INT"'
);

-- Note: This ALTER TABLE might fail if existing rows have non-integer values (like slugs 'artemis-i').
-- Ideally we would clean up data first, but assuming dev environment is fresh or clean enough.
-- If it fails, run: TRUNCATE TABLE user_machine_instances; (WARNING: DELETES RUNNING INSTANCES)

PREPARE stmt_convert FROM @sql_convert;
EXECUTE stmt_convert;
DEALLOCATE PREPARE stmt_convert;

-- 3. Ensure foreign key exists on user_machine_instances
SET @exist_fk_umi := (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA='xack_platform' AND TABLE_NAME='user_machine_instances' AND CONSTRAINT_NAME='fk_umi_machine');
SET @sql_fk_umi := IF(@exist_fk_umi = 0, 'ALTER TABLE user_machine_instances ADD CONSTRAINT fk_umi_machine FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE', 'SELECT "Constraint fk_umi_machine already exists"');
PREPARE stmt_fk_umi FROM @sql_fk_umi;
EXECUTE stmt_fk_umi;
DEALLOCATE PREPARE stmt_fk_umi;

SELECT "Migration Completed Successfully" as status;
