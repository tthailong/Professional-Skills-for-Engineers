# CineBook API Documentation

This document outlines the API endpoints required for the CineBook frontend application.

## Base URL

All API endpoints are prefixed with `/api`.

---

## Authentication

### Login

Authenticates a user and returns a session token/user data.

- **Endpoint**: `POST /auth/login`
- **Input**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Output**:
  ```json
  {
    "token": "jwt_token_string",
    "user": {
      "id": "user_123",
      "name": "John Doe",
      "email": "user@example.com",
      "phone": "+1234567890",
      "loyaltyPoints": 50,
      "createdAt": "2023-01-01T00:00:00Z"
    }
  }
  ```

### Register

Registers a new user.

- **Endpoint**: `POST /auth/register`
- **Input**:
  ```json
  {
    "name": "John Doe",
    "email": "user@example.com",
    "phone": "+1234567890",
    "dob": "1990-01-01",
    "gender": "M",
    "password": "password123"
  }
  ```
- **Output**: Same as Login (returns user + token).

---

## Movies

### Get All Movies

Retrieves a list of movies, optionally filtered.

- **Endpoint**: `GET /movies`
- **Query Parameters**:
  - `search` (optional): Search by title, actor, or genre.
  - `genre` (optional): Filter by genre (e.g., "Action").
  - `category` (optional): Filter by category (e.g., "now_showing", "coming_soon").
- **Output**:
  ```json
  [
    {
      "id": 1,
      "title": "The Dark Knight",
      "genre": "Action",
      "rating": 9.0,
      "duration": 152,
      "ageRating": "12A",
      "poster": "/images/dark-knight.jpg",
      "category": "blockbuster"
    }
  ]
  ```

### Get Movie Details

Retrieves detailed information for a specific movie.

- **Endpoint**: `GET /movies/{id}`
- **Input**: `id` (path parameter)
- **Output**:
  ```json
  {
    "id": 1,
    "title": "The Dark Knight",
    "description": "Batman faces the Joker...",
    "genre": "Action",
    "cast": ["Christian Bale", "Heath Ledger"],
    "director": "Christopher Nolan",
    "rating": 9.0,
    "duration": 152,
    "ageRating": "12A",
    "languages": ["English", "Vietnamese"],
    "poster": "/images/dark-knight.jpg",
    "reviews": [
      {
        "id": 101,
        "user": "Alice",
        "rating": 5,
        "comment": "Amazing movie!"
      }
    ]
  }
  ```

### Get Movie Showtimes

Retrieves showtimes for a specific movie, filtered by date and cinema.

- **Endpoint**: `GET /movies/{id}/showtimes`
- **Input**: `id` (path parameter)
- **Query Parameters**:
  - `date` (required): Date string (YYYY-MM-DD).
  - `cinemaId` (optional): Filter by specific cinema.
- **Output**:
  ```json
  [
    {
      "id": "st_1",
      "cinemaId": "hcm-01",
      "branch": "CinemaPlus Cantavil",
      "address": "123 Main St",
      "time": "19:30",
      "hallName": "Hall A",
      "format": "2D",
      "availableSeats": 45,
      "totalSeats": 100
    }
  ]
  ```

### Add Review

Adds a user review for a movie.

- **Endpoint**: `POST /movies/{id}/reviews`
- **Input**:
  ```json
  {
    "userId": "user_123",
    "rating": 5,
    "comment": "Great movie!"
  }
  ```
- **Output**:
  ```json
  {
    "id": 202,
    "user": "John Doe",
    "rating": 5,
    "comment": "Great movie!",
    "createdAt": "2023-10-27T10:00:00Z"
  }
  ```

---

## Cinemas (Branches)

### Get All Cinemas

Retrieves a list of all cinema branches.

- **Endpoint**: `GET /cinemas`
- **Query Parameters**:
  - `city` (optional): Filter by city (e.g., "Ho Chi Minh").
- **Output**:
  ```json
  [
    {
      "id": "hcm-01",
      "name": "CinemaPlus Cantavil",
      "city": "Ho Chi Minh",
      "address": "Level 7, Cantavil Premier...",
      "phone": "1900 1234",
      "facilities": ["Dolby Atmos", "IMAX"],
      "imageUrl": "/images/cinema-1.jpg"
    }
  ]
  ```

### Get Cinema Showtimes

Retrieves showtimes for a specific cinema for a given date.

