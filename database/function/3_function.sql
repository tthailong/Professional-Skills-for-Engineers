-- 1 Tổng Doanh Thu Net theo Tháng (Toàn Hệ Thống)
DELIMITER $$

DROP FUNCTION IF EXISTS fn_MonthlyNetRevenue $$

CREATE FUNCTION fn_MonthlyNetRevenue(
    p_year INT,
    p_month INT
)
RETURNS DECIMAL(14, 2)
READS SQL DATA
BEGIN
    DECLARE v_gross_revenue DECIMAL(14, 2) DEFAULT 0.00;
    DECLARE v_total_discount DECIMAL(14, 2) DEFAULT 0.00;

    -- 1. Tính Tổng Doanh Thu Gộp (Vé + Sản phẩm)
    
    -- A. Tổng Doanh Thu từ Vé
    SELECT COALESCE(SUM(T.Price), 0) INTO @TicketGross
    FROM Ticket T
    JOIN Receipt R ON T.Receipt_id = R.Receipt_id
    WHERE YEAR(R.Receipt_date) = p_year
      AND MONTH(R.Receipt_date) = p_month;
      
    -- B. Cộng Tổng Doanh Thu từ Sản phẩm
    SELECT COALESCE(SUM(OP.Quantity * P.Price), 0) INTO @ProductGross
    FROM OrderProduct OP
    JOIN Product P ON OP.Product_id = P.Product_id
    JOIN Receipt R ON OP.Receipt_id = R.Receipt_id
    WHERE YEAR(R.Receipt_date) = p_year
      AND MONTH(R.Receipt_date) = p_month;

    SET v_gross_revenue = @TicketGross + @ProductGross;

    -- 2. Tính Tổng Giảm Giá Voucher (Sử dụng CURSOR)
    BEGIN
        DECLARE done INT DEFAULT FALSE;
        DECLARE v_receipt_id INT;
        DECLARE v_voucher_discount_percent DECIMAL(5, 2);
        DECLARE v_receipt_gross_amount DECIMAL(14, 2);
        
        -- Cursor chọn các Receipt sử dụng Voucher trong tháng/năm đang xét
        DECLARE cur CURSOR FOR
            SELECT R.Receipt_id, V.Discount
            FROM Receipt R
            JOIN CustomerVoucher CV ON R.Customer_id = CV.Customer_id AND R.CV_id = CV.CV_id
            JOIN Voucher V ON CV.Voucher_id = V.Voucher_id
            WHERE R.CV_id IS NOT NULL 
              AND YEAR(R.Receipt_date) = p_year
              AND MONTH(R.Receipt_date) = p_month;

        DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

        OPEN cur;

        discount_loop: LOOP
            FETCH cur INTO v_receipt_id, v_voucher_discount_percent;
            IF done THEN
                LEAVE discount_loop;
            END IF;

            -- Tính tổng tiền GỐC (vé + sản phẩm) của toàn bộ Receipt hiện tại
            SET v_receipt_gross_amount = 0.00;
            
            SELECT COALESCE(SUM(T_ALL.Price), 0) INTO v_receipt_gross_amount
            FROM Ticket T_ALL WHERE T_ALL.Receipt_id = v_receipt_id;
            
            SELECT v_receipt_gross_amount + COALESCE(SUM(OP_ALL.Quantity * P_ALL.Price), 0) INTO v_receipt_gross_amount
            FROM OrderProduct OP_ALL
            JOIN Product P_ALL ON OP_ALL.Product_id = P_ALL.Product_id
            WHERE OP_ALL.Receipt_id = v_receipt_id;
            
            -- Tính giảm giá trên toàn bộ hóa đơn
            SET v_total_discount = v_total_discount + (v_receipt_gross_amount * v_voucher_discount_percent / 100);

        END LOOP;
        
        CLOSE cur;
    END;

    -- 3. Tính Doanh thu Net
    RETURN v_gross_revenue - v_total_discount;
END $$

DELIMITER ;

-- 2. Doanh Thu Vé theo Tháng (Gross Revenue)
DELIMITER $$

DROP FUNCTION IF EXISTS fn_MonthlyTicketGrossRevenue $$
CREATE FUNCTION fn_MonthlyTicketGrossRevenue(
    p_year INT,
    p_month INT
)
RETURNS DECIMAL(14, 2)
READS SQL DATA
BEGIN
    SELECT COALESCE(SUM(T.Price), 0) INTO @GrossTicketRevenue
    FROM Ticket T
    JOIN Receipt R ON T.Receipt_id = R.Receipt_id
    WHERE YEAR(R.Receipt_date) = p_year 
      AND MONTH(R.Receipt_date) = p_month;
    
    RETURN @GrossTicketRevenue;
END $$
DELIMITER ;

-- 3. Doanh Thu F&B/Sản Phẩm theo Tháng (Gross Revenue)
DELIMITER $$

DROP FUNCTION IF EXISTS fn_MonthlyProductGrossRevenue $$
CREATE FUNCTION fn_MonthlyProductGrossRevenue(
    p_year INT,
    p_month INT
)
RETURNS DECIMAL(14, 2)
READS SQL DATA
BEGIN
    SELECT COALESCE(SUM(OP.Quantity * P.Price), 0) INTO @GrossProductRevenue
    FROM OrderProduct OP
    JOIN Product P ON OP.Product_id = P.Product_id
    JOIN Receipt R ON OP.Receipt_id = R.Receipt_id
    WHERE YEAR(R.Receipt_date) = p_year 
      AND MONTH(R.Receipt_date) = p_month;
    
    RETURN @GrossProductRevenue;
END $$
DELIMITER ;

