# SQL Learning Summary Report

This document summarizes the SQL concepts, statements, and database objects (Procedures, Functions, Triggers) used in your project. It is designed to help you understand the "what", "why", and "how" of the SQL code you have implemented.

## 1. Types of SQL Statements Used

Your project utilizes several categories of SQL statements, each serving a specific purpose in the database lifecycle.

### 1.1. Data Definition Language (DDL)

**Meaning:** DDL statements are used to define or modify the structure of database objects (tables, schemas, etc.).
**Application in Project:**

- `CREATE DATABASE`: Used to initialize your project's database (`db_assignment2`).
- `CREATE TABLE`: Defines the schema for your entities like `Movie`, `Customer`, `Ticket`, etc. You used constraints like `PRIMARY KEY`, `FOREIGN KEY`, `CHECK`, `UNIQUE`, and `DEFAULT` to ensure data integrity.
- `ALTER TABLE`: Used to modify existing tables, such as adding foreign keys after table creation or adding derived columns like `Age`.
- `DROP ...`: Used to remove objects (`DROP DATABASE`, `DROP PROCEDURE`, `DROP TRIGGER`) to ensure clean state before recreation.

### 1.2. Data Manipulation Language (DML)

**Meaning:** DML statements are used to manage data within the existing schema.
**Application in Project:**

- `INSERT INTO`: Used to populate tables with sample data (e.g., adding movies, customers) and within procedures (e.g., `create_branch`).
- `UPDATE`: Used to modify existing records. For example, updating a customer's password or updating the `Cinema_Branch` seat count via a trigger.
- `DELETE`: Used to remove records. For example, `delete_branch` removes a branch and all its related data.

### 1.3. Data Query Language (DQL)

**Meaning:** DQL is focused on retrieving data from the database.
**Application in Project:**

- `SELECT`: The most common statement. You used it for:
  - **Simple Retrieval**: `SELECT * FROM CustomerPhone`.
  - **Filtering**: `WHERE Email = p_email`.
  - **Aggregation**: `COUNT(*)`, `SUM(Price)`, `AVG(Rating)`.
  - **Grouping**: `GROUP BY` to aggregate data by branch or movie.
  - **Joining**: `JOIN`, `LEFT JOIN` to combine data from multiple tables (e.g., linking `Ticket` to `Receipt` to `Customer`).
  - **Sorting & Paging**: `ORDER BY` and `LIMIT` in search procedures.

### 1.4. Procedural SQL

**Meaning:** Extensions to SQL that allow for programming logic like loops, variables, and conditionals.
**Application in Project:**

- **Variables**: `DECLARE v_customer_id INT;`
- **Control Flow**: `IF ... THEN ... END IF;`, `WHILE ... DO ... END WHILE;`.
- **Error Handling**: `SIGNAL SQLSTATE '45000'` to raise custom error messages.
- **Cursors**: Used in functions like `fn_MonthlyNetRevenue` to iterate through rows row-by-row for complex calculations.

---

## 2. Stored Procedures

**Definition:** A set of SQL statements with an assigned name, which are stored in the database in compiled form so that they can be shared by a number of programs.

| Procedure Name                        | Purpose                      | Key Learning Points                                                                                                                                                        |
| :------------------------------------ | :--------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`create_branch`**                   | Creates a new cinema branch. | • Input validation (`IF ... THEN SIGNAL`).<br>• `LAST_INSERT_ID()` to get the ID of the new row.<br>• Transactional logic (insert branch -> insert phone -> update admin). |
| **`update_branch`**                   | Updates branch details.      | • Logic to swap managers (handle old vs new admin).<br>• Conditional updates.                                                                                              |
| **`delete_branch`**                   | Deletes a branch.            | • **Cascading Deletes**: Manually deletes data from child tables (`Showtime`, `Seat`, `Hall`) before deleting the parent `Cinema_Branch` to avoid foreign key errors.      |
| **`login_customer`**                  | Authenticates a customer.    | • Security: Checks email/password combination.<br>• Data Retrieval: Returns joined profile data.                                                                           |
| **`login_admin`**                     | Authenticates an admin.      | • Role Logic: Determines if admin is 'primary' or 'regular' based on `Admin_Manager_id`.                                                                                   |
| **`create_admin`**                    | Registers a new admin.       | • Logic to auto-assign a manager if the new admin is 'regular'.                                                                                                            |
| **`change_customer_password`**        | Updates customer password.   | • Verification: Checks old password before updating.                                                                                                                       |
| **`sp_SearchBranches`**               | Searches for branches.       | • **Dynamic SQL**: Uses `PREPARE` and `EXECUTE` to build queries with variable `WHERE` and `ORDER BY` clauses.<br>• Pagination logic (`LIMIT offset, size`).               |
| **`sp_GetMonthlyLowOccupancyAlerts`** | Reports low occupancy.       | • Complex Aggregation: Uses `COUNT`, `SUM`, `CASE` statements to calculate percentages.<br>• Window Functions: `COUNT(*) OVER()` for total records.                        |
| **`GetCustomerReceipts`**             | Lists customer receipts.     | • Multi-table `JOIN` to assemble a complete receipt view (Movie, Branch, Time, Price).                                                                                     |

