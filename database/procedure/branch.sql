DELIMITER $$

-- =====================================================================================
-- 1. CREATE_BRANCH
-- Creates a new cinema branch, validates required fields, and assigns a manager (Admin).
-- =====================================================================================
DROP PROCEDURE IF EXISTS create_branch $$
CREATE PROCEDURE create_branch
(
    IN p_name VARCHAR(100),
    IN p_city VARCHAR(100),
    IN p_address VARCHAR(255),
    IN p_admin_id INT,
    IN p_phone VARCHAR(15)
)
BEGIN
    DECLARE v_new_branch_id INT;

    -- --- 1. BASIC FIELD VALIDATION ---
    IF p_name IS NULL OR p_name = '' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Branch Name is required.';
    END IF;
    IF p_city IS NULL OR p_city = '' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Branch City is required.';
    END IF;
    IF p_address IS NULL OR p_address = '' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Branch Address is required.';
    END IF;

    -- --- 2. ADMIN VALIDATION ---
    IF p_admin_id IS NOT NULL THEN
        -- Check if admin exists and is a regular admin (Admin_Manager_id is not NULL)
        IF NOT EXISTS (SELECT 1 FROM Admin WHERE Admin_id = p_admin_id AND Admin_Manager_id IS NOT NULL) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Invalid Admin ID or Admin is not a regular staff member (e.g., they might be a top-level manager).';
        END IF;

        -- Check if admin is already managing a branch
        IF EXISTS (SELECT 1 FROM Cinema_Branch WHERE Admin_id = p_admin_id) THEN
           SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Admin is already managing an existing branch.';
        END IF;
    END IF;

    -- --- 3. PHONE VALIDATION ---
    IF p_phone IS NOT NULL AND p_phone NOT REGEXP '^[0-9]{10}$' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Phone number must be 10 digits.';
    END IF;

    -- --- 4. INSERT BRANCH ---
    INSERT INTO Cinema_Branch (Name, City, Address, Admin_id)
    VALUES (p_name, p_city, p_address, p_admin_id);
    
    SET v_new_branch_id = LAST_INSERT_ID();

    -- --- 5. POST-INSERT ACTIONS ---
    -- Insert Branch Phone
    IF p_phone IS NOT NULL THEN
        INSERT INTO BranchPhone (Branch_id, BPhone) VALUES (v_new_branch_id, p_phone);
    END IF;

    -- Sync Admin table: Link the assigned admin to the new branch
    IF p_admin_id IS NOT NULL THEN
        UPDATE Admin SET Branch_id = v_new_branch_id WHERE Admin_id = p_admin_id;
    END IF;

    -- Return the newly created branch record
    SELECT * FROM Cinema_Branch WHERE Branch_id = v_new_branch_id;
END $$


