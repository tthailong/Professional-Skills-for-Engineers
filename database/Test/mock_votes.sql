-- Mock mood votes for movies
USE db_assignment2;

-- Clear existing votes to start fresh (optional, but good for consistent mock data)
-- DELETE FROM Vote;

INSERT IGNORE INTO Vote (Movie_id, Customer_id, Mood_id) VALUES
-- Inception (1): Top 2 - Mind-blowing, Epic
(1, 1, 2), (1, 2, 2), (1, 3, 2), (1, 4, 2), (1, 5, 2), -- Mind-blowing
(1, 1, 6), (1, 2, 6), (1, 3, 6), -- Epic
(1, 1, 4), -- Funny

-- The Dark Knight (2): Top 2 - Epic, Mind-blowing
(2, 1, 6), (2, 2, 6), (2, 3, 6), (2, 4, 6), (2, 5, 6), -- Epic
(2, 4, 2), (2, 5, 2), -- Mind-blowing
(2, 1, 3), -- Scared

-- Dune (3): Top 2 - Epic, Scared
(3, 1, 6), (3, 2, 6), (3, 3, 6), (3, 4, 6), -- Epic
(3, 5, 3), -- Scared
(3, 1, 2), -- Mind-blowing

-- Barbie (4): Top 2 - Funny, Mind-blowing
(4, 1, 4), (4, 2, 4), (4, 3, 4), (4, 4, 4), (4, 5, 4), -- Funny
(4, 1, 2), (4, 2, 2), -- Mind-blowing
(4, 3, 5), -- Sad

-- Avatar (5): Top 2 - Epic, Sad
(5, 1, 6), (5, 2, 6), (5, 3, 6), (5, 4, 6), -- Epic
(5, 1, 5), (5, 2, 5), -- Sad
(5, 3, 4); -- Funny
