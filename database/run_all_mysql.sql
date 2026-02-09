-- =============================================================================
-- MySQL Batch Execution Script
-- =============================================================================
-- This file runs all SQL files in the database directory
-- Usage: mysql -u username -p database_name < run_all_mysql.sql
-- Or from MySQL CLI: SOURCE /path/to/run_all_mysql.sql
-- =============================================================================

-- Display script information
SELECT 'Starting MySQL Batch Execution...' AS Status;
SELECT NOW() AS 'Execution Start Time';

-- =============================================================================
-- 1. SELECT DATABASE
-- =============================================================================
SELECT '>> Using database: db_assignment2' AS Status;
USE db_assignment2;

-- =============================================================================
-- 2. STORED PROCEDURES
-- =============================================================================
SELECT '>> Executing: procedure/stored_procedure.sql' AS Status;
SOURCE procedure/stored_procedure.sql;

SELECT '>> Executing: procedure/authentication.sql' AS Status;
SOURCE procedure/authentication.sql;

SELECT '>> Executing: procedure/branch.sql' AS Status;
SOURCE procedure/branch.sql;

SELECT '>> Executing: procedure/receipt.sql' AS Status;
SOURCE procedure/receipt.sql;

SELECT '>> Executing: procedure/alert.sql' AS Status;
SOURCE procedure/alert.sql;

SELECT '>> Executing: procedure/get_all_receipts.sql' AS Status;
SOURCE procedure/get_all_receipts.sql;

SELECT '>> Executing: procedure/get_detail_customer.sql' AS Status;
SOURCE procedure/get_detail_customer.sql;

-- =============================================================================
-- 3. FUNCTIONS
-- =============================================================================
SELECT '>> Executing: function/3_function.sql' AS Status;
SOURCE function/3_function.sql;

SELECT '>> Executing: function/dashboard_stats.sql' AS Status;
SOURCE function/dashboard_stats.sql;

SELECT '>> Executing: function/dashboard_enhancements.sql' AS Status;
SOURCE function/dashboard_enhancements.sql;

-- =============================================================================
-- 4. TRIGGERS
-- =============================================================================
SELECT '>> Executing: trigger/db_triggers.sql' AS Status;
SOURCE trigger/db_triggers.sql;

SELECT '>> Executing: trigger/create_data_trigger.sql' AS Status;
SOURCE trigger/create_data_trigger.sql;

-- =============================================================================
-- 5. TEST FILES
-- =============================================================================
SELECT '>> Executing: testprocedure.sql' AS Status;
SOURCE testprocedure.sql;

SELECT '>> Executing: Test/trigger_test.sql' AS Status;
SOURCE Test/trigger_test.sql;

-- =============================================================================
-- 6. ADDITIONAL FILES
-- =============================================================================
SELECT '>> Executing: assignment_report.sql' AS Status;
SOURCE assignment_report.sql;

SELECT '>> Executing: all/db_assignment2.sql' AS Status;
SOURCE all/db_assignment2.sql;

-- =============================================================================
-- COMPLETION
-- =============================================================================
SELECT '================================' AS '';
SELECT 'All SQL files executed successfully!' AS Status;
SELECT NOW() AS 'Execution End Time';
SELECT '================================' AS '';

-- Display final database statistics
SELECT 'Database Statistics:' AS '';
SELECT 
    TABLE_NAME AS 'Table', 
    TABLE_ROWS AS 'Rows',
    ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'db_assignment2'
ORDER BY TABLE_NAME;