---

## 3. Functions

**Definition:** A stored program that returns a single value. Can be used in SQL statements.

| Function Name                         | Return Type | Purpose & Logic                                                                                                                             |
| :------------------------------------ | :---------- | :------------------------------------------------------------------------------------------------------------------------------------------ |
| **`fn_MonthlyNetRevenue`**            | DECIMAL     | • **Complex Calculation**: Gross Revenue - Discounts.<br>• **Cursor Usage**: Iterates through receipts to apply specific voucher discounts. |
| **`fn_MonthlyTicketGrossRevenue`**    | DECIMAL     | • Simple aggregation of `Ticket.Price`.                                                                                                     |
| **`fn_MonthlyProductGrossRevenue`**   | DECIMAL     | • Aggregation of `Quantity * Price` for products.                                                                                           |
| **`fn_MonthlyRevenueByBranch`**       | DECIMAL     | • **Attribution**: Calculates revenue specific to a branch, including splitting shared receipt values.                                      |
| **`fn_YearlyRevenueByBranch`**        | DECIMAL     | • **Loop**: Calls the monthly function 12 times (or sums directly) to get a yearly total.                                                   |
| **`fn_FBAttachmentRate`**             | DECIMAL     | • **Business Metric**: Calculates % of transactions that include food/drinks (`Receipts with Products / Total Receipts`).                   |
| **`fn_MonthlyOccupancyRateByBranch`** | DECIMAL     | • **Ratio**: `Booked Seats / Total Capacity`.                                                                                               |
| **`fn_SystemMonthlyOccupancyRate`**   | DECIMAL     | • Same as above but system-wide.                                                                                                            |
| **`fn_MovieTotalNetRevenue`**         | DECIMAL     | • Calculates net revenue for a specific movie, handling voucher logic.                                                                      |
| **`fn_AverageRating`**                | DECIMAL     | • `AVG()` of reviews. Handles `NULL` if no reviews exist.                                                                                   |
| **`fn_total_bookings`**               | INT         | • Simple count of tickets.                                                                                                                  |
| **`fn_movies_listed`**                | INT         | • Simple count of movies.                                                                                                                   |
| **`fn_TotalAdmins`**                  | INT         | • Simple count of admins.                                                                                                                   |
| **`CalculateWeeklyRevenueByBranch`**  | DECIMAL     | • Similar to monthly but filters by a date range (`BETWEEN`).                                                                               |
| **`fn_BranchMonthlyVoucherDiscount`** | DECIMAL     | • Calculates total discount value given by a branch.                                                                                        |

---

## 4. Triggers

**Definition:** A set of SQL statements that automatically executes (fires) in response to certain events on a particular table (INSERT, UPDATE, DELETE).

### 4.1. Business Constraints (Data Integrity)

These triggers prevent invalid data from entering the database.

- **`trg_check_movie_duration`**: Ensures `Duration > 0`.
- **`trg_dob_insert_check` / `trg_dob_update_check`**: Ensures Customers are > 15 years old.
- **`trg_admin_dob_insert_check` / `trg_admin_dob_update_check`**: Ensures Admins are > 18 years old.
- **`trg_check_voucher_discount`**: Ensures `Discount <= 100`.

### 4.2. Derived Attributes (Automation)

These triggers automatically calculate and update fields so the application doesn't have to.

- **`trg_customer_age_insert` / `trg_customer_age_update`**: Automatically calculates `Age` column whenever `Date_of_birth` is set or changed.
- **`trg_admin_age_insert` / `trg_admin_age_update`**: Same as above for Admins.
- **`trg_customervoucher_cvid`**: Auto-generates a sequence ID (`CV_id`) for a composite primary key logic.

### 4.3. Data Synchronization (Denormalization)

These triggers keep summary data in sync to improve read performance.

- **`trg_branch_hall_insert`**: When a Hall is added, increment `Hall_count` and `Total_seats` in `Cinema_Branch`.
- **`trg_branch_hall_delete`**: Decrement counts when a Hall is removed.
- **`trg_branch_hall_update`**: Adjust `Total_seats` if a Hall's capacity changes.
- **`trg_seat_book`**: Decreases `Hall.Seat_capacity` (available seats) when a seat is booked.
- **`trg_seat_unbook`**: Increases capacity when a booking is cancelled.

### 4.4. Business Logic (Loyalty & Gamification)

- **`trg_loyalty_add_ticket`**: Adds +5 points to customer for every ticket bought.
- **`trg_loyalty_add_product`**: Adds points based on product quantity.
- **`trg_update_customer_rank`**: Checks `Loyal_point` total and updates the customer's `Membership` type (Bronze/Silver/Gold/Platinum) automatically.

### 4.5. Cascading Actions

- **`trg_delete_showtime_when_screen_removed`**: If a movie is removed from a branch's screen list, delete all future showtimes for that movie at that branch.
