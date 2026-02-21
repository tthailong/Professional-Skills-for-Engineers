USE db_assignment2;

DELIMITER //
CREATE TRIGGER trg_check_movie_duration
BEFORE INSERT ON Movie
FOR EACH ROW
BEGIN
    IF NEW.Duration <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: Movie duration must be greater than 0.';
    END IF;
END;
//
DELIMITER ;

DELIMITER //
CREATE TRIGGER trg_dob_insert_check
BEFORE INSERT ON Customer
FOR EACH ROW
BEGIN
    IF NEW.Date_of_birth IS NOT NULL AND NEW.Date_of_birth > DATE_SUB(CURDATE(), INTERVAL 15 YEAR) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Customer must be at least 15 years old.';
    END IF;
END;
//
DELIMITER ;

DELIMITER //
CREATE TRIGGER trg_dob_update_check
BEFORE UPDATE ON Customer
FOR EACH ROW
BEGIN
    IF NEW.Date_of_birth IS NOT NULL AND NEW.Date_of_birth > DATE_SUB(CURDATE(), INTERVAL 15 YEAR) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Customer must be at least 15 years old.';
    END IF;
END;
//
DELIMITER ;

DELIMITER //

CREATE TRIGGER trg_admin_dob_insert_check
BEFORE INSERT ON Admin
FOR EACH ROW
BEGIN
    IF NEW.Date_of_birth IS NOT NULL 
       AND NEW.Date_of_birth > DATE_SUB(CURDATE(), INTERVAL 18 YEAR) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Admin must be at least 18 years old.';
    END IF;
END;
//

DELIMITER ;

DELIMITER //

CREATE TRIGGER trg_admin_dob_update_check
BEFORE UPDATE ON Admin
FOR EACH ROW
BEGIN
    IF NEW.Date_of_birth IS NOT NULL 
       AND NEW.Date_of_birth > DATE_SUB(CURDATE(), INTERVAL 18 YEAR) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Admin must be at least 18 years old.';
    END IF;
END;
//

DELIMITER ;


ALTER TABLE Customer
ADD Age INT;

DELIMITER //
CREATE TRIGGER trg_customer_age_insert
BEFORE INSERT ON Customer
FOR EACH ROW
BEGIN
    IF NEW.Date_of_birth IS NOT NULL THEN
        SET NEW.Age = TIMESTAMPDIFF(YEAR, NEW.Date_of_birth, CURDATE());
    END IF;
END;
//
DELIMITER ;

DELIMITER //
CREATE TRIGGER trg_customer_age_update
BEFORE UPDATE ON Customer
FOR EACH ROW
BEGIN
    IF NEW.Date_of_birth <> OLD.Date_of_birth THEN
        SET NEW.Age = TIMESTAMPDIFF(YEAR, NEW.Date_of_birth, CURDATE());
    END IF;
END;
//
DELIMITER ;

ALTER TABLE Admin 
ADD COLUMN Age INT;

DELIMITER //

CREATE TRIGGER trg_admin_age_insert
BEFORE INSERT ON Admin
FOR EACH ROW
BEGIN
    IF NEW.Date_of_birth IS NOT NULL THEN
        SET NEW.Age = TIMESTAMPDIFF(YEAR, NEW.Date_of_birth, CURDATE());
    END IF;
END;
//

DELIMITER ;

DELIMITER //

CREATE TRIGGER trg_admin_age_update
BEFORE UPDATE ON Admin
FOR EACH ROW
BEGIN
    IF NEW.Date_of_birth <> OLD.Date_of_birth THEN
        SET NEW.Age = TIMESTAMPDIFF(YEAR, NEW.Date_of_birth, CURDATE());
    END IF;
END;
//

DELIMITER ;


DELIMITER //
CREATE TRIGGER trg_check_voucher_discount
BEFORE INSERT ON Voucher
FOR EACH ROW
BEGIN
    IF NEW.Discount > 100 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: Discount cannot exceed 100%.';
    END IF;
END;
//
DELIMITER ;

DELIMITER //

CREATE TRIGGER trg_customervoucher_cvid
BEFORE INSERT ON CustomerVoucher
FOR EACH ROW
BEGIN
    IF NEW.CV_id IS NULL OR NEW.CV_id = 0 THEN
        SET NEW.CV_id = (
            SELECT IFNULL(MAX(CV_id), 0) + 1 
            FROM CustomerVoucher 
            WHERE Customer_id = NEW.Customer_id
        );
    END IF;
END;
//

DELIMITER ;

ALTER TABLE Cinema_Branch
ADD Hall_count INT DEFAULT 0,
ADD Total_seats INT DEFAULT 0;

