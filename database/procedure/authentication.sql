select * from customerphone;

DELIMITER $$

DROP PROCEDURE IF exists login_customer $$
CREATE PROCEDURE login_customer
(
    IN p_email VARCHAR(100),
    IN p_password VARCHAR(255)
)
BEGIN
    DECLARE v_customer_id INT;

    -- Check if customer exists and password matches
    SELECT Customer_id INTO v_customer_id
    FROM Customer
    WHERE Email = p_email AND Password = p_password;
    
    -- Check for existence
    IF v_customer_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Invalid email or password.';
    END IF;
    
    -- Login successful, return customer data including phone number from CustomerPhone
    SELECT
        C.Customer_id as Customer_id,
        C.FName as FName,
        C.LName as LName,
        C.Gender as Gender,
        C.Email as Email,
        -- Use MAX(CP.Phone_number) to return a single phone number if multiple exist.
        -- If no phone number exists, this will return NULL.
        MAX(CP.CPhone) AS Phone,
        DATE_FORMAT(C.Date_of_birth, '%d/%m/%Y') AS Date_of_birth,
        C.Membership_id as Membership_id,
        C.Loyal_point as Loyal_point
    FROM Customer C
    LEFT JOIN CustomerPhone CP ON C.Customer_id = CP.Customer_id
    WHERE C.Customer_id = v_customer_id
    GROUP BY 
        C.Customer_id, C.FName, C.LName, C.Gender, C.Email, 
        C.Date_of_birth, C.Membership_id, C.Loyal_point;
    
END $$

DROP PROCEDURE IF exists login_admin $$
CREATE PROCEDURE login_admin 
(
    IN p_email VARCHAR(100),
    IN p_password VARCHAR(255)
)
BEGIN
    DECLARE v_admin_id INT;
    
    -- Check if admin exists and get ID
    SELECT Admin_id INTO v_admin_id
    FROM Admin
    WHERE Email = p_email AND Password = p_password;
    
    -- Check for existence
    IF v_admin_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Invalid email or password.';
    END IF;
    
    -- Login successful, return admin data including the calculated Role and Phone
    SELECT 
        A.Admin_id, 
        A.Name, 
        A.Gender, 
        DATE_FORMAT(A.Date_of_birth, '%Y-%m-%d') AS Date_of_birth, 
        A.Email, 
        MAX(AP.APhone) AS Phone,
        A.Branch_id,
        B.Name as Branch_Name, 
        A.Admin_Manager_id,
        CASE 
            WHEN A.Admin_Manager_id IS NULL THEN 'primary'
            ELSE 'regular'
        END AS Role
    FROM Admin A
    LEFT JOIN AdminPhone AP ON A.Admin_id = AP.Admin_id
    LEFT JOIN Cinema_Branch B ON A.Branch_id = B.Branch_id
    WHERE A.Admin_id = v_admin_id
    GROUP BY A.Admin_id, A.Name, A.Gender, A.Date_of_birth, A.Email, A.Branch_id, B.Name, A.Admin_Manager_id;
    
END $$

DROP PROCEDURE IF EXISTS get_all_admins $$
CREATE PROCEDURE get_all_admins()
BEGIN
    SELECT 
        A.Admin_id, 
        A.Name, 
        A.Gender, 
        DATE_FORMAT(A.Date_of_birth, '%Y-%m-%d') AS Date_of_birth, 
        A.Email, 
        MAX(AP.APhone) AS Phone,
        A.Branch_id,
        B.Name as Branch_Name,
        A.Admin_Manager_id,
        CASE 
            WHEN A.Admin_Manager_id IS NULL THEN 'primary'
            ELSE 'regular'
        END AS Role
    FROM Admin A
    LEFT JOIN AdminPhone AP ON A.Admin_id = AP.Admin_id
    LEFT JOIN Cinema_Branch B ON A.Branch_id = B.Branch_id
    GROUP BY A.Admin_id, A.Name, A.Gender, A.Date_of_birth, A.Email, A.Branch_id, B.Name, A.Admin_Manager_id;
END $$

