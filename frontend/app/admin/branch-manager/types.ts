// components/branch_manager/types.ts

export interface Showtime {
  showtime_id: number;
  movie_id: number;
  title: string;
  start_time: string;
  date: string;
  format: string;
  subtitle: string;
  hall_number: number;
}

export interface Movie {
  movie_id: number;
  title: string;
  director?: string;
  release_date?: string;
  language?: string;
  age_rating?: string;
  duration?: number;
  description?: string;
  actors: string[];
  formats: string[];
  subtitles: string[];
  genres: string[];
  isActive: boolean; // Frontend state: true if in branch (Screen), false otherwise
  showtimes: Showtime[]; // Frontend state: associated showtimes
}

export interface BranchData {
  id: string;
  name: string;
  city: string;
  location: string;
  phone?: string;
  movies: Movie[]; // Combined list of active and inactive movies
  activeEventIds: string[];
  activeProductIds: string[];
}

export const ITEMS_PER_PAGE = 4;
