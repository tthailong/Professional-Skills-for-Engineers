
-- 16. Calculate Dynamic Net Revenue (Flexible Date Range & Optional Branch)
DELIMITER $$

DROP FUNCTION IF EXISTS fn_DynamicRevenue $$

CREATE FUNCTION fn_DynamicRevenue(
    p_start_date DATE,
    p_end_date DATE,
    p_branch_id INT -- NULL for System-wide
)
RETURNS DECIMAL(14, 2)
READS SQL DATA
BEGIN
    DECLARE v_gross_revenue DECIMAL(14, 2) DEFAULT 0.00;
    DECLARE v_total_discount DECIMAL(14, 2) DEFAULT 0.00;
    
    -- 1. Validation
    IF p_start_date IS NULL OR p_end_date IS NULL OR p_start_date > p_end_date THEN
        RETURN 0.00;
    END IF;

    -- 2. Calculate Gross Revenue (Tickets + Products)
    
    -- A. Ticket Revenue
    SELECT COALESCE(SUM(T.Price), 0) INTO v_gross_revenue
    FROM Ticket T
    JOIN Receipt R ON T.Receipt_id = R.Receipt_id
    WHERE R.Receipt_date BETWEEN p_start_date AND p_end_date
      AND (p_branch_id IS NULL OR T.Branch_id = p_branch_id);
      
    -- B. Product Revenue
    -- Note: Products in a receipt are assumed to belong to the same branch context if filtered by branch.
    -- If p_branch_id is provided, we need to filter receipts that contain tickets from that branch
    -- OR rely on the assumption that a Receipt is tied to a location. 
    -- Since Receipt doesn't have Branch_id directly, we filter by Tickets in that Receipt.
    
    IF p_branch_id IS NOT NULL THEN
        -- Get Receipts associated with the Branch in this period
        SELECT GROUP_CONCAT(DISTINCT T.Receipt_id) INTO @branch_receipt_ids
        FROM Ticket T
        JOIN Receipt R ON T.Receipt_id = R.Receipt_id
        WHERE T.Branch_id = p_branch_id
          AND R.Receipt_date BETWEEN p_start_date AND p_end_date;
          
        IF @branch_receipt_ids IS NOT NULL THEN
             SELECT v_gross_revenue + COALESCE(SUM(OP.Quantity * P.Price), 0) INTO v_gross_revenue
             FROM OrderProduct OP
             JOIN Product P ON OP.Product_id = P.Product_id
             WHERE FIND_IN_SET(OP.Receipt_id, @branch_receipt_ids) > 0;
        END IF;
    ELSE
        -- System-wide Product Revenue
        SELECT v_gross_revenue + COALESCE(SUM(OP.Quantity * P.Price), 0) INTO v_gross_revenue
        FROM OrderProduct OP
        JOIN Product P ON OP.Product_id = P.Product_id
        JOIN Receipt R ON OP.Receipt_id = R.Receipt_id
        WHERE R.Receipt_date BETWEEN p_start_date AND p_end_date;
    END IF;

    -- 3. Calculate Voucher Discounts (Simplified logic for performance, or reuse existing logic)
    -- For exact precision, we should replicate the cursor logic from fn_MonthlyNetRevenue/fn_MonthlyRevenueByBranch
    -- tailored for the date range.
    
    -- Calling the appropriate discount function based on context is complex in a single function due to different logic.
    -- For this implementation, we will use a simplified approximation or a dedicated block.
    -- Let's use a dedicated block similar to fn_DiscountsApplied but with Branch support.
    
    BEGIN
        DECLARE done INT DEFAULT FALSE;
        DECLARE v_receipt_id INT;
        DECLARE v_voucher_discount_percent DECIMAL(5, 2);
        DECLARE v_receipt_gross_amount_total DECIMAL(14, 2);
        
        DECLARE cur CURSOR FOR
            SELECT R.Receipt_id, V.Discount
            FROM Receipt R
            JOIN CustomerVoucher CV ON R.Customer_id = CV.Customer_id AND R.CV_id = CV.CV_id
            JOIN Voucher V ON CV.Voucher_id = V.Voucher_id
            WHERE R.Receipt_date BETWEEN p_start_date AND p_end_date
              AND R.CV_id IS NOT NULL
              AND (p_branch_id IS NULL OR EXISTS (SELECT 1 FROM Ticket T WHERE T.Receipt_id = R.Receipt_id AND T.Branch_id = p_branch_id));

        DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

        OPEN cur;

        discount_loop: LOOP
            FETCH cur INTO v_receipt_id, v_voucher_discount_percent;
            IF done THEN LEAVE discount_loop; END IF;

            -- Calculate Receipt Total Gross
            SET v_receipt_gross_amount_total = 0.00;
            SELECT COALESCE(SUM(T.Price), 0) INTO v_receipt_gross_amount_total FROM Ticket T WHERE T.Receipt_id = v_receipt_id;
            SELECT v_receipt_gross_amount_total + COALESCE(SUM(OP.Quantity * P.Price), 0) INTO v_receipt_gross_amount_total
            FROM OrderProduct OP JOIN Product P ON OP.Product_id = P.Product_id WHERE OP.Receipt_id = v_receipt_id;

            IF p_branch_id IS NULL THEN
                -- System-wide: Full discount
                SET v_total_discount = v_total_discount + (v_receipt_gross_amount_total * v_voucher_discount_percent / 100);
            ELSE
                -- Branch-specific: Allocated discount
                SET @branch_gross = 0.00;
                SELECT COALESCE(SUM(T.Price), 0) INTO @branch_gross FROM Ticket T WHERE T.Receipt_id = v_receipt_id AND T.Branch_id = p_branch_id;
                -- Assume products in this receipt belong to the branch context if the user bought tickets there (simplification)
                -- Or strictly, products don't have branch. We'll allocate product revenue based on ticket share? 
                -- Let's stick to the logic: Products are attached to the receipt. If receipt is "at a branch", products are too?
                -- But a receipt could theoretically have tickets from multiple branches? (Unlikely in physical flow, possible in app?)
                -- Let's assume proportional allocation based on Ticket Revenue share if multiple branches involved, 
                -- OR if we treat Product revenue as "Shared", we allocate it.
                -- For now, let's use the same logic as fn_MonthlyRevenueByBranch:
                SELECT @branch_gross + COALESCE(SUM(OP.Quantity * P.Price), 0) INTO @branch_gross
                FROM OrderProduct OP JOIN Product P ON OP.Product_id = P.Product_id WHERE OP.Receipt_id = v_receipt_id;
                
                SET @weight = IF(v_receipt_gross_amount_total > 0, @branch_gross / v_receipt_gross_amount_total, 0);
                SET v_total_discount = v_total_discount + ((v_receipt_gross_amount_total * v_voucher_discount_percent / 100) * @weight);
            END IF;
        END LOOP;
        CLOSE cur;
    END;

    RETURN v_gross_revenue - v_total_discount;