-- 4. Tổng Doanh Thu Net theo Tháng của Chi Nhánh (Branch Leaderboard)
DELIMITER $$

DROP FUNCTION IF EXISTS fn_MonthlyRevenueByBranch $$

CREATE FUNCTION fn_MonthlyRevenueByBranch(
    p_branch_id INT,
    p_year INT,
    p_month INT
)
RETURNS DECIMAL(14, 2)
READS SQL DATA
BEGIN
    DECLARE v_gross_revenue DECIMAL(14, 2) DEFAULT 0.00;
    DECLARE v_total_discount DECIMAL(14, 2) DEFAULT 0.00;
     -- 1. Validation: Kiểm tra Branch_id có tồn tại không
    IF NOT EXISTS (SELECT 1 FROM Cinema_Branch WHERE Branch_id = p_branch_id) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Lỗi: Branch_id không tồn tại.';
        RETURN NULL;
    END IF;

    -- 2. Validation: Kiểm tra Năm và Tháng hợp lệ
    IF p_year IS NULL OR p_month IS NULL OR p_month < 1 OR p_month > 12 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Lỗi: Năm hoặc Tháng không hợp lệ.';
        RETURN NULL;
    END IF;
    -- 1. Xác định các Receipt_id liên quan đến Chi nhánh trong phạm vi ngày
    SELECT GROUP_CONCAT(DISTINCT T.Receipt_id) INTO @branch_receipt_ids
    FROM Ticket T
    JOIN Receipt R ON T.Receipt_id = R.Receipt_id
    WHERE T.Branch_id = p_branch_id
      AND T.Receipt_id IS NOT NULL
      AND YEAR(R.Receipt_date) = p_year
      AND MONTH(R.Receipt_date) = p_month;

    IF @branch_receipt_ids IS NULL THEN
        RETURN 0.00;
    END IF;

    -- 2. Tính Tổng Doanh Thu Gộp của Branch (Vé + Sản phẩm)
    
    -- A. Tổng Doanh Thu từ Vé (chỉ vé thuộc Branch này)
    SELECT COALESCE(SUM(T.Price), 0) INTO v_gross_revenue
    FROM Ticket T
    WHERE T.Branch_id = p_branch_id
      AND FIND_IN_SET(T.Receipt_id, @branch_receipt_ids) > 0;
      
    -- B. Cộng Tổng Doanh Thu từ Sản phẩm (Giả định sản phẩm đi kèm với Receipt này thuộc Branch)
    SELECT v_gross_revenue + COALESCE(SUM(OP.Quantity * P.Price), 0) INTO v_gross_revenue
    FROM OrderProduct OP
    JOIN Product P ON OP.Product_id = P.Product_id
    WHERE FIND_IN_SET(OP.Receipt_id, @branch_receipt_ids) > 0;
    
    -- 3. Tính Tổng Giảm Giá Voucher (Phân bổ cho Branch này) - Logic tương tự Function 1.1 nhưng có phân bổ
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
            WHERE FIND_IN_SET(R.Receipt_id, @branch_receipt_ids) > 0
              AND R.CV_id IS NOT NULL;

        DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

        OPEN cur;

        discount_loop: LOOP
            FETCH cur INTO v_receipt_id, v_voucher_discount_percent;
            IF done THEN
                LEAVE discount_loop;
            END IF;

            -- A. Tính Tổng Tiền Gốc của TOÀN BỘ Hóa Đơn (để tính chiết khấu gốc)
            SELECT COALESCE(SUM(T_ALL.Price), 0) INTO v_receipt_gross_amount_total
            FROM Ticket T_ALL WHERE T_ALL.Receipt_id = v_receipt_id;
            
            SELECT v_receipt_gross_amount_total + COALESCE(SUM(OP_ALL.Quantity * P_ALL.Price), 0) INTO v_receipt_gross_amount_total
            FROM OrderProduct OP_ALL JOIN Product P_ALL ON OP_ALL.Product_id = P_ALL.Product_id
            WHERE OP_ALL.Receipt_id = v_receipt_id;

            -- B. Tính Giảm Giá Phân Bổ cho Branch
            SET @branch_gross_amount_in_receipt = 0.00;
            
            SELECT COALESCE(SUM(T_BRANCH.Price), 0) INTO @branch_gross_amount_in_receipt
            FROM Ticket T_BRANCH WHERE T_BRANCH.Receipt_id = v_receipt_id AND T_BRANCH.Branch_id = p_branch_id;
            
            SELECT @branch_gross_amount_in_receipt + COALESCE(SUM(OP_BRANCH.Quantity * P_BRANCH.Price), 0) INTO @branch_gross_amount_in_receipt
            FROM OrderProduct OP_BRANCH JOIN Product P_BRANCH ON OP_BRANCH.Product_id = P_BRANCH.Product_id
            WHERE OP_BRANCH.Receipt_id = v_receipt_id;

            -- Tỷ trọng doanh thu Branch trong hóa đơn
            SET @revenue_weight = IF(v_receipt_gross_amount_total > 0, @branch_gross_amount_in_receipt / v_receipt_gross_amount_total, 0);
            
            -- Giảm giá phân bổ
            SET @total_receipt_discount = v_receipt_gross_amount_total * v_voucher_discount_percent / 100;
            SET @branch_discount_share = @total_receipt_discount * @revenue_weight;
            
            SET v_total_discount = v_total_discount + @branch_discount_share;

        END LOOP;
        
        CLOSE cur;
    END;

    -- 4. Tính Doanh thu Net
    RETURN v_gross_revenue - v_total_discount;
END $$

DELIMITER ;

-- 5. Hàm tính tổng doanh thu của 1 chi nhánh theo 1 năm 
DELIMITER $$

