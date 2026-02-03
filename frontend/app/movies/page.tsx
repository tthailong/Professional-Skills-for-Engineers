"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { Navbar } from "@/app/navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Star, Calendar, Users, RotateCw } from "lucide-react"; // Added RotateCw for loading
import { toast } from "sonner";
import { API_BASE_URL } from "@/store/useUserStore";

// --- API Type Definitions (Matching FastAPI MovieOut) ---
// Note: We use MovieResponse to match the API's snake_case keys for fetching.
export interface MovieResponse {
  Movie_id: number;
  Director: string;
  Title: string;
  Image: string | null;
  Release_date: string | null; // DD/MM/YYYY string
  Language: string;
  Age_rating: string;
  Duration: number | null;
  Description: string | null;
}

// Movie type for component state (camelCase for front-end usage consistency)
export interface Movie {
  id: number;
  title: string;
  director: string;
  poster: string;
  releaseDate: string | null; // DD/MM/YYYY string
  language: string;
  ageRating: string;
  duration: number | null;
  description: string | null;
  // Note: The API does not provide rating, genre, actor, or category directly,
  // so we will default/mock these for the UI unless the API is extended.
  genre: string; // Placeholder/default
  actor: string; // Placeholder/default
  category: string; // Placeholder/default
}

// Helper to transform API data to component state data
const transformApiMovie = (apiMovie: MovieResponse): Movie => {
  // Note: The API response doesn't provide rating, genre, actor, or category.
  // We are setting placeholders here to keep the component rendering logic intact.
  return {
    id: apiMovie.Movie_id,
    title: apiMovie.Title,
    director: apiMovie.Director,
    poster: apiMovie.Image || "/placeholder.svg?height=300&width=200",
    releaseDate: apiMovie.Release_date,
    language: apiMovie.Language,
    ageRating: apiMovie.Age_rating,
    duration: apiMovie.Duration,
    description: apiMovie.Description,
    genre: apiMovie.Language === "English" ? "Action" : "Local", // Simple mock genre
    actor: apiMovie.Director || "N/A", // Using director as actor placeholder
    category: apiMovie.Age_rating.includes("18") ? "adult" : "blockbuster", // Simple mock category
    // --- End Placeholder/Mock Data ---
  };
};

