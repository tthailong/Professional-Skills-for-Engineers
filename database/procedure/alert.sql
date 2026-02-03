DELIMITER $$

DROP PROCEDURE IF EXISTS sp_GetMonthlyLowOccupancyAlerts $$

CREATE PROCEDURE sp_GetMonthlyLowOccupancyAlerts(
    IN p_month INT,
    IN p_year INT,
    IN p_threshold_percent DECIMAL(5,2),
    IN p_branch_id INT,
    IN p_limit INT,
    IN p_offset INT
)
BEGIN
    SELECT 
        M.Title AS Movie_Name,
        CB.Name AS Branch_Name,
        M.Duration,
        S.Start_time,
        S.Date,
        COUNT(*) AS Total_Capacity,
        SUM(CASE WHEN SS.Status = 'BOOKED' THEN 1 ELSE 0 END) AS Booked_Seats,
        CAST(
            (SUM(CASE WHEN SS.Status = 'BOOKED' THEN 1 ELSE 0 END) / COUNT(*)) * 100 
            AS DECIMAL(5,2)
        ) AS Occupancy_Rate,
        COUNT(*) OVER() AS Total_Count
    FROM Showtime S
    JOIN Movie M ON S.Movie_id = M.Movie_id
    JOIN Cinema_Branch CB ON S.Branch_id = CB.Branch_id
    JOIN ShowtimeSeat SS ON S.Showtime_id = SS.Showtime_id
    WHERE YEAR(S.Date) = p_year 
      AND MONTH(S.Date) = p_month
      AND (p_branch_id IS NULL OR S.Branch_id = p_branch_id)
    GROUP BY S.Showtime_id, M.Title, CB.Name, M.Duration, S.Start_time, S.Date
    HAVING 
        CAST(
            (SUM(CASE WHEN SS.Status = 'BOOKED' THEN 1 ELSE 0 END) / COUNT(*)) * 100 
            AS DECIMAL(5,2)
        ) < p_threshold_percent
    ORDER BY Occupancy_Rate ASC, S.Date DESC
    LIMIT p_limit OFFSET p_offset;
END $$

DELIMITER ;