DROP FUNCTION IF EXISTS fn_YearlyRevenueByBranch $$

CREATE FUNCTION fn_YearlyRevenueByBranch(
    p_branch_id INT,
    p_year INT
)
RETURNS DECIMAL(12, 2)
READS SQL DATA
BEGIN
    DECLARE v_yearly_revenue DECIMAL(12, 2) DEFAULT 0.00;
    DECLARE v_month INT DEFAULT 1;

    -- 1. Validation: Kiểm tra Branch_id có tồn tại không
    IF NOT EXISTS (SELECT 1 FROM Cinema_Branch WHERE Branch_id = p_branch_id) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Lỗi: Branch_id không tồn tại.';
        RETURN NULL;
    END IF;
-- 2. Validation: Kiểm tra Năm hợp lệ
    IF p_year IS NULL OR p_year < 2000 OR p_year > 2025 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Lỗi: Năm không hợp lệ.';
        RETURN NULL;
    END IF;
    -- Lặp qua 12 tháng và cộng dồn doanh thu hàng tháng của chi nhánh đó
    WHILE v_month <= 12 DO
        SET v_yearly_revenue = v_yearly_revenue + fn_MonthlyRevenueByBranch(p_branch_id, p_year, v_month);
        SET v_month = v_month + 1;
    END WHILE;

    RETURN v_yearly_revenue;
END $$

DELIMITER ;

-- 6. Tỷ Lệ Mua Kèm F&B (Attachment Rate)
DELIMITER $$

DROP FUNCTION IF EXISTS fn_FBAttachmentRate $$
CREATE FUNCTION fn_FBAttachmentRate(
    p_year INT,
    p_month INT
)
RETURNS DECIMAL(5, 2)
READS SQL DATA
BEGIN
    DECLARE v_receipts_with_products INT;
    DECLARE v_total_receipts INT;

    -- Tổng số Receipt có mua kèm sản phẩm (F&B/Souvenir) trong tháng
    SELECT COUNT(DISTINCT OP.Receipt_id) INTO v_receipts_with_products
    FROM OrderProduct OP
    JOIN Receipt R ON OP.Receipt_id = R.Receipt_id
    WHERE YEAR(R.Receipt_date) = p_year AND MONTH(R.Receipt_date) = p_month;

    -- Tổng số Receipt (Giao dịch) có vé bán ra trong tháng
    SELECT COUNT(DISTINCT T.Receipt_id) INTO v_total_receipts
    FROM Ticket T
    JOIN Receipt R ON T.Receipt_id = R.Receipt_id
    WHERE YEAR(R.Receipt_date) = p_year AND MONTH(R.Receipt_date) = p_month;

    IF v_total_receipts = 0 THEN
        RETURN 0.00;
    END IF;

    -- Trả về tỷ lệ phần trăm
    RETURN (v_receipts_with_products / v_total_receipts) * 100;
END $$
DELIMITER ;

-- 7. Tỷ Lệ Chiếm Dụng theo Chi Nhánh (Occupancy Rate)

DELIMITER $$

DROP FUNCTION IF EXISTS fn_MonthlyOccupancyRateByBranch $$
CREATE FUNCTION fn_MonthlyOccupancyRateByBranch(
    p_branch_id INT,
    p_year INT,
    p_month INT
)
RETURNS DECIMAL(5, 2)
READS SQL DATA
BEGIN
    DECLARE v_booked_seats INT;
    DECLARE v_total_seats INT;

    -- 1. Tổng số ghế đã được BOOKED (bán ra) tại chi nhánh trong tháng
    SELECT COALESCE(COUNT(*), 0) INTO v_booked_seats
    FROM ShowtimeSeat SS
    JOIN Showtime S ON SS.Showtime_id = S.Showtime_id
    WHERE SS.Branch_id = p_branch_id
      AND SS.Status = 'BOOKED'
      AND YEAR(S.Date) = p_year
      AND MONTH(S.Date) = p_month;

    -- 2. Tổng số ghế khả dụng (Total Capacity) của tất cả các suất chiếu trong tháng
    -- (Số lượng Seat = Tổng số suất chiếu * Tổng số ghế mỗi phòng)
    SELECT COALESCE(COUNT(*), 0) INTO v_total_seats
    FROM ShowtimeSeat SS
    JOIN Showtime S ON SS.Showtime_id = S.Showtime_id
    WHERE SS.Branch_id = p_branch_id
      AND YEAR(S.Date) = p_year
      AND MONTH(S.Date) = p_month;

    IF v_total_seats = 0 THEN
        RETURN 0.00;
    END IF;

    -- Tỷ lệ Occupancy = (Ghế đã bán) / (Tổng ghế khả dụng) * 100
    RETURN (v_booked_seats / v_total_seats) * 100;
END $$
DELIMITER ;

-- 8. Tổng Doanh Thu Net của Một Bộ Phim (Toàn Hệ Thống)
DELIMITER $$

DROP FUNCTION IF EXISTS fn_MovieTotalNetRevenue $$