DELIMITER //
CREATE TRIGGER trg_branch_hall_insert
AFTER INSERT ON Hall
FOR EACH ROW
BEGIN
    UPDATE Cinema_Branch
    SET 
        Hall_count = Hall_count + 1,
        Total_seats = Total_seats + NEW.Seat_capacity
    WHERE Branch_id = NEW.Branch_id;
END //
DELIMITER ;

DELIMITER //
CREATE TRIGGER trg_branch_hall_delete
AFTER DELETE ON Hall
FOR EACH ROW
BEGIN
    UPDATE Cinema_Branch
    SET 
        Hall_count = Hall_count - 1,
        Total_seats = Total_seats - OLD.Seat_capacity
    WHERE Branch_id = OLD.Branch_id;
END //
DELIMITER ;

DELIMITER //
CREATE TRIGGER trg_branch_hall_update
AFTER UPDATE ON Hall
FOR EACH ROW
BEGIN
    UPDATE Cinema_Branch
    SET 
        Total_seats = Total_seats - OLD.Seat_capacity + NEW.Seat_capacity
    WHERE Branch_id = NEW.Branch_id;
END //
DELIMITER ;

DELIMITER //
CREATE TRIGGER trg_seat_book
AFTER UPDATE ON ShowtimeSeat
FOR EACH ROW
BEGIN
    IF OLD.Status = 'Available' AND NEW.Status = 'Booked' THEN
        UPDATE Hall
        SET Seat_capacity = Seat_capacity - 1
        WHERE Branch_id = NEW.Branch_id
          AND Hall_number = NEW.Hall_number;
    END IF;
END//
DELIMITER ;

DELIMITER //
CREATE TRIGGER trg_seat_unbook
AFTER UPDATE ON ShowtimeSeat
FOR EACH ROW
BEGIN
    IF OLD.Status = 'Booked' AND NEW.Status = 'Available' THEN
        UPDATE Hall
        SET Seat_capacity = Seat_capacity + 1
        WHERE Branch_id = NEW.Branch_id
          AND Hall_number = NEW.Hall_number;
    END IF;
END//
DELIMITER ;

DELIMITER //

CREATE TRIGGER trg_loyalty_add_ticket
AFTER INSERT ON Ticket
FOR EACH ROW
BEGIN
    UPDATE Customer
    SET Loyal_point = Loyal_point + 5
    WHERE Customer_id = (
        SELECT Customer_id
        FROM Receipt
        WHERE Receipt_id = NEW.Receipt_id
        LIMIT 1
    );
END;
//

DELIMITER ;

DELIMITER //

CREATE TRIGGER trg_loyalty_add_product
AFTER INSERT ON OrderProduct
FOR EACH ROW
BEGIN
    UPDATE Customer
    SET Loyal_point = Loyal_point + (NEW.Quantity * 1)
    WHERE Customer_id = (
        SELECT Customer_id
        FROM Receipt
        WHERE Receipt_id = NEW.Receipt_id
        LIMIT 1
    );
END;
//

DELIMITER ;

DELIMITER //

CREATE TRIGGER trg_update_customer_rank
AFTER UPDATE ON Customer
FOR EACH ROW
BEGIN
    DECLARE new_rank VARCHAR(50);

    IF NEW.Loyal_point >= 400 THEN
        SET new_rank = 'Platinum';
    ELSEIF NEW.Loyal_point >= 300 THEN
        SET new_rank = 'Gold';
    ELSEIF NEW.Loyal_point >= 200 THEN
        SET new_rank = 'Silver';
    ELSE
        SET new_rank = 'Bronze';
    END IF;

	CALL update_membership(
		NEW.Membership_id,
		new_rank,
		DATE_FORMAT(CURDATE(), '%d/%m/%Y')
	);

END;
//

DELIMITER ;

DELIMITER //

CREATE TRIGGER trg_delete_showtime_when_screen_removed
AFTER DELETE ON Screen
FOR EACH ROW
BEGIN
    DELETE FROM Showtime
    WHERE Movie_id = OLD.Movie_id
      AND Branch_id = OLD.Branch_id;
END;

//
DELIMITER ;

DELIMITER //
CREATE TRIGGER trg_assign_new_voucher
AFTER INSERT ON Voucher
FOR EACH ROW
BEGIN
    DECLARE done INT DEFAULT 0;
    DECLARE cid INT;

    -- Cursor duyệt tất cả customer
    DECLARE cur CURSOR FOR 
        SELECT Customer_id FROM Customer;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    OPEN cur;

    assign_loop: LOOP
        FETCH cur INTO cid;
        IF done = 1 THEN
            LEAVE assign_loop;
        END IF;

        -- Insert record mới (CV_id tự tăng bởi trigger trg_customervoucher_cvid)
        INSERT INTO CustomerVoucher(Customer_id, Status, Voucher_id)
        VALUES (cid, 'Unused', NEW.Voucher_id);

    END LOOP;

    CLOSE cur;
END;
//
DELIMITER ;

