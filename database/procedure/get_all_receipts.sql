USE db_assignment2;

DELIMITER $$

DROP PROCEDURE IF EXISTS get_all_receipts $$
CREATE PROCEDURE get_all_receipts()
BEGIN
    SELECT
        R.Receipt_id,
        CONCAT(C.FName, ' ', C.LName) AS Customer_Name,
        GROUP_CONCAT(DISTINCT M.Title SEPARATOR ', ') AS Movie_Title,
        GROUP_CONCAT(DISTINCT T.Seat_number SEPARATOR ', ') AS Seats,
        DATE_FORMAT(R.Receipt_date, '%Y-%m-%d') AS Date,
        CAST(
            (
                COALESCE(SUM(T.Price), 0) +
                COALESCE((
                    SELECT SUM(P.Price * OP.Quantity)
                    FROM OrderProduct OP
                    JOIN Product P ON OP.Product_id = P.Product_id
                    WHERE OP.Receipt_id = R.Receipt_id
                ), 0)
            ) * (1 - COALESCE(V.Discount, 0) / 100) 
        AS DECIMAL(10,2)) AS Total_Amount
    FROM Receipt R
    JOIN Customer C ON R.Customer_id = C.Customer_id
    LEFT JOIN Ticket T ON R.Receipt_id = T.Receipt_id
    LEFT JOIN Movie M ON T.Movie_id = M.Movie_id
    LEFT JOIN CustomerVoucher CV ON R.Customer_id = CV.Customer_id AND R.CV_id = CV.CV_id
    LEFT JOIN Voucher V ON CV.Voucher_id = V.Voucher_id
    GROUP BY R.Receipt_id, C.FName, C.LName, R.Receipt_date, V.Discount
    ORDER BY R.Receipt_date DESC;
END $$

DROP PROCEDURE IF EXISTS get_receipts_by_branch $$
CREATE PROCEDURE get_receipts_by_branch(IN p_branch_id INT)
BEGIN
    SELECT
        R.Receipt_id,
        CONCAT(C.FName, ' ', C.LName) AS Customer_Name,
        GROUP_CONCAT(DISTINCT M.Title SEPARATOR ', ') AS Movie_Title,
        GROUP_CONCAT(DISTINCT T.Seat_number SEPARATOR ', ') AS Seats,
        DATE_FORMAT(R.Receipt_date, '%Y-%m-%d') AS Date,
        CAST(
            (
                COALESCE(SUM(T.Price), 0) +
                COALESCE((
                    SELECT SUM(P.Price * OP.Quantity)
                    FROM OrderProduct OP
                    JOIN Product P ON OP.Product_id = P.Product_id
                    WHERE OP.Receipt_id = R.Receipt_id
                ), 0)
            ) * (1 - COALESCE(V.Discount, 0) / 100)
        AS DECIMAL(10,2)) AS Total_Amount
    FROM Receipt R
    JOIN Customer C ON R.Customer_id = C.Customer_id
    JOIN Ticket T ON R.Receipt_id = T.Receipt_id
    LEFT JOIN Movie M ON T.Movie_id = M.Movie_id
    LEFT JOIN CustomerVoucher CV ON R.Customer_id = CV.Customer_id AND R.CV_id = CV.CV_id
    LEFT JOIN Voucher V ON CV.Voucher_id = V.Voucher_id
    WHERE T.Branch_id = p_branch_id
    GROUP BY R.Receipt_id, C.FName, C.LName, R.Receipt_date, V.Discount
    ORDER BY R.Receipt_date DESC;
END $$

DELIMITER ;
