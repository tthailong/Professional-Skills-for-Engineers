"use client";
import { Badge } from "@/components/ui/badge";
import { Film } from "lucide-react";
import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
const CustomBadge = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors ${className}`}
  >
    {children}
  </div>
);
export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedAgeRating, setSelectedAgeRating] = useState("all");

  const fetchMovies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (selectedLanguage !== "all") params.append("language", selectedLanguage);
    if (selectedAgeRating !== "all")
      params.append("age_rating", selectedAgeRating);
    if (searchQuery) params.append("search", searchQuery);

    try {
      const response = await fetch(
        `${API_BASE_URL}/movies?${params.toString()}`,
      );
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const apiMovies: MovieResponse[] = await response.json();
      setMovies(apiMovies.map(transformApiMovie));
    } catch (e: any) {
      setError(e.message);
      toast.error("Failed to load movies.");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedLanguage, selectedAgeRating]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const uniqueLanguages = useMemo(
    () => ["all", ...Array.from(new Set(movies.map((m) => m.language)))],
    [movies],
  );
  const uniqueAgeRatings = useMemo(
    () => ["all", ...Array.from(new Set(movies.map((m) => m.ageRating)))],
    [movies],
  );

  return (
    // THE NEW GRADIENT BACKGROUND: White base with soft indigo/rose/amber blurs
    <div className="min-h-screen bg-white relative overflow-hidden text-slate-900">
      {/* Aurora Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/50 blur-[120px] -z-10" />
      <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] rounded-full bg-rose-100/40 blur-[120px] -z-10" />
      <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[40%] rounded-full bg-indigo-50/60 blur-[120px] -z-10" />

      <Navbar />

      <main className="container mx-auto px-4 pt-16 pb-24 relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 bg-gradient-to-br from-rose-500 via-rose-500 to-rose-500 bg-clip-text text-transparent">
            Now Showing
          </h1>
          <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto">
            Discover the latest cinematic masterpieces and book your experience.
          </p>
        </motion.div>

        {/* Modern Floating Search Bar */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="p-2 rounded-3xl bg-white/40 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search for movies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 bg-transparent border-none focus-visible:ring-0 h-14 text-lg placeholder:text-slate-400"
                />
              </div>
              <div className="h-10 w-[1px] bg-slate-200 hidden md:block self-center" />
              <div className="flex gap-2 p-1 overflow-x-auto no-scrollbar">
                {uniqueLanguages.map((lang) => (
                  <Button
                    key={lang}
                    variant="ghost"
                    onClick={() => setSelectedLanguage(lang)}
                    className={`rounded-2xl px-5 h-12 transition-all duration-300 ${
                      selectedLanguage === lang
                        ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                        : "hover:bg-slate-100 text-slate-600"
                    }`}
                  >
                    {lang}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Movie Grid */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-[2/3] rounded-3xl bg-slate-100 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <motion.div
              layout
              initial="hidden"
              animate="show"
              variants={{
                show: { transition: { staggerChildren: 0.1 } },
              }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {movies.map((movie) => (
                <motion.div
                  key={movie.id}
                  variants={{
                    hidden: { opacity: 0, scale: 0.95 },
                    show: { opacity: 1, scale: 1 },
                  }}
                  whileHover={{ y: -10 }}
                  className="group"
                >
                  <Link href={`/movies/${movie.id}`}>
                    <Card className="border-none bg-white/60 backdrop-blur-sm shadow-[0_10px_30px_rgba(0,0,0,0.04)] rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
                      <div className="relative aspect-[3/4] overflow-hidden">
                        <img
                          src={movie.poster}
                          alt={movie.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute top-4 left-4">
                          <CustomBadge className="bg-white/90 backdrop-blur text-slate-900 border-none shadow-sm">
                            {movie.ageRating}
                          </CustomBadge>
                        </div>
                      </div>

                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-1">
                          {movie.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mb-6">
                          <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg">
                            <Film className="w-3 h-3" /> {movie.language}
                          </span>
                          <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg">
                            <Calendar className="w-3 h-3" /> {movie.duration}m
                          </span>
                        </div>

                        <Button className="w-full h-12 rounded-2xl bg-red-400 hover:bg-red-700 text-white font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95">
                          Book Ticket
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* No Results Styling */}
        {!isLoading && movies.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex p-6 rounded-full bg-slate-50 mb-4">
              <Search className="w-10 h-10 text-slate-300" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              No movies found
            </h2>
            <p className="text-slate-500">Try a different search or filter.</p>
          </div>
        )}
      </main>
    </div>
  );
}