- **Endpoint**: `GET /cinemas/{id}/showtimes`
- **Input**: `id` (path parameter)
- **Query Parameters**:
  - `date` (required): Date string (YYYY-MM-DD).
- **Output**:
  ```json
  [
    {
      "movieId": 1,
      "movieTitle": "The Dark Knight",
      "poster": "/images/dark-knight.jpg",
      "showtimes": [
        {
          "id": "st_1",
          "time": "19:30",
          "format": "2D",
          "hallName": "Hall A",
          "availableSeats": 45
        }
      ]
    }
  ]
  ```

---

## Bookings

### Get Showtime Details (Seat Map)

Retrieves details for a specific showtime, including the seat map and booked seats.

- **Endpoint**: `GET /showtimes/{id}`
- **Input**: `id` (path parameter)
- **Output**:
  ```json
  {
    "id": "st_1",
    "movieId": 1,
    "cinemaId": "hcm-01",
    "time": "19:30",
    "hallName": "Hall A",
    "price": 100000,
    "seatMap": {
      "rows": 10,
      "cols": 12,
      "bookedSeats": ["A1", "A2", "B5"]
    }
  }
  ```

### Create Booking

Creates a temporary booking (holds seats) before payment.

- **Endpoint**: `POST /bookings`
- **Input**:
  ```json
  {
    "userId": "user_123",
    "showtimeId": "st_1",
    "seats": ["C5", "C6"]
  }
  ```
- **Output**:
  ```json
  {
    "bookingId": "bk_999",
    "status": "pending",
    "totalPrice": 200000,
    "expiresAt": "2023-10-27T10:15:00Z"
  }
  ```

### Confirm Payment

Confirms payment for a booking.

- **Endpoint**: `POST /payments`
- **Input**:
  ```json
  {
    "bookingId": "bk_999",
    "paymentMethod": "credit_card",
    "paymentDetails": { ... }
  }
  ```
- **Output**:
  ```json
  {
    "status": "success",
    "transactionId": "tx_888",
    "bookingStatus": "confirmed"
  }
  ```

---

## User Profile

### Get User Profile

Retrieves the current user's profile information.

- **Endpoint**: `GET /user/profile`
- **Headers**: `Authorization: Bearer <token>`
- **Output**: User object (same as login).

### Get User Bookings

Retrieves the user's booking history.

- **Endpoint**: `GET /user/bookings`
- **Headers**: `Authorization: Bearer <token>`
- **Output**:
  ```json
  [
    {
      "id": "bk_999",
      "movieTitle": "The Dark Knight",
      "cinemaName": "CinemaPlus Cantavil",
      "showtime": "2023-10-27T19:30:00Z",
      "seats": ["C5", "C6"],
      "totalPrice": 200000,
      "status": "confirmed"
    }
  ]
  ```

---

## Events

### Get All Events

Retrieves a list of current events and promotions.

- **Endpoint**: `GET /events`
- **Output**:
  ```json
  [
    {
      "id": 1,
      "title": "Summer Blockbuster Sale",
      "description": "Get 50% off on all tickets...",
      "imageUrl": "/images/event-summer.jpg",
      "startDate": "2023-06-01",
      "endDate": "2023-08-31"
    }
  ]
  ```

### Get Event Details

Retrieves details for a specific event.

- **Endpoint**: `GET /events/{id}`
- **Input**: `id` (path parameter)
- **Output**: Event object with full details.

---

## Admin

### Admin Login

Authenticates an admin user.

- **Endpoint**: `POST /auth/admin-login`
- **Input**: `email`, `password`
- **Output**: Admin token + user details.

### Get Dashboard Stats

Retrieves statistics for the admin dashboard.

- **Endpoint**: `GET /admin/dashboard`
- **Headers**: `Authorization: Bearer <admin_token>`
- **Output**:
  ```json
  {
    "totalRevenue": 5000000,
    "totalBookings": 120,
    "activeMovies": 15,
    "totalUsers": 350
  }
  ```

### Manage Movies

CRUD operations for movies.

- **Endpoints**:
  - `POST /admin/movies` (Create)
  - `PUT /admin/movies/{id}` (Update)
  - `DELETE /admin/movies/{id}` (Delete)

### Manage Branches

CRUD operations for cinema branches.

- **Endpoints**:
  - `POST /admin/branches` (Create)
  - `PUT /admin/branches/{id}` (Update)
  - `DELETE /admin/branches/{id}` (Delete)