export default function MoviesPage() {
  // State for fetched movie data
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for Search and Filters (will now map to API query parameters)
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all"); // Maps to 'language'
  const [selectedAgeRating, setSelectedAgeRating] = useState("all"); // Maps to 'age_rating'

  // NOTE: 'Genre' and 'Category' filters from the original mock are not directly supported by the API
  // parameters, so we map them to Language and Age Rating, respectively, for API compatibility.
  // The UI labels are kept for now, but the logic is linked to API params.

  // --- API Fetch Logic ---
  const fetchMovies = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // 1. Build Query Parameters
    const params = new URLSearchParams();
    if (selectedLanguage !== "all") {
      params.append("language", selectedLanguage);
    }
    if (selectedAgeRating !== "all") {
      params.append("age_rating", selectedAgeRating);
    }
    if (searchQuery) {
      params.append("search", searchQuery);
    }

    const url = `${API_BASE_URL}/movies?${params.toString()}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const apiMovies: MovieResponse[] = await response.json();

      // 2. Transform and update state
      const transformedMovies: Movie[] = apiMovies.map(transformApiMovie);

      setMovies(transformedMovies);
    } catch (e: any) {
      setError("Failed to fetch movies: " + e.message);
      toast.error("Failed to load movies. Please check the API connection.");
      console.error(e);
      setMovies([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedLanguage, selectedAgeRating]); // Dependencies are the filter states

  useEffect(() => {
    // Fetch data whenever search or filters change
    fetchMovies();
  }, [fetchMovies]);
  // --- End API Fetch Logic ---

  // Derived values for the filter buttons (must be fetched from the actual API response)
  // Since we don't have separate endpoints for available languages/ratings, we derive them from the fetched list.
  const uniqueLanguages = useMemo(() => {
    const languages = new Set<string>();
    movies.forEach((m) => languages.add(m.language));
    return ["all", ...Array.from(languages)];
  }, [movies]);

  const uniqueAgeRatings = useMemo(() => {
    const ratings = new Set<string>();
    movies.forEach((m) => ratings.add(m.ageRating));
    return ["all", ...Array.from(ratings)];
  }, [movies]);

  // NOTE: The original component's filtering logic is now handled by the API call,
  // so `filteredMovies` simply becomes the fetched `movies` state.
  const displayedMovies = movies;

  // We use the Language/Age Rating as the filter options in the UI, replacing Genre/Category
  const languages = uniqueLanguages;
  const ageRatings = uniqueAgeRatings;

  // Renamed the handlers to match the API parameters
  const handleSetLanguage = (lang: string) => {
    setSelectedLanguage(lang);
  };

  const handleSetAgeRating = (rating: string) => {
    setSelectedAgeRating(rating);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Now Showing
          </h1>
          <p className="text-muted-foreground">
            Choose your favorite movie and book tickets
          </p>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by title..." // Simplified placeholder since API only searches title
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground h-12"
            />
          </div>

          {/* Filter 1: Language (replaces Genre) */}
          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                Language:
              </span>
            </div>
            {languages.map((lang) => (
              <Button
                key={lang}
                onClick={() => handleSetLanguage(lang)}
                className={`rounded-full capitalize ${
                  selectedLanguage === lang
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground hover:bg-card border border-border"
                }`}
              >
                {lang}
              </Button>
            ))}
          </div>

          {/* Filter 2: Age Rating (replaces Category) */}
          <div className="flex gap-4 flex-wrap">
            <span className="text-sm font-medium text-foreground">
              Age Rating:
            </span>
            {ageRatings.map((rating) => (
              <Button
                key={rating}
                onClick={() => handleSetAgeRating(rating)}
                size="sm"
                className={`capitalize ${
                  selectedAgeRating === rating
                    ? "bg-accent text-accent-foreground"
                    : "bg-card text-foreground hover:bg-secondary border border-border"
                }`}
              >
                {rating}
              </Button>
            ))}
          </div>
        </div>

        {/* Loading & Error States */}
        {isLoading && (
          <div className="text-center py-12 text-primary flex items-center justify-center gap-2">
            <RotateCw className="w-6 h-6 animate-spin" />
            <p className="text-lg">Loading movies...</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="text-center py-12 text-red-500 border border-red-500/50 bg-red-500/10 rounded-lg p-4">
            <p className="text-lg">Error: {error}</p>
          </div>
        )}

        {/* Movie Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayedMovies.map((movie) => (
              <Link key={movie.id} href={`/movies/${movie.id}`} passHref>
                <Card className="border-border bg-card hover:bg-card/80 transition cursor-pointer h-full overflow-hidden hover:shadow-lg hover:shadow-primary/20">
                  <div className="relative h-64 overflow-hidden bg-secondary">
                    <img
                      // movie.poster now comes from API's Image field
                      src={movie.poster}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <CardContent className="pt-4">
                    <CardTitle className="text-lg line-clamp-2">
                      {movie.title}
                    </CardTitle>
                    <CardDescription className="mb-3">
                      <span className="text-primary font-semibold">
                        {/* Using language as a genre-like tag */}
                        {movie.language}
                      </span>
                    </CardDescription>

                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <p className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {/* Displaying Director as a key person */}
                        {movie.director}
                      </p>
                      <p className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {movie.duration} min • {movie.ageRating}
                      </p>
                    </div>

                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                      Book Ticket
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* No Movies Found */}
        {displayedMovies.length === 0 && !isLoading && !error && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No movies found matching your criteria.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
