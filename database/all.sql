DROP DATABASE IF EXISTS db_assignment2;

create database db_assignment2
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

use db_assignment2;

CREATE TABLE Movie (
    Movie_id INT PRIMARY KEY AUTO_INCREMENT,
    Director VARCHAR(100),
    Title VARCHAR(200),
    Image VARCHAR(255),
    Release_date DATE,  
    Language VARCHAR(50),
    Age_rating VARCHAR(20),
    Duration INT,
    Description TEXT,
    Admin_id INT NOT NULL
) ENGINE=InnoDB
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

INSERT INTO Movie (Director, Title, Image, Release_date, Language, Age_rating, Duration, Description, Admin_id)
VALUES
('Christopher Nolan', 'Inception', 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_FMjpg_UX1000_.jpg', '2010-07-16', 'English', 'PG-13', 148, 'A skilled thief enters people’s dreams to steal secrets.', 1),
('Christopher Nolan', 'The Dark Knight', 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_FMjpg_UX1000_.jpg', '2008-07-18', 'English', 'PG-13', 152, 'Batman faces the Joker in Gotham’s battle for justice.', 1),
('Denis Villeneuve', 'Dune: Part One', 'https://m.media-amazon.com/images/M/MV5BNWIyNmU5MGYtZDZmNi00ZjAwLWJlYjgtZTc0ZGIxMDE4ZGYwXkEyXkFqcGc@._V1_.jpg', '2021-10-22', 'English', 'PG-13', 155, 'A noble family becomes embroiled in a war for control of the desert planet Arrakis.', 2),
('Greta Gerwig', 'Barbie', 'https://resizing.flixster.com/-XZAfHZM39UwaGJIFWKAE8fS0ak=/v3/t/assets/p13472534_p_v8_am.jpg', '2023-07-21', 'English', 'PG-13', 114, 'Barbie and Ken explore the real world after leaving Barbie Land.', 2),
('James Cameron', 'Avatar: The Way of Water', 'https://upload.wikimedia.org/wikipedia/en/5/54/Avatar_The_Way_of_Water_poster.jpg', '2022-12-16', 'English', 'PG-13', 192, 'Jake Sully and Neytiri must protect their family from new threats on Pandora.', 1);

-- Bảng Customer
CREATE TABLE Customer (
    Customer_id INT PRIMARY KEY AUTO_INCREMENT,
    FName VARCHAR(50),
    LName VARCHAR(50),
    Gender ENUM('Male','Female','Other'),
    Email VARCHAR(100),
    Date_of_birth DATE,
    Membership_id INT NOT NULL,
    Loyal_point INT DEFAULT 0,
    Password VARCHAR(100)
) ENGINE=InnoDB
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
INSERT INTO Customer (FName, LName, Gender, Email, Date_of_birth, Membership_id, Loyal_point, Password)
VALUES
('Nguyen', 'Anh', 'Male', 'anh.nguyen@example.com', '1999-06-15', 1, 200, "12345678"),
('Tran', 'My', 'Female', 'my.tran@example.com', '2000-03-22', 2, 600, "12345678"),
('Le', 'Khang', 'Male', 'khang.le@example.com', '1998-11-10', 3, 1200, "12345678"),
('Pham', 'Tuan', 'Male', 'tuan.pham@example.com', '1995-02-05', 4, 2500, "12345678"),
('Do', 'Linh', 'Female', 'linh.do@example.com', '2001-09-30', 5, 100, "12345678");


-- Bảng Review
CREATE TABLE Review(
    Movie_id INT,
    Customer_id INT,
    Rating Decimal(2,1),
    Date_comment Date,
    Comment VARCHAR(250),
    spoiler_tag enum('spoiler', 'non_spoiler') NOT NULL DEFAULT 'non_spoiler',
    FOREIGN KEY(Movie_id) REFERENCES Movie(Movie_id),
    FOREIGN KEY(Customer_id) REFERENCES Customer(Customer_id)
)ENGINE=InnoDB
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
INSERT INTO Review (Movie_id, Customer_id, Rating, Date_comment, Comment)
VALUES
(1, 1, 9.0, '2025-11-01', 'Inception mind-blowing, loved the concept!'),
(2, 2, 8.5, '2025-11-02', 'The Joker performance was amazing.'),
(3, 3, 9.2, '2025-11-03', 'Epic visuals and storytelling in Dune.'),
(4, 4, 7.8, '2025-11-04', 'Fun movie with great humor and colors.'),
(5, 5, 9.5, '2025-11-05', 'Avatar 2 has stunning underwater scenes.');


-- Membership
CREATE TABLE Membership (
    Membership_id INT PRIMARY KEY AUTO_INCREMENT,
    Type VARCHAR(50),
    Start_Date DATE
) ENGINE=InnoDB
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
INSERT INTO Membership (Type, Start_Date)
VALUES
('Bronze', '2023-01-01'),
('Silver', '2023-03-15'),
('Gold', '2023-06-10'),
('Platinum', '2023-09-01'),
('Bronze', '2023-06-10');

-- Privilege
CREATE TABLE Privilege (
    Privilege_id INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100),
    Expiration DATE,
    Description TEXT
) ENGINE=InnoDB
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
INSERT INTO Privilege (Name, Expiration, Description)
VALUES
('Free Small Popcorn', '2025-12-31', 'Nhận 1 phần bắp nhỏ miễn phí mỗi khi mua vé.'),
('10% Discount on Tickets', '2025-12-31', 'Giảm 10% giá vé xem phim cho thành viên.'),
('Free Drink Upgrade', '2025-12-31', 'Nâng cấp nước ngọt lên cỡ lớn miễn phí.'),
('Priority Seat Selection', '2025-12-31', 'Được ưu tiên chọn chỗ ngồi trước khi mở bán công khai.'),
('Free Birthday Ticket', '2025-12-31', 'Nhận 1 vé miễn phí trong tháng sinh nhật.');


-- ACCESS(Relationship)
CREATE TABLE Access(
    Membership_id INT,
    Privilege_id INT,
    PRIMARY KEY(Membership_id, Privilege_id),
    FOREIGN KEY (Membership_id) REFERENCES Membership(Membership_id),
    FOREIGN KEY (Privilege_id) REFERENCES Privilege(Privilege_id)
) ENGINE=InnoDB
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
INSERT INTO Access (Membership_id, Privilege_id)
VALUES
-- Bronze
(1, 1),
(5, 1),
-- Silver
(2, 1),
(2, 2),
-- Gold
(3, 1),
(3, 2),
(3, 3),
(3, 4),
-- Platinum
(4, 1),
(4, 2),
(4, 3),
(4, 4),
(4, 5);


-- Cinema_Branch
CREATE TABLE Cinema_Branch (
    Branch_id INT PRIMARY KEY AUTO_INCREMENT,
    City VARCHAR(100),
    Address VARCHAR(255),
    Name VARCHAR(100),
    Admin_id INT UNIQUE NOT NULL
) ENGINE=InnoDB
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

INSERT INTO Cinema_Branch (City, Address, Name, Admin_id)
VALUES
('TP. Hồ Chí Minh', '469 Nguyễn Hữu Thọ, Quận 7', 'Lotte Cinema Nam Sài Gòn', 1),
('TP. Hồ Chí Minh', '60A Trường Sơn, Quận Tân Bình', 'Lotte Cinema Cộng Hòa', 2),
('TP. Hồ Chí Minh', '968 Ba Tháng Hai, Quận 11', 'Lotte Cinema Lê Đại Hành', 3),
('TP. Hồ Chí Minh', '242 Nguyễn Văn Lượng, Quận Gò Vấp', 'Lotte Cinema Gò Vấp', 4),
('TP. Hồ Chí Minh', '469 Nguyễn Hữu Cảnh, Quận Bình Thạnh', 'Lotte Cinema Pearl Plaza', 5);



-- Admin
CREATE TABLE Admin (
    Admin_id INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100),
    Gender ENUM('Male','Female','Other'),
    Date_of_birth DATE,
    Email VARCHAR(100),
    Branch_id INT,
    Admin_Manager_id INT default NULL,
    Password VARCHAR(100),
    FOREIGN KEY (Branch_id) REFERENCES Cinema_Branch(Branch_id),
    FOREIGN KEY (Admin_Manager_id) REFERENCES Admin(Admin_id)
) ENGINE=InnoDB
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
INSERT INTO Admin (Name, Gender, Date_of_birth, Email, Branch_id, Admin_Manager_id, Password)
VALUES ('Nguyễn Văn Minh', 'Male', '1980-05-20', 'minh.nguyen@cinema.vn', NULL, NULL, "primarypass");

INSERT INTO Admin (Name, Gender, Date_of_birth, Email, Branch_id, Admin_Manager_id, Password)
VALUES
('Trần Văn Hà', 'Male', '2000-01-01', 'ha.trann@cinema.vn', 1, 1, 'regularpass'),
('Trần Thị Lan', 'Female', '1988-09-12', 'lan.tran@cinema.vn', 2, 1, "regularpass"),
('Phạm Quang Huy', 'Male', '1990-03-08', 'huy.pham@cinema.vn', 3, 1, "regularpass"),
('Lê Mỹ Duyên', 'Female', '1992-11-22', 'duyen.le@cinema.vn', 4, 1, "regularpass"),
('Hoàng Anh Tuấn', 'Male', '1985-07-15', 'tuan.hoang@cinema.vn', 5, 1, "regularpass");

-- Voucher
CREATE TABLE Voucher (
    Voucher_id INT PRIMARY KEY AUTO_INCREMENT,
    Discount DECIMAL(5,2),
    Expiration DATE,
    `Description` VARCHAR(255),
    `Condition` VARCHAR(255)
) ENGINE=InnoDB
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
INSERT INTO Voucher (Discount, Expiration, `Description`, `Condition`)
VALUES
(5.00,  '2025-12-31', 'Giảm 5% cho đơn hàng trên $100', 'gt_$100'),
(10.00, '2025-12-31', 'Giảm 10% cho đơn hàng trên $200', 'gt_$200'),
(15.00, '2025-12-31', 'Giảm 15% cho thành viên Silver trở lên', 'No'),
(20.00, '2025-12-31', 'Giảm 20% cho thành viên Gold trở lên', 'No'),
(25.00, '2025-12-31', 'Voucher sinh nhật – giảm 25% mọi hóa đơn trong tháng sinh nhật', 'No');

-- CustomerVoucher
CREATE TABLE CustomerVoucher(
    Customer_id INT,
    CV_id INT, -- cái này xài trigger để nó tự tăng ví dụ (1,1) (1,2) (2,1)
    PRIMARY KEY(Customer_id, CV_id),
    Status VARCHAR(250),
    Voucher_id INT NOT NULL,
    FOREIGN KEY (Customer_id) REFERENCES Customer(Customer_id),
    FOREIGN KEY (Voucher_id) REFERENCES Voucher(Voucher_id)
) ENGINE=InnoDB
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
INSERT INTO CustomerVoucher (Customer_id, CV_id, Status, Voucher_id)
VALUES
(1, 1, 'Used', 1),
(1, 2, 'Unused', 2),
(2, 1, 'Unused', 3),
(2, 2, 'Used', 1),
(3, 1, 'Expired', 4),
(3, 2, 'Unused', 5),
(4, 1, 'Used', 2),
(4, 2, 'Unused', 3),
(5, 1, 'Unused', 5),
(5, 2, 'Unused', 1);


-- Product
CREATE TABLE Product (
    Product_id INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100),
    Price DECIMAL(10,2),
    Description TEXT
) ENGINE=InnoDB
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
INSERT INTO Product (Name, Price, Description)
VALUES
-- Food & Drink
('Popcorn Combo', 79.00, 'Combo bắp rang bơ và nước ngọt cỡ lớn'),
('Coca-Cola', 35.00, 'Lon Coca-Cola 330ml'),
('Nachos Cheese', 65.00, 'Nachos giòn với phô mai nóng chảy'),
('Caramel Popcorn', 85.00, 'Bắp rang vị caramel thơm ngọt'),
('Iced Latte', 55.00, 'Cà phê sữa đá mát lạnh tại rạp'),
-- Souvenir
('Inception Poster', 99.00, 'Poster phim Inception khổ A2'),
('Batman Action Figure', 199.00, 'Mô hình Batman tỉ lệ 1:10'),
('Dune Sand Keychain', 89.00, 'Móc khóa chủ đề hành tinh Arrakis'),
('Barbie Doll Limited', 249.00, 'Búp bê Barbie phiên bản rạp 2023'),
('Avatar Necklace', 129.00, 'Dây chuyền lấy cảm hứng từ Pandora');

-- Food_Drink
CREATE TABLE Food_Drink(
    Product_id INT PRIMARY KEY,
    `Size` ENUM('SMALL', 'MEDIUM', 'LARGE'),
    `Type` VARCHAR(100),
    FOREIGN KEY(Product_id) REFERENCES Product(Product_id)
        ON DELETE CASCADE
)ENGINE=InnoDB
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
INSERT INTO Food_Drink (Product_id, `Size`, `Type`)
VALUES
(1, "LARGE", 'Combo'),
(2, "LARGE", 'Drink'),
(3, "SMALL", 'Snack'),
(4, "LARGE", 'Sweet'),
(5, "MEDIUM", 'Coffee');

