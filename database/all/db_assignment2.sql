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

-- ReactionIcon
CREATE TABLE ReactionIcon (
    Icon_id INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(50) NOT NULL,
    Symbol VARCHAR(50) NOT NULL
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
INSERT INTO ReactionIcon (Name, Symbol)
VALUES
('Boring', 'https://raw.githubusercontent.com/googlefonts/noto-emoji/main/svg/emoji_u1f634.svg'),
('Mind-blowing', 'https://raw.githubusercontent.com/googlefonts/noto-emoji/main/svg/emoji_u1f92f.svg'),
('Scared', 'https://raw.githubusercontent.com/googlefonts/noto-emoji/main/svg/emoji_u1f628.svg'),
('Funny', 'https://raw.githubusercontent.com/googlefonts/noto-emoji/main/svg/emoji_u1f602.svg'),
('Sad', 'https://raw.githubusercontent.com/googlefonts/noto-emoji/main/svg/emoji_u1f62d.svg'),
('Epic', 'https://raw.githubusercontent.com/googlefonts/noto-emoji/main/svg/emoji_u1f525.svg');

CREATE TABLE React (
    React_id INT PRIMARY KEY AUTO_INCREMENT,
    Movie_id INT NOT NULL,
    Customer_id INT NOT NULL,
    Icon_id INT NOT NULL, -- This links to ReactionIcon
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Icon_id) REFERENCES ReactionIcon(Icon_id),
    FOREIGN KEY (Movie_id) REFERENCES Movie(Movie_id),
    FOREIGN KEY (Customer_id) REFERENCES Customer(Customer_id),
    UNIQUE KEY (Movie_id, Customer_id, Icon_id) -- Prevents a user from voting the same icon on the same movie
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


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