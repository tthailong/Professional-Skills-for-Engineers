USE db_assignment2;

DELIMITER $$
DROP PROCEDURE IF EXISTS GetMovieShowtimes $$
CREATE PROCEDURE GetMovieShowtimes(IN p_movie_id INT)
BEGIN
    SELECT 
        s.Showtime_id,
        s.Movie_id,

        m.Title AS Movie_title,
        s.Format,
        s.Subtitle,

        DATE_FORMAT(s.Date, '%d/%m/%Y') AS Date,
        TIME_FORMAT(s.Start_time, '%H:%i') AS Start_time,

        cb.Branch_id,
        cb.Name AS Branch_name,
        cb.Address AS Branch_address,

        h.Hall_number,
        h.Type AS Hall_type
    FROM Showtime s
    JOIN Movie m 
        ON m.Movie_id = s.Movie_id
    JOIN Cinema_Branch cb 
        ON cb.Branch_id = s.Branch_id
    JOIN Hall h
        ON h.Branch_id = s.Branch_id
       AND h.Hall_number = s.Hall_number
    WHERE s.Movie_id = p_movie_id
    ORDER BY s.Date, s.Start_time;
END$$

DELIMITER ;


-- ============================================
-- 2. GetMovieReviews
-- ============================================
DELIMITER $$
DROP PROCEDURE IF EXISTS GetMovieReviews $$
CREATE PROCEDURE GetMovieReviews(IN p_movie_id INT, IN p_spoiler_tag varchar(20))
BEGIN
    SELECT 
        c.FName AS Customer_name,
        r.Rating,
        r.Comment,
        DATE_FORMAT(r.Date_comment, '%d/%m/%Y') AS Review_date
    FROM Review r
    JOIN Customer c 
        ON c.Customer_id = r.Customer_id
    WHERE r.Movie_id = p_movie_id AND (p_spoiler_tag IS NULL OR r.spoiler_tag = p_spoiler_tag)
    ORDER BY r.Date_comment DESC;
END$$

DELIMITER ;

-- ============================================
-- 3. GetShowtimeInfo
-- ============================================
DELIMITER $$
DROP PROCEDURE IF EXISTS GetShowtimeInfo $$
CREATE PROCEDURE GetShowtimeInfo (
    IN p_movie_id INT,
    IN p_showtime_id INT
)
BEGIN
    SELECT 
        s.Showtime_id,
        s.Movie_id,

        m.Title AS Movie_title,
        s.Format,
        s.Subtitle,

        DATE_FORMAT(s.Date, '%d/%m/%Y') AS Date,
        TIME_FORMAT(s.Start_time, '%H:%i') AS Start_time,

        cb.Branch_id,
        cb.Name AS Branch_name,
        cb.Address AS Branch_address,

        h.Hall_number,
        h.Type AS Hall_type
    FROM Showtime s
    JOIN Movie m 
        ON m.Movie_id = s.Movie_id
    JOIN Cinema_Branch cb 
        ON cb.Branch_id = s.Branch_id
    JOIN Hall h 
        ON h.Branch_id = s.Branch_id
       AND h.Hall_number = s.Hall_number
    WHERE s.Movie_id = p_movie_id
      AND s.Showtime_id = p_showtime_id
    LIMIT 1;
END$$

DELIMITER ;


-- ============================================
-- 4. GetShowtimeSeats
-- ============================================
DELIMITER $$
DROP PROCEDURE IF EXISTS GetShowtimeSeats $$
CREATE PROCEDURE GetShowtimeSeats (
    IN p_movie_id INT,
    IN p_showtime_id INT
)
BEGIN
    SELECT 
        ss.Seat_number,
        seat.Seat_type,
        ss.Status
    FROM ShowtimeSeat ss
    JOIN Seat seat 
         ON seat.Branch_id = ss.Branch_id
        AND seat.Hall_number = ss.Hall_number
        AND seat.Seat_number = ss.Seat_number
    WHERE ss.Movie_id = p_movie_id
      AND ss.Showtime_id = p_showtime_id
    ORDER BY ss.Seat_number;
END$$

DELIMITER ;