CREATE FUNCTION fn_MovieTotalNetRevenue(
    p_movie_id INT
)
RETURNS DECIMAL(14, 2)
READS SQL DATA
BEGIN
    DECLARE v_gross_revenue DECIMAL(14, 2) DEFAULT 0.00;
    DECLARE v_total_discount DECIMAL(14, 2) DEFAULT 0.00;

    -- 1. Xác định các Receipt_id đã mua vé của phim này
    SELECT GROUP_CONCAT(DISTINCT T.Receipt_id) INTO @movie_receipt_ids
    FROM Ticket T
    WHERE T.Movie_id = p_movie_id AND T.Receipt_id IS NOT NULL;

    IF @movie_receipt_ids IS NULL THEN RETURN 0.00; END IF;

    -- 2. Tính Tổng Doanh Thu Gộp của Phim (Vé + Sản phẩm liên quan)
    
    -- A. Tổng Doanh Thu từ Vé của Phim này
    SELECT COALESCE(SUM(T.Price), 0) INTO v_gross_revenue
    FROM Ticket T
    WHERE T.Movie_id = p_movie_id
      AND FIND_IN_SET(T.Receipt_id, @movie_receipt_ids) > 0;
      
    -- B. Cộng Tổng Doanh Thu từ Sản phẩm
    SELECT v_gross_revenue + COALESCE(SUM(OP.Quantity * P.Price), 0) INTO v_gross_revenue
    FROM OrderProduct OP
    JOIN Product P ON OP.Product_id = P.Product_id
    WHERE FIND_IN_SET(OP.Receipt_id, @movie_receipt_ids) > 0;
    
    -- 3. Tính Tổng Giảm Giá Voucher (Phân bổ cho Phim này)
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
            WHERE FIND_IN_SET(R.Receipt_id, @movie_receipt_ids) > 0
              AND R.CV_id IS NOT NULL;

        DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

        OPEN cur;

        discount_loop: LOOP
            FETCH cur INTO v_receipt_id, v_voucher_discount_percent;
            IF done THEN LEAVE discount_loop; END IF;

            -- A. Tính Tổng Tiền Gốc của TOÀN BỘ Hóa Đơn
            SELECT COALESCE(SUM(T_ALL.Price), 0) INTO v_receipt_gross_amount_total
            FROM Ticket T_ALL WHERE T_ALL.Receipt_id = v_receipt_id;
            
            SELECT v_receipt_gross_amount_total + COALESCE(SUM(OP_ALL.Quantity * P_ALL.Price), 0) INTO v_receipt_gross_amount_total
            FROM OrderProduct OP_ALL JOIN Product P_ALL ON OP_ALL.Product_id = P_ALL.Product_id
            WHERE OP_ALL.Receipt_id = v_receipt_id;

            -- B. Tính Giảm Giá Phân Bổ cho PHIM đang xét (Gross Phim + SP liên quan)
            SET @movie_gross_amount_in_receipt = 0.00;
            
            SELECT COALESCE(SUM(T_TARGET.Price), 0) INTO @movie_gross_amount_in_receipt
            FROM Ticket T_TARGET WHERE T_TARGET.Receipt_id = v_receipt_id AND T_TARGET.Movie_id = p_movie_id;
            
            SELECT @movie_gross_amount_in_receipt + COALESCE(SUM(OP_BRANCH.Quantity * P_BRANCH.Price), 0) INTO @movie_gross_amount_in_receipt
            FROM OrderProduct OP_BRANCH JOIN Product P_BRANCH ON OP_BRANCH.Product_id = P_BRANCH.Product_id
            WHERE OP_BRANCH.Receipt_id = v_receipt_id;

            -- Tỷ trọng doanh thu (Vé phim + Sản phẩm) trong hóa đơn
            SET @revenue_weight = IF(v_receipt_gross_amount_total > 0, @movie_gross_amount_in_receipt / v_receipt_gross_amount_total, 0);
            
            -- Giảm giá phân bổ
            SET @total_receipt_discount = v_receipt_gross_amount_total * v_voucher_discount_percent / 100;
            SET @movie_discount_share = @total_receipt_discount * @revenue_weight;
            
            SET v_total_discount = v_total_discount + @movie_discount_share;

        END LOOP;
        
        CLOSE cur;
    END;

    -- 4. Tính Doanh thu Net
    RETURN v_gross_revenue - v_total_discount;
END $$

DELIMITER ;

-- 9.hàm tính số điểm đánh giá trung bình của 1 bộ phim
DELIMITER $$

DROP FUNCTION IF EXISTS fn_AverageRating $$

CREATE FUNCTION fn_AverageRating(
    p_movie_id INT
)
RETURNS DECIMAL(3, 2)
READS SQL DATA
BEGIN
    DECLARE v_average_rating DECIMAL(3, 2);

    -- 1. Validation: Kiểm tra Movie_id có tồn tại trong bảng Movie không
    IF NOT EXISTS (SELECT 1 FROM Movie WHERE Movie_id = p_movie_id) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Lỗi: Movie_id không tồn tại trong bảng Movie.';
        RETURN NULL;
    END IF;

    -- 2. Tính điểm đánh giá trung bình
    SELECT AVG(Rating) INTO v_average_rating
    FROM Review
    WHERE Movie_id = p_movie_id;

    -- 3. Xử lý trường hợp phim chưa có đánh giá
    -- Nếu không có đánh giá, AVG sẽ trả về NULL.
    IF v_average_rating IS NULL THEN
        -- Có thể trả về 0.00 hoặc một giá trị đặc biệt để báo hiệu chưa có đánh giá.
        -- Ở đây ta trả về 0.00.
        SET v_average_rating = 0.00;
    END IF;

    RETURN v_average_rating;
END $$

DELIMITER ;
-- 10.tổng số vé đã được đặt:
DELIMITER $$

DROP FUNCTION IF EXISTS fn_total_bookings $$

CREATE FUNCTION fn_total_bookings()
RETURNS INT
READS SQL DATA
BEGIN
    DECLARE v_total_tickets INT DEFAULT 0;

    -- Tính tổng số lượng vé (booking) có trong bảng Ticket
    SELECT COUNT(Ticket_id) INTO v_total_tickets
    FROM Ticket;

    RETURN v_total_tickets;
END $$