DROP PROCEDURE IF EXISTS create_admin $$
CREATE PROCEDURE create_admin
(
    IN p_name VARCHAR(100),
    IN p_email VARCHAR(100),
    IN p_password VARCHAR(255),
    IN p_gender VARCHAR(10),
    IN p_dob DATE,
    IN p_phone VARCHAR(15),
    IN p_branch_id INT,
    IN p_role VARCHAR(20) -- 'primary' or 'regular'
)
BEGIN
    DECLARE v_admin_id INT;
    DECLARE v_manager_id INT;

    -- Check if email exists
    IF EXISTS (SELECT 1 FROM Admin WHERE Email = p_email) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Email already exists.';
    END IF;

    -- Determine Manager ID
    IF p_role = 'regular' THEN
        -- Assign to the first primary admin found (or specific logic if needed)
        SELECT Admin_id INTO v_manager_id FROM Admin WHERE Admin_Manager_id IS NULL LIMIT 1;
        IF v_manager_id IS NULL THEN
             SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: No primary admin found to assign as manager.';
        END IF;
    ELSE
        SET v_manager_id = NULL;
    END IF;

    -- Insert into Admin
    INSERT INTO Admin (Name, Gender, Date_of_birth, Email, Branch_id, Admin_Manager_id, Password)
    VALUES (p_name, p_gender, p_dob, p_email, p_branch_id, v_manager_id, p_password);

    SET v_admin_id = LAST_INSERT_ID();

    -- Insert into AdminPhone if provided
    IF p_phone IS NOT NULL AND p_phone != '' THEN
        INSERT INTO AdminPhone (Admin_id, APhone) VALUES (v_admin_id, p_phone);
    END IF;

    -- Return the new admin data
    SELECT 
        A.Admin_id, 
        A.Name, 
        A.Gender, 
        DATE_FORMAT(A.Date_of_birth, '%Y-%m-%d') AS Date_of_birth, 
        A.Email, 
        MAX(AP.APhone) AS Phone,
        A.Branch_id,
        B.Name as Branch_Name,
        A.Admin_Manager_id,
        CASE 
            WHEN A.Admin_Manager_id IS NULL THEN 'primary'
            ELSE 'regular'
        END AS Role
    FROM Admin A
    LEFT JOIN AdminPhone AP ON A.Admin_id = AP.Admin_id
    LEFT JOIN Cinema_Branch B ON A.Branch_id = B.Branch_id
    WHERE A.Admin_id = v_admin_id
    GROUP BY A.Admin_id, A.Name, A.Gender, A.Date_of_birth, A.Email, A.Branch_id, B.Name, A.Admin_Manager_id;

END $$

DELIMITER ;

DELIMITER $$

DROP PROCEDURE IF EXISTS change_customer_password $$
CREATE PROCEDURE change_customer_password
(
    IN p_customer_id INT,
    IN p_old_password VARCHAR(255),
    IN p_new_password VARCHAR(255)
)
BEGIN
    DECLARE v_exists INT;

    -- Verify old password
    SELECT COUNT(*) INTO v_exists
    FROM Customer
    WHERE Customer_id = p_customer_id AND Password = p_old_password;

    IF v_exists = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Invalid old password.';
    END IF;

    -- Update password
    UPDATE Customer
    SET Password = p_new_password
    WHERE Customer_id = p_customer_id;

    SELECT 'Password updated successfully' AS message;
END $$

DROP PROCEDURE IF EXISTS change_admin_password $$
CREATE PROCEDURE change_admin_password
(
    IN p_admin_id INT,
    IN p_old_password VARCHAR(255),
    IN p_new_password VARCHAR(255)
)
BEGIN
    DECLARE v_exists INT;

    -- Verify old password
    SELECT COUNT(*) INTO v_exists
    FROM Admin
    WHERE Admin_id = p_admin_id AND Password = p_old_password;

    IF v_exists = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Invalid old password.';
    END IF;

    -- Update password
    UPDATE Admin
    SET Password = p_new_password
    WHERE Admin_id = p_admin_id;

    SELECT 'Password updated successfully' AS message;
END $$

DROP PROCEDURE IF EXISTS update_admin_profile $$
CREATE PROCEDURE update_admin_profile
(
    IN p_admin_id INT,
    IN p_name VARCHAR(255),
    IN p_gender VARCHAR(10),
    IN p_dob DATE,
    IN p_email VARCHAR(255),
    IN p_branch_id INT,
    IN p_phone VARCHAR(15)
)
BEGIN
    -- Validate phone number (must be 10 digits)
    IF p_phone IS NOT NULL AND p_phone NOT REGEXP '^[0-9]{10}$' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Phone number must be 10 digits.';
    END IF;

    -- Check if email is being changed and if it's already taken
    IF EXISTS (SELECT 1 FROM Admin WHERE Email = p_email AND Admin_id != p_admin_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Email already exists.';
    END IF;

    UPDATE Admin
    SET 
        Name = p_name,
        Gender = p_gender,
        Date_of_birth = p_dob,
        Email = p_email,
        Branch_id = p_branch_id
    WHERE Admin_id = p_admin_id;

    -- Update Phone Number
    -- Strategy: Delete existing and insert new one to ensure single phone number per admin for this context
    IF p_phone IS NOT NULL THEN
        DELETE FROM AdminPhone WHERE Admin_id = p_admin_id;
        INSERT INTO AdminPhone (Admin_id, APhone) VALUES (p_admin_id, p_phone);
    END IF;

    SELECT 'Admin profile updated successfully' AS message;
END $$

DELIMITER ;