-- =====================================================================================
-- 2. UPDATE_BRANCH
-- Updates branch details and handles the swap of the branch manager (Admin).
-- =====================================================================================
DROP PROCEDURE IF EXISTS update_branch $$
CREATE PROCEDURE update_branch
(
    IN p_branch_id INT,
    IN p_name VARCHAR(100),
    IN p_city VARCHAR(100),
    IN p_address VARCHAR(255),
    IN p_admin_id INT, -- New Admin ID (NULL to remove manager)
    IN p_phone VARCHAR(15)
)
BEGIN
    DECLARE v_old_admin_id INT;
    
    -- --- 1. CHECK EXISTENCE ---
    IF NOT EXISTS (SELECT 1 FROM Cinema_Branch WHERE Branch_id = p_branch_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Branch not found.';
    END IF;

    -- --- 2. BASIC FIELD VALIDATION (If parameters are mandatory for update) ---
    IF p_name IS NULL OR p_name = '' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Branch Name is required.';
    END IF;
    IF p_city IS NULL OR p_city = '' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Branch City is required.';
    END IF;
    IF p_address IS NULL OR p_address = '' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Branch Address is required.';
    END IF;
    
    -- --- 3. PHONE VALIDATION ---
    IF p_phone IS NOT NULL AND p_phone NOT REGEXP '^[0-9]{10}$' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Phone number must be 10 digits.';
    END IF;

    -- Store the currently assigned admin before update
    SELECT Admin_id INTO v_old_admin_id FROM Cinema_Branch WHERE Branch_id = p_branch_id;

    -- --- 4. ADMIN SWAP/UPDATE LOGIC ---
    IF p_admin_id IS NOT NULL AND p_admin_id <> v_old_admin_id THEN
        -- Check if new admin exists and is regular
        IF NOT EXISTS (SELECT 1 FROM Admin WHERE Admin_id = p_admin_id AND Admin_Manager_id IS NOT NULL) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Invalid Admin ID or Admin is not a regular staff member.';
        END IF;

        -- Check if the new admin is ALREADY managing a *different* branch
        IF EXISTS (SELECT 1 FROM Cinema_Branch WHERE Admin_id = p_admin_id AND Branch_id <> p_branch_id) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Admin is already managing a different branch. Must unassign them first.';
        END IF;

        -- Unlink old admin (if one exists)
        IF v_old_admin_id IS NOT NULL THEN
            UPDATE Admin SET Branch_id = NULL WHERE Admin_id = v_old_admin_id;
        END IF;
        
        -- Link new admin
        UPDATE Admin SET Branch_id = p_branch_id WHERE Admin_id = p_admin_id;

    ELSEIF p_admin_id IS NULL AND v_old_admin_id IS NOT NULL THEN
        -- Case: Manager is being unassigned (set to NULL)
        UPDATE Admin SET Branch_id = NULL WHERE Admin_id = v_old_admin_id;
    END IF;


    -- --- 5. UPDATE BRANCH DETAILS ---
    UPDATE Cinema_Branch
    SET 
        Name = p_name,
        City = p_city,
        Address = p_address,
        Admin_id = p_admin_id -- Include the Admin_id update here
    WHERE Branch_id = p_branch_id;

    -- --- 6. UPDATE BRANCH PHONE ---
    IF p_phone IS NOT NULL THEN
        -- Remove old phones and insert new (assuming we want to replace, not append)
        DELETE FROM BranchPhone WHERE Branch_id = p_branch_id;
        INSERT INTO BranchPhone (Branch_id, BPhone) VALUES (p_branch_id, p_phone);
    END IF;

    -- Return the updated branch record
    SELECT * FROM Cinema_Branch WHERE Branch_id = p_branch_id;
END $$


-- =====================================================================================
-- 3. DELETE_BRANCH
-- Deletes a branch and manually handles related table clean-up.
-- =====================================================================================
DROP PROCEDURE IF EXISTS delete_branch $$
CREATE PROCEDURE delete_branch
(
    IN p_branch_id INT
)
BEGIN
    -- Check if branch exists
    IF NOT EXISTS (SELECT 1 FROM Cinema_Branch WHERE Branch_id = p_branch_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Branch ID does not exist.';
    END IF;

    -- Unassign all admins from this branch (set Branch_id to NULL)
    UPDATE Admin SET Branch_id = NULL WHERE Branch_id = p_branch_id;
    
    -- Delete related data manually (following dependency order)
    
    -- 1. Locate (Event - Branch)
    DELETE FROM Locate WHERE Branch_id = p_branch_id;

    -- 2. Screen (Movie - Branch)
    DELETE FROM Screen WHERE Branch_id = p_branch_id;

    -- 3. Showtime (Should cascade to ShowtimeSeat and Ticket)
    DELETE FROM Showtime WHERE Branch_id = p_branch_id;

    -- 4. Seat (Dependencies of Hall, but sometimes has Branch_id for convenience)
    DELETE FROM Seat WHERE Branch_id = p_branch_id;

    -- 5. Hall (References Branch)
    DELETE FROM Hall WHERE Branch_id = p_branch_id;

    -- 6. BranchPhone (Often cascades, but doesn't hurt to explicitly delete)
    DELETE FROM BranchPhone WHERE Branch_id = p_branch_id;

    -- 7. Finally delete the branch
    DELETE FROM Cinema_Branch WHERE Branch_id = p_branch_id;

    SELECT 'Branch deleted successfully' AS message;
END $$


-- =====================================================================================
-- 4. SP_SEARCHBRANCHES (FIXED)
-- Searches, sorts, and paginates branch records.
-- =====================================================================================
DROP PROCEDURE IF EXISTS sp_SearchBranches $$
CREATE PROCEDURE sp_SearchBranches
(
    IN p_search_query VARCHAR(255),
    IN p_sort_column VARCHAR(50),
    IN p_sort_order VARCHAR(10),
    IN p_page INT,
    IN p_page_size INT,
    OUT p_total_count INT
)
BEGIN
    DECLARE v_offset INT;
    -- Changed v_sql to @v_sql for robust dynamic SQL execution
    DECLARE v_count_sql TEXT;
    DECLARE v_order_clause VARCHAR(100);
    DECLARE v_where_clause TEXT;

    -- Defaults
    SET p_page = IFNULL(p_page, 1);
    SET p_page_size = IFNULL(p_page_size, 10);
    SET v_offset = (p_page - 1) * p_page_size;
    SET p_sort_order = IFNULL(p_sort_order, 'ASC');
    
    -- Validate Sort Column to prevent SQL Injection
    IF p_sort_column NOT IN ('Branch_id', 'Name', 'City', 'Address') THEN
        SET p_sort_column = 'Branch_id';
    END IF;
    
    IF p_sort_order NOT IN ('ASC', 'DESC') THEN
        SET p_sort_order = 'ASC';
    END IF;

    SET v_order_clause = CONCAT(' ORDER BY b.', p_sort_column, ' ', p_sort_order);

    -- Build WHERE clause
    SET v_where_clause = ' WHERE 1=1 ';
    IF p_search_query IS NOT NULL AND p_search_query != '' THEN
        SET v_where_clause = CONCAT(v_where_clause, ' AND (b.Name LIKE CONCAT("%", "', p_search_query, '", "%") OR b.City LIKE CONCAT("%", "', p_search_query, '", "%") OR b.Address LIKE CONCAT("%", "', p_search_query, '", "%"))');
    END IF;

    -- 1. Get Total Count (Uses session variable @sql_count, which is correct)
    SET @sql_count = CONCAT('SELECT COUNT(*) INTO @total FROM Cinema_Branch b ', v_where_clause);
    PREPARE stmt_count FROM @sql_count;
    EXECUTE stmt_count;
    DEALLOCATE PREPARE stmt_count;
    SET p_total_count = @total;

    -- 2. Get Data (FIXED: Using session variable @v_sql for PREPARE)
    SET @v_sql = CONCAT('
        SELECT 
            b.Branch_id,
            b.City,
            b.Address,
            b.Name,
            b.Admin_id,
            MAX(bp.BPhone) AS Phone
        FROM Cinema_Branch b
        LEFT JOIN BranchPhone bp ON b.Branch_id = bp.Branch_id
        ', v_where_clause, '
        GROUP BY b.Branch_id, b.City, b.Address, b.Name, b.Admin_id
        ', v_order_clause, '
        LIMIT ', v_offset, ', ', p_page_size
    );

    PREPARE stmt FROM @v_sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;

END $$

DELIMITER ;