DELIMITER ;

-- 11.tổng số lượng phim hiện có:
DELIMITER $$

DROP FUNCTION IF EXISTS fn_movies_listed $$

CREATE FUNCTION fn_movies_listed()
RETURNS INT
READS SQL DATA
BEGIN
    DECLARE v_total_movies INT DEFAULT 0;

    -- Tính tổng số lượng Movie có trong bảng Movie
    SELECT COUNT(Movie_id) INTO v_total_movies
    FROM Movie;

    RETURN v_total_movies;
END $$

DELIMITER ;


-- 12.Tính Tổng Số Lượng Admin Toàn Hệ Thống
DELIMITER $$

DROP FUNCTION IF EXISTS fn_TotalAdmins $$

CREATE FUNCTION fn_TotalAdmins()
RETURNS INT
READS SQL DATA
BEGIN
    DECLARE v_total_admins INT DEFAULT 0;

    -- Đếm tổng số lượng bản ghi trong bảng Admin
    SELECT COUNT(Admin_id)
    INTO v_total_admins
    FROM Admin;

    RETURN v_total_admins;
END $$

DELIMITER ;

-- 13. Hàm tính tổng doanh thu của 1 chi nhánh theo 1 tuần
DELIMITER $$

DROP FUNCTION IF EXISTS CalculateWeeklyRevenueByBranch $$

