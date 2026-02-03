# Assignment 2: Application Demo Guide

This document outlines how the application demonstrates the requirements for **Part 3: Application Implementation**.

## 3.1 Insert / Update / Delete Screen (1 point)

**Requirement:** Implement a screen that supports Insert / Update / Delete for the table in section 2.1 (`Cinema_Branch`).

### Feature: Branch Management

- **Location:** Admin Panel > Primary Admin > Branches
- **URL:** `/admin/primary/branches`
- **Underlying SQL:**
  - [create_branch](file:///Users/teobun/Computer%20Network/hcmut_db/database-systems-assignment2/backend/routes/branches.py#105-125) (Stored Procedure)
  - [update_branch](file:///Users/teobun/Computer%20Network/hcmut_db/database-systems-assignment2/backend/routes/branches.py#126-148) (Stored Procedure)
  - [delete_branch](file:///Users/teobun/Computer%20Network/hcmut_db/database-systems-assignment2/backend/routes/branches.py#149-162) (Stored Procedure)

### How to Demonstrate:

1.  **Insert (Create):**
    - Click the **"Add Branch"** button.
    - Fill in the form (Name, City, Address, Phone, Manager).
    - Click **"Create Branch"**.
    - _Verification:_ The new branch appears in the list.
2.  **Update (Edit):**
    - Click the **Edit (Pencil)** icon on any branch row.
    - Change the Name or Phone number.
    - Click **"Save Changes"**.
    - _Verification:_ The list updates immediately with the new details.
3.  **Delete:**
    - Click the **Delete (Trash)** icon on a branch row.
    - Confirm the deletion in the warning modal.
    - _Verification:_ The branch is removed from the list.

---

## 3.2 Advanced List Interface (1 point)

**Requirement:** Interface displaying a data list retrieved from a stored procedure (from 2.3) related to the table in 2.1. Includes search, sorting, validation, error handling, and user-friendly controls.

### Feature: Branch Management List

- **Location:** Admin Panel > Primary Admin > Branches
- **URL:** `/admin/primary/branches`
- **Underlying SQL:** `sp_SearchBranches` (Stored Procedure)

### How to Demonstrate:

1.  **Search:**
    - Type "Lotte" or a specific city name (e.g., "Gò Vấp") in the **Search branches...** input.
    - _Result:_ The list filters in real-time (debounced) to show only matching records. This passes the search query to `sp_SearchBranches`.
2.  **Sorting:**
    - Click on column headers: **ID**, **Name**, **City**, or **Address**.
    - _Result:_ The list reorders Ascending/Descending. This passes `p_sort_column` and `p_sort_order` to the stored procedure.
3.  **Pagination:**
    - Use the **Previous** / **Next** buttons at the bottom of the table.
    - _Result:_ Navigates through pages of data using `p_page` and `p_page_size` parameters.
4.  **Validation & Error Handling:**
    - **Input Validation:** Try creating a branch with an invalid phone number (e.g., "abc"). The UI will show an error, and the backend stored procedure [create_branch](file:///Users/teobun/Computer%20Network/hcmut_db/database-systems-assignment2/backend/routes/branches.py#105-125) also has a check (`REGEXP '^[0-9]{10}$'`) which returns a specific error message if bypassed.
    - **Logical Error:** Try deleting a branch that doesn't exist (simulated) or creating a branch with a Manager who is already managing another branch. The system displays the specific error message returned by MySQL (e.g., "Admin is already managing an existing branch").

---

## 3.3 Interface for Other Procedure/Function (1 point)

**Requirement:** Interface illustrating at least one other procedure (from 2.3) or function (from 2.4).

### Feature: Dashboard Low Occupancy Alerts

- **Location:** Admin Panel > Primary Admin > Dashboard > "Low Occupancy Alerts" Tab
- **URL:** `/admin/primary/dashboard`
- **Underlying SQL:** `sp_GetMonthlyLowOccupancyAlerts` (Stored Procedure from 2.3)

### How to Demonstrate:

1.  **Parameter Input:**
    - Use the **Month** and **Year** pickers at the top of the dashboard.
    - The **Threshold** is set to 20% by default (configurable in code).
2.  **Data Retrieval:**
    - Click the **"Low Occupancy Alerts"** tab.
    - _Result:_ Displays a list of showtimes where `Occupancy_Rate < 20%`.
    - This demonstrates a complex query involving:
      - **Joins:** [Showtime](file:///Users/teobun/Computer%20Network/hcmut_db/database-systems-assignment2/frontend/app/movies/%5Bid%5D/page.tsx#42-55), [Movie](file:///Users/teobun/Computer%20Network/hcmut_db/database-systems-assignment2/backend/routes/movies.py#13-29), `Cinema_Branch`, `ShowtimeSeat`.
      - **Aggregation:** `COUNT(*)` for capacity, `SUM(...)` for booked seats.
      - **Calculated Column:** `Occupancy_Rate`.
      - **Filtering:** `HAVING Occupancy_Rate < p_threshold`.
3.  **Pagination:**
    - The table supports server-side pagination (Limit/Offset) as implemented in the stored procedure.

### Feature: System Occupancy Rate Card

- **Location:** Admin Panel > Primary Admin > Dashboard
- **Underlying SQL:** `fn_SystemMonthlyOccupancyRate` (Function from 2.4)

### How to Demonstrate:

1.  **View Statistic:**
    - Look at the **"Occupancy Rate"** summary card on the dashboard.
    - _Result:_ Shows a single percentage value (e.g., "45.2%").
    - This demonstrates calling a scalar function that performs calculations across the entire system for the selected month/year.
