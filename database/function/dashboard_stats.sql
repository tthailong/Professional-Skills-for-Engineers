DELIMITER $$

DROP FUNCTION IF EXISTS fn_SystemMonthlyOccupancyRate $$

CREATE FUNCTION fn_SystemMonthlyOccupancyRate(
    p_month INT,
    p_year INT
) RETURNS DECIMAL(5,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_occupancy_rate DECIMAL(5,2);

    SELECT 
        CAST(
            (SUM(CASE WHEN SS.Status = 'BOOKED' THEN 1 ELSE 0 END) / COUNT(*)) * 100 
            AS DECIMAL(5,2)
        ) INTO v_occupancy_rate
    FROM Showtime S
    JOIN ShowtimeSeat SS ON S.Showtime_id = SS.Showtime_id
    WHERE YEAR(S.Date) = p_year 
      AND MONTH(S.Date) = p_month;

    RETURN COALESCE(v_occupancy_rate, 0.00);
END $$

DELIMITER ;
