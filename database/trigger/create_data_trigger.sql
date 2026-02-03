USE db_assignment2;


-- trigger tạo seat cho hall
DELIMITER $$

CREATE TRIGGER trg_generate_standard_seats
AFTER INSERT ON Hall
FOR EACH ROW
BEGIN
    DECLARE i INT DEFAULT 1;
    DECLARE j INT DEFAULT 1;
    DECLARE row_char CHAR(1);
    DECLARE seat_num VARCHAR(10);

    WHILE i <= NEW.Row_count DO
        
        SET row_char = CHAR(64 + i);  -- A, B, C,...

        SET j = 1;
        WHILE j <= NEW.Col_count DO
            
            SET seat_num = CONCAT(row_char, j);

            INSERT INTO Seat(Branch_id, Hall_number, Seat_number, Seat_type)
            VALUES (NEW.Branch_id, NEW.Hall_number, seat_num, 'STANDARD');

            SET j = j + 1;
        END WHILE;

        SET i = i + 1;
    END WHILE;

END$$

DELIMITER ;


--trigger tự động tạo showtimeseat
DELIMITER $$

CREATE TRIGGER trg_generate_showtime_seats
AFTER INSERT ON Showtime
FOR EACH ROW
BEGIN
    INSERT INTO ShowtimeSeat(Movie_id, Showtime_id, Branch_id, Hall_number, Seat_number, Status)
    SELECT 
        NEW.Movie_id,
        NEW.Showtime_id,
        NEW.Branch_id,
        NEW.Hall_number,
        Seat.Seat_number,
        'AVAILABLE'
    FROM Seat
    WHERE Seat.Branch_id = NEW.Branch_id
      AND Seat.Hall_number = NEW.Hall_number;
END$$

DELIMITER ;