END $$
DELIMITER ;


-- 17. Get Top Movies by Revenue (Stored Procedure)
DELIMITER $$

DROP PROCEDURE IF EXISTS sp_GetTopMoviesRevenue $$

CREATE PROCEDURE sp_GetTopMoviesRevenue(
    IN p_start_date DATE,
    IN p_end_date DATE,
    IN p_branch_id INT, -- NULL for System-wide
    IN p_limit INT
)
BEGIN
    SELECT 
        M.Title,
        COALESCE(SUM(T.Price), 0) as Revenue -- Simplified: Ticket Revenue only for "Top Movies" ranking to be faster
    FROM Movie M
    JOIN Ticket T ON M.Movie_id = T.Movie_id
    JOIN Receipt R ON T.Receipt_id = R.Receipt_id
    WHERE R.Receipt_date BETWEEN p_start_date AND p_end_date
      AND (p_branch_id IS NULL OR T.Branch_id = p_branch_id)
    GROUP BY M.Movie_id, M.Title
    ORDER BY Revenue DESC
    LIMIT p_limit;
END $$
DELIMITER ;


-- 18. Get Daily Revenue Trend (Stored Procedure)
DELIMITER $$

DROP PROCEDURE IF EXISTS sp_GetDailyRevenueTrend $$

CREATE PROCEDURE sp_GetDailyRevenueTrend(
    IN p_start_date DATE,
    IN p_end_date DATE,
    IN p_branch_id INT -- NULL for System-wide
)
BEGIN
    -- We need to generate a series of dates or just group by existing data.
    -- Grouping by existing data is easier but might miss days with 0 revenue.
    -- For simplicity in this assignment, we will just group by Receipt Date.
    
    SELECT 
        DATE(R.Receipt_date) as Date,
        COALESCE(SUM(T.Price), 0) as TicketRevenue,
        -- Product Revenue (Approximate: Sum products in receipts of that day)
        (
            SELECT COALESCE(SUM(OP.Quantity * P.Price), 0)
            FROM OrderProduct OP
            JOIN Product P ON OP.Product_id = P.Product_id
            JOIN Receipt R2 ON OP.Receipt_id = R2.Receipt_id
            WHERE DATE(R2.Receipt_date) = DATE(R.Receipt_date)
              AND (p_branch_id IS NULL OR EXISTS (SELECT 1 FROM Ticket T2 WHERE T2.Receipt_id = R2.Receipt_id AND T2.Branch_id = p_branch_id))
        ) as ProductRevenue
    FROM Receipt R
    JOIN Ticket T ON R.Receipt_id = T.Receipt_id
    WHERE R.Receipt_date BETWEEN p_start_date AND p_end_date
      AND (p_branch_id IS NULL OR T.Branch_id = p_branch_id)
    GROUP BY DATE(R.Receipt_date)
    ORDER BY DATE(R.Receipt_date);
END $$
DELIMITER ;