-- Souvenir
CREATE TABLE Souvenir(
    Product_id INT PRIMARY KEY,
    Movie_id INT NOT NULL,
    FOREIGN KEY (Product_id) REFERENCES Product(Product_id) 
        ON DELETE CASCADE,
    FOREIGN KEY (Movie_id) REFERENCES Movie(Movie_id)
        ON DELETE CASCADE
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;
INSERT INTO Souvenir (Product_id, Movie_id)
VALUES
(6, 1),  -- Inception Poster → Inception
(7, 2),  -- Batman Action Figure → The Dark Knight
(8, 3),  -- Dune Sand Keychain → Dune: Part One
(9, 4),  -- Barbie Doll Limited → Barbie
(10, 5); -- Avatar Necklace → Avatar: The Way of Water

-- OrderProduct (relationship)
CREATE TABLE OrderProduct(
    OrderProduct_id INT AUTO_INCREMENT,
    Receipt_id INT NOT NULL,
    PRIMARY KEY(OrderProduct_id, Receipt_id),
    Product_id INT NOT NULL,
    Quantity INT default 1,
    FOREIGN KEY (Product_id) REFERENCES Product(Product_id)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci; 

-- Event
CREATE TABLE Event (
    Event_id INT PRIMARY KEY AUTO_INCREMENT,
    Start_date DATE,
    End_date DATE,
    Title VARCHAR(255) NOT NULL,
    Image VARCHAR(255),
    Description TEXT,
    Admin_id INT NOT NULL,
    Type VARCHAR(100),
    FOREIGN KEY (Admin_id) REFERENCES Admin(Admin_id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
INSERT INTO Event (Start_date, End_date, Title, Image, Description, Admin_id, Type)
VALUES
('2025-11-01', '2025-11-10', 'Inception Week', 'https://spaces.filmstories.co.uk/uploads/2020/03/Inception-poster.jpg', 'Tuần lễ phim Inception cùng ưu đãi 20%', 1, 'Promotion'),
('2025-12-01', '2025-12-20', 'Christmas Movie Fest', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDi0c7BEbFVRycX0YdHYTi1ajICsmKK3x3Jw&s', 'Chuỗi phim Giáng Sinh đặc biệt', 1, 'Festival'),
('2025-10-15', '2025-10-25', 'Halloween Horror Night', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtbra9mjH0v8IXIVplppwxAuw8idecp_YRYw&s', 'Chiếu các phim kinh dị nổi tiếng', 1, 'Event'),
('2025-11-20', '2025-11-30', 'Barbie Pink Week', 'https://static.independent.co.uk/2023/04/28/05/Film_Summer_Movie_Preview_87196.jpg?width=1200&height=900&fit=crop', 'Tuần lễ Barbie với quà tặng độc quyền', 1, 'Promotion'),
('2025-12-25', '2026-01-05', 'New Year Premiere', 'https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F1170746519%2F2671093886421%2F1%2Foriginal.20251112-005816?h=230&w=460&auto=format%2Ccompress&q=75&sharp=10&rect=0%2C19%2C1920%2C960&s=8be4ed173b73b8c2251786bbcfdf2ea5', 'Công chiếu phim mới mừng năm mới', 1, 'Premiere');

-- Locate(Relationship)
CREATE TABLE Locate (
    Event_id INT,
    Branch_id INT,
    PRIMARY KEY (Event_id, Branch_id),
    FOREIGN KEY (Event_id) REFERENCES Event(Event_id)
        ON DELETE CASCADE,
    FOREIGN KEY (Branch_id) REFERENCES Cinema_Branch(Branch_id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
INSERT INTO Locate (Event_id, Branch_id)
VALUES
(1, 1),
(1, 5),
(2, 2),
(3, 3),
(4, 4);

-- Hall
CREATE TABLE Hall (
    Branch_id INT,
    Hall_number INT,
    Type VARCHAR(100),
    Seat_capacity INT CHECK (Seat_capacity > 0),
    Row_count INT default 12, -- số ghế 1 dãy
    Col_count INT default 20, -- số dãy
    PRIMARY KEY (Branch_id, Hall_number),
    FOREIGN KEY (Branch_id) REFERENCES Cinema_Branch(Branch_id) 
        ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
INSERT INTO Hall (Branch_id, Hall_number, Type, Seat_capacity, Row_count, Col_count)
VALUES 
(1, 1, 'IMAX', 150, 12, 20),
(1, 2, '4DX', 180, 14, 18),
(1, 3, 'IMAX', 100, 10, 12), 
(2, 1, 'Standard', 200, 16, 18),
(2, 2, 'Standard', 150, 12, 15),
(2, 3, 'Standard', 120, 10, 10),
(3, 1, '2D', 160, 12, 16),
(3, 2, 'Standard', 90, 8, 12),
(3, 3, 'Premium', 130, 10, 14),
(4, 1, '3D', 120, 10, 12),
(4, 2, 'Standard', 80, 8, 10),
(5, 1, 'IMAX', 220, 14, 20),
(5, 2, 'Standard', 160, 10, 16),
(5, 3, 'Standard', 100, 10, 10);


-- Screen(Relationship)
CREATE TABLE Screen (
    Branch_id INT,
    Movie_id INT,
    PRIMARY KEY (Branch_id, Movie_id),
    FOREIGN KEY (Branch_id) REFERENCES Cinema_Branch(Branch_id),
    FOREIGN KEY (Movie_id) REFERENCES Movie(Movie_id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
INSERT INTO Screen (Branch_id, Movie_id)
VALUES
(1, 1),  -- Lotte Nam Sài Gòn chiếu Inception
(1, 2),  -- Lotte Nam Sài Gòn chiếu The Dark Knight
(2, 3),  -- Lotte Cộng Hòa chiếu Dune: Part One
(3, 4),  -- Lotte Lê Đại Hành chiếu Barbie
(4, 5),  -- Lotte Gò Vấp chiếu Avatar: The Way of Water
(5, 1),  -- Lotte Pearl Plaza chiếu Inception
(5, 3),  -- Lotte Pearl Plaza chiếu Dune: Part One
(5, 4);  -- Lotte Pearl Plaza chiếu Barbie

-- Seat
CREATE TABLE Seat (
    Branch_id INT,
    Hall_number INT,
    Seat_number VARCHAR(10),
    Seat_type ENUM('STANDARD', 'VIP', 'COUPLE', 'ACCESSIBLE', 'BOOKED'),
    PRIMARY KEY (Branch_id, Hall_number, Seat_number),
    FOREIGN KEY (Branch_id, Hall_number) REFERENCES Hall(Branch_id, Hall_number)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

DELIMITER $$

CREATE PROCEDURE GenerateSeats()
BEGIN
    DECLARE done INT DEFAULT FALSE;

    DECLARE b_id INT;
    DECLARE h_num INT;
    DECLARE row_cnt INT;
    DECLARE col_cnt INT;

    -- Cursor
    DECLARE hall_cursor CURSOR FOR
        SELECT Branch_id, Hall_number, Row_count, Col_count
        FROM Hall;

    -- Handler
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN hall_cursor;

    read_loop: LOOP
        FETCH hall_cursor INTO b_id, h_num, row_cnt, col_cnt;

        IF done THEN
            LEAVE read_loop;
        END IF;

        SET @i = 1;

        WHILE @i <= row_cnt DO
            SET @row_char = CHAR(64 + @i); -- 1→A, 2→B,...

            SET @j = 1;
            WHILE @j <= col_cnt DO

                SET @seat_num = CONCAT(@row_char, @j);

                INSERT INTO Seat(Branch_id, Hall_number, Seat_number, Seat_type)
                VALUES (b_id, h_num, @seat_num, 'STANDARD');

                SET @j = @j + 1;
            END WHILE;

            SET @i = @i + 1;
        END WHILE;

    END LOOP;

    CLOSE hall_cursor;

END$$

DELIMITER ;

CALL GenerateSeats();


-- Showtime
CREATE TABLE Showtime (
    Showtime_id INT PRIMARY KEY AUTO_INCREMENT,
    Movie_id INT NOT NULL,
    Start_time TIME NOT NULL,
    Date DATE NOT NULL,
    Format VARCHAR(50),
    Subtitle VARCHAR(50),
    Branch_id INT NOT NULL,
    Hall_number INT NOT NULL,
    FOREIGN KEY (Movie_id) REFERENCES Movie(Movie_id),
    FOREIGN KEY (Branch_id, Hall_number) REFERENCES Hall(Branch_id, Hall_number)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
INSERT INTO Showtime (Movie_id, Start_time, Date, Format, Subtitle, Branch_id, Hall_number)
VALUES
(1, '10:00:00', '2025-11-23', 'IMAX', 'English', 1, 1),
(1, '10:00:00', '2025-11-23', 'IMAX', 'English', 1, 3),
(2, '10:00:00', '2025-11-23', '4DX', 'Vietnamese', 1, 2),
(2, '13:00:00', '2025-11-23', '4DX', 'Vietnamese', 1, 2),
(3, '16:00:00', '2025-11-24', 'Standard', 'English', 2, 1),
(4, '19:00:00', '2025-11-24', '2D', 'Vietnamese', 3, 1),
(5, '09:00:00', '2025-11-24', '3D', 'English', 4, 1);




-- ShowtimeSeat
CREATE TABLE ShowtimeSeat(
    Movie_id INT,
    Showtime_id INT,
    Branch_id INT,
    Hall_number INT,
    Seat_number VARCHAR(10),
    Status ENUM('AVAILABLE', 'BOOKED', 'BLOCKED') DEFAULT 'AVAILABLE',
    PRIMARY KEY(Showtime_id, Branch_id, Hall_number, Seat_number),
    FOREIGN KEY (Showtime_id) REFERENCES Showtime(Showtime_id)
        ON DELETE CASCADE,
    FOREIGN KEY (Branch_id, Hall_number, Seat_number) REFERENCES Seat(Branch_id, Hall_number, Seat_number)
        ON DELETE CASCADE
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;
DELIMITER $$

DROP PROCEDURE IF EXISTS GenerateShowtimeSeats;
DELIMITER $$

CREATE PROCEDURE GenerateShowtimeSeats()
BEGIN
    DECLARE done INT DEFAULT FALSE;

    DECLARE v_showtime_id INT;
    DECLARE v_movie_id INT;
    DECLARE v_branch_id INT;
    DECLARE v_hall_number INT;

    DECLARE cur CURSOR FOR
        SELECT Showtime_id, Movie_id, Branch_id, Hall_number
        FROM Showtime;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN cur;

    read_loop: LOOP
        FETCH cur INTO v_showtime_id, v_movie_id, v_branch_id, v_hall_number;

        IF done THEN
            LEAVE read_loop;
        END IF;

        -- Insert all seats in the hall
        INSERT INTO ShowtimeSeat(Showtime_id, Movie_id, Branch_id, Hall_number, Seat_number, Status)
        SELECT 
            v_showtime_id,
            v_movie_id,
            v_branch_id,
            v_hall_number,
            s.Seat_number,
            'AVAILABLE'
        FROM Seat AS s
        WHERE s.Branch_id = v_branch_id
          AND s.Hall_number = v_hall_number;
    END LOOP;

    CLOSE cur;

END$$

DELIMITER ;

CALL GenerateShowtimeSeats();



-- Ticket
CREATE TABLE Ticket (
    Ticket_id INT PRIMARY KEY AUTO_INCREMENT,
    Price DECIMAL(10,2) CHECK (Price >= 0),
    Receipt_id INT,
    Movie_id INT,
    Showtime_id INT,
    Branch_id INT,
    Hall_number INT,
    Seat_number VARCHAR(10),
    FOREIGN KEY (Showtime_id, Branch_id, Hall_number, Seat_number) REFERENCES ShowtimeSeat(Showtime_id, Branch_id, Hall_number, Seat_number)
        ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- Receipt
CREATE TABLE Receipt(
    Receipt_id INT PRIMARY KEY AUTO_INCREMENT,
    Receipt_date DATE,
    Method ENUM('CARD', 'UPI', 'BANK') DEFAULT 'CARD',
    Customer_id INT NOT NULL,
    CV_id INT,
    FOREIGN KEY (Customer_id) REFERENCES Customer(Customer_id),
    FOREIGN KEY (Customer_id, CV_id) REFERENCES CustomerVoucher(Customer_id, CV_id)
) ENGINE=InnoDB
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

INSERT INTO Receipt (Receipt_date, Method, Customer_id, CV_id)
VALUES
('2025-11-01 10:00:00', 'CARD', 1, 1),
('2025-11-02 14:30:00', 'CARD', 2, 1),
('2025-11-03 18:45:00', 'CARD', 3, 1),
('2025-11-04 20:00:00', 'CARD', 4, 1),
('2025-11-05 09:00:00', 'CARD', 5, 1);

INSERT INTO Ticket 
(Price, Receipt_id, Movie_id, Showtime_id, Branch_id, Hall_number, Seat_number)
VALUES
(120.00, 1, 1, 1, 1, 1, 'A1'),
(120.00, 2, 1, 1, 1, 1, 'A2'),
(120.00, 3, 1, 1, 1, 1, 'A3'),
(110.00, 4, 1, 1, 1, 1, 'B1'),
(110.00, 5, 1, 1, 1, 1, 'B2');

INSERT INTO OrderProduct (Receipt_id, Product_id, Quantity)
VALUES
(1, 1, 1),  
(1, 2, 2),  
(2, 3, 3),  
(3, 6, 1),  
(4, 9, 2),  
(5, 10, 1), 
(5, 5, 2); 

-- AdminPhone
CREATE TABLE AdminPhone(
    Admin_id INT,
    APhone VARCHAR(15),
    PRIMARY KEY (Admin_id, APhone),
    FOREIGN KEY (Admin_id) REFERENCES Admin(Admin_id)
        ON DELETE CASCADE
) ENGINE=InnoDB
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
INSERT INTO AdminPhone (Admin_id, APhone)
VALUES
(1, '0901234567'),
(2, '0902345678'),
(3, '0903456789'),
(4, '0904567890'),
(5, '0905678901');

-- CustomerPhone
CREATE TABLE CustomerPhone (
    Customer_id INT,
    CPhone VARCHAR(15),
    PRIMARY KEY (Customer_id, CPhone),
    FOREIGN KEY (Customer_id) REFERENCES Customer(Customer_id)
        ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
INSERT INTO CustomerPhone (Customer_id, CPhone)
VALUES
(1, '0911111111'),
(2, '0912222222'),
(3, '0913333333'),
(4, '0914444444'),
(5, '0915555555');

-- BranchPhone
CREATE TABLE BranchPhone(
    Branch_id INT,
    BPhone VARCHAR(15),
    PRIMARY KEY (Branch_id, BPhone),
    FOREIGN KEY (Branch_id) REFERENCES Cinema_Branch(Branch_id)
        ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
INSERT INTO BranchPhone (Branch_id, BPhone)
VALUES
(1, '0281234567'),
(2, '0282345678'),
(3, '0283456789'),
(4, '0284567890'),
(5, '0285678901');

-- Movie - Actor
CREATE TABLE MovieActor (
    Movie_id INT,
    AActor VARCHAR(100),
    PRIMARY KEY (Movie_id, AActor),
    FOREIGN KEY (Movie_id) REFERENCES Movie(Movie_id)
        ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
INSERT INTO MovieActor (Movie_id, AActor)
VALUES
(1, 'Leonardo DiCaprio'),
(2, 'Christian Bale'),
(3, 'Timothée Chalamet'),
(4, 'Margot Robbie'),
(5, 'Sam Worthington');


-- Movie - Format
CREATE TABLE MovieFormat (
    Movie_id INT,
    AFormat VARCHAR(50),
    PRIMARY KEY (Movie_id, AFormat),
    FOREIGN KEY (Movie_id) REFERENCES Movie(Movie_id)
        ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
INSERT INTO MovieFormat (Movie_id, AFormat)
VALUES
(1, 'IMAX'),
(2, '4DX'),
(3, 'Standard'),
(4, '2D'),
(5, '3D');


-- Movie - Subtitle
CREATE TABLE MovieSubtitle (
    Movie_id INT,
    ASubtitle VARCHAR(50),
    PRIMARY KEY (Movie_id, ASubtitle),
    FOREIGN KEY (Movie_id) REFERENCES Movie(Movie_id)
        ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
INSERT INTO MovieSubtitle (Movie_id, ASubtitle)
VALUES
(1, 'English'),
(2, 'Vietnamese'),
(3, 'English'),
(4, 'Vietnamese'),
(5, 'English');

-- Movie - Genres
CREATE TABLE MovieGenres (
    Movie_id INT,
    AGenres VARCHAR(50),
    PRIMARY KEY (Movie_id, AGenres),
    FOREIGN KEY (Movie_id) REFERENCES Movie(Movie_id)
        ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
INSERT INTO MovieGenres (Movie_id, AGenres)
VALUES
(1, 'Sci-Fi'),
(2, 'Action'),
(3, 'Adventure'),
(4, 'Comedy'),
(5, 'Fantasy');

-- THÊM KHÓA NGOẠI SAU KHI BẢNG CHA ĐÃ TẠO
ALTER TABLE Movie
ADD CONSTRAINT fk_movie_admin FOREIGN KEY (Admin_id) REFERENCES Admin(Admin_id);

ALTER TABLE Customer
ADD CONSTRAINT fk_customer_membership FOREIGN KEY (Membership_id) REFERENCES Membership(Membership_id);

ALTER TABLE Cinema_Branch
ADD CONSTRAINT fk_branch_admin FOREIGN KEY (Admin_id) REFERENCES Admin(Admin_id);

ALTER TABLE OrderProduct
ADD CONSTRAINT fk_reciept_product FOREIGN KEY(Receipt_id) REFERENCES  Receipt(Receipt_id);

ALTER TABLE Ticket
ADD CONSTRAINT fk_reciept_ticket FOREIGN KEY(Receipt_id) REFERENCES  Receipt(Receipt_id);

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
    DECLARE v_total_net_revenue DECIMAL(14, 2);
    DECLARE v_total_receipts INT;

    -- Lấy Tổng Doanh Thu Net trong khoảng thời gian (Cần viết lại logic NET Revenue cho DATE RANGE)
    -- Tạm thời gọi lại logic tính NET Revenue, nhưng áp dụng cho Date Range thay vì Month/Year
    -- (Để đơn giản, ta dùng Gross và trừ đi Total Discount)
    
    SELECT COALESCE(SUM(T.Price), 0) + COALESCE(SUM(OP.Quantity * P.Price), 0) INTO @GrossRevenue
    FROM Receipt R
    LEFT JOIN Ticket T ON R.Receipt_id = T.Receipt_id
    LEFT JOIN OrderProduct OP ON R.Receipt_id = OP.Receipt_id
    LEFT JOIN Product P ON OP.Product_id = P.Product_id
    WHERE R.Receipt_date BETWEEN p_start_date AND p_end_date;
    
    SET v_total_net_revenue = @GrossRevenue - fn_DiscountsApplied(p_start_date, p_end_date);

    -- Tổng số giao dịch (Receipts)
    SELECT COUNT(R.Receipt_id) INTO v_total_receipts
    FROM Receipt R
    WHERE R.Receipt_date BETWEEN p_start_date AND p_end_date;

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

select * from customerphone;

DELIMITER $$

DROP PROCEDURE IF exists login_customer $$
CREATE PROCEDURE login_customer
(
    IN p_email VARCHAR(100),
    IN p_password VARCHAR(255)
)
BEGIN
    DECLARE v_customer_id INT;

    -- Check if customer exists and password matches
    SELECT Customer_id INTO v_customer_id
    FROM Customer
    WHERE Email = p_email AND Password = p_password;
    
    -- Check for existence
    IF v_customer_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Invalid email or password.';
    END IF;
    
    -- Login successful, return customer data including phone number from CustomerPhone
    SELECT
        C.Customer_id as Customer_id,
        C.FName as FName,
        C.LName as LName,
        C.Gender as Gender,
        C.Email as Email,
        -- Use MAX(CP.Phone_number) to return a single phone number if multiple exist.
        -- If no phone number exists, this will return NULL.
        MAX(CP.CPhone) AS Phone,
        DATE_FORMAT(C.Date_of_birth, '%d/%m/%Y') AS Date_of_birth,
        C.Membership_id as Membership_id,
        C.Loyal_point as Loyal_point
    FROM Customer C
    LEFT JOIN CustomerPhone CP ON C.Customer_id = CP.Customer_id
    WHERE C.Customer_id = v_customer_id
    GROUP BY 
        C.Customer_id, C.FName, C.LName, C.Gender, C.Email, 
        C.Date_of_birth, C.Membership_id, C.Loyal_point;
    
END $$

DROP PROCEDURE IF exists login_admin $$
CREATE PROCEDURE login_admin 
(
    IN p_email VARCHAR(100),
    IN p_password VARCHAR(255)
)
BEGIN
    DECLARE v_admin_id INT;
    
    -- Check if admin exists and get ID
    SELECT Admin_id INTO v_admin_id
    FROM Admin
    WHERE Email = p_email AND Password = p_password;
    
    -- Check for existence
    IF v_admin_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Invalid email or password.';
    END IF;
    
    -- Login successful, return admin data including the calculated Role and Phone
    SELECT 
        A.Admin_id, 
        A.Name, 
        A.Gender, 
        DATE_FORMAT(A.Date_of_birth, '%Y-%m-%d') AS Date_of_birth, 
        A.Email, 
        MAX(AP.APhone) AS Phone,
        A.Branch_id,
        B.Name as Branch_Name, 
        A.Admin_Manager_id,
        CASE 
            WHEN A.Admin_Manager_id IS NULL THEN 'primary'
            ELSE 'regular'
        END AS Role
    FROM Admin A
    LEFT JOIN AdminPhone AP ON A.Admin_id = AP.Admin_id
    LEFT JOIN Cinema_Branch B ON A.Branch_id = B.Branch_id
    WHERE A.Admin_id = v_admin_id
    GROUP BY A.Admin_id, A.Name, A.Gender, A.Date_of_birth, A.Email, A.Branch_id, B.Name, A.Admin_Manager_id;
    
END $$

DROP PROCEDURE IF EXISTS get_all_admins $$
CREATE PROCEDURE get_all_admins()
BEGIN
    SELECT 
        A.Admin_id, 
        A.Name, 
        A.Gender, 
        DATE_FORMAT(A.Date_of_birth, '%Y-%m-%d') AS Date_of_birth, 
        A.Email, 
        MAX(AP.APhone) AS Phone,
        A.Branch_id,
        B.Name as Branch_Name,
        A.Admin_Manager_id,
        CASE 
            WHEN A.Admin_Manager_id IS NULL THEN 'primary'
            ELSE 'regular'
        END AS Role
    FROM Admin A
    LEFT JOIN AdminPhone AP ON A.Admin_id = AP.Admin_id
    LEFT JOIN Cinema_Branch B ON A.Branch_id = B.Branch_id
    GROUP BY A.Admin_id, A.Name, A.Gender, A.Date_of_birth, A.Email, A.Branch_id, B.Name, A.Admin_Manager_id;
END $$

DROP PROCEDURE IF EXISTS create_admin $$
CREATE PROCEDURE create_admin
(
    IN p_name VARCHAR(100),
    IN p_email VARCHAR(100),
    IN p_password VARCHAR(255),
    IN p_gender VARCHAR(10),
    IN p_dob DATE,
    IN p_phone VARCHAR(15),
    IN p_branch_id INT,
    IN p_role VARCHAR(20) -- 'primary' or 'regular'
)
BEGIN
    DECLARE v_admin_id INT;
    DECLARE v_manager_id INT;

    -- Check if email exists
    IF EXISTS (SELECT 1 FROM Admin WHERE Email = p_email) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Email already exists.';
    END IF;

    -- Determine Manager ID
    IF p_role = 'regular' THEN
        -- Assign to the first primary admin found (or specific logic if needed)
        SELECT Admin_id INTO v_manager_id FROM Admin WHERE Admin_Manager_id IS NULL LIMIT 1;
        IF v_manager_id IS NULL THEN
             SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: No primary admin found to assign as manager.';
        END IF;
    ELSE
        SET v_manager_id = NULL;
    END IF;

    -- Insert into Admin
    INSERT INTO Admin (Name, Gender, Date_of_birth, Email, Branch_id, Admin_Manager_id, Password)
    VALUES (p_name, p_gender, p_dob, p_email, p_branch_id, v_manager_id, p_password);

    SET v_admin_id = LAST_INSERT_ID();

    -- Insert into AdminPhone if provided
    IF p_phone IS NOT NULL AND p_phone != '' THEN
        INSERT INTO AdminPhone (Admin_id, APhone) VALUES (v_admin_id, p_phone);
    END IF;

    -- Return the new admin data
    SELECT 
        A.Admin_id, 
        A.Name, 
        A.Gender, 
        DATE_FORMAT(A.Date_of_birth, '%Y-%m-%d') AS Date_of_birth, 
        A.Email, 
        MAX(AP.APhone) AS Phone,
        A.Branch_id,
        B.Name as Branch_Name,
        A.Admin_Manager_id,
        CASE 
            WHEN A.Admin_Manager_id IS NULL THEN 'primary'
            ELSE 'regular'
        END AS Role
    FROM Admin A
    LEFT JOIN AdminPhone AP ON A.Admin_id = AP.Admin_id
    LEFT JOIN Cinema_Branch B ON A.Branch_id = B.Branch_id
    WHERE A.Admin_id = v_admin_id
    GROUP BY A.Admin_id, A.Name, A.Gender, A.Date_of_birth, A.Email, A.Branch_id, B.Name, A.Admin_Manager_id;

END $$

DELIMITER ;

DELIMITER $$

DROP PROCEDURE IF EXISTS change_customer_password $$
CREATE PROCEDURE change_customer_password
(
    IN p_customer_id INT,
    IN p_old_password VARCHAR(255),
    IN p_new_password VARCHAR(255)
)
BEGIN
    DECLARE v_exists INT;

    -- Verify old password
    SELECT COUNT(*) INTO v_exists
    FROM Customer
    WHERE Customer_id = p_customer_id AND Password = p_old_password;

    IF v_exists = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Invalid old password.';
    END IF;

    -- Update password
    UPDATE Customer
    SET Password = p_new_password
    WHERE Customer_id = p_customer_id;

    SELECT 'Password updated successfully' AS message;
END $$

DROP PROCEDURE IF EXISTS change_admin_password $$
CREATE PROCEDURE change_admin_password
(
    IN p_admin_id INT,
    IN p_old_password VARCHAR(255),
    IN p_new_password VARCHAR(255)
)
BEGIN
    DECLARE v_exists INT;

    -- Verify old password
    SELECT COUNT(*) INTO v_exists
    FROM Admin
    WHERE Admin_id = p_admin_id AND Password = p_old_password;

    IF v_exists = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Invalid old password.';
    END IF;

    -- Update password
    UPDATE Admin
    SET Password = p_new_password
    WHERE Admin_id = p_admin_id;

    SELECT 'Password updated successfully' AS message;
END $$

DROP PROCEDURE IF EXISTS update_admin_profile $$
CREATE PROCEDURE update_admin_profile
(
    IN p_admin_id INT,
    IN p_name VARCHAR(255),
    IN p_gender VARCHAR(10),
    IN p_dob DATE,
    IN p_email VARCHAR(255),
    IN p_branch_id INT,
    IN p_phone VARCHAR(15)
)
BEGIN
    -- Validate phone number (must be 10 digits)
    IF p_phone IS NOT NULL AND p_phone NOT REGEXP '^[0-9]{10}$' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Phone number must be 10 digits.';
    END IF;

    -- Check if email is being changed and if it's already taken
    IF EXISTS (SELECT 1 FROM Admin WHERE Email = p_email AND Admin_id != p_admin_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Email already exists.';
    END IF;

    UPDATE Admin
    SET 
        Name = p_name,
        Gender = p_gender,
        Date_of_birth = p_dob,
        Email = p_email,
        Branch_id = p_branch_id
    WHERE Admin_id = p_admin_id;

    -- Update Phone Number
    -- Strategy: Delete existing and insert new one to ensure single phone number per admin for this context
    IF p_phone IS NOT NULL THEN
        DELETE FROM AdminPhone WHERE Admin_id = p_admin_id;
        INSERT INTO AdminPhone (Admin_id, APhone) VALUES (p_admin_id, p_phone);
    END IF;

    SELECT 'Admin profile updated successfully' AS message;
END $$

DELIMITER ;

DELIMITER $$

-- =====================================================================================
-- 1. CREATE_BRANCH
-- Creates a new cinema branch, validates required fields, and assigns a manager (Admin).
-- =====================================================================================
DROP PROCEDURE IF EXISTS create_branch $$
CREATE PROCEDURE create_branch
(
    IN p_name VARCHAR(100),
    IN p_city VARCHAR(100),
    IN p_address VARCHAR(255),
    IN p_admin_id INT,
    IN p_phone VARCHAR(15)
)
BEGIN
    DECLARE v_new_branch_id INT;

    -- --- 1. BASIC FIELD VALIDATION ---
    IF p_name IS NULL OR p_name = '' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Branch Name is required.';
    END IF;
    IF p_city IS NULL OR p_city = '' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Branch City is required.';
    END IF;
    IF p_address IS NULL OR p_address = '' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Branch Address is required.';
    END IF;

    -- --- 2. ADMIN VALIDATION ---
    IF p_admin_id IS NOT NULL THEN
        -- Check if admin exists and is a regular admin (Admin_Manager_id is not NULL)
        IF NOT EXISTS (SELECT 1 FROM Admin WHERE Admin_id = p_admin_id AND Admin_Manager_id IS NOT NULL) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Invalid Admin ID or Admin is not a regular staff member (e.g., they might be a top-level manager).';
        END IF;

        -- Check if admin is already managing a branch
        IF EXISTS (SELECT 1 FROM Cinema_Branch WHERE Admin_id = p_admin_id) THEN
           SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Admin is already managing an existing branch.';
        END IF;
    END IF;

    -- --- 3. PHONE VALIDATION ---
    IF p_phone IS NOT NULL AND p_phone NOT REGEXP '^[0-9]{10}$' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Phone number must be 10 digits.';
    END IF;

    -- --- 4. INSERT BRANCH ---
    INSERT INTO Cinema_Branch (Name, City, Address, Admin_id)
    VALUES (p_name, p_city, p_address, p_admin_id);
    
    SET v_new_branch_id = LAST_INSERT_ID();

    -- --- 5. POST-INSERT ACTIONS ---
    -- Insert Branch Phone
    IF p_phone IS NOT NULL THEN
        INSERT INTO BranchPhone (Branch_id, BPhone) VALUES (v_new_branch_id, p_phone);
    END IF;

    -- Sync Admin table: Link the assigned admin to the new branch
    IF p_admin_id IS NOT NULL THEN
        UPDATE Admin SET Branch_id = v_new_branch_id WHERE Admin_id = p_admin_id;
    END IF;

    -- Return the newly created branch record
    SELECT * FROM Cinema_Branch WHERE Branch_id = v_new_branch_id;
END $$


-- =====================================================================================
-- 2. UPDATE_BRANCH
-- Updates branch details and handles the swap of the branch manager (Admin).
-- =====================================================================================
DROP PROCEDURE IF EXISTS update_branch $$
CREATE PROCEDURE update_branch
(
    IN p_branch_id INT,
    IN p_name VARCHAR(100),
    IN p_city VARCHAR(100),
    IN p_address VARCHAR(255),
    IN p_admin_id INT, -- New Admin ID (NULL to remove manager)
    IN p_phone VARCHAR(15)
)
BEGIN
    DECLARE v_old_admin_id INT;
    
    -- --- 1. CHECK EXISTENCE ---
    IF NOT EXISTS (SELECT 1 FROM Cinema_Branch WHERE Branch_id = p_branch_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Branch not found.';
    END IF;

    -- --- 2. BASIC FIELD VALIDATION (If parameters are mandatory for update) ---
    IF p_name IS NULL OR p_name = '' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Branch Name is required.';
    END IF;
    IF p_city IS NULL OR p_city = '' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Branch City is required.';
    END IF;
    IF p_address IS NULL OR p_address = '' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Branch Address is required.';
    END IF;
    
    -- --- 3. PHONE VALIDATION ---
    IF p_phone IS NOT NULL AND p_phone NOT REGEXP '^[0-9]{10}$' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Phone number must be 10 digits.';
    END IF;

    -- Store the currently assigned admin before update
    SELECT Admin_id INTO v_old_admin_id FROM Cinema_Branch WHERE Branch_id = p_branch_id;

    -- --- 4. ADMIN SWAP/UPDATE LOGIC ---
    IF p_admin_id IS NOT NULL AND p_admin_id <> v_old_admin_id THEN
        -- Check if new admin exists and is regular
        IF NOT EXISTS (SELECT 1 FROM Admin WHERE Admin_id = p_admin_id AND Admin_Manager_id IS NOT NULL) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Invalid Admin ID or Admin is not a regular staff member.';
        END IF;

        -- Check if the new admin is ALREADY managing a *different* branch
        IF EXISTS (SELECT 1 FROM Cinema_Branch WHERE Admin_id = p_admin_id AND Branch_id <> p_branch_id) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Admin is already managing a different branch. Must unassign them first.';
        END IF;

        -- Unlink old admin (if one exists)
        IF v_old_admin_id IS NOT NULL THEN
            UPDATE Admin SET Branch_id = NULL WHERE Admin_id = v_old_admin_id;
        END IF;
        
        -- Link new admin
        UPDATE Admin SET Branch_id = p_branch_id WHERE Admin_id = p_admin_id;

    ELSEIF p_admin_id IS NULL AND v_old_admin_id IS NOT NULL THEN
        -- Case: Manager is being unassigned (set to NULL)
        UPDATE Admin SET Branch_id = NULL WHERE Admin_id = v_old_admin_id;
    END IF;


    -- --- 5. UPDATE BRANCH DETAILS ---
    UPDATE Cinema_Branch
    SET 
        Name = p_name,
        City = p_city,
        Address = p_address,
        Admin_id = p_admin_id -- Include the Admin_id update here
    WHERE Branch_id = p_branch_id;

    -- --- 6. UPDATE BRANCH PHONE ---
    IF p_phone IS NOT NULL THEN
        -- Remove old phones and insert new (assuming we want to replace, not append)
        DELETE FROM BranchPhone WHERE Branch_id = p_branch_id;
        INSERT INTO BranchPhone (Branch_id, BPhone) VALUES (p_branch_id, p_phone);
    END IF;

    -- Return the updated branch record
    SELECT * FROM Cinema_Branch WHERE Branch_id = p_branch_id;
END $$


-- =====================================================================================
-- 3. DELETE_BRANCH
-- Deletes a branch and manually handles related table clean-up.
-- =====================================================================================
DROP PROCEDURE IF EXISTS delete_branch $$
CREATE PROCEDURE delete_branch
(
    IN p_branch_id INT
)
BEGIN
    -- Check if branch exists
    IF NOT EXISTS (SELECT 1 FROM Cinema_Branch WHERE Branch_id = p_branch_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Branch ID does not exist.';
    END IF;

    -- Unassign all admins from this branch (set Branch_id to NULL)
    UPDATE Admin SET Branch_id = NULL WHERE Branch_id = p_branch_id;
    
    -- Delete related data manually (following dependency order)
    
    -- 1. Locate (Event - Branch)
    DELETE FROM Locate WHERE Branch_id = p_branch_id;

    -- 2. Screen (Movie - Branch)
    DELETE FROM Screen WHERE Branch_id = p_branch_id;

    -- 3. Showtime (Should cascade to ShowtimeSeat and Ticket)
    DELETE FROM Showtime WHERE Branch_id = p_branch_id;

    -- 4. Seat (Dependencies of Hall, but sometimes has Branch_id for convenience)
    DELETE FROM Seat WHERE Branch_id = p_branch_id;

    -- 5. Hall (References Branch)
    DELETE FROM Hall WHERE Branch_id = p_branch_id;

    -- 6. BranchPhone (Often cascades, but doesn't hurt to explicitly delete)
    DELETE FROM BranchPhone WHERE Branch_id = p_branch_id;

    -- 7. Finally delete the branch
    DELETE FROM Cinema_Branch WHERE Branch_id = p_branch_id;

    SELECT 'Branch deleted successfully' AS message;
END $$


-- =====================================================================================
-- 4. SP_SEARCHBRANCHES (FIXED)
-- Searches, sorts, and paginates branch records.
-- =====================================================================================
DROP PROCEDURE IF EXISTS sp_SearchBranches $$
CREATE PROCEDURE sp_SearchBranches
(
    IN p_search_query VARCHAR(255),
    IN p_sort_column VARCHAR(50),
    IN p_sort_order VARCHAR(10),
    IN p_page INT,
    IN p_page_size INT,
    OUT p_total_count INT
)
BEGIN
    DECLARE v_offset INT;
    -- Changed v_sql to @v_sql for robust dynamic SQL execution
    DECLARE v_count_sql TEXT;
    DECLARE v_order_clause VARCHAR(100);
    DECLARE v_where_clause TEXT;

    -- Defaults
    SET p_page = IFNULL(p_page, 1);
    SET p_page_size = IFNULL(p_page_size, 10);
    SET v_offset = (p_page - 1) * p_page_size;
    SET p_sort_order = IFNULL(p_sort_order, 'ASC');
    
    -- Validate Sort Column to prevent SQL Injection
    IF p_sort_column NOT IN ('Branch_id', 'Name', 'City', 'Address') THEN
        SET p_sort_column = 'Branch_id';
    END IF;
    
    IF p_sort_order NOT IN ('ASC', 'DESC') THEN
        SET p_sort_order = 'ASC';
    END IF;

    SET v_order_clause = CONCAT(' ORDER BY b.', p_sort_column, ' ', p_sort_order);

    -- Build WHERE clause
    SET v_where_clause = ' WHERE 1=1 ';
    IF p_search_query IS NOT NULL AND p_search_query != '' THEN
        SET v_where_clause = CONCAT(v_where_clause, ' AND (b.Name LIKE CONCAT("%", "', p_search_query, '", "%") OR b.City LIKE CONCAT("%", "', p_search_query, '", "%") OR b.Address LIKE CONCAT("%", "', p_search_query, '", "%"))');
    END IF;

    -- 1. Get Total Count (Uses session variable @sql_count, which is correct)
    SET @sql_count = CONCAT('SELECT COUNT(*) INTO @total FROM Cinema_Branch b ', v_where_clause);
    PREPARE stmt_count FROM @sql_count;
    EXECUTE stmt_count;
    DEALLOCATE PREPARE stmt_count;
    SET p_total_count = @total;

    -- 2. Get Data (FIXED: Using session variable @v_sql for PREPARE)
    SET @v_sql = CONCAT('
        SELECT 
            b.Branch_id,
            b.City,
            b.Address,
            b.Name,
            b.Admin_id,
            MAX(bp.BPhone) AS Phone
        FROM Cinema_Branch b
        LEFT JOIN BranchPhone bp ON b.Branch_id = bp.Branch_id
        ', v_where_clause, '
        GROUP BY b.Branch_id, b.City, b.Address, b.Name, b.Admin_id
        ', v_order_clause, '
        LIMIT ', v_offset, ', ', p_page_size
    );

    PREPARE stmt FROM @v_sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;

END $$

DELIMITER ;

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


USE db_assignment2;

DELIMITER $$

DROP PROCEDURE IF EXISTS create_customer $$
CREATE PROCEDURE create_customer 
(
    IN p_fname VARCHAR(50),
    IN p_lname VARCHAR(50),
    IN p_gender VARCHAR(50),
    IN p_email VARCHAR(100),
    IN dob_input VARCHAR(20),
    IN p_loyalpoint INT,
    IN p_phone VARCHAR(50),
    IN p_password VARCHAR(255)
)
BEGIN
    DECLARE dob DATE;
    DECLARE v_memid INT;

    -- First Name
    IF p_fname IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Customer first name cannot be NULL.'; 
    ELSEIF p_fname NOT REGEXP '^[a-zA-Z ]+$' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Customer first name must contain only letters.'; 
    END IF;

    -- Last Name
    IF p_lname IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Customer last name cannot be NULL.'; 
    ELSEIF p_lname NOT REGEXP '^[a-zA-Z ]+$' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Customer last name must contain only letters.'; 
    END IF;

    -- Gender
    IF p_gender IS NOT NULL AND p_gender NOT IN ('Male', 'Female', 'Other') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Gender must be Male, Female, or Other.';
    END IF;

    -- Email
    IF p_email IS NOT NULL THEN
        IF p_email NOT REGEXP '^[a-zA-Z0-9.-]+@+[a-zA-Z0-9.-]+(\.[a-zA-Z0-9]+)+$' THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Invalid Email format.';
        ELSEIF EXISTS (SELECT 1 FROM Customer WHERE Email = p_email) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: This email already exists.';
        END IF;
    END IF;

    -- Date of Birth
    SET dob = STR_TO_DATE(dob_input, '%d/%m/%Y');
    IF dob IS NULL OR YEAR(dob) < 1900 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Invalid date of birth.';
    END IF;

    IF TIMESTAMPDIFF(YEAR, dob, CURDATE()) < 15 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Customer must be at least 15 years old.';
    END IF;

    CALL create_membership('Bronze', DATE_FORMAT(CURDATE(), '%d/%m/%Y'));

    SET v_memid = LAST_INSERT_ID();  

    -- Loyal Point
    IF p_loyalpoint IS NULL THEN
        SET p_loyalpoint = 0;
    ELSEIF p_loyalpoint < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Loyalty points must be >= 0.';
    END IF;

    -- Password
    IF p_password IS NULL OR LENGTH(p_password) < 8 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Password must be at least 8 characters.';
    END IF;

    -- Insert Customer
    INSERT INTO Customer(FName, LName, Gender, Email, Date_of_birth, Membership_id, Loyal_point, Password)
    VALUES (p_fname, p_lname, p_gender, p_email, dob, v_memid, p_loyalpoint, p_password);

    -- Insert Phone
    IF p_phone IS NOT NULL THEN
        CALL insert_customerphone(LAST_INSERT_ID(), p_phone);
    END IF;

END $$


DROP PROCEDURE IF EXISTS update_customer $$
CREATE PROCEDURE update_customer 
(
    IN p_customer_id INT,
    IN p_fname VARCHAR(50),
    IN p_lname VARCHAR(50),
    IN p_gender VARCHAR(50),
    IN p_email VARCHAR(100),
    IN dob_input VARCHAR(20),
    IN p_memid INT,
    IN p_loyalpoint INT,
    IN p_phone VARCHAR(50)
)
BEGIN
	DECLARE dob DATE;
    DECLARE old_fname VARCHAR(50);
    DECLARE old_lname VARCHAR(50);
    DECLARE old_gender VARCHAR(50);
    DECLARE old_email VARCHAR(100);
    DECLARE old_dob DATE;
    DECLARE old_memid INT;
    DECLARE old_loyalpoint INT;
    
	-- check if customer exists --
    IF NOT EXISTS (SELECT 1 FROM Customer WHERE Customer_id = p_customer_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Customer ID does not exist.';
    END IF;

	-- load old data --
	SELECT FName, LName, Gender, Email, Date_of_birth, Membership_id, Loyal_point
    INTO old_fname, old_lname, old_gender, old_email, old_dob, old_memid, old_loyalpoint
    FROM Customer
    WHERE Customer_id = p_customer_id;
    
    -- name --
    IF p_fname IS NOT NULL AND p_fname != old_fname THEN
		IF p_fname NOT REGEXP '^[a-zA-Z ]+$' THEN
			SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Customer first name format has to be character.';
		END IF;
    END IF;

    IF p_lname IS NOT NULL AND p_lname != old_lname THEN
		IF p_lname NOT REGEXP '^[a-zA-Z ]+$' THEN
			SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Customer last name format has to be character.';
		END IF;
    END IF;

    -- gender --
    IF p_gender IS NOT NULL AND p_gender != old_gender AND p_gender NOT IN ('Male', 'Female', 'Other') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Gender must be one of: Male, Female, or Other.';
    END IF;

    -- email --
    IF p_email IS NOT NULL AND p_email != old_email THEN
        IF p_email NOT REGEXP '^[a-zA-Z0-9.-]+@+[a-zA-Z0-9.-]+(\.[a-zA-Z0-9]+)+$' THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Email format has to be ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$.';
        ELSEIF EXISTS (
            SELECT 1 FROM Customer WHERE Email = p_email AND Customer_id <> p_customer_id
        ) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: The provided email already exists. Each customer must have a unique email.';
        END IF;
    END IF;
    
    -- date of birth --
    SET dob = STR_TO_DATE(dob_input, '%d/%m/%Y');
    IF YEAR(dob) < 1900 THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Invalid date of birth format.';
	END IF;
    IF dob IS NOT NULL AND dob != old_dob AND TIMESTAMPDIFF(YEAR, dob, CURDATE()) < 15 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Customer\'s age has to be greater than or equal to 15.';
    END IF;

    -- foreign key membershipid --
    IF p_memid IS NOT NULL AND p_memid != old_memid THEN
		-- Check if Membership ID exists in Membership table
		IF NOT EXISTS (SELECT 1 FROM Membership WHERE Membership_id = p_memid) THEN
			SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: The provided Membership ID does not exist.';
		END IF;
	END IF;

    -- loyal point --
    IF p_loyalpoint IS NOT NULL AND p_loyalpoint != old_loyalpoint THEN
		IF p_loyalpoint < 0 THEN
			SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Loyalty points must be greater than or equal to 0.';
		END IF;
    END IF;

	UPDATE Customer
	SET
		FName = COALESCE(p_fname, old_fname),
		LName = COALESCE(p_lname, old_lname),
		Gender = COALESCE(p_gender, old_gender),
		Email = COALESCE(p_email, old_email),
		Date_of_birth = COALESCE(dob, old_dob),
		Membership_id = COALESCE(p_memid, old_memid),
		Loyal_point = COALESCE(p_loyalpoint, old_loyalpoint)
	WHERE Customer_id = p_customer_id;
    
    IF p_phone IS NOT NULL THEN
		CALL insert_customerphone(p_customer_id,p_phone);
    END IF;
END $$

DROP PROCEDURE IF exists delete_customer $$
CREATE PROCEDURE delete_customer 
(
    IN p_customer_id INT
)
BEGIN
    -- check if customer exists
    IF NOT EXISTS (SELECT 1 FROM Customer WHERE Customer_id = p_customer_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Customer ID does not exist.';
    END IF;

    -- check if customer has related 
    IF EXISTS (SELECT 1 FROM `Review` WHERE Customer_id = p_customer_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: You has to delete relation in "Review" table first.';
	ELSEIF EXISTS (SELECT 1 FROM `CustomerVoucher` WHERE Customer_id = p_customer_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: You has to delete relation in "CustomerVoucher" table first.';
	ELSEIF EXISTS (SELECT 1 FROM `Receipt` WHERE Customer_id = p_customer_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: You has to delete relation in "Receipt" table first.';
    END IF;

    -- if no references found, delete customer
    DELETE FROM Customer WHERE Customer_id = p_customer_id;

END $$

DROP PROCEDURE IF EXISTS insert_customerphone $$
CREATE PROCEDURE insert_customerphone
(
	IN p_customer_id INT,
    IN p_phone VARCHAR(50)
)
BEGIN
	-- customer id can duplicate (many phone)
	IF NOT EXISTS (SELECT 1 FROM Customer WHERE Customer_id = p_customer_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Customer ID does not exist.';
    END IF;
	IF EXISTS (SELECT 1 FROM CustomerPhone WHERE CPhone = p_phone) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: This phone already exist.';
	ELSEIF p_phone NOT REGEXP '^[0-9]{10}$' THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: This phone format not correct: it has to be 10 number digits.';
    END IF;
    
	-- Insert phone
    INSERT INTO CustomerPhone(Customer_id, CPhone)
    VALUES (p_customer_id, p_phone);
END $$

DROP PROCEDURE IF EXISTS delete_customerphone $$
CREATE PROCEDURE delete_customerphone
(
	IN p_customer_id INT,
    IN p_phone VARCHAR(50)
)
BEGIN
	-- customer id can duplicate (many phone)
	IF NOT EXISTS (SELECT 1 FROM Customer WHERE Customer_id = p_customer_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Customer ID does not exist.';
    END IF;
	IF NOT EXISTS (SELECT 1 FROM CustomerPhone WHERE Customer_id = p_customer_id AND CPhone = p_phone) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: The customer dont have this phone number.';
    END IF;
    
    DELETE FROM CustomerPhone WHERE Customer_id = p_customer_id AND CPhone = p_phone;
END $$

-- THIS IS MOVIE --

DROP PROCEDURE IF EXISTS create_movie $$
CREATE PROCEDURE create_movie
(
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
    IN p_format TEXT,
    IN p_subtitle TEXT,
    IN p_genres TEXT
)
BEGIN
	DECLARE rels_date DATE;
    DECLARE p_id INT;
    
    -- director --
    IF p_director IS NULL THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Director cannot be null.';
	ELSEIF p_director NOT REGEXP '^[a-zA-Z ]+$' THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: This director name format is: ^[a-zA-Z ]+$';
    END IF;
    
    -- title --
    IF p_title IS NULL THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Title cannot be null.';
    END IF;
    
    -- Image --
    -- IF p_image IS NOT NULL AND p_image NOT REGEXP '^[A-Za-z0-9_\\-/]+\\.(jpg|jpeg|png|gif)$' THEN
    --    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Image file name must end with .jpg, .jpeg, .png, or .gif';
    -- END IF;
    
    -- release_date --
	SET rels_date = STR_TO_DATE(p_releasedate, '%d/%m/%Y');
	IF YEAR(rels_date) < 1900 THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Invalid date of birth format.';
	END IF;
    
    -- language --
    IF p_language IS NULL THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Language cannot be null.';
	END IF;
    
    -- age_rating --
    IF p_agerating IS NULL THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: age rating cannot be null.';
	ELSEIF p_agerating NOT IN ('P', 'K', 'T13', 'T16', 'T18') THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Age rating must be one of these: P, K, T13, T16, T18.';
	END IF;
    
	-- Adminid --
    IF p_adminid IS NULL THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: The Admin_id cant be null';
	ELSEIF NOT EXISTS (SELECT 1 FROM Admin WHERE Admin_id = p_adminid) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: The provided Admin ID does not exist.';
    END IF;
    
    INSERT INTO Movie(Director, Title, Image, Release_date, Language, Age_rating, Duration, Description, Admin_id)
    VALUES (p_director, p_title, p_image, rels_date, p_language, p_agerating, p_duration, p_description, p_adminid);
    
    SET p_id = LAST_INSERT_ID();
    IF p_actor IS NOT NULL THEN
		CALL insert_movieactor(p_id,p_actor);
	END IF;
	IF p_format IS NOT NULL THEN
		CALL insert_movieformat(p_id,p_format);
    END IF;
	IF p_subtitle IS NOT NULL THEN
		CALL insert_moviesubtitle(p_id,p_subtitle);
    END IF;
	IF p_genres IS NOT NULL THEN
		CALL insert_moviegenres(p_id,p_genres);
    END IF;
END $$

DROP PROCEDURE IF exists update_movie $$
CREATE PROCEDURE update_movie
(
	IN p_movie_id INT,
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
    IN p_format TEXT,
    IN p_subtitle TEXT,
    IN p_genres TEXT
)
BEGIN
	DECLARE rels_date DATE;
	DECLARE old_director VARCHAR(100);
    DECLARE old_title VARCHAR(200);
    DECLARE old_image VARCHAR(255);   
    DECLARE old_releasedate DATE;
    DECLARE old_language VARCHAR(50);
    DECLARE old_agerating VARCHAR(20);
    DECLARE old_duration INT;
    DECLARE old_description TEXT;
    DECLARE old_adminid INT;

    -- movie --
	IF NOT EXISTS (SELECT 1 FROM Movie WHERE Movie_id = p_movie_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Movie ID does not exist.';
    END IF;

	-- load old data --
	SELECT Director, Title, Image, Release_date, Language, Age_rating, Duration, Description, Admin_id
    INTO old_director, old_title, old_image, old_releasedate, old_language, old_agerating, old_duration, old_description, old_adminid
    FROM Movie
    WHERE Movie_id = p_movie_id;
    
    -- director --
    IF p_director IS NOT NULL AND p_director != old_director AND p_director NOT REGEXP '^[a-zA-Z ]+$' THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: This director name format is: ^[a-zA-Z ]+$';
    END IF;
    
    -- Image --
    -- IF p_image IS NOT NULL AND p_image != old_image AND p_image NOT REGEXP '^[A-Za-z0-9_\\-/]+\\.(jpg|jpeg|png|gif)$' THEN
    --     SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Image file name must end with .jpg, .jpeg, .png, or .gif';
    -- END IF;
    
    -- release_date --
	SET rels_date = STR_TO_DATE(p_releasedate, '%d/%m/%Y');
    
    -- age_rating --
    IF p_agerating IS NOT NULL AND p_agerating != old_agerating AND p_agerating NOT IN ('P', 'K', 'T13', 'T16', 'T18') THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Age rating must be one of these: P, K, T13, T16, T18.';
	END IF;
    
    -- duration --
    IF p_duration IS NOT NULL AND p_duration != old_duration AND p_duration <= 0 THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Duration has to be a positive number.';
	END IF;
    
	-- Adminid --
    IF p_adminid IS NOT NULL AND p_adminid != old_adminid AND NOT EXISTS (SELECT 1 FROM Admin WHERE Admin_id = p_adminid) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: The provided Admin ID does not exist.';
    END IF;
    
    UPDATE Movie
	SET
		Director = COALESCE(p_director, old_director),
		Title = COALESCE(p_title, old_title),
        Image = COALESCE(p_image, old_image),
        Release_date = COALESCE(rels_date, old_releasedate),
        Language = COALESCE(p_language, old_language),
        Age_rating = COALESCE(p_agerating, old_agerating),
        Duration = COALESCE(p_duration, old_duration),
        Description = COALESCE(p_description, old_description),
        Admin_id = COALESCE(p_adminid, old_adminid)
	WHERE Movie_id = p_movie_id;    
    
    IF p_actor IS NOT NULL THEN
		DELETE FROM MovieActor WHERE Movie_id = p_movie_id; 
		CALL insert_movieactor(p_movie_id, p_actor);        
	END IF;
    IF p_format IS NOT NULL THEN
		DELETE FROM MovieFormat WHERE Movie_id = p_movie_id; 
		CALL insert_movieformat(p_movie_id,p_format);
	END IF;
    IF p_subtitle IS NOT NULL THEN  
		DELETE FROM MovieSubtitle WHERE Movie_id = p_movie_id; 
		CALL insert_moviesubtitle(p_movie_id,p_subtitle);
    END IF;
    IF p_genres IS NOT NULL THEN
		DELETE FROM MovieGenres WHERE Movie_id = p_movie_id; 
		CALL insert_moviegenres(p_movie_id,p_genres);
	END IF;
END $$

DROP PROCEDURE IF EXISTS delete_movie $$
CREATE PROCEDURE delete_movie
(
    IN p_movie_id INT
)
BEGIN
    -- check if movie exists --
    IF NOT EXISTS (SELECT 1 FROM Movie WHERE Movie_id = p_movie_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Movie ID does not exist.';
    END IF;

    -- check if movie has relation --
	IF EXISTS (SELECT 1 FROM `Screen` WHERE Movie_id = p_movie_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: You has to delete relation in "Screen" table first.';
	ELSEIF EXISTS (SELECT 1 FROM `Showtime` WHERE Movie_id = p_movie_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: You has to delete relation in "Showtime" table first.';
	ELSEIF EXISTS (SELECT 1 FROM `Review` WHERE Movie_id = p_movie_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: You has to delete relation in "Review" table first.';
	ELSEIF EXISTS (SELECT 1 FROM `Souvenir` WHERE Movie_id = p_movie_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: You has to delete relation in "Souvenir" table first.';
	END IF;

    -- if no references found, delete customer --
	DELETE FROM Movie 
	WHERE
		Movie_id = p_movie_id;

END $$

DROP PROCEDURE IF EXISTS insert_movieactor $$
CREATE PROCEDURE insert_movieactor
(
    IN p_movie_id INT,
    IN p_actor_list TEXT -- Input example: "holland,enma,luffy" (No spaces after commas)
)
BEGIN
    DECLARE next_value VARCHAR(100);
    DECLARE remainder TEXT DEFAULT p_actor_list;
    DECLARE comma_pos INT;
    DECLARE actor_clean VARCHAR(100);

    -- 1. Check Movie Existence
    IF NOT EXISTS (SELECT 1 FROM Movie WHERE Movie_id = p_movie_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Movie ID does not exist.';
    END IF;

    -- 2. Loop through the list
    WHILE CHAR_LENGTH(remainder) > 0 DO
        SET comma_pos = LOCATE(',', remainder);
        
        IF comma_pos > 0 THEN
            -- Take the word up to the comma
            SET next_value = SUBSTRING(remainder, 1, comma_pos - 1);
            -- Update remainder to everything AFTER the comma
            SET remainder = SUBSTRING(remainder, comma_pos + 1);
        ELSE
            -- Last item in the list
            SET next_value = remainder;
            SET remainder = '';
        END IF;

        -- TRIM is still useful to remove invisible characters (newline, tab) even if no spaces exist
        SET actor_clean = TRIM(next_value);

        IF CHAR_LENGTH(actor_clean) > 0 THEN
            -- A. Validation: Regex
            -- If you strictly want "text without space" (single word names only): use '^[a-zA-Z]+$'
            -- If you allow "Tom Holland" but the list is compact: use '^[a-zA-Z ]+$'
            IF actor_clean NOT REGEXP '^[a-zA-Z ]+$' THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Actor name contains invalid characters.';
            END IF;

            -- B. Validation: Duplicate check
            IF EXISTS (SELECT 1 FROM MovieActor WHERE Movie_id = p_movie_id AND AActor = actor_clean) THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: One of the actors already exists in this movie.';
            END IF;

            -- C. Insert
            INSERT INTO MovieActor(Movie_id, AActor) VALUES (p_movie_id, actor_clean);
        END IF;
    END WHILE;
END $$

DROP PROCEDURE IF EXISTS delete_movieactor $$
CREATE PROCEDURE delete_movieactor
(
	IN p_movie_id INT,
    IN p_actor VARCHAR(50)
)
BEGIN
	IF NOT EXISTS (SELECT 1 FROM Movie WHERE Movie_id = p_movie_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Movie ID does not exist.';
    END IF;
	IF NOT EXISTS (SELECT 1 FROM MovieActor WHERE Movie_id = p_movie_id AND AActor = p_actor) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: This actor not perform in this movie.';
    END IF;
    
    DELETE FROM MovieActor WHERE Movie_id = p_movie_id AND AActor = p_actor;
END $$

DROP PROCEDURE IF EXISTS insert_movieformat $$
CREATE PROCEDURE insert_movieformat
(
    IN p_movie_id INT,
    IN p_format_list TEXT -- Input example: "2D,IMAX"
)
BEGIN
    DECLARE next_value VARCHAR(100);
    DECLARE remainder TEXT DEFAULT p_format_list;
    DECLARE comma_pos INT;
    DECLARE format_clean VARCHAR(100);

    -- 1. Check Movie Existence
    IF NOT EXISTS (SELECT 1 FROM Movie WHERE Movie_id = p_movie_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Movie ID does not exist.';
    END IF;

    -- 2. Loop through the list
    WHILE CHAR_LENGTH(remainder) > 0 DO
        SET comma_pos = LOCATE(',', remainder);
        
        IF comma_pos > 0 THEN
            SET next_value = SUBSTRING(remainder, 1, comma_pos - 1);
            SET remainder = SUBSTRING(remainder, comma_pos + 1);
        ELSE
            SET next_value = remainder;
            SET remainder = '';
        END IF;

        SET format_clean = TRIM(next_value);

        IF CHAR_LENGTH(format_clean) > 0 THEN
            -- A. Validation: Allowed Values
            IF format_clean NOT IN ("2D", "3D", "IMAX", "4DX") THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Invalid format found. Allowed: 2D, 3D, IMAX, 4DX';
            END IF;

            -- B. Validation: Duplicate
            IF EXISTS (SELECT 1 FROM MovieFormat WHERE Movie_id = p_movie_id AND AFormat = format_clean) THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: One of the formats already exists in this movie.';
            END IF;

            -- C. Insert
            INSERT INTO MovieFormat(Movie_id, AFormat) VALUES (p_movie_id, format_clean);
        END IF;
    END WHILE;
END $$

DROP PROCEDURE IF EXISTS delete_movieformat $$
CREATE PROCEDURE delete_movieformat
(
	IN p_movie_id INT,
    IN p_format VARCHAR(50)
)
BEGIN
	IF NOT EXISTS (SELECT 1 FROM Movie WHERE Movie_id = p_movie_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Movie ID does not exist.';
    END IF;
	IF NOT EXISTS (SELECT 1 FROM MovieFormat WHERE Movie_id = p_movie_id AND AFormat = p_format) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: This format not in this movie.';
    END IF;
    
    DELETE FROM MovieActor WHERE Movie_id = p_movie_id AND AFormat = p_format;
END $$

DROP PROCEDURE IF EXISTS insert_moviesubtitle $$
CREATE PROCEDURE insert_moviesubtitle
(
    IN p_movie_id INT,
    IN p_subtitle_list TEXT -- Input example: "English,Japanese"
)
BEGIN
    DECLARE next_value VARCHAR(100);
    DECLARE remainder TEXT DEFAULT p_subtitle_list;
    DECLARE comma_pos INT;
    DECLARE subtitle_clean VARCHAR(100);
    DECLARE v_movie_lang VARCHAR(50);

    -- 1. Check Movie Existence & Get Language
    SELECT Language INTO v_movie_lang FROM Movie WHERE Movie_id = p_movie_id;
    
    IF v_movie_lang IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Movie ID does not exist.';
    END IF;

    -- 2. Loop through the list
    WHILE CHAR_LENGTH(remainder) > 0 DO
        SET comma_pos = LOCATE(',', remainder);
        
        IF comma_pos > 0 THEN
            SET next_value = SUBSTRING(remainder, 1, comma_pos - 1);
            SET remainder = SUBSTRING(remainder, comma_pos + 1);
        ELSE
            SET next_value = remainder;
            SET remainder = '';
        END IF;

        SET subtitle_clean = TRIM(next_value);

        IF CHAR_LENGTH(subtitle_clean) > 0 THEN
            -- A. Validation: Allowed Values
			-- IF subtitle_clean NOT IN ('Vietnamese', 'English', 'Japanese') THEN
			-- SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Invalid subtitle found. Allowed: Vietnamese, English, Japanese';
            -- END IF;
            -- B. Validation: Conflict with Audio Language
            -- IF subtitle_clean = v_movie_lang THEN
			-- SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Subtitle cannot be the same as the movie original language.';
			-- END IF;

            -- C. Validation: Duplicate
            IF EXISTS (SELECT 1 FROM MovieSubtitle WHERE Movie_id = p_movie_id AND ASubtitle = subtitle_clean) THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: One of the subtitles already exists in this movie.';
            END IF;

            -- D. Insert
            INSERT INTO MovieSubtitle(Movie_id, ASubtitle) VALUES (p_movie_id, subtitle_clean);
        END IF;
    END WHILE;
END $$

DROP PROCEDURE IF EXISTS delete_moviesubtitle $$
CREATE PROCEDURE delete_moviesubtitle
(
	IN p_movie_id INT,
    IN p_subtitle VARCHAR(50)
)
BEGIN
	IF NOT EXISTS (SELECT 1 FROM Movie WHERE Movie_id = p_movie_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Movie ID does not exist.';
    END IF;
	IF NOT EXISTS (SELECT 1 FROM MovieSubtitle WHERE Movie_id = p_movie_id AND ASubtitle = p_subtitle) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: This subtitle not in this movie.';
    END IF;
    
    DELETE FROM MovieActor WHERE Movie_id = p_movie_id AND ASubtitle = p_subtitle;
END $$

DROP PROCEDURE IF EXISTS insert_moviegenres $$
CREATE PROCEDURE insert_moviegenres
(
    IN p_movie_id INT,
    IN p_genre_list TEXT -- Input example: "Action,Drama"
)
BEGIN
    DECLARE next_value VARCHAR(100);
    DECLARE remainder TEXT DEFAULT p_genre_list;
    DECLARE comma_pos INT;
    DECLARE genre_clean VARCHAR(100);

    -- 1. Check Movie Existence
    IF NOT EXISTS (SELECT 1 FROM Movie WHERE Movie_id = p_movie_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Movie ID does not exist.';
    END IF;

    -- 2. Loop through the list
    WHILE CHAR_LENGTH(remainder) > 0 DO
        SET comma_pos = LOCATE(',', remainder);
        
        IF comma_pos > 0 THEN
            SET next_value = SUBSTRING(remainder, 1, comma_pos - 1);
            SET remainder = SUBSTRING(remainder, comma_pos + 1);
        ELSE
            SET next_value = remainder;
            SET remainder = '';
        END IF;

        SET genre_clean = TRIM(next_value);

        IF CHAR_LENGTH(genre_clean) > 0 THEN
            -- A. Validation: Allowed Values
			IF genre_clean NOT IN ('Action', 'Drama', 'Sci-Fi', 'Comedy', 'Thriller', 'Romance', 'Crime', 'Other') THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Invalid genre found. Allowed: Action, Drama, Sci-Fi, Comedy, Thriller, Romance, Crime, Other';
			END IF;

            -- B. Validation: Duplicate
            IF EXISTS (SELECT 1 FROM MovieGenres WHERE Movie_id = p_movie_id AND AGenres = genre_clean) THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: One of the genres already exists in this movie.';
            END IF;

            -- C. Insert
            INSERT INTO MovieGenres(Movie_id, AGenres) VALUES (p_movie_id, genre_clean);
        END IF;
    END WHILE;
END $$

DROP PROCEDURE IF EXISTS delete_moviegenres $$
CREATE PROCEDURE delete_moviegenres
(
	IN p_movie_id INT,
    IN p_genres VARCHAR(50)
)
BEGIN
	IF NOT EXISTS (SELECT 1 FROM Movie WHERE Movie_id = p_movie_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Movie ID does not exist.';
    END IF;
	IF NOT EXISTS (SELECT 1 FROM MovieGenres WHERE Movie_id = p_movie_id AND AGenres = p_genres) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: This genres not in this movie.';
    END IF;
    
    DELETE FROM MovieActor WHERE Movie_id = p_movie_id AND AGenres = p_genres;
END $$

-- THIS IS ORDER --

DROP PROCEDURE IF EXISTS create_order $$
CREATE PROCEDURE create_order
(
    IN p_order_date VARCHAR(50),
    IN p_customer_id INT,
    IN p_status ENUM('PENDING','PAID','CANCELLED','REFUNDED'),
    IN p_total_amount DECIMAL(12,2) -- dummy input, need to calculate by call function later 
)
BEGIN
    DECLARE input_date DATETIME;

    SET input_date = STR_TO_DATE(p_order_date, '%H:%i:%s %d/%m/%Y');

    INSERT INTO `Order` (Order_date, Customer_id, Status, Total_amount)
    VALUES (input_date, p_customer_id, COALESCE(p_status, 'PENDING'), p_total_amount);
END $$

DROP PROCEDURE IF EXISTS update_order $$
CREATE PROCEDURE update_order
(
    IN p_order_id INT,
    IN p_order_date VARCHAR(50),
    IN p_customer_id INT,
    IN p_status ENUM('PENDING','PAID','CANCELLED','REFUNDED'),
    IN p_total_amount DECIMAL(12,2) -- dummy input, need to calculate by call function later 
)
BEGIN
    DECLARE input_date DATETIME;
    DECLARE old_date DATETIME;
    DECLARE old_customer INT;
    DECLARE old_status ENUM('PENDING','PAID','CANCELLED','REFUNDED');
    DECLARE old_total DECIMAL(12,2); -- dummy input, need to calculate by call function later 

    -- Validate ID
    IF NOT EXISTS (SELECT 1 FROM `Order` WHERE Order_id = p_order_id) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'ERROR: Order ID does not exist.';
    END IF;

    -- Get old values
    SELECT Order_date, Customer_id, Status, Total_amount
    INTO old_date, old_customer, old_status, old_total
    FROM `Order`
    WHERE Order_id = p_order_id;

    -- Convert date
    SET input_date = STR_TO_DATE(p_order_date, '%H:%i:%s %d/%m/%Y');

    -- Perform update
    UPDATE `Order`
    SET
        Order_date   = COALESCE(input_date, old_date),
        Customer_id  = COALESCE(p_customer_id, old_customer),
        Status       = COALESCE(p_status, old_status),
        Total_amount = COALESCE(p_total_amount, old_total)
    WHERE Order_id = p_order_id;

END $$

DROP PROCEDURE IF EXISTS delete_order $$
CREATE PROCEDURE delete_order
(
    IN order_id INT
)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM `Order` WHERE Order_id = order_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Order ID does not exist.';
    END IF;

    -- check if movie has related orders --
    IF EXISTS (SELECT 1 FROM `Apply` WHERE Order_id = order_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: You has to delete relation in "Apply" table first.';
	ELSEIF EXISTS (SELECT 1 FROM `OrderProduct` WHERE Order_id = order_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: You has to delete relation in "OrderProduct" table first.';
	ELSEIF EXISTS (SELECT 1 FROM `Ticket` WHERE Order_id = order_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: You has to delete relation in "Ticket" table first.';
	END IF;

    DELETE FROM `Order` WHERE Order_id = order_id;

END $$

-- THIS IS TICKET --
DROP PROCEDURE IF exists create_ticket $$
CREATE PROCEDURE create_ticket
(
    IN p_price DECIMAL(10,2),
    IN p_receipt_id INT,
    IN p_movie_id INT,
    IN p_showtime_id INT,
    IN p_branch_id INT,
    IN p_hall_number INT,
    IN p_seat_number VARCHAR(10)
)
BEGIN
	-- price --
    IF p_price IS NOT NULL AND p_price < 0 THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: the ticket price has to be >= 0.';
	END IF;
    
    -- order --
    IF p_receipt_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM `Receipt` WHERE Receipt_id = p_receipt_id) THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: The provided Order ID does not exist.';
	END IF;
    
	IF NOT EXISTS (
        SELECT 1 FROM ShowtimeSeat
        WHERE Movie_id = p_movie_id
        AND Showtime_id = p_showtime_id
        AND Branch_id = p_branch_id
        AND Hall_number = p_hall_number
        AND Seat_number = p_seat_number
        AND Status = 'AVAILABLE'
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Provided ShowtimeSeat does not available.';
    END IF;

	UPDATE ShowtimeSeat
	SET Status = 'BOOKED'
	WHERE Movie_id = p_movie_id
	  AND Showtime_id = p_showtime_id
	  AND Branch_id = p_branch_id
	  AND Hall_number = p_hall_number
	  AND Seat_number = p_seat_number;
      
    INSERT INTO Ticket 
    (Price, Receipt_id, Movie_id, Showtime_id, Branch_id, Hall_number, Seat_number)
    VALUES
    (p_price, p_receipt_id, p_movie_id, p_showtime_id, p_branch_id, p_hall_number, p_seat_number);
END $$

DROP PROCEDURE IF EXISTS update_ticket $$
CREATE PROCEDURE update_ticket
(
	IN p_ticket_id INT,
    IN p_price DECIMAL(10,2),
	IN p_receipt_id INT,
    IN p_movie_id INT,
    IN p_showtime_id INT,
    IN p_branch_id INT,
    IN p_hall_number INT,
    IN p_seat_number VARCHAR(10)
)
BEGIN
    DECLARE old_price DECIMAL(10,2);
	DECLARE old_receipt_id INT;
    DECLARE old_movie_id INT;
    DECLARE old_showtime_id INT;
    DECLARE old_branch_id INT;
    DECLARE old_hall_number INT;
    DECLARE old_seat_number VARCHAR(10);
	DECLARE new_movie INT;
    DECLARE new_showtime INT;
    DECLARE new_branch INT;
    DECLARE new_hall INT;
    DECLARE new_seat VARCHAR(10);

	-- ticket id --
	IF NOT EXISTS (SELECT 1 FROM `Ticket` WHERE Ticket_id = p_ticket_id) THEN
			SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: The provided Ticket ID does not exist.';
	END IF;
    
    -- Fetch old data
    SELECT Price, Receipt_id, Movie_id, Showtime_id, Branch_id, Hall_number, Seat_number
    INTO old_price, old_receipt_id, old_movie_id, old_showtime_id, old_branch_id, old_hall_number, old_seat_number
    FROM `Ticket`
    WHERE Ticket_id = p_ticket_id;
    
	-- price --
    IF p_price IS NOT NULL AND p_price != old_price AND p_price < 0 THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: the ticket price has to be >= 0.';
	END IF;
    
    -- order --
	IF p_receipt_id IS NOT NULL AND p_receipt_id != old_receipt_id AND NOT EXISTS (SELECT 1 FROM `Receipt` WHERE Receipt_id = p_receipt_id) THEN
			SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: The provided Receipt ID does not exist.';
	END IF;
    
    -- Determine new FK values for checking
    SET new_movie = COALESCE(p_movie_id, old_movie_id);
    SET new_showtime = COALESCE(p_showtime_id, old_showtime_id);
    SET new_branch = COALESCE(p_branch_id, old_branch_id);
    SET new_hall = COALESCE(p_hall_number, old_hall_number);
    SET new_seat = COALESCE(p_seat_number, old_seat_number);

    -- 5. CRITICAL SEAT SWAP LOGIC
    
    -- Check if the seat location is changing (if any FK component changes)
	IF new_movie != old_movie_id 
        OR new_showtime != old_showtime_id 
        OR new_branch != old_branch_id 
        OR new_hall != old_hall_number 
        OR new_seat != old_seat_number 
    THEN
        -- A. Validate the NEW seat status
        IF NOT EXISTS (
			SELECT 1 FROM ShowtimeSeat
			WHERE Movie_id = new_movie
			AND Showtime_id = new_showtime
			AND Branch_id = new_branch
			AND Hall_number = new_hall
			AND Seat_number = new_seat
			AND Status = 'AVAILABLE' -- MUST be available
		) THEN
			SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: The target ShowtimeSeat is not available or does not exist.';
		END IF;
        
        -- B. Release the OLD seat
        UPDATE ShowtimeSeat
        SET Status = 'AVAILABLE'
        WHERE Movie_id = old_movie_id
          AND Showtime_id = old_showtime_id
          AND Branch_id = old_branch_id
          AND Hall_number = old_hall_number
          AND Seat_number = old_seat_number;

        -- C. Book the NEW seat
        UPDATE ShowtimeSeat
        SET Status = 'BOOKED'
        WHERE Movie_id = new_movie
          AND Showtime_id = new_showtime
          AND Branch_id = new_branch
          AND Hall_number = new_hall
          AND Seat_number = new_seat;
	END IF;
    
-- 6. Update Ticket Record (Including Foreign Keys)
	 UPDATE `Ticket`
		SET
		Price = COALESCE(p_price, old_price),
		Receipt_id = COALESCE(p_receipt_id, old_receipt_id), -- Corrected name
        Movie_id = new_movie,
        Showtime_id = new_showtime,
        Branch_id = new_branch,
        Hall_number = new_hall,
        Seat_number = new_seat
	WHERE Ticket_id = p_ticket_id;
END $$

DROP PROCEDURE IF EXISTS delete_ticket $$
CREATE PROCEDURE delete_ticket
(
    IN p_ticket_id INT
)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM `Ticket` WHERE Ticket_id = p_ticket_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Ticket ID does not exist.';
    END IF;

    -- check if movie has related orders --
    IF EXISTS (SELECT 1 FROM `Has` WHERE Ticket_id = p_ticket_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: You has to delete relation in "Has" table first.';
	END IF;

    DELETE FROM `Ticket` WHERE Ticket_id = ticket_id;

END $$

-- THIS IS FOOD DRINK --

DROP PROCEDURE IF exists create_food_drink $$
CREATE PROCEDURE create_food_drink
(
	IN p_name VARCHAR(50),
    IN p_price DECIMAL(10,2),
    IN p_description TEXT,
    IN p_size VARCHAR(10),
    IN p_type VARCHAR(100)
)
BEGIN
	DECLARE new_product INT;
	-- name --
    IF p_name is NULL THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: product name cannot be NULL.'; 
    END IF; 
    
    -- price --
    IF p_price is NULL THEN
		SET p_price = 0;
    ELSEIF p_price is NOT NULL AND p_price < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: The price must be a positive number.';
    END IF;
    
	-- size --
	IF p_size IS NULL THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: food and drink size cannot be null.';
	ELSEIF p_size NOT IN ('SMALL', 'MEDIUM', 'LARGE') THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Size must be one of these: SMALL, MEDIUM, LARGE.';
	END IF;
    
    -- type --
    IF p_type IS NULL THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: food and drink type cannot be null.';
	END IF;
    
    INSERT INTO Product(Name, Price, Description)
    VALUES (p_name, p_price, p_description);
    
	SET new_product = LAST_INSERT_ID();
    INSERT INTO Food_Drink (Product_id, Size, Type)
    VALUES (new_product, p_size, p_type);
END $$

DROP PROCEDURE IF exists update_food_drink $$
CREATE PROCEDURE update_food_drink
(
	IN p_product_id INT,
	IN p_name VARCHAR(50),
    IN p_price DECIMAL(10,2),
    IN p_description TEXT,
    IN p_size VARCHAR(10),
    IN p_type VARCHAR(100)
)
BEGIN
	-- load data --
	DECLARE old_name VARCHAR(50);
    DECLARE old_price DECIMAL(10,2);
    DECLARE old_description TEXT;
    DECLARE old_size VARCHAR(10);
    DECLARE old_type VARCHAR(100);
    
	-- id valid --
	IF NOT EXISTS (SELECT 1 FROM Product WHERE Product_id = p_product_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Product ID does not exist.';
    END IF;
	IF NOT EXISTS (SELECT 1 FROM Food_Drink WHERE Product_id = p_product_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Product ID does not exist.';
    END IF;
    
    SELECT Name, Price, Description 
    INTO old_name, old_price, old_description
    FROM Product WHERE Product_id = p_product_id;
    
	SELECT Size, `Type`
    INTO old_size, old_type
    FROM Food_Drink WHERE Product_id = p_product_id;
    
    -- price --
    IF p_price IS NOT NULL AND p_price != old_price AND p_price is NOT NULL AND p_price < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: The price must be a positive number.';
    END IF;
    
	-- size --
     IF p_size IS NOT NULL AND p_size != old_size AND p_size NOT IN ('SMALL', 'MEDIUM', 'LARGE') THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Size must be one of these: SMALL, MEDIUM, LARGE.';
	END IF;
        
	UPDATE Product
	SET
		Name = COALESCE (p_name, old_name),
        Price = COALESCE (p_price, old_price),
        Description = COALESCE (p_description, old_description)
	WHERE Product_id = p_product_id;
	UPDATE Food_Drink
	SET
		Size = COALESCE (p_size, old_size),
        `Type` = COALESCE (p_type, old_type)
	WHERE Product_id = p_product_id;
END $$

DROP PROCEDURE IF EXISTS delete_food_drink $$
CREATE PROCEDURE delete_food_drink
(
	IN p_product_id INT
)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Product WHERE Product_id = p_product_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Product not found.';
    END IF;
    DELETE FROM Product WHERE Product_id = p_product_id;
END $$

-- THIS IS SOUVENIR --

DROP PROCEDURE IF exists create_souvenir $$
CREATE PROCEDURE create_souvenir
(
	IN p_name VARCHAR(50),
    IN p_price DECIMAL(10,2),
    IN p_description TEXT,
	IN p_movie_id INT
)
BEGIN
	DECLARE new_product INT;
	-- name --
    IF p_name is NULL THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: product name cannot be NULL.'; 
    END IF; 
    
    -- price --
    IF p_price is NULL THEN
		SET p_price = 0;
    ELSEIF p_price is NOT NULL AND p_price < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: The price must be a positive number.';
    END IF;
    
	-- movie id --
	IF p_movie_id IS NULL THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Movie id cannot be null.';
	ELSEIF NOT EXISTS (SELECT 1 FROM Movie WHERE Movie_id = p_movie_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Movie ID does not exist.';
	END IF;
    
    INSERT INTO Product(Name, Price, Description)
    VALUES (p_name, p_price, p_description);
    
	SET new_product = LAST_INSERT_ID();
    INSERT INTO Souvenir(Product_id, Movie_id)
    VALUES (new_product, p_movie_id);
END $$

DROP PROCEDURE IF exists update_souvenir $$
CREATE PROCEDURE update_souvenir
(
	IN p_product_id INT,
	IN p_name VARCHAR(50),
    IN p_price DECIMAL(10,2),
    IN p_description TEXT,
	IN p_movie_id INT
)
BEGIN
	-- load data --
	DECLARE old_name VARCHAR(50);
    DECLARE old_price DECIMAL(10,2);
    DECLARE old_description TEXT;
    DECLARE old_movie_id INT;
    
	-- id valid --
	IF NOT EXISTS (SELECT 1 FROM Product WHERE Product_id = p_product_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Product ID does not exist.';
    END IF;
	IF NOT EXISTS (SELECT 1 FROM Souvenir WHERE Product_id = p_product_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Product ID does not exist.';
    END IF;
    
    SELECT Name, Price, Description 
    INTO old_name, old_price, old_description
    FROM Product WHERE Product_id = p_product_id;
    
	SELECT Movie_id
    INTO old_movie_id
    FROM Souvenir WHERE Product_id = p_product_id;
    
    
    -- price --
    IF p_price IS NOT NULL AND p_price != old_price AND p_price is NOT NULL AND p_price < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: The price must be a positive number.';
    END IF;

    -- movie id --
    IF p_movie_id IS NOT NULL AND p_movie_id != old_movie_id AND NOT EXISTS (SELECT 1 FROM Movie WHERE Movie_id = p_movie_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Movie ID does not exist.';
    END IF;
        
	UPDATE Product
	SET
		Name = COALESCE (p_name, old_name),
        Price = COALESCE (p_price, old_price),
        Description = COALESCE (p_description, old_description)
	WHERE Product_id = p_product_id;
	UPDATE Souvenir
	SET
		Movie_id = COALESCE (p_movie_id, old_movie_id)
	WHERE Product_id = p_product_id;
END $$

DROP PROCEDURE IF EXISTS delete_souvenir $$
CREATE PROCEDURE delete_souvenir
(
	IN p_product_id INT
)
BEGIN
	-- delete from souvenir --
    IF NOT EXISTS (SELECT 1 FROM Product WHERE Product_id = p_product_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Product not found.';
    END IF;
    DELETE FROM Product WHERE Product_id = p_product_id;
END $$

-- THIS IS EVENT --

DROP PROCEDURE IF exists create_event $$
CREATE PROCEDURE create_event
(
    IN input_start VARCHAR(50),
    IN input_end VARCHAR (50),
    IN p_title VARCHAR(255),
    IN p_image VARCHAR(255),
    IN p_description TEXT,
    IN p_admin_id INT,
    IN p_type VARCHAR(100)
)
BEGIN
	DECLARE p_start DATE;
    DECLARE p_end DATE;
    SET p_start = STR_TO_DATE(input_start, '%d/%m/%Y');
    SET p_end = STR_TO_DATE(input_end, '%d/%m/%Y');
    
    -- date --
	IF p_start > p_end THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Start date cannot be after end date.';
    END IF;
    
    -- title --
    IF p_title is NULL THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: title cannot be NULL.'; 
	END IF;
    
	-- Image --
    -- IF p_image IS NOT NULL AND p_image NOT REGEXP '^[A-Za-z0-9_\\-/]+\\.(jpg|jpeg|png|gif)$' THEN
     --   SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Image file name must end with .jpg, .jpeg, .png, or .gif';
    -- END IF;
    
	-- Adminid --
    IF p_admin_id IS NULL THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: The Admin_id cant be null';
	ELSEIF NOT EXISTS (SELECT 1 FROM Admin WHERE Admin_id = p_admin_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: The provided Admin ID does not exist.';
    END IF;
    
    INSERT INTO `Event`(Start_date, End_date, Title, Image, Description, Admin_id, Type)
    VALUES (p_start, p_end, p_title, p_image, p_description, p_admin_id, p_type);
    
END $$

DROP PROCEDURE IF exists update_event $$
CREATE PROCEDURE update_event
(
	IN p_event_id INT,
    IN input_start VARCHAR(50),
    IN input_end VARCHAR (50),
    IN p_title VARCHAR(255),
    IN p_image VARCHAR(255),
    IN p_description TEXT,
    IN p_admin_id INT,
    IN p_type VARCHAR(100)
)
BEGIN
	DECLARE p_start DATE;
    DECLARE p_end DATE;
	DECLARE old_start DATE;
    DECLARE old_end DATE;
    DECLARE old_title VARCHAR(255);
    DECLARE old_image VARCHAR(255);
    DECLARE old_description TEXT;
    DECLARE old_admin_id INT;
    DECLARE old_type VARCHAR(100);
    SET p_start = STR_TO_DATE(input_start, '%d/%m/%Y');
    SET p_end = STR_TO_DATE(input_end, '%d/%m/%Y');
    
	-- id valid --
	IF NOT EXISTS (SELECT 1 FROM `Event` WHERE Event_id = p_event_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Event ID does not exist.';
    END IF;
    
    SELECT Start_date, End_date, Title, Image, Description, Admin_id, Type
    INTO old_start, old_end, old_title, old_image, old_description, old_admin_id, old_type
    FROM `Event`
    WHERE Event_id = p_event_id;
    
    -- date --
	IF p_start > p_end THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Start date cannot be after end date.';
    END IF;
    
	-- Image --
    -- IF p_image IS NOT NULL AND p_image != old_image AND p_image NOT REGEXP '^[A-Za-z0-9_\\-/]+\\.(jpg|jpeg|png|gif)$' THEN
    --    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Image file name must end with .jpg, .jpeg, .png, or .gif';
	-- END IF;
    
	-- Adminid --
    IF p_admin_id IS NOT NULL AND p_admin_id != old_admin_id AND NOT EXISTS (SELECT 1 FROM Admin WHERE Admin_id = p_admin_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: The provided Admin ID does not exist.';
    END IF;
    
    UPDATE `Event`
	SET
		Start_date = COALESCE (p_start, old_start),
		End_date = COALESCE (p_end, old_end),
        Title = COALESCE (p_title, old_title),
        Image = COALESCE (p_image, old_image),
        Description = COALESCE (p_description, old_description),
        Admin_id = COALESCE (p_admin_id, old_admin_id),
        Type = COALESCE (p_type, old_type)
	WHERE Event_id = p_event_id;
    
END $$

DROP PROCEDURE IF EXISTS delete_event $$
CREATE PROCEDURE delete_event
(
	IN p_event_id INT
)
BEGIN
	-- delete from event --
	IF NOT EXISTS (SELECT 1 FROM `Event` WHERE Event_id = p_event_id) THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Event ID does not exist.';
	END IF;
    
    IF EXISTS (SELECT 1 FROM Locate WHERE Event_id = p_event_id) THEN
		CALL delete_locate(NULL, p_event_id);
	END IF;
    
    DELETE FROM `Event` WHERE Event_id = p_event_id;
END $$

-- THIS IS ADMIN --

DROP PROCEDURE IF exists create_admin $$
CREATE PROCEDURE create_admin 
(
	IN p_name VARCHAR(50),
    IN p_gender VARCHAR(50),
	IN dob_input VARCHAR(20),
    IN p_email VARCHAR(100),
    IN p_branch_id INT,
    IN p_adminmanager INT,
    IN p_phone VARCHAR(50)
)
BEGIN
    DECLARE dob DATE;
	-- name --
    IF p_name is NULL THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Admin name cannot be NULL.'; 
	ELSEIF p_name NOT REGEXP '^[a-zA-Z ]+$' THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Admin name format has to be character.';
    END IF;   
    
    -- gender --
	IF p_gender is NOT NULL AND p_gender NOT IN ('Male', 'Female', 'Other') THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Gender must be one of: Male, Female, or Other.';
    END IF; 
        
    -- email --    
    IF p_email is NOT NULL THEN
		IF p_email NOT REGEXP '^[a-zA-Z0-9.-]+@+[a-zA-Z0-9.-]+(\.[a-zA-Z0-9]+)+$' THEN
			SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Email format has to be (char/num)@(char/num).(char/num).';
		ELSEIF EXISTS (SELECT 1 FROM Admin WHERE Email = p_email) THEN
			SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: The provided email already exists. Each admin must have a unique email.';
		END IF;
    END IF;
    
    -- date of birth --
    SET dob = STR_TO_DATE(dob_input, '%d/%m/%Y');
    IF dob IS NOT NULL AND TIMESTAMPDIFF(YEAR, dob, CURDATE()) < 18 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Admin\'s age has to be greater than or equal to 18.';
    END IF;
    
    -- foreign key branch id --
    IF p_branch_id IS NULL THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: The branch cant be null.';
	ELSE
		IF NOT EXISTS (SELECT 1 FROM Cinema_Branch WHERE Branch_id = p_branch_id) THEN
			SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: The provided Branch ID does not exist.';
		END IF;
	END IF;
    
	-- Check admin manager
	IF p_adminmanager IS NOT NULL AND NOT EXISTS (SELECT 1 FROM `Admin` WHERE Admin_id = p_adminmanager) THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: The provided Admin ID does not exist.';
    END IF;

    INSERT INTO Admin(Name, Gender, Date_of_birth, Email, Branch_id, Admin_Manager_id)
    VALUES (p_name, p_gender, dob, p_email, p_branch_id, p_adminmanager);
    
	IF p_phone IS NOT NULL THEN
		CALL insert_adminphone(LAST_INSERT_ID(),p_phone);
    END IF;
END $$

DROP PROCEDURE IF EXISTS update_admin $$
CREATE PROCEDURE update_admin 
(
	IN p_admin_id INT,
	IN p_name VARCHAR(50),
    IN p_gender VARCHAR(50),
	IN dob_input VARCHAR(20),
    IN p_email VARCHAR(100),
    IN p_branch_id INT,
    IN p_adminmanager INT,
    IN p_phone VARCHAR(50)
)
BEGIN
    DECLARE dob DATE;
	DECLARE old_name VARCHAR(50);
    DECLARE old_gender VARCHAR(50);
	DECLARE old_dob DATE;
    DECLARE old_email VARCHAR(100);
    DECLARE old_branch_id INT;
    DECLARE old_adminmanager INT;
    -- admin id --
	IF NOT EXISTS (SELECT 1 FROM `Admin` WHERE Admin_id = p_admin_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Admin ID does not exist.';
    END IF;
    
    SELECT Name, Gender, Date_of_birth, Email, Branch_id, Admin_Manager_id
    INTO old_name, old_gender, old_dob, old_email, old_branch_id, old_adminmanager
    FROM `Admin`
    WHERE Admin_id = p_admin_id;
    
	-- name --
    IF p_name IS NOT NULL AND p_name != old_name AND p_name NOT REGEXP '^[a-zA-Z ]+$' THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Admin name format has to be character.';
    END IF;   
    
    -- gender --
	IF p_gender IS NOT NULL AND p_gender NOT IN ('Male', 'Female', 'Other') THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Gender must be one of: Male, Female, or Other.';
    END IF; 
        
    -- email --    
    IF p_email IS NOT NULL AND p_email != old_email THEN
		IF p_email NOT REGEXP '^[a-zA-Z0-9.-]+@+[a-zA-Z0-9.-]+(\.[a-zA-Z0-9]+)+$' THEN
			SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Email format has to be (char/num)@(char/num).(char/num).';
		ELSEIF EXISTS (SELECT 1 FROM Admin WHERE Email = p_email) THEN
			SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: The provided email already exists. Each admin must have a unique email.';
		END IF;
    END IF;
    
    -- date of birth --
    SET dob = STR_TO_DATE(dob_input, '%d/%m/%Y');
    IF dob IS NOT NULL AND dob != old_dob AND TIMESTAMPDIFF(YEAR, dob, CURDATE()) < 18 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Admin\'s age has to be greater than or equal to 18.';
    END IF;
    
    -- foreign key branch id --
    IF p_branch_id IS NOT NULL AND p_branch_id != old_branch_id AND NOT EXISTS (SELECT 1 FROM Cinema_Branch WHERE Branch_id = p_branch_id) THEN
			SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: The provided Branch ID does not exist.';
	END IF;
    
	-- Check admin manager
	IF p_adminmanager IS NOT NULL AND p_adminmanager != old_adminmanager AND NOT EXISTS (SELECT 1 FROM `Admin` WHERE Admin_id = p_adminmanager) THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: The provided Admin ID does not exist.';
	END IF;

	UPDATE `Admin`
	SET
		Name = COALESCE (p_name, old_name),
		Gender = COALESCE (p_gender, old_gender),
		Date_of_birth = COALESCE (dob, old_dob),
		Email = COALESCE (p_email, old_email),
        Branch_id = COALESCE (p_branch_id, old_branch_id),
        Admin_Manager_id = COALESCE (p_adminmanager, old_adminmanager)
	WHERE Admin_id = p_admin_id;
    IF p_phone IS NOT NULL THEN
		CALL insert_adminphone(p_admin_id,p_phone);
	END IF;
END $$

DROP PROCEDURE IF exists delete_admin $$
CREATE PROCEDURE delete_admin
(
    IN p_admin_id INT
)
BEGIN
    -- check if admin exists
    IF NOT EXISTS (SELECT 1 FROM `Admin` WHERE Admin_id = p_admin_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Admin ID does not exist.';
    END IF;

    -- check if Admin has related 
    IF EXISTS (SELECT 1 FROM `Event` WHERE Admin_id = p_admin_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: You has to delete relation in "Event" table first.';
	ELSEIF EXISTS (SELECT 1 FROM `Movie` WHERE Admin_id = p_admin_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: You has to delete relation in "Movie" table first.';
	ELSEIF EXISTS (SELECT 1 FROM `Cinema_Branch` WHERE Admin_id = p_admin_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: You has to delete relation in "Cinema_branch" table first.';
    END IF;

    -- if no references found, delete admin
    DELETE FROM `Admin` WHERE Admin_id = p_admin_id;

END $$

DROP PROCEDURE IF EXISTS insert_adminphone $$
CREATE PROCEDURE insert_adminphone
(
	IN p_admin_id INT,
    IN p_phone VARCHAR(50)
)
BEGIN
	-- admin id can duplicate (many phone)
	IF NOT EXISTS (SELECT 1 FROM `Admin` WHERE Admin_id = p_admin_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Admin ID does not exist.';
    END IF;
	IF EXISTS (SELECT 1 FROM AdminPhone WHERE APhone = p_phone) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: This phone already exist.';
	ELSEIF p_phone NOT REGEXP '^[0-9]{10}$' THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: This phone format not correct: it has to be 10 number digits.';
    END IF;
    
	-- Insert phone
    INSERT INTO AdminPhone(Admin_id, APhone)
    VALUES (p_admin_id, p_phone);
END $$

DROP PROCEDURE IF EXISTS delete_adminphone $$
CREATE PROCEDURE delete_adminphone
(
	IN p_admin_id INT,
    IN p_phone VARCHAR(50)
)
BEGIN
	-- admin id can duplicate (many phone)
	IF NOT EXISTS (SELECT 1 FROM `Admin` WHERE Admin_id = p_admin_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Admin ID does not exist.';
    END IF;
	IF NOT EXISTS (SELECT 1 FROM AdminPhone WHERE Admin_id = p_admin_id AND APhone = p_phone) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: The admin dont have this phone number.';
    END IF;
    
    DELETE FROM AdminPhone WHERE Admin_id = p_admin_id AND APhone = p_phone;
END $$

-- THIS IS CINEMA_BRANCH --

DROP PROCEDURE IF exists create_cinema_branch $$
CREATE PROCEDURE create_cinema_branch 
(
    IN p_city VARCHAR(100),
    IN p_address VARCHAR(255),
    IN p_name VARCHAR(100),
    IN p_admin_id INT,
    IN p_phone VARCHAR(50)
)
BEGIN
	-- city --
    IF p_city is NULL THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: City cannot be null ';
    ELSEIF p_city NOT IN ('TP. Hồ Chí Minh', 'Hà Nội', 'Tây Ninh', 'Khánh Hòa') THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: City must be valid like: TP. Hồ Chí Minh, Hà Nội, Tây Ninh, Khánh Hòa,...';
	END IF;
    
	-- address --
    IF p_address IS NULL THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Address cannot be null ';
	ELSEIF p_address NOT REGEXP '^[0-9]+[A-Za-z]? [a-zA-ZÀ-ỹ0-9 ]+, Quận [A-Za-z0-9 ]+$' THEN 
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Address fomat is: 123A Ba Tháng Hai, Quận 1';
    END IF; 
    
    -- name --
    IF p_name is NULL THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Cinema name cannot be NULL.'; 
    END IF;   
    
    -- name + addressunique --
    IF EXISTS (SELECT 1 FROM Cinema_Branch WHERE City = p_city AND Address = p_address) THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: The location is the same, need to change.';
    END IF;
    
    -- foreign key admin id --
    IF p_admin_id IS NULL THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: The admin cant be null.';
	ELSE
		IF NOT EXISTS (SELECT 1 FROM `Admin` WHERE Admin_id = p_admin_id) THEN
			SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: The provided Admin ID does not exist.';
		END IF;
	END IF;
    
    INSERT INTO Cinema_Branch (City, Address, Name, Admin_id)
    VALUES (p_city, p_address, p_name, p_admin_id);
	IF p_phone IS NOT NULL THEN
		CALL insert_branchphone(LAST_INSERT_ID(),p_phone);
    END IF;
END $$

DROP PROCEDURE IF EXISTS update_cinema_branch $$
CREATE PROCEDURE update_cinema_branch
(
	IN p_branch_id INT,
    IN p_city VARCHAR(100),
    IN p_address VARCHAR(255),
    IN p_name VARCHAR(100),
    IN p_admin_id INT,
    IN p_phone VARCHAR(50)
)
BEGIN
	DECLARE old_city VARCHAR(100);
    DECLARE old_address VARCHAR(255);
    DECLARE old_name VARCHAR(100);
    DECLARE old_admin_id INT;

	-- check --
	IF NOT EXISTS (SELECT 1 FROM `Cinema_Branch` WHERE Branch_id = p_branch_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: branch ID does not exist.';
    END IF;
    
    SELECT City, Address, Name, Admin_id
    INTO old_city, old_address, old_name, old_admin_id
    FROM `Cinema_Branch`
    WHERE Branch_id = p_branch_id;
    
    -- city --
    IF p_city IS NOT NULL AND p_city != old_city AND  p_city NOT IN ('TP. Hồ Chí Minh', 'Hà Nội', 'Tây Ninh', 'Khánh Hòa') THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: City must be valid like: TP. Hồ Chí Minh, Hà Nội, Tây Ninh, Khánh Hòa,...';
	END IF;
    
	-- address --
    IF p_address IS NOT NULL AND p_address != old_address AND p_address NOT REGEXP '^[0-9]+[A-Za-z]? [a-zA-ZÀ-ỹ0-9 ]+, Quận [A-Za-z0-9 ]+$' THEN 
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Address fomat is: 123A Ba Tháng Hai, Quận 1';
    END IF; 
    
    -- name + address unique --
    IF p_city IS NOT NULL AND p_city != old_city AND p_address IS NOT NULL AND p_address != old_address 
	AND EXISTS (SELECT 1 FROM Cinema_Branch WHERE City = p_city AND Address = p_address) THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: The location is the same, need to change.';
    END IF;
    
    -- foreign key admin id --
    IF p_admin_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM `Admin` WHERE Admin_id = p_admin_id) THEN
			SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: The provided Admin ID does not exist.';
	END IF;

	UPDATE `Cinema_Branch`
	SET
		City = COALESCE (p_city, old_city),
        Address = COAlESCE (p_address, old_address),
        Name = COALESCE (p_name, old_name),
        Admin_id = COALESCE (p_admin_id, old_admin_id)
	WHERE Branch_id = p_branch_id;
	IF p_phone IS NOT NULL THEN
		CALL insert_branchphone(p_branch_id,p_phone);
	END IF;
END $$

DROP PROCEDURE IF EXISTS delete_cinema_branch $$
CREATE PROCEDURE delete_cinema_branch
(
    IN p_branch_id INT
)
BEGIN
    -- check if branch exists
    IF NOT EXISTS (SELECT 1 FROM Cinema_Branch WHERE Branch_id = p_branch_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: branch ID does not exist.';
    END IF;

    -- 1. Delete screens belonging to this branch
    IF EXISTS (SELECT 1 FROM Screen WHERE Branch_id = p_branch_id) THEN
        CALL delete_screen(p_branch_id, NULL);
    END IF;

    -- 2. Delete halls (this will trigger seat + showtime delete)
    IF EXISTS (SELECT 1 FROM Hall WHERE Branch_id = p_branch_id) THEN
        CALL delete_hall(p_branch_id, NULL);
    END IF;

    -- 3. Delete locate relationships
    IF EXISTS (SELECT 1 FROM Locate WHERE Branch_id = p_branch_id) THEN
        CALL delete_locate(p_branch_id, NULL);
    END IF;

    -- 4. Delete admins assigned to this branch
    IF EXISTS (SELECT 1 FROM Admin WHERE Branch_id = p_branch_id) THEN
        CALL delete_admin(p_branch_id);
    END IF;

    -- 5. Delete the branch last
    DELETE FROM Cinema_Branch WHERE Branch_id = p_branch_id;
END $$


DROP PROCEDURE IF EXISTS insert_branchphone $$
CREATE PROCEDURE insert_branchphone
(
	IN p_branch_id INT,
    IN p_phone VARCHAR(50)
)
BEGIN
	-- branch id can duplicate (many phone)
	IF NOT EXISTS (SELECT 1 FROM `Cinema_Branch` WHERE Branch_id = p_branch_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Branch ID does not exist.';
    END IF;
	IF EXISTS (SELECT 1 FROM BranchPhone WHERE BPhone = p_phone) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: This phone already exist.';
	ELSEIF p_phone NOT REGEXP '^[0-9]{10}$' THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: This phone format not correct: it has to be 10 number digits.';
    END IF;
    
	-- Insert phone
    INSERT INTO BranchPhone(Admin_id, BPhone)
    VALUES (p_branch_id, p_phone);
END $$

DROP PROCEDURE IF EXISTS delete_branchphone $$
CREATE PROCEDURE delete_branchphone
(
	IN p_branch_id INT,
    IN p_phone VARCHAR(50)
)
BEGIN
	-- branch id can duplicate (many phone)
	IF NOT EXISTS (SELECT 1 FROM `Cinema_Branch` WHERE Branch_id = p_branch_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Branch ID does not exist.';
    END IF;
	IF NOT EXISTS (SELECT 1 FROM BranchPhone WHERE Branch_id = p_branch_id AND BPhone = p_phone) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: The branch dont have this phone number.';
    END IF;
    
    DELETE FROM BranchPhone WHERE Branch_id = p_branch_id AND BPhone = p_phone;
END $$

-- THIS IS SCREEN --

DROP PROCEDURE IF EXISTS create_screen $$
CREATE PROCEDURE create_screen
(
    IN p_branch_id INT,
    IN p_movie_id INT
)
BEGIN
	IF NOT EXISTS (SELECT 1 FROM Cinema_Branch WHERE Branch_id = p_branch_id) THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Branch does not exist.';
	END IF;
	IF NOT EXISTS (SELECT 1 FROM Movie WHERE Movie_id = p_movie_id) THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Movie does not exist.';
	END IF;
	IF EXISTS (SELECT 1 FROM Screen WHERE Branch_id = p_branch_id AND Movie_id = p_movie_id) THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Screen already exists for this branch and movie.';
	END IF;
    
    -- Insert relationship
    INSERT INTO Screen (Branch_id, Movie_id)
    VALUES (p_branch_id, p_movie_id);
END $$

DROP PROCEDURE IF EXISTS delete_screen $$
CREATE PROCEDURE delete_screen
(
    IN p_branch_id INT,
    IN p_movie_id INT
)
BEGIN
    -- Case 1: both inputs NULL → cannot proceed
    IF p_branch_id IS NULL AND p_movie_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'ERROR: both inputs are null, cannot delete';
    END IF;

    -- Validate branch_id if provided
    IF p_branch_id IS NOT NULL AND
       NOT EXISTS (SELECT 1 FROM Cinema_Branch WHERE Branch_id = p_branch_id) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'ERROR: Branch does not exist.';
    END IF;

    -- Validate movie_id if provided
    IF p_movie_id IS NOT NULL AND
       NOT EXISTS (SELECT 1 FROM Movie WHERE Movie_id = p_movie_id) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'ERROR: Movie does not exist.';
    END IF;

    -- Deletion cases (same pattern as delete_access & delete_locate)
    IF p_movie_id IS NULL THEN
        DELETE FROM Screen
        WHERE Branch_id = p_branch_id;

    ELSEIF p_branch_id IS NULL THEN
        DELETE FROM Screen
        WHERE Movie_id = p_movie_id;

    ELSE
        DELETE FROM Screen
        WHERE Branch_id = p_branch_id
          AND Movie_id = p_movie_id;
    END IF;
END $$

-- THIS IS LOCATE --

DROP PROCEDURE IF EXISTS create_locate $$
CREATE PROCEDURE create_locate
(
    IN p_branch_id INT,
    IN p_event_id INT
)
BEGIN
	IF NOT EXISTS (SELECT 1 FROM Cinema_Branch WHERE Branch_id = p_branch_id) THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Branch does not exist.';
	END IF;
	IF NOT EXISTS (SELECT 1 FROM `Event` WHERE Event_id = p_event_id) THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Event does not exist.';
	END IF;
	IF EXISTS (SELECT 1 FROM Locate WHERE Branch_id = p_branch_id AND Event_id = p_event_id) THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Locate already exists for this branch and event.';
	END IF;
    
	-- Insert relationship
    INSERT INTO Locate (Branch_id, Event_id)
    VALUES (p_branch_id, p_event_id);
END $$

DROP PROCEDURE IF EXISTS delete_locate $$
CREATE PROCEDURE delete_locate
(
    IN p_branch_id INT,
    IN p_event_id INT
)
BEGIN
    -- Case 1: Both NULL → cannot proceed
    IF p_branch_id IS NULL AND p_event_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'ERROR: both inputs are null, cannot delete';
    END IF;

    -- Validate branch_id if provided
    IF p_branch_id IS NOT NULL AND
       NOT EXISTS (SELECT 1 FROM Cinema_Branch WHERE Branch_id = p_branch_id) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'ERROR: Branch does not exist.';
    END IF;

    -- Validate event_id if provided
    IF p_event_id IS NOT NULL AND
       NOT EXISTS (SELECT 1 FROM Event WHERE Event_id = p_event_id) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'ERROR: Event does not exist.';
    END IF;

    -- Deletion cases (same style as delete_access)
    IF p_branch_id IS NULL THEN
        DELETE FROM Locate
        WHERE Event_id = p_event_id;

    ELSEIF p_event_id IS NULL THEN
        DELETE FROM Locate
        WHERE Branch_id = p_branch_id;

    ELSE
        DELETE FROM Locate
        WHERE Branch_id = p_branch_id
          AND Event_id = p_event_id;
    END IF;
END $$


-- THIS IS HALL --

DROP PROCEDURE IF exists create_hall $$
CREATE PROCEDURE create_hall
(
    IN p_branch_id INT,
    IN p_hall_number INT,
    IN p_type VARCHAR(100),
    IN p_seat_capacity INT,
    IN p_row_count INT,
    IN p_col_count INT
)
BEGIN
	-- branch --
    IF p_branch_id IS NULL THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Branch id cant be null.';
	ELSEIF NOT EXISTS (SELECT 1 FROM Cinema_Branch WHERE Branch_id = p_branch_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Branch does not exist.';
    END IF;
	
    -- Hall --
    IF p_hall_number IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Hall number cannot be NULL.';
    END IF;
    
    -- unique --
    IF EXISTS (SELECT 1 FROM Hall  WHERE Branch_id = p_branch_id AND Hall_number = p_hall_number) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: This hall already exists in the branch.';
    END IF;
    
	-- Type --
    IF p_type IS NULL THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Hall type cannot be NULL.';
    END IF;
    
    -- seat capacity --
	IF p_seat_capacity IS NULL OR p_seat_capacity <= 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Seat capacity must be greater than 0.';
    END IF;
    
    -- row and column count validation (NEW CHECK) --
    IF p_row_count IS NULL OR p_col_count IS NULL OR p_row_count <= 0 OR p_col_count <= 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Row count and column count must be greater than 0.';
    END IF;

    IF p_row_count * p_col_count <> p_seat_capacity THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Row count multiplied by column count must equal the seat capacity.';
    END IF;
    
	INSERT INTO Hall (Branch_id, Hall_number, Type, Seat_capacity, Row_count, Col_count)
    VALUES (p_branch_id, p_hall_number, p_type, p_seat_capacity, p_row_count, p_col_count);
END $$

DROP PROCEDURE IF EXISTS update_hall $$
CREATE PROCEDURE update_hall
(
    IN p_branch_id INT,
    IN p_hall_number INT,
    IN p_type VARCHAR(100),
    IN p_seat_capacity INT,
	IN p_row_count INT,
    IN p_col_count INT
)
BEGIN
    DECLARE old_type VARCHAR(100);
    DECLARE old_seat_capacity INT;
    DECLARE old_row_count INT;  
    DECLARE old_col_count INT;
    
	-- branch --
    IF p_branch_id IS NULL THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Branch id cant be null.';
	ELSEIF NOT EXISTS (SELECT 1 FROM Cinema_Branch WHERE Branch_id = p_branch_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Branch does not exist.';
    END IF;
	
    -- Hall --
    IF p_hall_number IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Hall number cannot be NULL.';
    END IF;
    
    -- unique --
    IF NOT EXISTS (SELECT 1 FROM Hall  WHERE Branch_id = p_branch_id AND Hall_number = p_hall_number) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: This hall not exists in the branch.';
    END IF;
    
	SELECT Type, Seat_capacity, `Row_count`, Col_count
    INTO old_type, old_seat_capacity, old_row_count, old_col_count
    FROM `Hall`
    WHERE Branch_id = p_branch_id AND Hall_number = p_hall_number;
    
    -- seat capacity --
	IF p_seat_capacity IS NOT NULL AND p_seat_capacity != old_seat_capacity AND p_seat_capacity <= 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Seat capacity must be greater than 0.';
    END IF;
    
    -- Row and column validation (Must be greater than 0) --
    IF (p_row_count != old_row_count AND p_row_count <= 0) OR (p_col_count != old_col_count AND p_col_count <= 0) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Row count and column count must be greater than 0.';
    END IF;

    -- Grid capacity check --
    IF COALESCE(p_row_count, old_row_count) * COALESCE(p_col_count, old_col_count) <> COALESCE(p_seat_capacity, old_seat_capacity) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Row count multiplied by column count must equal the seat capacity.';
    END IF;
    
	UPDATE `Hall`
	SET
		Type = COALESCE (p_type, old_type),
        Seat_capacity = COALESCE (p_seat_capacity, old_seat_capacity),
		Row_count = COALESCE (p_row_count, old_row_count),
        Col_count = COALESCE (p_col_count, old_col_count)
	WHERE Branch_id = p_branch_id AND Hall_number = p_hall_number;
END $$

DROP PROCEDURE IF EXISTS delete_hall $$
CREATE PROCEDURE delete_hall
(
    IN p_branch_id INT,
    IN p_hall_number INT
)
BEGIN
    -- CASE 1: delete ALL halls in a branch
    IF p_branch_id IS NOT NULL AND p_hall_number IS NULL THEN

        -- delete seats of all halls in this branch
        IF EXISTS (SELECT 1 FROM Seat WHERE Branch_id = p_branch_id) THEN
            CALL delete_seat(p_branch_id, NULL, NULL); -- ALL seats in branch
        END IF;

        -- ensure no showtime exists before deleting halls
        IF EXISTS (SELECT 1 FROM Showtime WHERE Branch_id = p_branch_id) THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'ERROR: Delete showtimes before deleting halls in this branch.';
        END IF;

        DELETE FROM Hall WHERE Branch_id = p_branch_id;

    -- CASE 2: delete ONE hall
    ELSEIF p_branch_id IS NOT NULL AND p_hall_number IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM Hall  WHERE Branch_id = p_branch_id AND Hall_number = p_hall_number) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Hall does not exist.';
        END IF;

        -- delete seats
        IF EXISTS (SELECT 1 FROM Seat WHERE Branch_id = p_branch_id AND Hall_number = p_hall_number) THEN
            CALL delete_seat(p_branch_id, p_hall_number, NULL);
        END IF;

        -- block if showtime exists
        IF EXISTS (SELECT 1 FROM Showtime  WHERE Branch_id = p_branch_id AND Hall_number = p_hall_number) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Delete showtimes before deleting this hall.';
        END IF;

        DELETE FROM Hall WHERE Branch_id = p_branch_id AND Hall_number = p_hall_number;
    
    ELSE
        -- INVALID
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Invalid hall deletion parameters.';
    END IF;
END $$



-- THIS IS SEAT --

DROP PROCEDURE IF exists create_seat $$
CREATE PROCEDURE create_seat
(
    IN p_branch_id INT,
    IN p_hall_number INT,
    IN p_seat_number VARCHAR(10),
    IN p_seat_type VARCHAR(50)
)
BEGIN
    -- valid? --
    IF p_branch_id IS NULL THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Branch id cant be null.';
    ELSEIF p_hall_number IS NULL THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: hall number cant be null.';    
    ELSEIF NOT EXISTS (SELECT 1 FROM Hall  WHERE Branch_id = p_branch_id AND Hall_number = p_hall_number) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: No matching key from hall.';
    END IF;
    
    -- unique --
    IF p_seat_number IS NULL THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: seat number cant be null.';
	ELSEIF p_seat_number NOT REGEXP '^[A-Z][1-9][0-9]?$' THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Seat number must be in format like A1, B5, C12';
	ELSEIF EXISTS (SELECT 1 FROM Seat WHERE Branch_id = p_branch_id AND Hall_number = p_hall_number AND Seat_number = p_seat_number) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: This seat already exists';
    END IF;
    
	-- Type --
    IF p_seat_type IS NULL THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: seat type cannot be NULL.';
	ELSEIF p_seat_type NOT IN ('Standard', 'VIP', 'Couple', 'Accessible') THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Seat type must be Standard, VIP, Couple, or Accessible.';
    END IF;
    
	INSERT INTO Seat (Branch_id, Hall_number, Seat_number, Seat_type)
    VALUES (p_branch_id, p_hall_number, p_seat_number, p_seat_type);
END $$

DROP PROCEDURE IF EXISTS update_seat $$
CREATE PROCEDURE update_seat
(
    IN p_branch_id INT,
    IN p_hall_number INT,
    IN p_seat_number VARCHAR(10),
    IN p_seat_type VARCHAR(50)
)
BEGIN
    DECLARE old_seat_type VARCHAR(50);
    
	-- valid? --
    IF p_branch_id IS NULL THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Branch id cant be null.';
    ELSEIF p_hall_number IS NULL THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: hall number cant be null.';    
    ELSEIF NOT EXISTS (SELECT 1 FROM Hall  WHERE Branch_id = p_branch_id AND Hall_number = p_hall_number) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: No matching key from hall.';
    ELSEIF p_seat_number IS NULL THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: seat number cant be null.';
	ELSEIF p_seat_number NOT REGEXP '^[A-Z][1-9][0-9]?$' THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Seat number must be in format like A1, B5, C12';
    END IF;
    
	SELECT Seat_type
    INTO old_seat_type
    FROM `Seat`
    WHERE Branch_id = p_branch_id AND Hall_number = p_hall_number AND Seat_number = p_seat_number;
    
	-- Type --
    IF p_seat_type IS NOT NULL AND p_seat_type != old_seat_type AND p_seat_type NOT IN ('Standard', 'VIP', 'Couple', 'Accessible') THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Seat type must be Standard, VIP, Couple, or Accessible.';
    END IF;
    
	UPDATE `Seat`
	SET
		Seat_type = COALESCE (p_seat_type, old_seat_type)
	WHERE Branch_id = p_branch_id AND Hall_number = p_hall_number AND Seat_number = p_seat_number;
END $$

DROP PROCEDURE IF EXISTS delete_seat $$
CREATE PROCEDURE delete_seat
(
    IN p_branch_id INT,
    IN p_hall_number INT,
    IN p_seat_number VARCHAR(10)
)
BEGIN
    -- 1. Delete ONE specific seat
    IF p_branch_id IS NOT NULL 
       AND p_hall_number IS NOT NULL
       AND p_seat_number IS NOT NULL THEN

        IF NOT EXISTS (SELECT 1 FROM Seat WHERE Branch_id = p_branch_id AND Hall_number = p_hall_number AND Seat_number = p_seat_number) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Seat does not exist.';
        END IF;

        DELETE FROM Seat
        WHERE Branch_id = p_branch_id AND Hall_number = p_hall_number AND Seat_number = p_seat_number;

    -- 2. Delete ALL seats in ONE hall
    ELSEIF p_branch_id IS NOT NULL
       AND p_hall_number IS NOT NULL
       AND p_seat_number IS NULL THEN

        IF NOT EXISTS (SELECT 1 FROM Seat WHERE Branch_id = p_branch_id AND Hall_number = p_hall_number) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: No seats found for this hall.';
        END IF;

        DELETE FROM Seat WHERE Branch_id = p_branch_id AND Hall_number = p_hall_number;

    -- 3. Delete ALL seats in a branch (used by delete_hall)
    ELSEIF p_branch_id IS NOT NULL
       AND p_hall_number IS NULL
       AND p_seat_number IS NULL THEN

        IF NOT EXISTS (SELECT 1 FROM Seat WHERE Branch_id = p_branch_id) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: No seats found for this branch.';
        END IF;
        
        DELETE FROM Seat WHERE Branch_id = p_branch_id;
    
    ELSE
        -- INVALID
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'ERROR: Invalid seat deletion parameters.';
    END IF;
END $$



-- THIS IS SHOWTIME --

DROP PROCEDURE IF EXISTS create_showtime $$
CREATE PROCEDURE create_showtime
(
    IN p_movie_id INT,
    IN p_start_time TIME,
    IN input_date VARCHAR(50),
    IN p_format VARCHAR(50),
    IN p_subtitle VARCHAR(50),
    IN p_branch_id INT,
    IN p_hall_number INT
)
BEGIN
    DECLARE p_date DATE;
    DECLARE v_hall_format VARCHAR(50);
   
    -- Check if Movie exists
    IF p_movie_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM Movie WHERE Movie_id = p_movie_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Movie does not exist.';
    END IF;


    -- Validate Format belongs to Movie
    IF p_format IS NULL OR NOT EXISTS (
        SELECT 1 FROM MovieFormat WHERE Movie_id = p_movie_id AND AFormat = p_format
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Movie does not support this Format.';
    END IF;


    -- Validate Subtitle belongs to Movie
    IF p_subtitle IS NULL OR NOT EXISTS (
        SELECT 1 FROM MovieSubtitle WHERE Movie_id = p_movie_id AND ASubtitle = p_subtitle
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Movie does not support this Subtitle.';
    END IF;


    -- Check if Hall exists
    IF p_branch_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: branch cannot be null.';
    ELSEIF p_hall_number IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: hall number cannot be null.';  
    ELSEIF NOT EXISTS (SELECT 1 FROM Hall WHERE Branch_id = p_branch_id AND Hall_number = p_hall_number) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Hall does not exist.';
    END IF;

     -- Hall exists & supports format
    SELECT Type
    INTO v_hall_format
    FROM Hall
    WHERE Branch_id = p_branch_id AND Hall_number = p_hall_number;

    IF v_hall_format IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Hall does not exist.';
    END IF;

    -- Hall format validation with default STANDARD + 2D
    IF p_format = 'IMAX' AND v_hall_format != 'IMAX' THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: WRONG HALL FOR FORMAT MOVIE (IMAX requires IMAX Hall)';
	ELSEIF p_format = '4DX' AND v_hall_format != '4DX' THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: WRONG HALL FOR FORMAT MOVIE (4DX requires 4DX Hall)';
	ELSEIF p_format = '3D' AND v_hall_format != '3D' THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: WRONG HALL FOR FORMAT MOVIE (3D requires 3D Hall)';
	END IF;

    SET p_date = STR_TO_DATE(input_date, '%d/%m/%Y');

    -- Insert showtime
    INSERT INTO Showtime (Movie_id, Start_time, Date, Format, Subtitle, Branch_id, Hall_number)
    VALUES (p_movie_id, p_start_time, p_date, p_format, p_subtitle, p_branch_id, p_hall_number);


END $$


DROP PROCEDURE IF EXISTS update_showtime $$
CREATE PROCEDURE update_showtime
(
    IN p_showtime_id INT,
    IN p_movie_id INT,
    IN p_start_time TIME,
    IN input_date VARCHAR(50),
    IN p_format VARCHAR(50),
    IN p_subtitle VARCHAR(50),
    IN p_branch_id INT,
    IN p_hall_number INT
)
BEGIN
    DECLARE p_date DATE;

    DECLARE old_movie INT;
    DECLARE old_start TIME;
    DECLARE old_date DATE;
    DECLARE old_branch INT;
    DECLARE old_hall INT;
    DECLARE old_format VARCHAR(50);
    DECLARE old_sub VARCHAR(50);

    DECLARE v_movie INT;
    DECLARE v_branch INT;
    DECLARE v_hall INT;
    DECLARE v_format VARCHAR(50);
    DECLARE v_sub VARCHAR(50);
    DECLARE v_hall_type VARCHAR(100);

    -- Showtime tồn tại
    IF NOT EXISTS (SELECT 1 FROM Showtime WHERE Showtime_id = p_showtime_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Showtime does not exist.';
    END IF;

    -- Load old data
    SELECT Movie_id, Start_time, Date, Branch_id, Hall_number, Format, Subtitle
    INTO old_movie, old_start, old_date, old_branch, old_hall, old_format, old_sub
    FROM Showtime
    WHERE Showtime_id = p_showtime_id;

    SET p_date = COALESCE(STR_TO_DATE(input_date, '%d/%m/%Y'), old_date);

    SET v_movie = COALESCE(p_movie_id, old_movie);
    SET v_format = COALESCE(p_format, old_format);
    SET v_sub = COALESCE(p_subtitle, old_sub);
    SET v_branch = COALESCE(p_branch_id, old_branch);
    SET v_hall = COALESCE(p_hall_number, old_hall);

    -- Movie
    IF NOT EXISTS (SELECT 1 FROM Movie WHERE Movie_id = v_movie) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Movie does not exist.';
    END IF;

    -- Movie Format check
    IF NOT EXISTS (
        SELECT 1 FROM MovieFormat WHERE Movie_id = v_movie AND AFormat = v_format
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Movie does not support this Format.';
    END IF;

    -- Movie Subtitle check
    IF NOT EXISTS (
        SELECT 1 FROM MovieSubtitle WHERE Movie_id = v_movie AND ASubtitle = v_sub
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Movie does not support this Subtitle.';
    END IF;

    -- Hall exists
    IF NOT EXISTS (
        SELECT 1 FROM Hall WHERE Branch_id = v_branch AND Hall_number = v_hall
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Hall does not exist.';
    END IF;

    -- Check format vs hall type
    SELECT Type INTO v_hall_type
    FROM Hall
    WHERE Branch_id = v_branch AND Hall_number = v_hall;

    IF v_hall_type IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Hall does not exist.';
    END IF;

    -- FORMAT RULE:
    -- STANDARD + 2D: always allowed
    -- IMAX hall → IMAX only (besides STANDARD + 2D)
    -- 4DX hall → 4DX only (besides STANDARD + 2D)
    -- 3D hall  → 3D only  (besides STANDARD + 2D)
    -- STANDARD hall → STANDARD + 2D only
    
	IF v_format = 'IMAX' AND v_hall_type != 'IMAX' THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: WRONG HALL FOR FORMAT MOVIE (IMAX requires IMAX Hall)';
	ELSEIF v_format = '4DX' AND v_hall_type != '4DX' THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: WRONG HALL FOR FORMAT MOVIE (4DX requires 4DX Hall)';
	ELSEIF v_format = '3D' AND v_hall_type != '3D' THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: WRONG HALL FOR FORMAT MOVIE (3D requires 3D Hall)';
	END IF;


    UPDATE Showtime
    SET 
        Movie_id = v_movie,
        Start_time = COALESCE(p_start_time, old_start),
        Date = p_date,
        Branch_id = v_branch,
        Hall_number = v_hall,
        Format = v_format,
        Subtitle = v_sub
    WHERE Showtime_id = p_showtime_id;

END $$


DROP PROCEDURE IF EXISTS delete_showtime $$
CREATE PROCEDURE delete_showtime(
    IN p_movie_id INT,
    IN p_showtime_id INT
)
BEGIN
    -- Check if showtime exists
    IF NOT EXISTS (
        SELECT 1 FROM Showtime 
        WHERE Movie_id = p_movie_id 
          AND Showtime_id = p_showtime_id
    ) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'ERROR: Showtime does not exist.';
    END IF;
    
    -- Check if there are tickets sold
    IF EXISTS (
        SELECT 1 
        FROM Ticket 
        WHERE Movie_id = p_movie_id 
          AND Showtime_id = p_showtime_id
    ) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'ERROR: Cannot delete showtime because tickets exist.';
    END IF;

    -- Safe to delete
    DELETE FROM Showtime
    WHERE Movie_id = p_movie_id 
      AND Showtime_id = p_showtime_id;
END $$ 


-- THIS IS REVIEW --

DROP PROCEDURE IF EXISTS create_review $$
CREATE PROCEDURE create_review
(
    IN p_movie_id INT,
    IN p_customer_id INT,
    IN p_rating DECIMAL(2,1),
    IN input_date_comment VARCHAR(50),
    IN p_comment VARCHAR(250),
    IN p_spoiler_tag ENUM('spoiler','non_spoiler')
)
BEGIN
    DECLARE p_date_comment DATE;

    -- Validate customer
    IF p_customer_id IS NULL THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Customer id cant be null.';
	ELSEIF NOT EXISTS (SELECT 1 FROM Customer WHERE Customer_id = p_customer_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Customer dont exist.';    
    END IF;

    -- Validate movie
    IF p_movie_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Movie cannot be null.';
    ELSEIF NOT EXISTS (SELECT 1 FROM Movie WHERE Movie_id = p_movie_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Movie does not exist.';
    END IF;

    -- Validate rating
    IF p_rating IS NULL OR p_rating < 1.0 OR p_rating > 10.0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Rating must be between 1.0 and 10.0.';
    END IF;

    -- Convert date
    IF input_date_comment IS NOT NULL THEN
        SET p_date_comment = STR_TO_DATE(input_date_comment, '%d/%m/%Y');
        IF p_date_comment > CURDATE() THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Date_comment cannot be in the future.';
        END IF;
    END IF;

    -- Comment & Date consistency
    IF (p_comment IS NOT NULL AND p_date_comment IS NULL) OR
       (p_comment IS NULL AND p_date_comment IS NOT NULL) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Comment and Date_comment must both be provided.';
    END IF;

    -- Comment length
    IF p_comment IS NOT NULL AND CHAR_LENGTH(p_comment) > 250 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Comment exceeds 250 characters.';
    END IF;

    -- Unique review per customer per movie
    IF EXISTS (SELECT 1 FROM Review WHERE Movie_id = p_movie_id AND Customer_id = p_customer_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Customer already reviewed this movie.';
    END IF;

    -- Insert review
    INSERT INTO Review (Movie_id, Customer_id, Rating, Date_comment, Comment,spoiler_tag)
    VALUES (p_movie_id, p_customer_id, p_rating, p_date_comment, p_comment, p_spoiler_tag);

END $$

DROP PROCEDURE IF EXISTS update_review $$
CREATE PROCEDURE update_review
(
    IN p_movie_id INT,
    IN p_customer_id INT,
    IN p_rating DECIMAL(2,1),
    IN input_date_comment VARCHAR(50),
    IN p_comment VARCHAR(250)
)
BEGIN
    DECLARE old_rating DECIMAL(2,1);
    DECLARE old_comment VARCHAR(250);
    DECLARE old_date_comment DATE;
    DECLARE new_date_comment DATE;
    DECLARE old_movie_id INT;

    -- Check if review exists
    IF p_customer_id IS NULL THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Customer id cant be null.';
	ELSEIF NOT EXISTS (SELECT 1 FROM Customer WHERE Customer_id = p_customer_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Customer dont exist.';    
    ELSEIF NOT EXISTS (SELECT 1 FROM Review WHERE Customer_id = p_customer_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Review does not exist for this Customer.';
    END IF;

    -- Load old values
    SELECT Rating, Comment, Date_comment, Movie_id 
    INTO old_rating, old_comment, old_date_comment, old_movie_id 
    FROM Review
    WHERE Customer_id = p_customer_id;

    -- Convert new date
    IF input_date_comment IS NOT NULL THEN
        SET new_date_comment = STR_TO_DATE(input_date_comment, '%d/%m/%Y');
        IF new_date_comment > CURDATE() THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Date_comment cannot be in the future.';
        END IF;
    END IF;

    -- Comment & Date consistency
    IF (p_comment IS NOT NULL AND new_date_comment IS NULL) OR
       (p_comment IS NULL AND new_date_comment IS NOT NULL) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Comment and Date_comment must both be provided.';
    END IF;

    -- Comment length
    IF p_comment IS NOT NULL AND p_comment != old_comment AND CHAR_LENGTH(p_comment) > 250 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Comment exceeds 250 characters.';
    END IF;

    -- Rating validation
    IF p_rating IS NOT NULL AND p_rating != old_rating AND (p_rating < 1.0 OR p_rating > 10.0) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Rating must be between 1.0 and 10.0.';
    END IF;
	
	-- Movie id --
    IF p_movie_id IS NOT NULL AND p_movie_id != old_movie_id AND NOT EXISTS (SELECT 1 FROM Movie WHERE Movie_id = p_movie_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: The provided Movie ID does not exist.';
    END IF;
    
    -- Update review
    UPDATE Review
    SET
        Rating = COALESCE(p_rating, old_rating),
        Comment = COALESCE(p_comment, old_comment),
        Date_comment = COALESCE(new_date_comment,old_date_comment),
        Movie_id = COALESCE(p_movie_id, old_movie_id)
    WHERE Customer_id = p_customer_id;

END $$

DROP PROCEDURE IF EXISTS delete_review $$
CREATE PROCEDURE delete_review
(
    IN p_customer_id INT
)
BEGIN
    -- check if review exists --
    IF p_customer_id IS NULL THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Customer id cant be null.';
	ELSEIF NOT EXISTS (SELECT 1 FROM Customer WHERE Customer_id = p_customer_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Customer dont exist.';    
    ELSEIF NOT EXISTS (SELECT 1 FROM Review WHERE Customer_id = p_customer_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Review does not exist for this Customer.';
    END IF;

    -- if no references found, delete customer --
	DELETE FROM Review 
	WHERE
		Customer_id = p_customer_id;

END $$

-- THIS IS MEMBERSHIP --

DROP PROCEDURE IF EXISTS create_membership $$
CREATE PROCEDURE create_membership
(
    IN p_type VARCHAR(50),
    IN input_start_Date VARCHAR(50)
)
BEGIN
    DECLARE p_start_date DATE;
    DECLARE new_memid INT;

    -- Validate input type
    IF p_type NOT IN ('Bronze', 'Silver', 'Gold', 'Platinum') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'ERROR: type must be one of Bronze, Silver, Gold, Platinum.';
    END IF;

    -- Convert date
    SET p_start_date = STR_TO_DATE(input_start_Date, '%d/%m/%Y');

    -- Insert membership
    INSERT INTO Membership(Type, Start_Date)
    VALUES (p_type, p_start_date);

    SET new_memid = LAST_INSERT_ID();

    -- Assign Privileges
    IF p_type = 'Bronze' THEN
        CALL create_access(new_memid, 1);
    END IF;

END $$


DROP PROCEDURE IF EXISTS update_membership $$
CREATE PROCEDURE update_membership
(
    IN p_membership_id INT,
    IN p_type VARCHAR(50),
    IN input_start_Date VARCHAR(50)
)
BEGIN
    DECLARE p_start_date DATE;

    DECLARE old_start_date DATE;
    DECLARE old_type VARCHAR(50);

    -- Validate membership ID
    IF p_membership_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Membership id cant be null.';
    ELSEIF NOT EXISTS (SELECT 1 FROM Membership WHERE Membership_id = p_membership_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Membership dont exist.';    
    END IF;

    -- Load old values
    SELECT Type, Start_Date
    INTO old_type, old_start_date
    FROM Membership
    WHERE Membership_id = p_membership_id;

    -- Validate type only when changed
    IF p_type IS NOT NULL 
       AND p_type != old_type
       AND p_type NOT IN ('Bronze', 'Silver', 'Gold', 'Platinum') THEN
        SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'ERROR: type must be one of: Bronze, Silver, Gold, Platinum.';
    END IF;

    -- Convert input date
    SET p_start_date = STR_TO_DATE(input_start_date, '%d/%m/%Y');

    -- Validate start date
    IF p_start_date IS NOT NULL 
       AND p_start_date != old_start_date
       AND p_start_date > CURDATE() THEN
        SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'ERROR: Start_date cannot be in the future.';
    END IF;

    -- Update membership info
    UPDATE Membership
    SET
        Type = COALESCE(p_type, old_type),
        Start_Date = COALESCE(p_start_date, old_start_date)
    WHERE Membership_id = p_membership_id;

    -- -------------------------------
    -- UPDATE ACCESS BASED ON NEW TYPE
    -- -------------------------------
    IF p_type IS NOT NULL AND p_type != old_type THEN
        
        -- Xóa toàn bộ quyền cũ
        DELETE FROM Access 
        WHERE Membership_id = p_membership_id;

        -- Bronze = privilege 1
        IF p_type = 'Bronze' THEN
            INSERT INTO Access(Membership_id, Privilege_id)
            VALUES (p_membership_id, 1);

        -- Silver = privilege 1,2
        ELSEIF p_type = 'Silver' THEN
            INSERT INTO Access VALUES (p_membership_id, 1), (p_membership_id, 2);

        -- Gold = privilege 1,2,3,4
        ELSEIF p_type = 'Gold' THEN
            INSERT INTO Access VALUES
                (p_membership_id, 1),
                (p_membership_id, 2),
                (p_membership_id, 3),
                (p_membership_id, 4);

        -- Platinum = privilege 1..5
        ELSEIF p_type = 'Platinum' THEN
            INSERT INTO Access VALUES
                (p_membership_id, 1),
                (p_membership_id, 2),
                (p_membership_id, 3),
                (p_membership_id, 4),
                (p_membership_id, 5);
        END IF;

    END IF;

END $$

DROP PROCEDURE IF EXISTS delete_membership $$
CREATE PROCEDURE delete_membership
(
    IN p_membership_id INT
)
BEGIN
    -- Check null
    IF p_membership_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Membership ID cannot be null.';
    END IF;

    -- Check membership exists
    IF NOT EXISTS (SELECT 1 FROM Membership WHERE Membership_id = p_membership_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Membership does not exist.';
    END IF;

    -- Check if any customer is using it
    IF EXISTS (SELECT 1 FROM Customer WHERE Membership_id = p_membership_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Cannot delete membership because it is referenced by a customer.';
    END IF;

    -- Delete membership
    DELETE FROM Membership
    WHERE Membership_id = p_membership_id;
END $$

-- THIS IS ACCESS --

DROP PROCEDURE IF EXISTS create_access $$
CREATE PROCEDURE create_access
(
    IN p_membership_id INT,
    IN p_privilege_id INT
)
BEGIN
    -- Validate membership
    IF NOT EXISTS (SELECT 1 FROM Membership WHERE Membership_id = p_membership_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Membership does not exist.';
    END IF;

    -- Validate privilege
    IF NOT EXISTS (SELECT 1 FROM Privilege WHERE Privilege_id = p_privilege_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Privilege does not exist.';
    END IF;

    -- Check duplicate
    IF EXISTS (SELECT 1 FROM Access 
               WHERE Membership_id = p_membership_id 
                 AND Privilege_id = p_privilege_id) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'ERROR: This access relationship already exists.';
    END IF;

    -- Insert relationship
    INSERT INTO Access (Membership_id, Privilege_id)
    VALUES (p_membership_id, p_privilege_id);
END $$


DROP PROCEDURE IF EXISTS delete_access $$
CREATE PROCEDURE delete_access
(
    IN p_membership_id INT,
    IN p_privilege_id INT
)
BEGIN
    IF p_membership_id IS NULL AND p_privilege_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: both inputs are null, cannot delete';
	END IF;
    
    -- Validate membership_id if provided
    IF p_membership_id IS NOT NULL AND 
       NOT EXISTS (SELECT 1 FROM Membership WHERE Membership_id = p_membership_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Membership does not exist.';
    END IF;

    -- Validate privilege_id if provided
    IF p_privilege_id IS NOT NULL AND
       NOT EXISTS (SELECT 1 FROM Privilege WHERE Privilege_id = p_privilege_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Privilege does not exist.';
    END IF;
    
	IF p_membership_id IS NULL THEN
		DELETE FROM Access
		WHERE Privilege_id = p_privilege_id;
	ELSEIF p_privilege_id IS NULL THEN
		DELETE FROM Access
		WHERE Membership_id = p_membership_id;
	ELSE
		DELETE FROM Access
		WHERE Membership_id = p_membership_id
		  AND Privilege_id = p_privilege_id;
	END IF;
END $$

-- THIS IS CUSTOMER VOUCHER --

DROP PROCEDURE IF EXISTS create_customer_voucher $$
CREATE PROCEDURE create_customer_voucher
(
    IN p_customer_id INT,
    IN p_voucher_id INT
)
BEGIN
    -- Validate customer
    IF p_customer_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Customer ID cannot be null.';
    ELSEIF NOT EXISTS (SELECT 1 FROM Customer WHERE Customer_id = p_customer_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Customer does not exist.';
    END IF;

    -- Validate voucher
    IF p_voucher_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Voucher ID cannot be null.';
    ELSEIF NOT EXISTS (SELECT 1 FROM Voucher WHERE Voucher_id = p_voucher_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Voucher does not exist.';
    END IF;

    -- Check if customer already has this voucher (active or used)
    IF EXISTS (SELECT 1 FROM CustomerVoucher WHERE Customer_id = p_customer_id AND Voucher_id = p_voucher_id AND Status != 'Expired') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Customer already has this voucher.';
    END IF;
    
    -- Insert new voucher with default Status = 'Unused'
    INSERT INTO CustomerVoucher (Customer_id, CV_id, Status, Voucher_id)
    VALUES (p_customer_id, NULL, 'Unused', p_voucher_id);
    -- Note: CV_id will be automatically set by the trigger
END $$

DROP PROCEDURE IF EXISTS update_customer_voucher $$
CREATE PROCEDURE update_customer_voucher
(
    IN p_customer_id INT,
    IN p_cv_id INT,
    IN p_status VARCHAR(250),
    IN p_voucher_id INT
)
BEGIN
    DECLARE old_status VARCHAR(250);
    DECLARE old_voucher_id INT;

    -- Validate inputs
    IF p_customer_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Customer ID cannot be null.';
    ELSEIF NOT EXISTS (SELECT 1 FROM Customer WHERE Customer_id = p_customer_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Customer does not exist.';
    END IF;

    IF p_cv_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: CV_id cannot be null.';
    ELSEIF NOT EXISTS (SELECT 1 FROM CustomerVoucher WHERE Customer_id = p_customer_id AND CV_id = p_cv_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: CustomerVoucher does not exist.';
    END IF;

    -- Load old values
    SELECT Status, Voucher_id
    INTO old_status, old_voucher_id
    FROM CustomerVoucher
    WHERE Customer_id = p_customer_id AND CV_id = p_cv_id;

    -- Validate status
    IF p_status IS NOT NULL AND p_status != old_status AND p_status NOT IN ('Unused', 'Used', 'Expired') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Status must be one of: Unused, Used, Expired.';
    END IF;

    -- Validate voucher_id
    IF p_voucher_id IS NOT NULL AND p_voucher_id != old_voucher_id AND NOT EXISTS (SELECT 1 FROM Voucher WHERE Voucher_id = p_voucher_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Voucher does not exist.';
    END IF;

    -- Check unique voucher per customer for active vouchers
    IF p_voucher_id IS NOT NULL AND p_voucher_id != old_voucher_id THEN
        IF EXISTS (SELECT 1 FROM CustomerVoucher WHERE Customer_id = p_customer_id AND Voucher_id = p_voucher_id AND Status != 'Expired') THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Customer already has this voucher.';
        END IF;
    END IF;

    -- Update CustomerVoucher
    UPDATE CustomerVoucher
    SET
        Status = COALESCE(p_status, old_status),
        Voucher_id = COALESCE(p_voucher_id, old_voucher_id)
    WHERE Customer_id = p_customer_id AND CV_id = p_cv_id;

END $$

DROP PROCEDURE IF EXISTS delete_customer_voucher $$
CREATE PROCEDURE delete_customer_voucher
(
    IN p_customer_id INT,
    IN p_cv_id INT
)
BEGIN
    -- Case 0: both NULL → invalid
    IF p_customer_id IS NULL AND p_cv_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Must provide customer_id or (customer_id + cv_id).';
    END IF;
    
    -- Case 1: If cv_id is provided but customer_id is NULL → INVALID
    IF p_customer_id IS NULL AND p_cv_id IS NOT NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Cannot delete using CV_id alone. Must also provide Customer_id.';
    END IF;
    
    -- Case 2: Validate customer exists
    IF p_customer_id IS NOT NULL AND 
    NOT EXISTS (SELECT 1 FROM Customer WHERE Customer_id = p_customer_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Customer does not exist.';
    END IF;

    -- Case 3: If deleting a specific voucher, check it exists
    IF p_customer_id IS NOT NULL AND p_cv_id IS NOT NULL AND
    NOT EXISTS (SELECT 1 FROM CustomerVoucher WHERE Customer_id = p_customer_id AND CV_id = p_cv_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: CustomerVoucher record does not exist.';
    END IF;


    -- Case 4: Check Apply dependency (FK child)
    IF p_customer_id IS NOT NULL AND p_cv_id IS NOT NULL AND 
    EXISTS (SELECT 1 FROM Apply WHERE Customer_id = p_customer_id AND CV_id = p_cv_id) THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Cannot delete because voucher is used in Apply table.';
    END IF;

    -- Case 5: Only customer_id → delete all vouchers for that customer
    IF p_customer_id IS NOT NULL AND p_cv_id IS NULL THEN
        DELETE FROM CustomerVoucher WHERE Customer_id = p_customer_id;
    END IF;


    -- Case 6: Both customer_id + cv_id → delete one voucher
    IF p_customer_id IS NOT NULL AND p_cv_id IS NOT NULL THEN
        DELETE FROM CustomerVoucher WHERE Customer_id = p_customer_id AND CV_id = p_cv_id;
    END IF;

END $$


-- THIS IS ORDER PRODUCT --

DROP PROCEDURE IF EXISTS create_order_product $$
CREATE PROCEDURE create_order_product
(
    IN p_receipt_id INT,
    IN p_product_id INT,
    IN p_quantity INT
)
BEGIN
    -- Validate inputs
    IF p_receipt_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Receipt ID cannot be null.';
    ELSEIF NOT EXISTS (SELECT 1 FROM `Receipt` WHERE Receipt_id = p_receipt_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Receipt does not exist.';
    END IF;

    IF p_product_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Product ID cannot be null.';
    ELSEIF NOT EXISTS (SELECT 1 FROM Product WHERE Product_id = p_product_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Product does not exist.';
    END IF;
	
    IF p_quantity IS NULL OR p_quantity <= 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Quantity must be a positive number (>= 1).';
    END IF;
    
    -- Check if this product is already in the order
    IF EXISTS (SELECT 1 FROM OrderProduct WHERE Receipt_id = p_receipt_id AND Product_id = p_product_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Product already exists in this order.';
    END IF;

    -- Insert
    INSERT INTO OrderProduct (Receipt_id, Product_id, Quantity)
    VALUES (p_receipt_id, p_product_id, p_quantity);
END $$

DROP PROCEDURE IF EXISTS update_order_product $$
CREATE PROCEDURE update_order_product
(
    IN p_orderproduct_id INT,
    IN p_receipt_id INT,
    IN p_product_id INT,
    IN p_quantity INT
)
BEGIN
    DECLARE old_product_id INT;
    DECLARE old_quantity INT;
    
    SET @AcceptedStatus = 'Used,Unused,Expired';

    -- Validate OrderProduct exists
    IF p_orderproduct_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: OrderProduct ID cannot be null.';
    ELSEIF NOT EXISTS (SELECT 1 FROM OrderProduct WHERE OrderProduct_id = p_orderproduct_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: OrderProduct does not exist.';
    END IF;

	IF p_receipt_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Receipt ID cannot be null.';
    END IF;
	IF NOT EXISTS (
        SELECT 1 FROM OrderProduct 
        WHERE OrderProduct_id = p_orderproduct_id AND Receipt_id = p_receipt_id
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: OrderProduct line item does not exist for this receipt.';
    END IF;
    
    -- Load old values
    SELECT Product_id, Quantity
    INTO old_product_id, old_quantity
    FROM OrderProduct
    WHERE OrderProduct_id = p_orderproduct_id AND Receipt_id = p_receipt_id;

    -- Validate new product_id
    IF p_product_id IS NOT NULL AND p_product_id != old_product_id AND NOT EXISTS (SELECT 1 FROM Product WHERE Product_id = p_product_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Product does not exist.';
    END IF;

	-- duplicate --
	IF p_product_id IS NOT NULL AND p_product_id != old_product_id THEN
		IF NOT EXISTS (
			SELECT 1
			FROM OrderProduct
			WHERE Receipt_id = p_receipt_id
			  AND Product_id = p_product_id
			  AND OrderProduct_id != p_orderproduct_id
		) THEN
			SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: The new Product ID already exists as a separate line item on this receipt.';
		END IF;
	END IF;

    -- Update
    UPDATE OrderProduct
    SET
			Product_id = COALESCE(p_product_id, old_product_id),
			Quantity = COALESCE(p_quantity, old_quantity) 
	WHERE OrderProduct_id = p_orderproduct_id AND Receipt_id = p_receipt_id; 
END $$

DROP PROCEDURE IF EXISTS delete_order_product $$
CREATE PROCEDURE delete_order_product
(
    IN p_orderproduct_id INT,
    IN p_order_id INT
)
BEGIN
    -- Case 0: both NULL → invalid
    IF p_orderproduct_id IS NULL AND p_order_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Both inputs NULL. Must provide order_id or both order_id + orderproduct_id.';
    END IF;
    
    -- Case 1: ONLY orderproduct_id given → REJECT
    IF p_orderproduct_id IS NOT NULL AND p_order_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Cannot delete using OrderProduct_id alone. Must also specify Order_id.';
    END IF;

    -- Case 2: ONLY order_id → delete all products in the order
    IF p_orderproduct_id IS NULL AND p_order_id IS NOT NULL THEN
		IF NOT EXISTS (SELECT 1 FROM `Order` WHERE Order_id = p_order_id) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Order does not exist.';
        END IF;

        DELETE FROM OrderProduct WHERE Order_id = p_order_id;
    END IF;

    -- Case 3: BOTH orderproduct_id + order_id → delete one row
    IF p_orderproduct_id IS NOT NULL AND p_order_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM OrderProduct WHERE OrderProduct_id = p_orderproduct_id AND Order_id = p_order_id) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: OrderProduct record does not exist.';
        END IF;

        DELETE FROM OrderProduct WHERE OrderProduct_id = p_orderproduct_id AND Order_id = p_order_id;
    END IF;

END $$


-- THIS IS VOUCHER --

DROP PROCEDURE IF EXISTS create_voucher $$
CREATE PROCEDURE create_voucher
(
    IN p_discount DECIMAL(5,2),
    IN input_expiration VARCHAR(50),
    IN p_description VARCHAR(255),
    IN p_condition VARCHAR(255)
)
BEGIN
	DECLARE p_expiration DATE;
    SET p_expiration = STR_TO_DATE(input_expiration, '%d/%m/%Y');
    
    -- Validate inputs
    IF p_discount IS NULL OR p_discount <= 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Discount must be a positive number.';
    END IF;

    IF p_expiration IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Expiration date cannot be null.';
    END IF;

    IF p_condition IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Condition cannot be empty.';
    END IF;

    -- Insert
    INSERT INTO Voucher (Discount, Expiration, `Description`, `Condition`)
    VALUES (p_discount, p_expiration, p_description, p_condition);
END $$

DROP PROCEDURE IF EXISTS update_voucher $$
CREATE PROCEDURE update_voucher
(
    IN p_voucher_id INT,
    IN p_discount DECIMAL(5,2),
    IN input_expiration VARCHAR(50),
    IN p_description VARCHAR(255),
    IN p_condition VARCHAR(255)
)
BEGIN
	DECLARE p_expiration DATE;
    
    DECLARE old_discount DECIMAL(5,2);
    DECLARE old_expiration DATE;
    DECLARE old_description VARCHAR(255);
    DECLARE old_condition VARCHAR(255);

    -- Validate voucher exists
    IF p_voucher_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Voucher ID cannot be null.';
    ELSEIF NOT EXISTS (SELECT 1 FROM Voucher WHERE Voucher_id = p_voucher_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Voucher does not exist.';
    END IF;

    -- Load old values
    SELECT Discount, Expiration, `Description`, `Condition`
    INTO old_discount, old_expiration, old_description, old_condition
    FROM Voucher
    WHERE Voucher_id = p_voucher_id;

    -- Validate new values
    IF p_discount IS NOT NULL AND p_discount != old_discount AND p_discount <= 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Discount must be a positive number.';
    END IF;

    SET p_expiration = STR_TO_DATE(input_expiration, '%d/%m/%Y');
    -- Update
    UPDATE Voucher
    SET
        Discount = COALESCE(p_discount, old_discount),
        Expiration = COALESCE(p_expiration, old_expiration),
        `Description` = COALESCE(p_description, old_description),
        `Condition` = COALESCE(p_condition, old_condition)
    WHERE Voucher_id = p_voucher_id;
END $$

DROP PROCEDURE IF EXISTS delete_voucher $$
CREATE PROCEDURE delete_voucher
(
    IN p_voucher_id INT
)
BEGIN
    -- Validate input
    IF p_voucher_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Voucher ID cannot be null.';
    ELSEIF NOT EXISTS (SELECT 1 FROM Voucher WHERE Voucher_id = p_voucher_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Voucher does not exist.';
    END IF;

    -- Check for references in CustomerVoucher
    IF EXISTS (SELECT 1 FROM CustomerVoucher WHERE Voucher_id = p_voucher_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Cannot delete Voucher because it is assigned to customers.';
    END IF;

    -- Delete
    DELETE FROM Voucher WHERE Voucher_id = p_voucher_id;
END $$

-- THIS IS APPLY --

DROP PROCEDURE IF EXISTS create_apply $$
CREATE PROCEDURE create_apply
(
    IN p_customer_id INT,
    IN p_cv_id INT,
    IN p_receipt_id INT,
    IN p_order_id INT
)
BEGIN
    -- Validate referenced tables
    IF NOT EXISTS (SELECT 1 FROM CustomerVoucher WHERE Customer_id = p_customer_id AND CV_id = p_cv_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: CustomerVoucher does not exist.';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM Receipt WHERE Receipt_id = p_receipt_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Receipt does not exist.';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM `Order` WHERE Order_id = p_order_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Order does not exist.';
    END IF;

    -- Check duplicate
    IF EXISTS (SELECT 1 FROM Apply WHERE Customer_id = p_customer_id AND CV_id = p_cv_id AND Receipt_id = p_receipt_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Apply relationship already exists (primary key duplicate).';
    END IF;

    IF EXISTS (SELECT 1 FROM Apply WHERE Customer_id = p_customer_id AND CV_id = p_cv_id AND Order_id = p_order_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Apply relationship already exists (unique order duplicate).';
    END IF;

    -- Insert
    INSERT INTO Apply (Customer_id, CV_id, Receipt_id, Order_id)
    VALUES (p_customer_id, p_cv_id, p_receipt_id, p_order_id);
END $$

DROP PROCEDURE IF EXISTS delete_apply $$
CREATE PROCEDURE delete_apply
(
    IN p_customer_id INT,
    IN p_cv_id INT,
    IN p_receipt_id INT
)
BEGIN
    -- 0. All inputs null → invalid
    IF p_customer_id IS NULL AND p_cv_id IS NULL AND p_receipt_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: All inputs are null. Cannot delete.';
    END IF;

    -- 1. Delete all Apply rows for a receipt
    IF p_customer_id IS NULL AND p_cv_id IS NULL AND p_receipt_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM Apply WHERE Receipt_id = p_receipt_id) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: No Apply rows found for this receipt.';
        END IF;

        DELETE FROM Apply WHERE Receipt_id = p_receipt_id;
    END IF;

    -- 2. Delete all Apply rows for a CustomerVoucher
    IF p_customer_id IS NOT NULL AND p_cv_id IS NOT NULL AND p_receipt_id IS NULL THEN
        IF NOT EXISTS (SELECT 1 FROM Apply WHERE Customer_id = p_customer_id AND CV_id = p_cv_id) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: No Apply rows found for this CustomerVoucher.';
        END IF;

        DELETE FROM Apply WHERE Customer_id = p_customer_id AND CV_id = p_cv_id;
    END IF;

    -- 3. Delete one specific Apply row
    IF p_customer_id IS NOT NULL AND p_cv_id IS NOT NULL AND p_receipt_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM Apply WHERE Customer_id = p_customer_id AND CV_id = p_cv_id AND Receipt_id = p_receipt_id) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Apply row does not exist.';
        END IF;

        DELETE FROM Apply WHERE Customer_id = p_customer_id AND CV_id = p_cv_id AND Receipt_id = p_receipt_id;
    END IF;

    -- 4. Invalid combinations
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Invalid parameters combination.';

END $$

-- THIS IS SHOWTIMESEAT --

DROP PROCEDURE IF EXISTS create_showtimeseat $$
CREATE PROCEDURE create_showtimeseat
(
    IN p_movie_id INT,
    IN p_showtime_id INT,
    IN p_branch_id INT,
    IN p_hall_number INT,
    IN p_seat_number VARCHAR(10),
    IN p_status VARCHAR(50)
)
BEGIN
    -- Validate referenced tables
    IF NOT EXISTS (SELECT 1 FROM Showtime WHERE Showtime_id = p_showtime_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Showtime does not exist.';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM Seat WHERE Branch_id = p_branch_id AND Hall_number = p_hall_number AND Seat_number = p_seat_number) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Seat does not exist.';
    END IF;

    -- Check duplicate (primary key)
    IF EXISTS (
        SELECT 1 FROM ShowtimeSeat 
          WHERE Showtime_id = p_showtime_id
          AND Branch_id = p_branch_id
          AND Hall_number = p_hall_number
          AND Seat_number = p_seat_number
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: ShowtimeSeat already exists (primary key duplicate).';
    END IF;

	-- status --
    IF p_status IS NOT NULL AND p_status NOT IN ('AVAILABLE', 'BOOKED', 'BLOCKED') THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Status has to be one of these: AVAILABLE, BOOKED, BLOCKED';
	END IF;
    
    -- Insert
    INSERT INTO ShowtimeSeat ( Movie_id, Showtime_id, Branch_id, Hall_number, Seat_number, Status)
    VALUES (p_movie_id, p_showtime_id, p_branch_id, p_hall_number, p_seat_number, p_status);
END $$

    
DROP PROCEDURE IF EXISTS update_showtimeseat $$
CREATE PROCEDURE update_showtimeseat(
	IN p_movie_id INT,
    IN p_showtime_id INT,
    IN p_branch_id INT,
    IN p_hall_number INT,
    IN p_seat_number VARCHAR(10),
    IN p_status VARCHAR(50)
)
BEGIN
    DECLARE old_status VARCHAR(50);
    DECLARE old_movie_id INT;

    IF NOT EXISTS (
        SELECT 1 FROM ShowtimeSeat
          WHERE Showtime_id = p_showtime_id
          AND Branch_id = p_branch_id
          AND Hall_number = p_hall_number
          AND Seat_number = p_seat_number
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: ShowtimeSeat does not exist.';
    END IF;

    SELECT Status, Movie_id
    INTO old_status, old_movie_id
    FROM ShowtimeSeat
      WHERE Showtime_id = p_showtime_id
      AND Branch_id = p_branch_id
      AND Hall_number = p_hall_number
      AND Seat_number = p_seat_number;

    IF p_status IS NOT NULL AND p_status != old_status THEN
        IF p_status NOT IN ('AVAILABLE','BOOKED','BLOCKED') THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Invalid status. Has to be: AVAILABLE, BOOKED, BLOCKED';
        END IF;
    END IF;

    UPDATE ShowtimeSeat
    SET 
    Status = COALESCE(p_status, old_status),
    Movie_id = COALESCE(p_movie_id, old_movie_id)
      WHERE Showtime_id = p_showtime_id
      AND Branch_id = p_branch_id
      AND Hall_number = p_hall_number
      AND Seat_number = p_seat_number;

END $$

DROP PROCEDURE IF EXISTS delete_showtimeseat $$
CREATE PROCEDURE delete_showtimeseat
(
    IN p_ticket_id INT,
    IN p_movie_id INT,
    IN p_showtime_id INT,
    IN p_branch_id INT,
    IN p_hall_number INT,
    IN p_seat_number VARCHAR(10)
)
BEGIN
    -- Case 0: all null → invalid
    IF p_ticket_id IS NULL AND p_movie_id IS NULL AND p_showtime_id IS NULL AND
       p_branch_id IS NULL AND p_hall_number IS NULL AND p_seat_number IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: All inputs are null. Cannot delete.';
    END IF;

    -- Case 1: Delete all ShowtimeSeat rows for a ticket
    IF p_ticket_id IS NOT NULL AND p_movie_id IS NULL AND p_showtime_id IS NULL AND
       p_branch_id IS NULL AND p_hall_number IS NULL AND p_seat_number IS NULL THEN
        IF NOT EXISTS (SELECT 1 FROM ShowtimeSeat WHERE Ticket_id = p_ticket_id) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: No ShowtimeSeat rows found for this ticket.';
        END IF;

        DELETE FROM ShowtimeSeat WHERE Ticket_id = p_ticket_id;
    END IF;

    -- Case 2: Delete all ShowtimeSeat rows for a showtime
    IF p_ticket_id IS NULL AND p_movie_id IS NOT NULL AND p_showtime_id IS NOT NULL AND
       p_branch_id IS NULL AND p_hall_number IS NULL AND p_seat_number IS NULL THEN
        IF NOT EXISTS (SELECT 1 FROM ShowtimeSeat WHERE Movie_id = p_movie_id AND Showtime_id = p_showtime_id) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: No ShowtimeSeat rows found for this showtime.';
        END IF;

        DELETE FROM ShowtimeSeat WHERE Movie_id = p_movie_id AND Showtime_id = p_showtime_id;
    END IF;

    -- Case 3: Delete all ShowtimeSeat rows for a seat
    IF p_ticket_id IS NULL AND p_movie_id IS NULL AND p_showtime_id IS NULL AND
       p_branch_id IS NOT NULL AND p_hall_number IS NOT NULL AND p_seat_number IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM ShowtimeSeat WHERE Branch_id = p_branch_id AND Hall_number = p_hall_number AND Seat_number = p_seat_number) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: No ShowtimeSeat rows found for this seat.';
        END IF;

        DELETE FROM ShowtimeSeat 
        WHERE Branch_id = p_branch_id 
          AND Hall_number = p_hall_number 
          AND Seat_number = p_seat_number;
    END IF;

    -- Case 4: Delete specific Has row
    IF p_ticket_id IS NOT NULL AND p_movie_id IS NOT NULL AND p_showtime_id IS NOT NULL AND
       p_branch_id IS NOT NULL AND p_hall_number IS NOT NULL AND p_seat_number IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM ShowtimeSeat
            WHERE Ticket_id = p_ticket_id
              AND Movie_id = p_movie_id
              AND Showtime_id = p_showtime_id
              AND Branch_id = p_branch_id
              AND Hall_number = p_hall_number
              AND Seat_number = p_seat_number
        ) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: ShowtimeSeat row does not exist.';
        END IF;

        DELETE FROM ShowtimeSeat
        WHERE Ticket_id = p_ticket_id
          AND Movie_id = p_movie_id
          AND Showtime_id = p_showtime_id
          AND Branch_id = p_branch_id
          AND Hall_number = p_hall_number
          AND Seat_number = p_seat_number;
    END IF;

    -- Case 5: Invalid combinations
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'ERROR: Invalid parameter combination for deletion.';
END $$


/*THIS IS PRIVILEGE*/

DROP PROCEDURE IF EXISTS create_privilege $$
CREATE PROCEDURE create_privilege
(
    IN p_name VARCHAR(100),
    IN p_expiration VARCHAR(20),
    IN p_description TEXT
)
BEGIN
    DECLARE exp DATE;

    IF p_name IS NULL OR p_name = '' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Privilege name cannot be NULL.';
    END IF;

    IF p_expiration IS NOT NULL THEN
        SET exp = STR_TO_DATE(p_expiration, '%d/%m/%Y');
        IF exp IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Expiration date format must be dd/mm/yyyy.';
        END IF;
    END IF;

    INSERT INTO Privilege(Name, Expiration, Description)
    VALUES (p_name, exp, p_description);
END $$


DROP PROCEDURE IF EXISTS update_privilege $$
CREATE PROCEDURE update_privilege
(
    IN p_privilege_id INT,
    IN p_name VARCHAR(100),
    IN p_expiration VARCHAR(20),
    IN p_description TEXT
)
BEGIN
    DECLARE exp DATE;

    IF NOT EXISTS (SELECT 1 FROM Privilege WHERE Privilege_id = p_privilege_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Privilege ID does not exist.';
    END IF;

    IF p_expiration IS NOT NULL THEN
        SET exp = STR_TO_DATE(p_expiration, '%d/%m/%Y');
        IF exp IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Expiration date format must be dd/mm/yyyy.';
        END IF;
    END IF;

    UPDATE Privilege
    SET 
        Name = COALESCE(NULLIF(p_name, ''), Name),
        Expiration = COALESCE(exp, Expiration),
        Description = COALESCE(p_description, Description)
    WHERE Privilege_id = p_privilege_id;
END $$


DROP PROCEDURE IF EXISTS delete_privilege $$
CREATE PROCEDURE delete_privilege
(
    IN p_privilege_id INT
)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Privilege WHERE Privilege_id = p_privilege_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Privilege ID does not exist.';
    END IF;

    IF EXISTS (SELECT 1 FROM Access WHERE Privilege_id = p_privilege_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Delete related rows in Access table first.';
    END IF;

    DELETE FROM Privilege WHERE Privilege_id = p_privilege_id;
END $$



/*THIS IS RECEIPT*/

DROP PROCEDURE IF EXISTS create_receipt $$
CREATE PROCEDURE create_receipt
(
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
)
BEGIN
    DECLARE rec_date DATE;
    DECLARE receipt_id INT;

    IF NOT EXISTS (SELECT 1 FROM Customer WHERE Customer_id = p_customer_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Customer ID does not exist.';
    END IF;

    SET rec_date = STR_TO_DATE(p_receipt_date, '%d/%m/%Y');
    IF rec_date IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Receipt date format must be dd/mm/yyyy.';
    END IF;

    IF p_method IS NULL OR p_method = '' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Payment method cannot be NULL.';
    END IF;


	IF p_cv_id IS NOT NULL THEN
		IF NOT EXISTS (SELECT 1 FROM `CustomerVoucher` WHERE Customer_id = p_customer_id AND CV_id = p_cv_id) THEN
			SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Customer Voucher ID (CV_id) does not exist for this Customer.';
		ELSEIF (SELECT `Status` FROM `CustomerVoucher`
		WHERE Customer_id = p_customer_id AND CV_id = p_cv_id) != 'Unused' THEN
			SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Voucher is not available (Status is not "Unused").';
		END IF;
	END IF;
    
    INSERT INTO Receipt(Receipt_date, Method, Customer_id, CV_id)
    VALUES (rec_date, p_method, p_customer_id, p_cv_id);

    SET receipt_id = LAST_INSERT_ID();

    IF p_product_id IS NOT NULL THEN
        CALL create_order_product(receipt_id, p_product_id, p_quantity);
    END IF;
    CALL create_ticket (p_price, receipt_id, p_movie_id, p_showtime_id, p_branch_id, p_hall_number, p_seat_number);
    
    IF p_cv_id IS NOT NULL THEN
        UPDATE CustomerVoucher
        SET Status = 'Used'
        WHERE Customer_id = p_customer_id AND CV_id = p_cv_id;
    END IF;

    SELECT receipt_id;
END $$


DROP PROCEDURE IF EXISTS update_receipt $$
CREATE PROCEDURE update_receipt
(
    IN p_receipt_id INT,
    IN p_receipt_date VARCHAR(20),
    IN p_method VARCHAR(250),
    IN p_customer_id INT,
    IN p_cv_id INT
)
BEGIN
    DECLARE rec_date DATE;
    DECLARE old_cv_id INT;
    DECLARE old_customer_id INT;

    IF NOT EXISTS (SELECT 1 FROM Receipt WHERE Receipt_id = p_receipt_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Receipt ID does not exist.';
    END IF;

	SELECT CV_id, Customer_id INTO old_cv_id, old_customer_id
    FROM Receipt WHERE Receipt_id = p_receipt_id;
    
    SET rec_date = STR_TO_DATE(p_receipt_date, '%d/%m/%Y');
    IF rec_date IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Receipt date format must be dd/mm/yyyy.';
    END IF;

    IF p_customer_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM Customer WHERE Customer_id = p_customer_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Customer ID does not exist.';
    END IF;

    IF p_cv_id IS NOT NULL AND p_cv_id != old_cv_id THEN
        -- Check if the NEW voucher exists for the (potentially new) customer
        IF NOT EXISTS (
            SELECT 1 FROM CustomerVoucher 
            WHERE Customer_id = COALESCE(p_customer_id, old_customer_id) 
            AND CV_id = p_cv_id
        ) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: New Customer Voucher (CV_id) does not exist for the customer.';
        -- Check if the NEW voucher is Unused
        ELSEIF (
            SELECT `Status` FROM `CustomerVoucher` 
            WHERE Customer_id = COALESCE(p_customer_id, old_customer_id) 
            AND CV_id = p_cv_id
        ) != 'Unused' THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: New Voucher is not available (Status is not "Unused").';
        END IF;

        -- Release old voucher (set to Unused)
        IF old_cv_id IS NOT NULL THEN
            UPDATE CustomerVoucher
            SET Status = 'Unused'
            WHERE Customer_id = old_customer_id AND CV_id = old_cv_id;
        END IF;
        
        -- Book new voucher (set to Used)
        UPDATE CustomerVoucher
        SET Status = 'Used'
        WHERE Customer_id = COALESCE(p_customer_id, old_customer_id) AND CV_id = p_cv_id;
    END IF;
    
	UPDATE Receipt
    SET
		Receipt_date = COALESCE(rec_date, Receipt_date),
        Method= COALESCE(NULLIF(p_method, ''), Method),
        Customer_id  = COALESCE(p_customer_id, Customer_id),
        CV_id= COALESCE(p_cv_id, CV_id)
	WHERE Receipt_id = p_receipt_id ;
END $$


DROP PROCEDURE IF EXISTS delete_receipt $$
CREATE PROCEDURE delete_receipt
(
    IN p_receipt_id INT
)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Receipt WHERE Receipt_id = p_receipt_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Receipt ID does not exist.';
    END IF;

    IF EXISTS (SELECT 1 FROM `Order` WHERE Receipt_id = p_receipt_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Delete related rows in Order table first.';
    END IF;

    DELETE FROM Receipt WHERE Receipt_id = p_receipt_id;
END $$


-- READ PROCEDURE --
-- xếp hạng thành viên có loyal point cao nhất dựa theo từng mức (input: Bronze, Silver)
DROP PROCEDURE IF EXISTS get_customers_by_membership $$
CREATE PROCEDURE get_customers_by_membership (
    IN p_membership_type VARCHAR(50)
)
BEGIN
    SELECT 
        c.Customer_id,
        c.FName,
        c.LName,
        c.Gender,
        c.Email,
        c.Loyal_point,
        m.Type AS Membership_Type,
        DATE_FORMAT(m.Start_Date, '%d/%m/%Y') AS Start_Date
    FROM Customer c
    JOIN Membership m ON c.Membership_id = m.Membership_id
    WHERE m.Type = p_membership_type
    ORDER BY c.Loyal_point DESC;
END $$

-- xếp hạng các phim có doanh thu phòng vé cao nhất theo năm (input = năm, hoặc input = null để xem mọi thời đại)
DROP PROCEDURE IF EXISTS get_popular_movies_by_year $$
CREATE PROCEDURE get_popular_movies_by_year (
    IN p_year INT
)
BEGIN
    SELECT 
        m.Movie_id,
        m.Title,
        COALESCE(SUM(t.Price), 0) AS Total_Revenue,
        COUNT(t.Ticket_id) AS Total_Tickets_Sold
    FROM Movie m
    LEFT JOIN Ticket t ON m.Movie_id = t.Movie_id
    WHERE (p_year IS NULL OR YEAR(m.Release_date) = p_year)
    GROUP BY m.Movie_id, m.Title, m.Release_date
    HAVING COUNT(t.Ticket_id) > 0
    ORDER BY Total_Revenue DESC, Total_Tickets_Sold DESC, m.Title ASC;
END $$

-- liệt kê các showtime hiện có của một branch
DROP PROCEDURE IF EXISTS read_showtime_by_branch $$
CREATE PROCEDURE read_showtime_by_branch
(
    IN p_branch_id INT
)
BEGIN
    -- Validate branch existence
    IF NOT EXISTS (SELECT 1 FROM Cinema_Branch WHERE Branch_id = p_branch_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Branch does not exist.';
    END IF;

    -- Select showtimes for that branch
    SELECT 
        s.Movie_id,
        m.Title AS Movie_Title,
        s.Showtime_id,
        s.Date,
        s.Start_time,
        s.End_time,
        s.Hall_number
    FROM Showtime s
    JOIN Movie m ON s.Movie_id = m.Movie_id
    WHERE s.Branch_id = p_branch_id
    ORDER BY s.Date, s.Start_time;
END $$

-- xếp hạng phòng chiếu có lượt book cao nhất (tỷ lệ ghế trống thấp nhất)
DROP PROCEDURE IF EXISTS GetLowOccupancyScreenings $$
CREATE PROCEDURE GetLowOccupancyScreenings(
    p_occupancy_threshold DECIMAL(5, 2) -- Mặc định là 0.10 (10%)
)
READS SQL DATA
BEGIN
    
    SELECT 
        S.Showtime_id,
        S.Movie_id,
        S.Branch_id,
        S.Date,
        S.Start_time,
        H.Seat_capacity AS Total_Seats,
        COUNT(T.Ticket_id) AS Tickets_Sold,
        -- Công thức tính Tỷ lệ lấp đầy
        (COUNT(T.Ticket_id) / H.Seat_capacity) AS Occupancy_Rate
    FROM 
        Showtime S
    JOIN 
        Hall H ON S.Branch_id = H.Branch_id AND S.Hall_number = H.Hall_number
    LEFT JOIN 
        Ticket T ON S.Movie_id = T.Movie_id AND S.Showtime_id = T.Showtime_id
                 AND S.Branch_id = T.Branch_id AND S.Hall_number = T.Hall_number
    LEFT JOIN 
        `Order` O ON T.Order_id = O.Order_id AND O.Status = 'PAID'
    GROUP BY 
        S.Showtime_id, S.Movie_id, S.Branch_id, H.Seat_capacity
    HAVING 
        -- Lọc những suất chiếu có tỷ lệ lấp đầy thấp hơn ngưỡng (ví dụ: < 0.10)
        (COUNT(T.Ticket_id) / H.Seat_capacity) < p_occupancy_threshold
        -- Và có ít nhất 1 vé đã bán để loại trừ các suất chiếu hoàn toàn trống rỗng
        AND COUNT(T.Ticket_id) > 0 
    ORDER BY 
        Occupancy_Rate ASC;
END $$
        
-- Liệt kê phương thức thanh toán và tổng Total_amount của Order tương ứng.
DROP PROCEDURE IF EXISTS GetTotalRevenueByPaymentMethod $$
CREATE PROCEDURE GetTotalRevenueByPaymentMethod()
READS SQL DATA
BEGIN
    -- Liệt kê phương thức thanh toán và tổng Total_amount của Order tương ứng.
    SELECT 
        R.Method,
        COALESCE(SUM(O.Total_amount), 0.00) AS Total_Revenue_Paid
    FROM 
        Receipt R
    JOIN 
        `Order` O ON R.Order_id = O.Order_id
    WHERE
        R.Status = 'PAID' -- Chỉ tính các giao dịch đã thanh toán thành công
    GROUP BY 
        R.Method
    ORDER BY
        Total_Revenue_Paid DESC;
END $$

-- tính tổng doanh thu và occupany của mỗi branch
DROP PROCEDURE IF EXISTS get_branch_performance $$
CREATE PROCEDURE get_branch_performance()
BEGIN
    -- tính tổng seat của từng branch
    WITH BranchCapacity AS (
        SELECT
            Branch_id,
            SUM(Seat_capacity) AS Total_Capacity
        FROM Hall
        GROUP BY Branch_id
    ),
    
    -- 3. Tính tổng doanh thu số vé, số sản phẩm và số ghế được booked của mỗi branch
    BranchMetrics AS (
        SELECT
            cb.Branch_id,
            cb.Name AS Branch_Name,
            
            COALESCE(MAX(v.Discount), 0.00) AS Discount_Percent,
            
            -- Total Ticket Revenue (sum Price from PAID tickets)
            COALESCE(SUM(CASE WHEN r.Status = 'PAID' THEN t.Price END), 0) AS Ticket_Revenue,
            
            -- Total Product Revenue (sum Product_Revenue from PAID orders)
            COALESCE(SUM(prpo.Product_Revenue), 0) AS Product_Revenue_Total,
            
            -- Total Booked Seats 
            SUM(CASE WHEN ss.Status = 'BOOKED' THEN 1 ELSE 0 END) AS Total_Booked_Seats
            
        FROM Cinema_Branch cb
        
        -- Join to get all seats/showtimes (needed to count all possible booked seats)
        LEFT JOIN Hall h ON cb.Branch_id = h.Branch_id
        LEFT JOIN Showtime s ON s.Branch_id = h.Branch_id AND s.Hall_number = h.Hall_number
        LEFT JOIN ShowtimeSeat ss ON 
            s.Movie_id = ss.Movie_id AND 
            s.Showtime_id = ss.Showtime_id AND 
            s.Branch_id = ss.Branch_id AND 
            s.Hall_number = ss.Hall_number
            
        -- Join to get Ticket details
        LEFT JOIN Ticket t ON 
            t.Movie_id = ss.Movie_id AND 
            t.Showtime_id = ss.Showtime_id AND 
            t.Branch_id = ss.Branch_id AND 
            t.Hall_number = ss.Hall_number AND 
            t.Seat_number = ss.Seat_number
            
        LEFT JOIN Receipt r ON o.Order_id = r.Order_id AND r.Status = 'PAID'
        LEFT JOIN Apply a ON r.Order_id = a.Order_id
        LEFT JOIN CustomerVoucher cv ON a.Customer_id = cv.Customer_id AND a.CV_id = cv.CV_id
        LEFT JOIN Voucher v ON cv.Voucher_id = v.Voucher_id
        -- kết hợp (product -> orderproduct) vào order để triết xuất giá product
        LEFT JOIN (
            SELECT 
                r.Order_id, 
                SUM(p.Price) AS Product_Revenue
            FROM Receipt r
            JOIN OrderProduct op ON r.Order_id = op.Order_id
            JOIN Product p ON op.Product_id = p.Product_id
            WHERE r.Status = 'PAID'
            GROUP BY r.Order_id
        ) AS prpo ON r.Order_id = prpo.Order_id
        
        GROUP BY cb.Branch_id, cb.Name
    )
    
    -- 4. Final SELECT statement to present the performance data, ordered by Revenue
    SELECT
        bm.Branch_Name,
        @NetFactor := (1 - (bm.Discount_Percent / 100)),
        ROUND((bm.Gross_Ticket_Revenue + bm.Gross_Product_Revenue) * @NetFactor, 2) AS Total_Net_Revenue,
        
        CASE 
            WHEN bc.Total_Capacity = 0 THEN 0.00
            ELSE ROUND((bm.Total_Booked_Seats / bc.Total_Capacity) * 100, 2)
        END AS Occupancy_Rate_Percentage
        
    FROM BranchMetrics bm
    JOIN BranchCapacity bc ON bm.Branch_id = bc.Branch_id
    -- Order by Total Revenue (descending) as requested for the leaderboard
    CROSS JOIN (SELECT @NetFactor := 1.0) AS init
    ORDER BY Total_Revenue DESC;
END $$

-- tính tổng doanh thu hàng tháng (ticket + product: ticket chiếm bao nhiêu phần trăm, product chiếm bao nhiêu...)
DROP PROCEDURE IF EXISTS get_monthly_revenue $$
CREATE PROCEDURE get_monthly_revenue
(
    IN p_year INT,
    IN p_month INT
)
BEGIN
    -- 1. Tính Gross Revenue, Discount Percent cho mỗi Order đã PAID trong tháng.
    WITH GrossAndDiscount AS (
        SELECT
            r.Order_id,
            r.Receipt_date,
            
            COALESCE(MAX(v.Discount), 0.00) AS Discount_Percent,
            COALESCE(SUM(t.Price), 0.00) AS Gross_Ticket_Revenue,
            COALESCE(SUM(p.Price), 0.00) AS Gross_Product_Revenue
            
        FROM Receipt r
        LEFT JOIN Ticket t ON r.Order_id = t.Order_id
        
        -- Lấy thông tin Product
        LEFT JOIN OrderProduct op ON r.Order_id = op.Order_id
        LEFT JOIN Product p ON op.Product_id = p.Product_id
        
        -- Lấy thông tin Voucher (Áp dụng cho Order)
        LEFT JOIN Apply a ON r.Order_id = a.Order_id
        LEFT JOIN CustomerVoucher cv ON a.Customer_id = cv.Customer_id AND a.CV_id = cv.CV_id
        LEFT JOIN Voucher v ON cv.Voucher_id = v.Voucher_id
        
        WHERE r.Status = 'PAID'
          AND YEAR(r.Receipt_date) = p_year
          AND MONTH(r.Receipt_date) = p_month
        
        -- Group theo Order_id và Receipt_date để tính Gross Revenue và Discount cho mỗi hóa đơn.
        GROUP BY r.Order_id, r.Receipt_date
    )
    
    -- 2. Tính toán Doanh thu Net (đã trừ Voucher) cho từng loại Ticket và Product.
    , NetRevenueByOrder AS (
        SELECT
            Order_id,
            -- Tính Net Factor: Tỷ lệ doanh thu còn lại sau giảm giá (ví dụ: 1 - 0.10 = 0.9)
            (1 - (Discount_Percent / 100)) AS Net_Factor,
            
            -- Tính Net Ticket Revenue: Gross Ticket * Net Factor
            ROUND(
                Gross_Ticket_Revenue * (1 - (Discount_Percent / 100)), 
                2
            ) AS Net_Ticket_Revenue,
            
            -- Tính Net Product Revenue: Gross Product * Net Factor
            ROUND(
                Gross_Product_Revenue * (1 - (Discount_Percent / 100)), 
                2
            ) AS Net_Product_Revenue
            
        FROM GrossAndDiscount
    )

    -- 3. Tổng hợp Net Revenue và tính phần trăm.
    SELECT
        -- Tổng doanh thu Net cuối cùng
        COALESCE(SUM(Net_Ticket_Revenue), 0.00) + COALESCE(SUM(Net_Product_Revenue), 0.00) AS Total_Monthly_Net_Revenue,

        -- Doanh thu Net từ Vé
        COALESCE(SUM(Net_Ticket_Revenue), 0.00) AS Tickets_Net_Revenue,
        
        -- Doanh thu Net từ Sản phẩm
        COALESCE(SUM(Net_Product_Revenue), 0.00) AS Product_Net_Revenue,
        
        -- Biến tạm lưu Tổng Net Revenue để tính phần trăm
        @TotalNet := (COALESCE(SUM(Net_Ticket_Revenue), 0.00) + COALESCE(SUM(Net_Product_Revenue), 0.00)),

        -- Phần trăm Vé
        CASE 
            WHEN @TotalNet = 0 THEN 0.00 
            ELSE ROUND((COALESCE(SUM(Net_Ticket_Revenue), 0.00) / @TotalNet) * 100, 2)
        END AS Tickets_Percentage,
        
        -- Phần trăm Sản phẩm
        CASE 
            WHEN @TotalNet = 0 THEN 0.00 
            ELSE ROUND((COALESCE(SUM(Net_Product_Revenue), 0.00) / @TotalNet) * 100, 2)
        END AS Product_Percentage

    FROM NetRevenueByOrder
    CROSS JOIN (SELECT @TotalNet := 0) AS init; -- Khởi tạo biến
END $$

-- liệt kê tất cả event
DROP PROCEDURE IF EXISTS read_all_events $$
CREATE PROCEDURE read_all_events()
BEGIN
    -- Select all relevant event information
    SELECT
        Event_id,
        Title,
        Start_date,
        End_date,
        Description,
        Image,
        
        -- Dynamically determine the Event Status based on the current date
        CASE
            WHEN End_date < CURDATE() THEN 'Ended' -- The end date has passed
            WHEN Start_date <= CURDATE() AND End_date >= CURDATE() THEN 'Ongoing' -- Current date is within the start/end range
            WHEN Start_date > CURDATE() THEN 'Upcoming' -- The start date is in the future
            ELSE 'Unknown'
        END AS Status
        
    FROM Event
    -- Order by End_date to usually show Upcoming/Ongoing events first, 
    -- followed by Ended events chronologically.
    ORDER BY End_date DESC; 
END $$

-- liệt kê toàn bộ admin (admin ko có manager là super admin)
DROP PROCEDURE IF EXISTS read_system_admin_list $$
CREATE PROCEDURE read_system_admin_list()
BEGIN
    SELECT
        a.Name,
        a.Email,
        
        -- Infer the ROLE based on the Admin_Manager_id
        CASE
            WHEN a.Admin_Manager_id IS NULL THEN 'Primary'
            ELSE 'Regular'
        END AS Role,
        
        -- Determine the BRANCH ID/Name
        CASE
            WHEN a.Admin_Manager_id IS NULL THEN 'GLOBAL' -- Primary/Super Admin is Global
            ELSE cb.Name                             -- Regular Admin is assigned to a specific branch name
        END AS Branch_Name_or_ID
        
    FROM Admin a
    -- LEFT JOIN to Cinema_Branch to get the branch name. 
    -- This ensures the Primary Admin (who might not strictly match a branch) is still included.
    LEFT JOIN Cinema_Branch cb ON a.Branch_id = cb.Branch_id
    
    -- Order the list to put the Primary Admin first, similar to the image
    ORDER BY a.Admin_Manager_id ASC, a.Name ASC;
END $$

-- Liệt kê các branch kèm admin
DROP PROCEDURE IF EXISTS read_branch_management_list $$
CREATE PROCEDURE read_branch_management_list()
BEGIN
    SELECT
        cb.Branch_id,
        cb.Name AS Branch_Name,
        cb.Address,
        -- We can optionally concatenate City and Address for a clearer location string
        -- CONCAT(cb.Address, ', ', cb.City) AS Location, 
        
        -- Get the assigned manager's name
        a.Name AS Manager_Name
        
        -- The Status (ACTIVE/INACTIVE) is assumed to be determined externally 
        -- or handled by a separate column not present in the current schema.
        
    FROM Cinema_Branch cb
    -- JOIN with the Admin table using the Admin_id linked to the branch
    LEFT JOIN Admin a ON cb.Admin_id = a.Admin_id
    
    -- Order by Branch Name alphabetically
    ORDER BY cb.Name;
END $$

-- liệt kê toàn bộ đồ ăn thức uống
DROP PROCEDURE IF EXISTS read_food_drink $$
CREATE PROCEDURE read_food_drink()
BEGIN
    SELECT
        p.Product_id,
        p.Name,
        p.Price,
        p.Description,
        fd.Size,
        fd.Type
    FROM Product p
    JOIN Food_Drink fd ON p.Product_id = fd.Product_id
    ORDER BY p.Product_id;
END $$

-- liệt kê toàn bộ quà tặng
DROP PROCEDURE IF EXISTS read_souvenirs $$
CREATE PROCEDURE read_souvenirs()
BEGIN
    SELECT
        p.Product_id,
        p.Name,
        p.Price,
        p.Description,
        s.Movie_id,
        m.Title AS Movie_Title
    FROM Product p
    JOIN Souvenir s ON p.Product_id = s.Product_id
    JOIN Movie m ON s.Movie_id = m.Movie_id
    ORDER BY p.Product_id;
END $$

-- liệt kê toàn bộ voucher
DROP PROCEDURE IF EXISTS read_vouchers $$
CREATE PROCEDURE read_vouchers()
BEGIN
    SELECT
        Voucher_id,
        Discount,
        Expiration,
        `Condition`
    FROM Voucher
    ORDER BY Voucher_id;
END $$

-- ADMIN PAGE --

-- liệt kê toàn bộ booking (mặc định null, null, null là toàn bộ)
DROP PROCEDURE IF EXISTS get_all_bookings $$
CREATE PROCEDURE get_all_bookings
(
    IN p_search_term VARCHAR(100),
    IN p_start_date DATE,
    IN p_end_date DATE
)
BEGIN
    -- Temporary table to combine seat numbers for each order
    WITH OrderSeats AS (
        SELECT
            t.Order_id,
            GROUP_CONCAT(t.Seat_number ORDER BY t.Seat_number SEPARATOR ', ') AS Seats_List
        FROM Ticket t
        GROUP BY t.Order_id
    )

    SELECT
        o.Order_id AS Booking_ID,
        CONCAT(c.FName, ' ', c.LName) AS Customer_Name,
        m.Title AS Movie_Title,
        os.Seats_List AS Seats,
        o.Total_amount AS Amount, -- Assuming this field holds the correct final amount
        o.Status AS Status,
        r.Receipt_date AS Date
        
    FROM `Order` o
    -- Join to Customer
    JOIN Customer c ON o.Customer_id = c.Customer_id
    -- Join to Receipt (for the booking date)
    JOIN Receipt r ON o.Order_id = r.Order_id
    -- Join to Ticket and Movie (need to join one ticket to get the Movie Title, assuming all tickets in one order are for the same movie)
    LEFT JOIN Ticket t_main ON o.Order_id = t_main.Order_id
    LEFT JOIN Movie m ON t_main.Movie_id = m.Movie_id
    -- Join to the concatenated seat list
    LEFT JOIN OrderSeats os ON o.Order_id = os.Order_id
    
    -- Filter using dynamic WHERE clauses
    WHERE (
        p_search_term IS NULL OR p_search_term = ''
        OR o.Order_id LIKE CONCAT('%', p_search_term, '%')
        OR CONCAT(c.FName, ' ', c.LName) LIKE CONCAT('%', p_search_term, '%')
        OR m.Title LIKE CONCAT('%', p_search_term, '%')
    )
    AND (
        p_start_date IS NULL OR r.Receipt_date >= p_start_date
    )
    AND (
        p_end_date IS NULL OR r.Receipt_date <= p_end_date
    )
    
    -- Ensure each booking is listed only once and order by date
    GROUP BY o.Order_id, c.FName, c.LName, m.Title, os.Seats_List, o.Total_amount, o.Status, r.Receipt_date
    ORDER BY r.Receipt_date DESC, o.Order_id DESC;
END $$

-- liệt kê toàn bộ branch
DROP PROCEDURE IF EXISTS read_branch_info_details $$
CREATE PROCEDURE read_branch_info_details
(
    IN p_branch_id INT
)
BEGIN
    SELECT
        Name AS Branch_Name,
        CONCAT(Address, ', ', City) AS Location,
        -- The Description field is not in the Cinema_Branch table, so we'll select NULL/placeholder
        NULL AS Description_Placeholder 
    FROM Cinema_Branch
    WHERE Branch_id = p_branch_id;
END $$

-- liệt kê toàn bộ movie showtime của branch
DROP PROCEDURE IF EXISTS read_branch_movies_schedule $$
CREATE PROCEDURE read_branch_movies_schedule
(
    IN p_branch_id INT
)
BEGIN
    SELECT
        m.Movie_id,
        m.Title AS Movie_Title,
        m.Duration,
        -- We'll assume the Age_rating can be interpreted as '12A' or 'PG' etc.
        m.Age_rating, 
        
        -- Subquery to aggregate and list unique showtimes set for this movie at this branch
        (
            SELECT GROUP_CONCAT(DISTINCT TIME_FORMAT(s.Start_time, '%H:%i') ORDER BY s.Start_time SEPARATOR ' | ')
            FROM Showtime s
            WHERE s.Branch_id = p_branch_id AND s.Movie_id = m.Movie_id
        ) AS Daily_Showtimes,
        
        -- Determine if the movie is "Active" (i.e., has showtimes scheduled)
        CASE
            WHEN EXISTS (
                SELECT 1 FROM Showtime s2 
                WHERE s2.Branch_id = p_branch_id AND s2.Movie_id = m.Movie_id
            ) THEN 'Active'
            ELSE 'Inactive'
        END AS Status
        
    FROM Movie m
    -- Filter movies to only those screened at this branch
    JOIN Screen sc ON m.Movie_id = sc.Movie_id
    WHERE sc.Branch_id = p_branch_id
    ORDER BY Movie_Title;
END $$

-- liệt kê toàn bộ event của branch
DROP PROCEDURE IF EXISTS read_branch_events $$
CREATE PROCEDURE read_branch_events
(
    IN p_branch_id INT
)
BEGIN
    SELECT
        e.Event_id,
        e.Title,
        e.Description,
        e.Start_date,
        e.End_date,
        
        -- Determine Event Status (Ended/Ongoing/Upcoming) relative to today
        CASE
            WHEN e.End_date < CURDATE() THEN 'Ended' 
            WHEN e.Start_date <= CURDATE() AND e.End_date >= CURDATE() THEN 'Ongoing'
            WHEN e.Start_date > CURDATE() THEN 'Upcoming'
            ELSE 'Unknown'
        END AS Event_Status,
        
        -- Determine Branch Status: If the event is linked via the Locate table
        CASE
            WHEN l.Branch_id IS NOT NULL THEN 'Active at Branch'
            ELSE 'Inactive'
        END AS Branch_Activation_Status

    FROM Event e
    -- Use LEFT JOIN to list all events, even those not located at the branch
    LEFT JOIN Locate l ON e.Event_id = l.Event_id AND l.Branch_id = p_branch_id
    
    -- Filter events that are either located at this branch OR events that could potentially be activated.
    -- (We'll select all events to show the full list as suggested by the image layout)
    ORDER BY e.Start_date DESC;
END $$

-- USER PAGE --

-- liệt kê toàn bộ movie
DROP PROCEDURE IF EXISTS read_all_movie_details $$
CREATE PROCEDURE read_all_movie_details()
BEGIN
    SELECT
        m.Movie_id,
        m.Title,
        m.Director,
        m.Release_date,
        m.Duration,
        m.Age_rating,
        m.Description,
        m.Language,
        
        -- Concatenate all actors for the movie
        (
            SELECT GROUP_CONCAT(ma.AActor ORDER BY ma.AActor SEPARATOR ', ')
            FROM MovieActor ma
            WHERE ma.Movie_id = m.Movie_id
        ) AS Actors,
        
        -- Concatenate all genres for the movie
        (
            SELECT GROUP_CONCAT(mg.AGenres ORDER BY mg.AGenres SEPARATOR ', ')
            FROM MovieGenres mg
            WHERE mg.Movie_id = m.Movie_id
        ) AS Genres,
        
        -- Concatenate all formats (e.g., IMAX, 3D, 2D) for the movie
        (
            SELECT GROUP_CONCAT(mf.AFormat ORDER BY mf.AFormat SEPARATOR ', ')
            FROM MovieFormat mf
            WHERE mf.Movie_id = m.Movie_id
        ) AS Formats,
        
        -- Concatenate all subtitles for the movie
        (
            SELECT GROUP_CONCAT(ms.ASubtitle ORDER BY ms.ASubtitle SEPARATOR ', ')
            FROM MovieSubtitle ms
            WHERE ms.Movie_id = m.Movie_id
        ) AS Subtitles
        
    FROM Movie m
    ORDER BY m.Title;
END $$

-- liệt kê toàn bộ chi tiết khi book 1 movie
DROP PROCEDURE IF EXISTS read_showtimes_by_movie $$
CREATE PROCEDURE read_showtimes_by_movie
(
    IN p_movie_id INT
)
BEGIN
    -- 1. Validate if the movie exists
    IF NOT EXISTS (SELECT 1 FROM Movie WHERE Movie_id = p_movie_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Movie does not exist.';
    END IF;

    -- 2. Select showtime details along with branch and hall information
    SELECT
        s.Showtime_id,
        s.Date,
        s.Start_time,
        s.End_time,
        
        -- Branch Information
        s.Branch_id,
        cb.Name AS Branch_Name,
        cb.Address,
        
        -- Hall Information
        s.Hall_number,
        h.Type AS Hall_Type,
        h.Seat_capacity
        
    FROM Showtime s
    JOIN Cinema_Branch cb ON s.Branch_id = cb.Branch_id
    JOIN Hall h ON s.Branch_id = h.Branch_id AND s.Hall_number = h.Hall_number
    
    WHERE s.Movie_id = p_movie_id
    
    -- Order by date and time to present a chronological schedule
    ORDER BY s.Date, s.Start_time;
END $$

-- giai đoạn chọn ghế
DROP PROCEDURE IF EXISTS read_seat_map_with_price $$
CREATE PROCEDURE read_seat_map_with_price
(
    IN p_movie_id INT,
    IN p_showtime_id INT,
    IN p_branch_id INT,
    IN p_hall_number INT
)
BEGIN
    -- CTE 1: Find the most representative historical price for every physical seat in the hall
    WITH SeatBasePrice AS (
        SELECT
            ti_base.Seat_number,
            MAX(ti_base.Price) AS Base_Price
        FROM Ticket ti_base
        WHERE ti_base.Branch_id = p_branch_id
          AND ti_base.Hall_number = p_hall_number
        GROUP BY ti_base.Seat_number
    )
    
    SELECT
        t.Branch_id,
        t.Hall_number,
        t.Seat_number,
        t.Seat_type,
        
        -- Seat Status (from ShowtimeSeat)
        COALESCE(ss.Status, 'AVAILABLE') AS Seat_Status,
        
        -- Price Logic (COALESCE checks for booked price, then base price)
        COALESCE(
            -- 1. Price if the seat is BOOKED in this exact showtime
            (
                SELECT ti.Price 
                FROM Ticket ti
                WHERE ti.Movie_id = p_movie_id
                  AND ti.Showtime_id = p_showtime_id
                  AND ti.Branch_id = p_branch_id -- Need to include Branch/Hall in subquery filter
                  AND ti.Hall_number = p_hall_number 
                  AND ti.Seat_number = t.Seat_number
                LIMIT 1
            ),
            -- 2. Base Price from the pre-calculated CTE (for AVAILABLE seats)
            sbp.Base_Price,
            0.00
        ) AS Price
        
    FROM Seat t
    -- ************************************************************
    -- FIX: Move all JOINs BEFORE the WHERE clause
    -- ************************************************************
    
    -- LEFT JOIN to get the pre-calculated base price
    LEFT JOIN SeatBasePrice sbp ON t.Seat_number = sbp.Seat_number
    
    -- LEFT JOIN to check the booking status for the specific showtime
    LEFT JOIN ShowtimeSeat ss ON
        ss.Branch_id = t.Branch_id AND
        ss.Hall_number = t.Hall_number AND
        ss.Seat_number = t.Seat_number AND
        ss.Movie_id = p_movie_id AND
        ss.Showtime_id = p_showtime_id
        
    -- ************************************************************
    -- FIX: Apply the WHERE clause at the end
    -- ************************************************************
    WHERE t.Branch_id = p_branch_id 
      AND t.Hall_number = p_hall_number
      
    ORDER BY t.Seat_number;
END $$


-- THIS IS ADMIN --

DROP PROCEDURE IF exists create_admin $$
CREATE PROCEDURE create_admin 
(
	IN p_name VARCHAR(50),
    IN p_gender VARCHAR(50),
	IN dob_input VARCHAR(20),
    IN p_email VARCHAR(100),
    IN p_branch_id INT,
    IN p_adminmanager INT,
    IN p_phone VARCHAR(50)
)
BEGIN
    DECLARE dob DATE;
	-- name --
    IF p_name is NULL THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Admin name cannot be NULL.'; 
	ELSEIF p_name NOT REGEXP '^[a-zA-Z ]+$' THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Admin name format has to be character.';
    END IF;   
    
    -- gender --
	IF p_gender is NOT NULL AND p_gender NOT IN ('Male', 'Female', 'Other') THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Gender must be one of: Male, Female, or Other.';
    END IF; 
        
    -- email --    
    IF p_email is NOT NULL THEN
		IF p_email NOT REGEXP '^[a-zA-Z0-9.-]+@+[a-zA-Z0-9.-]+(\.[a-zA-Z0-9]+)+$' THEN
			SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Email format has to be (char/num)@(char/num).(char/num).';
		ELSEIF EXISTS (SELECT 1 FROM Admin WHERE Email = p_email) THEN
			SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: The provided email already exists. Each admin must have a unique email.';
		END IF;
    END IF;
    
    -- date of birth --
    SET dob = STR_TO_DATE(dob_input, '%d/%m/%Y');
    IF dob IS NOT NULL AND TIMESTAMPDIFF(YEAR, dob, CURDATE()) < 18 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Admin\'s age has to be greater than or equal to 18.';
    END IF;
    
    -- foreign key branch id --
    IF p_branch_id IS NULL THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: The branch cant be null.';
	ELSE
		IF NOT EXISTS (SELECT 1 FROM Cinema_Branch WHERE Branch_id = p_branch_id) THEN
			SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: The provided Branch ID does not exist.';
		END IF;
	END IF;
    
	-- Check admin manager
	IF p_adminmanager IS NOT NULL AND NOT EXISTS (SELECT 1 FROM `Admin` WHERE Admin_id = p_adminmanager) THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: The provided Admin ID does not exist.';
    END IF;

    INSERT INTO Admin(Name, Gender, Date_of_birth, Email, Branch_id, Admin_Manager_id)
    VALUES (p_name, p_gender, dob, p_email, p_branch_id, p_adminmanager);
    
	IF p_phone IS NOT NULL THEN
		CALL insert_adminphone(LAST_INSERT_ID(),p_phone);
    END IF;
END $$

DROP PROCEDURE IF EXISTS update_admin $$
CREATE PROCEDURE update_admin 
(
	IN p_admin_id INT,
	IN p_name VARCHAR(50),
    IN p_gender VARCHAR(50),
	IN dob_input VARCHAR(20),
    IN p_email VARCHAR(100),
    IN p_branch_id INT,
    IN p_adminmanager INT,
    IN p_phone VARCHAR(50)
)
BEGIN
    DECLARE dob DATE;
	DECLARE old_name VARCHAR(50);
    DECLARE old_gender VARCHAR(50);
	DECLARE old_dob DATE;
    DECLARE old_email VARCHAR(100);
    DECLARE old_branch_id INT;
    DECLARE old_adminmanager INT;
    -- admin id --
	IF NOT EXISTS (SELECT 1 FROM `Admin` WHERE Admin_id = p_admin_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Admin ID does not exist.';
    END IF;
    
    SELECT Name, Gender, Date_of_birth, Email, Branch_id, Admin_Manager_id
    INTO old_name, old_gender, old_dob, old_email, old_branch_id, old_adminmanager
    FROM `Admin`
    WHERE Admin_id = p_admin_id;
    
	-- name --
    IF p_name IS NOT NULL AND p_name != old_name AND p_name NOT REGEXP '^[a-zA-Z ]+$' THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Admin name format has to be character.';
    END IF;   
    
    -- gender --
	IF p_gender IS NOT NULL AND p_gender NOT IN ('Male', 'Female', 'Other') THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Gender must be one of: Male, Female, or Other.';
    END IF; 
        
    -- email --    
    IF p_email IS NOT NULL AND p_email != old_email THEN
		IF p_email NOT REGEXP '^[a-zA-Z0-9.-]+@+[a-zA-Z0-9.-]+(\.[a-zA-Z0-9]+)+$' THEN
			SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Email format has to be (char/num)@(char/num).(char/num).';
		ELSEIF EXISTS (SELECT 1 FROM Admin WHERE Email = p_email) THEN
			SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: The provided email already exists. Each admin must have a unique email.';
		END IF;
    END IF;
    
    -- date of birth --
    SET dob = STR_TO_DATE(dob_input, '%d/%m/%Y');
    IF dob IS NOT NULL AND dob != old_dob AND TIMESTAMPDIFF(YEAR, dob, CURDATE()) < 18 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Admin\'s age has to be greater than or equal to 18.';
    END IF;
    
    -- foreign key branch id --
    IF p_branch_id IS NOT NULL AND p_branch_id != old_branch_id AND NOT EXISTS (SELECT 1 FROM Cinema_Branch WHERE Branch_id = p_branch_id) THEN
			SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: The provided Branch ID does not exist.';
	END IF;
    
	-- Check admin manager
	IF p_adminmanager IS NOT NULL AND p_adminmanager != old_adminmanager AND NOT EXISTS (SELECT 1 FROM `Admin` WHERE Admin_id = p_adminmanager) THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: The provided Admin ID does not exist.';
	END IF;

	UPDATE `Admin`
	SET
		Name = COALESCE (p_name, old_name),
		Gender = COALESCE (p_gender, old_gender),
		Date_of_birth = COALESCE (dob, old_dob),
		Email = COALESCE (p_email, old_email),
        Branch_id = COALESCE (p_branch_id, old_branch_id),
        Admin_Manager_id = COALESCE (p_adminmanager, old_adminmanager)
	WHERE Admin_id = p_admin_id;
    IF p_phone IS NOT NULL THEN
		CALL insert_adminphone(p_admin_id,p_phone);
	END IF;
END $$

DROP PROCEDURE IF exists change_customer_password $$
CREATE PROCEDURE change_customer_password 
(
    IN p_customer_id INT,
    IN p_old_password VARCHAR(255),
    IN p_new_password VARCHAR(255)
)
BEGIN
    DECLARE v_current_password VARCHAR(255);
    
    -- 1. Check if customer exists and retrieve current password
    SELECT Password INTO v_current_password
    FROM Customer
    WHERE Customer_id = p_customer_id;
    
    IF v_current_password IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Customer ID does not exist.';
    END IF;
    
    -- 2. Verify Old Password
    IF v_current_password <> p_old_password THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Old password is incorrect.';
    END IF;
    
    -- 3. Validate New Password
    IF p_new_password IS NULL OR LENGTH(p_new_password) < 8 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: New password must not be NULL and must be at least 8 characters long.';
    END IF;

    -- 4. Check if new password is the same as old password
    IF p_old_password = p_new_password THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: New password cannot be the same as the old password.';
    END IF;
    
    -- 5. Update Password
    UPDATE Customer
    SET Password = p_new_password
    WHERE Customer_id = p_customer_id;
    
    -- Success message (optional, but good practice for stored procedure status)
    SELECT 'Password changed successfully.' AS message;
    
END $$

DROP PROCEDURE IF exists change_admin_password $$
CREATE PROCEDURE change_admin_password 
(
    IN p_admin_id INT,
    IN p_old_password VARCHAR(255),
    IN p_new_password VARCHAR(255)
)
BEGIN
    DECLARE v_current_password VARCHAR(255);
    
    -- 1. Check if admin exists and retrieve current password
    SELECT Password INTO v_current_password
    FROM Admin
    WHERE Admin_id = p_admin_id;
    
    IF v_current_password IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Admin ID does not exist.';
    END IF;
    
    -- 2. Verify Old Password
    IF v_current_password <> p_old_password THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Old password is incorrect.';
    END IF;
    
    -- 3. Validate New Password
    IF p_new_password IS NULL OR LENGTH(p_new_password) < 8 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: New password must not be NULL and must be at least 8 characters long.';
    END IF;

    -- 4. Check if new password is the same as old password
    IF p_old_password = p_new_password THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: New password cannot be the same as the old password.';
    END IF;
    
    -- 5. Update Password
    UPDATE Admin
    SET Password = p_new_password
    WHERE Admin_id = p_admin_id;
    
    -- Success message
    SELECT 'Password changed successfully.' AS message;

END $$
    
SET SQL_SAFE_UPDATES = 1;
DELIMITER ;

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
DELIMITER;

