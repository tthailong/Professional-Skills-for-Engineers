USE db_assignment2;
-- 1. Create a new Movie (using Admin 1)
-- Parameters: Director, Title, Image, ReleaseDate (DD/MM/YYYY), Language, AgeRating (P/K/T13/T16/T18), Duration, Description, AdminID, ActorList, FormatList, SubtitleList, GenreList
CALL create_movie(
    'Christopher Nolan', 
    'Interstellar', 
    'https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg', 
    '07/11/2014', 
    'English', 
    'T13', 
    169, 
    'When Earth becomes uninhabitable, a team of ex-pilots and scientists travel through a wormhole in search of a new home for mankind.', 
    1, 
    'Matthew McConaughey,Anne Hathaway,Jessica Chastain', 
    'IMAX,2D', 
    'English,Vietnamese', 
    'Sci-Fi,Drama'
);
-- Get the ID of the movie we just created
SET @movie_id = LAST_INSERT_ID();
-- 2. Create a Showtime for the movie
-- Parameters: MovieID, StartTime (HH:MM:SS), Date (DD/MM/YYYY), Format, Subtitle, BranchID, HallNumber
-- Note: Branch 1, Hall 1 is an IMAX hall
CALL create_showtime(
    @movie_id, 
    '20:00:00', 
    '25/12/2025', 
    'IMAX', 
    'English', 
    1, 
    1
);
-- 3. Generate Showtime Seats
-- This procedure will populate seats for the new showtime based on the hall's layout
CALL GenerateShowtimeSeats();
-- 4. Verify the data
SELECT * FROM Movie WHERE Movie_id = @movie_id;
SELECT * FROM Showtime WHERE Movie_id = @movie_id;
SELECT COUNT(*) FROM ShowtimeSeat WHERE Movie_id = @movie_id;