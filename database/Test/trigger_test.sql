INSERT INTO Customer (FName, LName, Gender, Email, Date_of_birth, Membership_id, Loyal_point, Password)
VALUES
('Test','Adult','Male', 'adult@example.com', '2000-01-01', 1, 0, "12345678");

INSERT INTO Customer(FName, LName, Gender, Email, Date_of_birth, Membership_id, Loyal_point, Password) 
VALUES 
('Test','Kid','Male', 'kid@example.com', '2015-01-01', 1, 0, "12345678");

INSERT INTO Customer(FName, LName, Gender, Email, Date_of_birth, Membership_id, Loyal_point, Password) 
VALUES ('Edge','Case','Male', 'edge@example.com', DATE_SUB(CURDATE(), INTERVAL 15 YEAR), 1, 0, "12345678");

UPDATE Customer SET Date_of_birth = '2000-05-05' WHERE Customer_id = 1;

UPDATE Customer SET Date_of_birth = '2016-07-01' WHERE Customer_id = 1;

SELECT * FROM Customer;



