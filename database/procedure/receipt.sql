DELIMITER $$

CREATE PROCEDURE GetCustomerReceipts(IN cust_id INT)
BEGIN
    SELECT
        r.Receipt_id,
        DATE_FORMAT(r.Receipt_date, '%Y-%m-%d') as Receipt_date_fmt,
        r.Method,
        m.Title AS Movie_title,
        b.Name AS Branch_name,
        TIME_FORMAT(s.Start_time, '%h:%i %p') as Start_time_fmt,
        DATE_FORMAT(s.Date, '%Y-%m-%d') as Showtime_date_fmt,
        t.Seat_number,
        t.Price
    FROM Receipt r
    JOIN Ticket t ON r.Receipt_id = t.Receipt_id
    JOIN Movie m ON t.Movie_id = m.Movie_id
    JOIN Cinema_Branch b ON t.Branch_id = b.Branch_id
    JOIN Showtime s ON t.Showtime_id = s.Showtime_id
    WHERE r.Customer_id = cust_id
    ORDER BY r.Receipt_date DESC, r.Receipt_id DESC;
END $$

DELIMITER ;