CREATE FUNCTION CalculateWeeklyRevenueByBranch(
    p_branch_id INT,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS DECIMAL(12, 2)
READS SQL DATA
BEGIN
    DECLARE v_gross_revenue DECIMAL(12, 2) DEFAULT 0.00;
    DECLARE v_total_discount DECIMAL(12, 2) DEFAULT 0.00;
    
    -- 1. Validation: Kiểm tra Branch_id có tồn tại không
    IF NOT EXISTS (SELECT 1 FROM Cinema_Branch WHERE Branch_id = p_branch_id) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Lỗi: Branch_id không tồn tại.';
        RETURN NULL;
    END IF;
    -- 2. Validation
    IF p_start_date IS NULL OR p_end_date IS NULL OR p_start_date > p_end_date THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Lỗi: Ngày bắt đầu hoặc kết thúc không hợp lệ.';
        RETURN NULL;
    END IF;
    
    -- 2. Tính Tổng Doanh Thu Gộp (Vé + Sản phẩm)
    -- A. Tổng Doanh Thu từ Vé (lọc theo Receipt_date và Branch_id)
    SELECT COALESCE(SUM(T.Price), 0) INTO v_gross_revenue
    FROM Ticket T
    JOIN Receipt R ON T.Receipt_id = R.Receipt_id
    WHERE T.Branch_id = p_branch_id
      AND R.Receipt_date BETWEEN p_start_date AND p_end_date;
      
    -- B. Cộng Tổng Doanh Thu từ Sản phẩm (lọc theo Receipt_date)
    SELECT v_gross_revenue + COALESCE(SUM(OP.Quantity * P.Price), 0) INTO v_gross_revenue
    FROM OrderProduct OP
    JOIN Product P ON OP.Product_id = P.Product_id
    JOIN Receipt R ON OP.Receipt_id = R.Receipt_id
    WHERE R.Receipt_date BETWEEN p_start_date AND p_end_date;

    -- 3. Tính Tổng Giảm Giá Voucher
    BEGIN
        DECLARE done INT DEFAULT FALSE;
        DECLARE v_receipt_id INT;
        DECLARE v_voucher_discount_percent DECIMAL(5, 2);
        DECLARE v_receipt_gross_amount DECIMAL(12, 2);
        
        -- Cursor chọn các Receipt sử dụng Voucher và nằm trong khoảng thời gian
        DECLARE cur CURSOR FOR
            SELECT R.Receipt_id, V.Discount
            FROM Receipt R
            JOIN CustomerVoucher CV ON R.Customer_id = CV.Customer_id AND R.CV_id = CV.CV_id
            JOIN Voucher V ON CV.Voucher_id = V.Voucher_id
            WHERE R.CV_id IS NOT NULL -- Chỉ lấy Receipt có sử dụng Voucher
              AND R.Receipt_date BETWEEN p_start_date AND p_end_date;

        DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

        OPEN cur;

        discount_loop: LOOP
            FETCH cur INTO v_receipt_id, v_voucher_discount_percent;
            IF done THEN
                LEAVE discount_loop;
            END IF;

            -- 1. Tính tổng tiền GỐC (vé + sản phẩm) của Receipt hiện tại
            SET v_receipt_gross_amount = 0.00;

            -- Tổng tiền vé của Receipt (Chỉ tính vé thuộc Branch đang xét)
            SELECT COALESCE(SUM(T.Price), 0) INTO v_receipt_gross_amount
            FROM Ticket T
            WHERE T.Receipt_id = v_receipt_id AND T.Branch_id = p_branch_id;
            
            -- Cộng Tổng tiền sản phẩm của Receipt (Sản phẩm không có Branch_id, nên ta cộng tất cả)
            SELECT v_receipt_gross_amount + COALESCE(SUM(OP.Quantity * P.Price), 0) INTO v_receipt_gross_amount
            FROM OrderProduct OP
            JOIN Product P ON OP.Product_id = P.Product_id
            WHERE OP.Receipt_id = v_receipt_id;
            
            -- 2. Tính giảm giá và cộng vào tổng giảm giá
            -- Giảm giá = Tổng tiền gốc * Discount (%)
            SET v_total_discount = v_total_discount + (v_receipt_gross_amount * v_voucher_discount_percent / 100);

        END LOOP;
        
        CLOSE cur;
    END;

    -- 4. Tính Doanh thu Net (Doanh thu Gộp - Tổng Giảm giá)
    RETURN v_gross_revenue - v_total_discount;
END $$

DELIMITER ;

-- select CalculateWeeklyRevenueByBranch(1,'2025-11-01','2025-11-03');

-- 14. Function: Tổng Giảm Giá Voucher theo Chi Nhánh
DELIMITER $$

DROP FUNCTION IF EXISTS fn_BranchMonthlyVoucherDiscount $$

CREATE FUNCTION fn_BranchMonthlyVoucherDiscount(
    p_branch_id INT,
    p_year INT,
    p_month INT
)
RETURNS DECIMAL(14, 2)
READS SQL DATA
BEGIN
    DECLARE v_total_discount DECIMAL(14, 2) DEFAULT 0.00;
    
    -- 1. Validation: Kiểm tra Branch_id có tồn tại không
    IF NOT EXISTS (SELECT 1 FROM Cinema_Branch WHERE Branch_id = p_branch_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lỗi: Branch_id không tồn tại.';
        RETURN NULL;
    END IF;

    -- Biến tạm để lưu trữ các Receipt_id liên quan đến vé của chi nhánh này trong tháng
    SELECT GROUP_CONCAT(DISTINCT T.Receipt_id) INTO @branch_receipt_ids
    FROM Ticket T
    JOIN Receipt R ON T.Receipt_id = R.Receipt_id
    WHERE T.Branch_id = p_branch_id
      AND T.Receipt_id IS NOT NULL
      AND YEAR(R.Receipt_date) = p_year
      AND MONTH(R.Receipt_date) = p_month;

    IF @branch_receipt_ids IS NULL THEN
        RETURN 0.00;
    END IF;

    -- 2. Tính Tổng Giảm Giá Voucher (Phân bổ cho Branch này)
    BEGIN
        DECLARE done INT DEFAULT FALSE;
        DECLARE v_receipt_id INT;
        DECLARE v_voucher_discount_percent DECIMAL(5, 2);
        DECLARE v_receipt_gross_amount_total DECIMAL(14, 2); -- Tổng tiền gốc của toàn bộ hóa đơn
        
        -- Cursor chọn các Receipt_id liên quan có sử dụng Voucher
        DECLARE cur CURSOR FOR
            SELECT R.Receipt_id, V.Discount
            FROM Receipt R
            JOIN CustomerVoucher CV ON R.Customer_id = CV.Customer_id AND R.CV_id = CV.CV_id
            JOIN Voucher V ON CV.Voucher_id = V.Voucher_id
            WHERE FIND_IN_SET(R.Receipt_id, @branch_receipt_ids) > 0
              AND R.CV_id IS NOT NULL; -- Chỉ xét hóa đơn có dùng Voucher

        DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

        OPEN cur;

        discount_loop: LOOP
            FETCH cur INTO v_receipt_id, v_voucher_discount_percent;
            IF done THEN
                LEAVE discount_loop;
            END IF;

            -- A. Tính Tổng Tiền GỐC của TOÀN BỘ Hóa Đơn (Vé + Sản phẩm)
            SET v_receipt_gross_amount_total = 0.00;
            
            -- Tổng tiền vé của toàn bộ Receipt
            SELECT COALESCE(SUM(T_ALL.Price), 0) INTO v_receipt_gross_amount_total
            FROM Ticket T_ALL WHERE T_ALL.Receipt_id = v_receipt_id;
            
            -- Cộng Tổng tiền sản phẩm của Receipt
            SELECT v_receipt_gross_amount_total + COALESCE(SUM(OP_ALL.Quantity * P_ALL.Price), 0) INTO v_receipt_gross_amount_total
            FROM OrderProduct OP_ALL JOIN Product P_ALL ON OP_ALL.Product_id = P_ALL.Product_id
            WHERE OP_ALL.Receipt_id = v_receipt_id;

            -- B. Tính Giảm Giá Phân Bổ cho BRANCH
            SET @branch_gross_amount_in_receipt = 0.00;
            
            -- Tổng tiền vé của Branch này trong Receipt
            SELECT COALESCE(SUM(T_BRANCH.Price), 0) INTO @branch_gross_amount_in_receipt
            FROM Ticket T_BRANCH WHERE T_BRANCH.Receipt_id = v_receipt_id AND T_BRANCH.Branch_id = p_branch_id;
            
            -- Cộng Tổng tiền sản phẩm (sản phẩm được giả định thuộc Branch này)
            SELECT @branch_gross_amount_in_receipt + COALESCE(SUM(OP_BRANCH.Quantity * P_BRANCH.Price), 0) INTO @branch_gross_amount_in_receipt
            FROM OrderProduct OP_BRANCH JOIN Product P_BRANCH ON OP_BRANCH.Product_id = P_BRANCH.Product_id
            WHERE OP_BRANCH.Receipt_id = v_receipt_id;

            -- Tỷ trọng doanh thu Branch trong hóa đơn
            SET @revenue_weight = IF(v_receipt_gross_amount_total > 0, 
                                     @branch_gross_amount_in_receipt / v_receipt_gross_amount_total, 
                                     0);
            
            -- Giảm giá gốc của hóa đơn
            SET @total_receipt_discount = v_receipt_gross_amount_total * v_voucher_discount_percent / 100;
            -- Giảm giá phân bổ cho Branch
            SET @branch_discount_share = @total_receipt_discount * @revenue_weight;
            
            SET v_total_discount = v_total_discount + @branch_discount_share;

        END LOOP;
        
        CLOSE cur;
    END;

    RETURN v_total_discount;
END $$

DELIMITER ;
-- 15. Tổng số tiền Giảm giá Voucher được áp dụng trong một khoảng thời gian cho toàn hệ thống (chứ ko phải 1 chi nhánh).
DELIMITER $$

DROP FUNCTION IF EXISTS fn_DiscountsApplied $$

CREATE FUNCTION fn_DiscountsApplied(
    p_start_date DATE,
    p_end_date DATE
)
RETURNS DECIMAL(12, 2)
READS SQL DATA
BEGIN
    DECLARE v_total_discount DECIMAL(12, 2) DEFAULT 0.00;
    
    -- 1. Validation: Kiểm tra ngày hợp lệ
    IF p_start_date IS NULL OR p_end_date IS NULL OR p_start_date > p_end_date THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Lỗi: Ngày bắt đầu hoặc kết thúc không hợp lệ.';
        RETURN NULL;
    END IF;

    -- Bắt đầu khối CURSOR để tính toán giảm giá
    BEGIN
        DECLARE done INT DEFAULT FALSE;
        DECLARE v_receipt_id INT;
        DECLARE v_voucher_discount_percent DECIMAL(5, 2);
        DECLARE v_receipt_gross_amount DECIMAL(12, 2);
        
        -- Cursor chọn các Receipt_id đã sử dụng Voucher trong khoảng thời gian
        DECLARE cur CURSOR FOR
            SELECT R.Receipt_id, V.Discount
            FROM Receipt R
            -- Thay thế JOIN Apply bằng JOIN CustomerVoucher trực tiếp qua Receipt
            JOIN CustomerVoucher CV ON R.Customer_id = CV.Customer_id AND R.CV_id = CV.CV_id
            JOIN Voucher V ON CV.Voucher_id = V.Voucher_id
            -- Lọc theo ngày hóa đơn và đảm bảo có sử dụng Voucher
            WHERE R.Receipt_date BETWEEN p_start_date AND p_end_date
              AND R.CV_id IS NOT NULL; -- Chỉ lấy các hóa đơn có áp dụng Voucher

        DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

        OPEN cur;

        discount_loop: LOOP
            FETCH cur INTO v_receipt_id, v_voucher_discount_percent;
            IF done THEN
                LEAVE discount_loop;
            END IF;

            -- 1. Tính tổng tiền GỐC (vé + sản phẩm) của Receipt hiện tại
            SET v_receipt_gross_amount = 0.00;

            -- Tính tổng tiền vé của Receipt (T.Receipt_id thay cho T.Order_id)
            SELECT COALESCE(SUM(T.Price), 0) INTO v_receipt_gross_amount
            FROM Ticket T
            WHERE T.Receipt_id = v_receipt_id;
            
            -- Cộng tổng tiền sản phẩm của Receipt (OP.Receipt_id thay cho OP.Order_id)
            SELECT v_receipt_gross_amount + COALESCE(SUM(OP.Quantity * P.Price), 0) INTO v_receipt_gross_amount
            FROM Product P
            JOIN OrderProduct OP ON P.Product_id = OP.Product_id
            WHERE OP.Receipt_id = v_receipt_id;
            
            -- 2. Tính giảm giá và cộng vào tổng giảm giá
            -- Giảm giá = Tổng tiền gốc * Discount (%)
            SET v_total_discount = v_total_discount + (v_receipt_gross_amount * v_voucher_discount_percent / 100);

        END LOOP;
        
        CLOSE cur;
    END;

    RETURN v_total_discount;
END $$

DELIMITER ;

-- 16. hàm tinh Giá Trị Đơn Hàng Trung Bình (Avg Booking Value)
DELIMITER $$

DROP FUNCTION IF EXISTS fn_AvgReceiptValue $$
CREATE FUNCTION fn_AvgReceiptValue(
    p_start_date DATE,
    p_end_date DATE
)
RETURNS DECIMAL(14, 2)
READS SQL DATA
BEGIN
    DECLARE v_gross_tickets DECIMAL(14, 2) DEFAULT 0;
    DECLARE v_gross_products DECIMAL(14, 2) DEFAULT 0;
    DECLARE v_total_gross DECIMAL(14, 2) DEFAULT 0;
    DECLARE v_total_net_revenue DECIMAL(14, 2) DEFAULT 0;
    DECLARE v_total_receipts INT DEFAULT 0;

    -- 1. Calculate Ticket Revenue for the date range
    SELECT COALESCE(SUM(T.Price), 0) INTO v_gross_tickets
    FROM Ticket T
    JOIN Receipt R ON T.Receipt_id = R.Receipt_id
    WHERE R.Receipt_date BETWEEN p_start_date AND p_end_date;

    -- 2. Calculate Product Revenue for the date range
    SELECT COALESCE(SUM(OP.Quantity * P.Price), 0) INTO v_gross_products
    FROM OrderProduct OP
    JOIN Product P ON OP.Product_id = P.Product_id
    JOIN Receipt R ON OP.Receipt_id = R.Receipt_id
    WHERE R.Receipt_date BETWEEN p_start_date AND p_end_date;

    SET v_total_gross = v_gross_tickets + v_gross_products;

    -- 3. Calculate Net Revenue
    -- NOTE: Assuming fn_DiscountsApplied exists. If not, you must implement logic here.
    -- If fn_DiscountsApplied is missing, replace this line with discount logic.
    SET v_total_net_revenue = v_total_gross - IFNULL(fn_DiscountsApplied(p_start_date, p_end_date), 0);

    -- 4. Total Receipts count
    SELECT COUNT(Receipt_id) INTO v_total_receipts
    FROM Receipt 
    WHERE Receipt_date BETWEEN p_start_date AND p_end_date;

    IF v_total_receipts = 0 THEN
        RETURN 0.00;
    END IF;

    RETURN v_total_net_revenue / v_total_receipts;
END $$
DELIMITER ;

-- hàm tính Tỷ Lệ Lấp Đầy của một Suất Chiếu Cụ Thể (Low Performance Alert)
DELIMITER $$

DROP FUNCTION IF EXISTS fn_ShowtimeOccupancy $$
CREATE FUNCTION fn_ShowtimeOccupancy(
    p_showtime_id INT
)
RETURNS DECIMAL(5, 2)
READS SQL DATA
BEGIN
    DECLARE v_booked_seats INT;
    DECLARE v_total_seats INT;

    -- 1. Tổng số ghế đã được BOOKED (bán ra)
    SELECT COALESCE(COUNT(*), 0) INTO v_booked_seats
    FROM ShowtimeSeat SS
    WHERE SS.Showtime_id = p_showtime_id
      AND SS.Status = 'BOOKED';

    -- 2. Tổng số ghế khả dụng (Total Capacity) của suất chiếu
    SELECT COALESCE(COUNT(*), 0) INTO v_total_seats
    FROM ShowtimeSeat SS
    WHERE SS.Showtime_id = p_showtime_id;

    IF v_total_seats = 0 THEN
        RETURN 0.00;
    END IF;

    -- Trả về tỷ lệ phần trăm
    RETURN (v_booked_seats / v_total_seats) * 100;
END $$
DELIMITER ;

-- 17. Doanh Thu Net theo Phương Thức Thanh Toán
DELIMITER $$

DROP FUNCTION IF EXISTS fn_NetRevenueByPaymentMethod $$
CREATE FUNCTION fn_NetRevenueByPaymentMethod(
    p_method ENUM('CARD', 'UPI', 'BANK'),
    p_start_date DATE,
    p_end_date DATE
)
RETURNS DECIMAL(14, 2)
READS SQL DATA
BEGIN
    DECLARE v_net_revenue DECIMAL(14, 2) DEFAULT 0.00;
    
    -- 1. Lấy các Receipt_id có phương thức thanh toán này trong khoảng thời gian
    SELECT GROUP_CONCAT(R.Receipt_id) INTO @method_receipt_ids
    FROM Receipt R
    WHERE R.Method = p_method
      AND R.Receipt_date BETWEEN p_start_date AND p_end_date
      AND R.Receipt_id IS NOT NULL;

    IF @method_receipt_ids IS NULL THEN
        RETURN 0.00;
    END IF;

    -- 2. Tính Gross Revenue (Vé + Sản phẩm) của các Receipt này
    SELECT COALESCE(SUM(T.Price), 0) INTO @GrossTicketRevenue
    FROM Ticket T
    WHERE FIND_IN_SET(T.Receipt_id, @method_receipt_ids) > 0;
    
    SELECT @GrossTicketRevenue + COALESCE(SUM(OP.Quantity * P.Price), 0) INTO @GrossTotal
    FROM OrderProduct OP
    JOIN Product P ON OP.Product_id = P.Product_id
    WHERE FIND_IN_SET(OP.Receipt_id, @method_receipt_ids) > 0;
    
    SET v_net_revenue = @GrossTotal;

    -- 3. Tính và trừ đi Tổng Giảm Giá Voucher Đã Phân Bổ
    BEGIN
        DECLARE done INT DEFAULT FALSE;
        DECLARE v_receipt_id INT;
        DECLARE v_voucher_discount_percent DECIMAL(5, 2);
        DECLARE v_receipt_gross_amount_total DECIMAL(14, 2);
        
        -- Cursor chỉ chọn các Receipt đã lọc (theo Method) có dùng Voucher
        DECLARE cur CURSOR FOR
            SELECT R.Receipt_id, V.Discount
            FROM Receipt R
            JOIN CustomerVoucher CV ON R.Customer_id = CV.Customer_id AND R.CV_id = CV.CV_id
            JOIN Voucher V ON CV.Voucher_id = V.Voucher_id
            WHERE FIND_IN_SET(R.Receipt_id, @method_receipt_ids) > 0
              AND R.CV_id IS NOT NULL;

        DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

        OPEN cur;

        discount_loop: LOOP
            FETCH cur INTO v_receipt_id, v_voucher_discount_percent;
            IF done THEN LEAVE discount_loop; END IF;

            -- Tính Gross Revenue của TOÀN BỘ Hóa Đơn (để tính chiết khấu gốc)
            SELECT COALESCE(SUM(T_ALL.Price), 0) INTO v_receipt_gross_amount_total
            FROM Ticket T_ALL WHERE T_ALL.Receipt_id = v_receipt_id;
            
            SELECT v_receipt_gross_amount_total + COALESCE(SUM(OP_ALL.Quantity * P_ALL.Price), 0) INTO v_receipt_gross_amount_total
            FROM OrderProduct OP_ALL JOIN Product P_ALL ON OP_ALL.Product_id = P_ALL.Product_id
            WHERE OP_ALL.Receipt_id = v_receipt_id;

            -- Chỉ trừ chiết khấu nếu giao dịch có giá trị
            IF v_receipt_gross_amount_total > 0 THEN
                -- Giảm giá gốc của hóa đơn
                SET @total_receipt_discount = v_receipt_gross_amount_total * v_voucher_discount_percent / 100;
                
                -- Phân bổ giảm giá: Giả sử toàn bộ hóa đơn này thuộc phương thức thanh toán này
                SET v_net_revenue = v_net_revenue - @total_receipt_discount;
            END IF;

        END LOOP;
        
        CLOSE cur;
    END;

    RETURN v_net_revenue;
END $$
DELIMITER ;

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
