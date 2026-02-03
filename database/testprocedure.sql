USE db_assignment2;
DELIMITER $$


-- THIS IS TEST CASE PLACE FOR TESTING SOME AMAZING THING --


SET SQL_SAFE_UPDATES = 0;
-- Suppose we already have a customer with Customer_id = 1
-- We want to update only the Last Name to "Nguyen"

CALL update_customer(
    1,        -- p_customer_id
    NULL,     -- p_fname (don't change)
    'Long', -- p_lname (new value)
    NULL,     -- p_gender (don't change)
    NULL,     -- p_email (don't change)
    '12/1/200',     -- dob_input (don't change)
    NULL,     -- p_memid (don't change)
    NULL,     -- p_loyalpoint (don't change)
    NULL      -- p_phone (don't change)
);
SELECT * FROM Customer WHERE Customer_id = 1;

CALL update_movie(1,null,'abc',null,null,null,null,null,null,null,null,null,null,null);
SELECT * FROM Movie WHERE Movie_id=1;
CALL update_movie(1,null,'abc',null,null,null,null,null,null,null,'robert downey',null,null,null);
SELECT * FROM MovieActor WHERE Movie_id=1;
CALL update_movie(1,null,'abc',null,null,null,null,null,null,null,null,'4DX',null,null);
SELECT * FROM MovieFormat WHERE Movie_id=1;

CALL create_order('11:10:23 23/11/2025', 2, null, 12.0);
CALL update_order(6,'11:8:12 23/11/2025', null, null, null);
SELECT * FROM `Order`;

CALL create_ticket(120, 6, 1,1,1,1,'A1');
CALL update_ticket(6,2234,null,null,null,null,null,null);
SELECT * FROM `Ticket`;
SELECT * FROM `ShowtimeSeat`;
SELECT * FROM `Order`;

CALL create_food_drink('Cam ép', 30, 'Cam ép từ những trái cam tươi từ Nghệ An', 'Small', 'Combo');
CALL update_food_drink(11,'Cam ép đá tươi',null,null,'XXL','Drink');
SELECT * FROM `Food_Drink`;
SELECT * FROM `Product`;

CALL create_souvenir('Card batman', 199, 'card phim batman', 2);
CALL update_souvenir(12,'đồng hồ bruce wayne',null,'đồng hồ brucewayne',2);
SELECT * FROM `Souvenir`;
SELECT * FROM `Product`;
SELECT * FROM `Movie`;


CALL update_event(5, '1/1/2026', null, null, null, null, null, null);
SELECT * FROM `Event`;


CALL update_admin(5,null,null,null,'long.thaithienhai@hcmut.edu.vn',null,null,null);
SELECT * FROM `Admin`;
SELECT * FROM `Cinema_Branch`;

CALL update_cinema_branch(5,'Hà Nội',null,'Lotte Cinema Gò Vấp',null,null);
SELECT * FROM `Cinema_Branch`;

CALL update_cinema_branch(5,'Hà Nội',null,'Lotte Cinema Gò Vấp',null,null);
SELECT * FROM `Screen`;

CALL update_hall(3,1,'VIP',null);
SELECT * FROM `Hall`;

CALL update_showtime(5,1,'8:30',null,null,null,null);
SELECT * FROM `Showtime`;

CALL update_review(5,5,7,null,null);
SELECT * FROM `Review`;

CALL update_membership(5,null,'31/12/2024');
SELECT * FROM `Membership`;

CALL update_customer_voucher(5,2,'Expired',1);
SELECT * FROM `CustomerVoucher`;

CALL update_order_product(6,5,5);
SELECT * FROM `OrderProduct`;

CALL update_voucher(5, 100, null, 'Voucher giáng sinh');
SELECT * FROM `Voucher`;

CALL update_showtimeseat(1,1,1,1,'B2','AVAILABLE');
SELECT * FROM `ShowtimeSeat`;

CALL get_customers_by_membership('Bronze');
SELECT * FROM `Membership`;

CALL get_popular_movies_by_year(null);
SELECT * FROM `Ticket`;
SELECT * FROM `Movie`;

CALL read_showtime_by_branch(1);
SELECT * FROM `Showtime`;
SELECT * FROM `Movie`;
SELECT * FROM `Cinema_Branch`;

CALL update_privilege(5,null,'10/11/2025','Quà giáng sinh dành cho cặp đôi');
SELECT * FROM `Privilege`;

CALL update_receipt(5,'22/1/2026',null,'REFUNDED',null,null);
SELECT * FROM `Receipt`;


CALL GetLowOccupancyScreenings(0.10);

CALL GetTotalRevenueByPaymentMethod();
SELECT * FROM `Showtime`;
SELECT * FROM `Movie`;
SELECT * FROM `Cinema_Branch`;
SELECT * FROM `Hall`;
SELECT * FROM `Receipt`;
SELECT * FROM `Order`;
SELECT * FROM `Ticket`;

CALL get_monthly_revenue(2025,11);
SET SQL_SAFE_UPDATES = 1;
DELIMITER;


    
    
SELECT * FROM `CustomerVoucher`;
SELECT * FROM `Customer`;
SELECT * FROM `Receipt`;
SELECT * FROM `Ticket`;
SELECT * FROM `OrderProduct`;
CALL create_receipt ('24/11/2025', 'UPI', 4, 2, 5, 1, '100.00', 1, 1, 1, 1, 'A1');
	IN p_receipt_date VARCHAR(20),
    IN p_method VARCHAR(250),
    IN p_customer_id INT,
    IN p_cv_id INT,
    
    -- order product attr --
    -- IN p_receipt_id INT,
    IN p_product_id INT,
    IN p_quantity INT,
    
    -- ticket attr --
    IN p_price DECIMAL(10,2),
    -- IN p_receipt_id INT,
    IN p_movie_id INT,
    IN p_showtime_id INT,
    IN p_branch_id INT,
    IN p_hall_number INT,
    IN p_seat_number VARCHAR(10)
END $$


SELECT * FROM `Admin`;
SELECT * FROM `Movie`;
SELECT * FROM `MovieActor`;
SELECT * FROM `MovieGenres`;
CALL create_movie ("abcd","titeladsfhdsj","sdkfls.jpg","12/12/2025","Vietnamese","P",100,"this is abc",1,"luffy,zoro,jinbe,sanji","IMAX,4DX","English,Japanese,Korean","Action,Comedy")
CALL update_movie (8,null,null,null,null,null,null,null,null,null,"luffy,franky,zoro,robin",null,null,"Romance,Crime")
	IN p_director VARCHAR(100),
    IN p_title VARCHAR(200),
    IN p_image VARCHAR(255),   
    IN p_releasedate VARCHAR(20),  
    IN p_language VARCHAR(50),
    IN p_agerating VARCHAR(20),
    IN p_duration INT,
    IN p_description TEXT,
    IN p_adminid INT,
    IN p_actor TEXT,
    IN p_format VARCHAR(50),
    IN p_subtitle VARCHAR(50),
    IN p_genres VARCHAR(50)























-- test1 -- test the unique of the email of customer
SELECT * FROM Customer; 

CALL create_customer('Long','Thai','Male','long@gmail.com','1/2/2000',1,12,'0376631062');
CALL create_customer('Long','Thai','Male','long@gail.com','1/2/2000',2,12,'0322222222');
SELECT * FROM Customer; 
CALL create_customer('Long','Thai','Male','long@gail.com','1/2/2000',3,12,'0322234567');
-- output: Error Code: 1644. ERROR: The provided email already exists. Each customer must have a unique email. This is because the last call has same email as the second call

-- test2: test update customer
CALL update_customer(6,'Thai','Long','Male','long@yahoo.com','1/2/2000',NULL,12,'0322234567');
-- output: Error Code: 1644. ERROR: The membership cant be null.
CALL update_customer(6,'Thai','Long','Male','long@yahoo.com','1/2/2000',1,12,'0322234567');
-- output: success
SELECT * FROM Customer; 
SELECT * FROM CustomerPhone;

-- test3: test delete customer
CALL delete_customer(16);
-- output: Error Code: 1644. ERROR: Customer ID does not exist.
CALL delete_customer(6);
-- output: success

-- test4: test create movie
SELECT * FROM Cinema_Branch;
SELECT * FROM Admin;
CALL create_movie('Jordan Vogt Roberts','Kong: Skull Island','kong_skull_island_poster.jpg','10/03/2017','English','TP',118,
'A team of scientists and soldiers explore an uncharted island in the Pacific, 
unaware they are crossing into the domain of the mighty Kong.',3,'Tom Hiddleston','2D','Vietnamese','Action');
-- output: Error Code: 1644. ERROR: Age rating must be one of these: P, K, T13, T16, T18.
CALL create_movie('Jordan Vogt Roberts','Kong: Skull Island','kong_skull_island_poster.jpg','10/03/2017','English','T13',118,
'A team of scientists and soldiers explore an uncharted island in the Pacific, 
unaware they are crossing into the domain of the mighty Kong.',3,'Tom Hiddleston','2D','Vietnamese','Action');
-- output: success

-- test5: test update movie
SELECT * FROM Movie;
SELECT * FROM MovieSubtitle;
CALL update_movie(6,'Jordan Vogt Roberts','Kong: Skull Island','kong_skull_island_poster.jpg','10/03/2017','Vietnamese','T13',118,
'A team of scientists and soldiers explore an uncharted island in the Pacific, 
unaware they are crossing into the domain of the mighty Kong.',3,'Tom Hiddleston','2D','Vietnamese','Action');
-- output: Error Code: 1644. ERROR: Becareful! the subtitle has this language, you may want to change it.
CALL update_movie(6,'Jordan Vogt Roberts','Kong: Skull Island','2025.jpg','10/03/2017','English','T13',118,
'A team of scientists and soldiers explore an uncharted island in the Pacific, 
unaware they are crossing into the domain of the mighty Kong.',3,NULL,NULL,NULL,NULL);
-- output: Error Code: 1048. Column 'AActor' cannot be null (that is because the update run successful but fail 
-- at call insert_actor, if want to modified => run seperately)

-- test6: test delete movie
CALL delete_movie(6);
-- output: success
SELECT * FROM MovieSubtitle;
SELECT * FROM MovieGenres;
SELECT * FROM MovieActor;
SELECT * FROM MovieFormat;
-- check if the cascade delete all of its relation

-- presentation sql
-- Retrieve customer details who belong to a specific membership type (thanh vien bac for ex) base on loyal point order from high to low
-- prepare data
-- 🧍 New Customers (Silver-focused)
CALL create_customer('Lan','Nguyen','Female','lan@gmail.com','3/3/2001',2,100,'0901111222');       -- Silver
CALL create_customer('Minh','Tran','Male','minh@gmail.com','5/5/1994',2,120,'0912222333');          -- Silver
CALL create_customer('Hoa','Le','Female','hoa@gmail.com','6/6/1992',2,140,'0923333444');           -- Silver
CALL create_customer('Kien','Pham','Male','kien@gmail.com','7/7/1989',4,160,'0934444555');         -- Platinum
CALL create_customer('Thao','Ho','Female','thao@gmail.com','8/8/1996',2,110,'0945555666');         -- Silver
CALL create_customer('Quang','Vo','Male','quang@gmail.com','9/9/1993',2,130,'0956666777');         -- Silver
CALL create_customer('Dung','Phan','Female','dung@gmail.com','10/10/1995',3,150,'0967777888');     -- Gold
CALL create_customer('Tuan','Vu','Male','tuan@gmail.com','11/11/1990',2,170,'0978888999');          -- Silver
CALL create_customer('Mai','Dang','Female','mai@gmail.com','12/12/1997',2,120,'0989999000');       -- Silver
CALL create_customer('Hoang','Bui','Male','hoang@gmail.com','1/1/1991',1,140,'0990000111');        -- Bronze
SELECT * FROM Customer; 
-- procedure

DELIMITER ;
CALL get_customers_by_membership('Silver');

-- prepare data
-- Add more Orders
INSERT INTO `Order` (`Date`) VALUES
('2025-11-06'),
('2025-11-07'),
('2025-11-08'),
('2025-11-09'),
('2025-11-10');

-- Add more Tickets (multiple customers buy same movie)
INSERT INTO Ticket (Price, Order_id) VALUES
(150.00, 6),  -- Inception
(100.00, 7),  -- The Dark Knight
(150.00, 8),  -- Dune: Part One
(90.00, 9),  -- Avatar
(90.00, 10);  -- Avatar

-- Add more Has records (link tickets to movies)
INSERT INTO Has (Ticket_id, Movie_id, Showtime_id, Branch_id, Hall_number, Seat_number) VALUES
(6, 1, 1, 1, 1, 'A2'),   -- Inception (2nd ticket)
(7, 2, 1, 1, 1, 'A3'),   -- Dark Knight (2nd ticket)
(8, 3, 1, 1, 1, 'B1'),   -- Dune (2nd ticket)
(9, 5, 1, 1, 1, 'B2'),   -- Avatar (2nd ticket)
(10, 5, 1, 1, 1, 'A1');  -- Avatar (3rd ticket)

-- procedure2
-- Get the most popular movie based on revenue

DELIMITER ;

-- Example usage:
CALL get_popular_movies_by_revenue(1);

SELECT * FROM Has;


-- language --
    -- IF p_language IS NOT NULL AND p_language != old_language THEN
	--	IF p_language NOT IN ('Vietnamese', 'English', 'Japanese') THEN
	--		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Language must be valid like: Vietnamese, English, Japanese,...';
	--	ELSEIF EXISTS (SELECT 1 FROM MovieSubtitle WHERE Movie_id = p_movie_id AND p_language = ASubtitle) THEN
	--		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Becareful! the subtitle has this language, you may want to change it';
	--	END IF;
	-- END IF;
    
DELIMITER $$