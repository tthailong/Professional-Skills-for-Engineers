"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Navbar } from "@/app/navbar";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Star,
  Calendar as CalendarIcon,
  Users,
  MapPin,
  Shield,
  User,
  RotateCw, // For loading
} from "lucide-react";
// Assuming API_BASE_URL and useUserStore are defined elsewhere
import { API_BASE_URL, useUserStore } from "@/store/useUserStore";
import {
  format,
  startOfDay,
  parse, // Use parse for DD/MM/YYYY dates
} from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

// =========================================================================
// 🌎 API & DATA TYPE DEFINITIONS (Matching FastAPI output)
// =========================================================================

enum SpoilerTag {
  NON_SPOILER = "non_spoiler",
  SPOILER = "spoiler",
}

interface Review {
  Customer_name: string;
  Rating: number;
  Comment: string;
  Review_date: string; // DD/MM/YYYY HH:MM:SS
}

interface Showtime {
  Showtime_id: number;
  Movie_title: string;
  Date: string; // DD/MM/YYYY
  Start_time: string; // HH:MM:SS
  Format: string;
  Subtitle: string;
  Branch_id: number;
  Branch_name: string;
  Branch_address: string;
  Hall_number: number;
  Hall_type: string;
}

interface MovieDetails {
  Movie_id: number;
  Director: string;
  Title: string;
  Image: string | null;
  Release_date: string | null; // DD/MM/YYYY
  Language: string;
  Age_rating: string;
  Duration: number | null;
  Description: string | null;
  Genres: string[];
  Formats: string[];
  Actors: string[];
  Subtitles: string[];
}

interface MovieDetailApi {
  movie: MovieDetails;
  showtimes: Showtime[];
  reviews: Review[];
}

interface MoodOption {
  mood_id: number;
  name: string;
  symbol: string; // SVG URL
}

interface MoodVoteData {
  mood_id: number;
  mood_name: string;
  count: number;
}

// --- Component State Type (Flattened & Processed) ---
interface MovieData {
  id: number;
  title: string;
  director: string;
  poster: string;
  releaseYear: string; // Simplified
  language: string;
  ageRating: string;
  duration: number; // Assume minutes
  description: string;
  cast: string;
  averageRating: number; // Calculated average
  genres: string[];
  formats: string[];
}

interface EventShowtime {
  id: number;
  branchName: string;
  branchAddress: string;
  startTime: string; // HH:MM
  hallName: string; // Hall_number + Hall_type
  format: string; // Format from API
  subtitle: string; // Subtitle from API
  branchId: number;
  date: Date;
}

// =========================================================================
// 🛠️ HELPER FUNCTIONS
// =========================================================================

const calculateAverageRating = (reviews: Review[]): number => {
  if (reviews.length === 0) return 0.0;
  const totalRating = reviews.reduce((sum, r) => sum + r.Rating, 0);
  // Ensure rating is out of 5, assuming API rating is 0-5.
  // If API rating is 0-10, this calculation may need adjustment.
  return totalRating / reviews.length;
};

const transformMovieData = (
  apiMovie: MovieDetails,
  reviews: Review[]
): MovieData => {
  const releaseYear = apiMovie.Release_date
    ? apiMovie.Release_date.split("/")[2]
    : "N/A";

  return {
    id: apiMovie.Movie_id,
    title: apiMovie.Title,
    director: apiMovie.Director,
    poster: apiMovie.Image || "/placeholder.svg?height=450&width=300",
    releaseYear: releaseYear,
    language: apiMovie.Language,
    ageRating: apiMovie.Age_rating,
    duration: apiMovie.Duration || 0,
    description: apiMovie.Description || "No description provided.",
    cast: apiMovie.Actors ? apiMovie.Actors.join(", ") : apiMovie.Director, // Use Actors if available
    averageRating: calculateAverageRating(reviews),
    genres: apiMovie.Genres || [],
    formats: apiMovie.Formats || [],
  };
};

// =========================================================================
// 🚀 MOVIE DETAILS PAGE COMPONENT
// =========================================================================

export default function MovieDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const movieId = params.id ? Number(params.id) : null;

  const [tag, setTag] = useState<SpoilerTag>(SpoilerTag.NON_SPOILER);

  // --- State for API Data ---
  const [movieData, setMovieData] = useState<MovieData | null>(null);
  const [showtimesData, setShowtimesData] = useState<Showtime[]>([]);
  const [reviewsData, setReviewsData] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Mood Voting State ---
  const [moodOptions, setMoodOptions] = useState<MoodOption[]>([]);
  const [moodVotes, setMoodVotes] = useState<MoodVoteData[]>([]);
  const [userMoodVotes, setUserMoodVotes] = useState<number[]>([]); // Array of mood IDs user voted for
  const [hasPurchased, setHasPurchased] = useState(false);
  const [isLoadingMoods, setIsLoadingMoods] = useState(false);

  // --- State for UI/Filtering ---
  const initialDateParam = searchParams.get("date");
  const initialDate = initialDateParam
    ? startOfDay(parse(initialDateParam, "yyyy-MM-dd", new Date()))
    : startOfDay(new Date());
  const initialCinemaId = searchParams.get("cinemaId");

  const user = useUserStore((state) => state.user);

  const [activeTab, setActiveTab] = useState<"showtimes" | "reviews">(
    "showtimes"
  );
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);

  // --- API Fetch Logic ---
  const fetchMovieDetails = useCallback(
    async (id: number, tag: SpoilerTag | null) => {
      setIsLoading(true);
      setError(null);
      try {
        const url = `${API_BASE_URL}/movies/${id}/${tag ? `?tag=${tag}` : ""}`;
        const response = await fetch(url);

        if (response.status === 404) {
          setError("Movie not found (404)");
          toast.error(`Movie with ID ${id} not found.`);
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data: MovieDetailApi = await response.json();

        const movie = transformMovieData(data.movie, data.reviews);

        setMovieData(movie);
        setShowtimesData(data.showtimes);
        setReviewsData(data.reviews);
      } catch (e: any) {
        const errorMessage = e.message || "An unknown error occurred.";
        setError(errorMessage);
        toast.error(`Failed to load movie details: ${errorMessage}`);
        console.error("API Fetch Error:", e);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // --- Mood Voting Functions ---
  const fetchMoodOptions = useCallback(async () => {
    try {
      console.log("Fetching mood options from:", `${API_BASE_URL}/api/votemood/moods`);
      const res = await fetch(`${API_BASE_URL}/api/votemood/moods`);
      console.log("Mood options response status:", res.status);
      if (!res.ok) throw new Error("Failed to fetch moods");
      const data: MoodOption[] = await res.json();
      console.log("Mood options loaded:", data);
      setMoodOptions(data);
    } catch (err: any) {
      console.error("Error fetching moods:", err);
    }
  }, []);

  const fetchMoodVotes = useCallback(async (movieId: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/votemood/movie/${movieId}`);
      if (!res.ok) throw new Error("Failed to fetch mood votes");
      const data: MoodVoteData[] = await res.json();
      setMoodVotes(data);
    } catch (err: any) {
      console.error("Error fetching mood votes:", err);
    }
  }, []);

  const fetchUserMoodVotes = useCallback(
    async (customerId: number, movieId: number) => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/votemood/user/${customerId}/movie/${movieId}`
        );
        if (!res.ok) throw new Error("Failed to fetch user votes");
        const data: { mood_ids: number[] } = await res.json();
        setUserMoodVotes(data.mood_ids);
      } catch (err: any) {
        console.error("Error fetching user votes:", err);
      }
    },
    []
  );

  const checkPurchaseStatus = useCallback(
    async (customerId: number, movieId: number) => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/votemood/user/${customerId}/has-purchased/${movieId}`
        );
        if (!res.ok) throw new Error("Failed to check purchase");
        const data: { has_purchased: boolean } = await res.json();
        setHasPurchased(data.has_purchased);
      } catch (err: any) {
        console.error("Error checking purchase:", err);
        setHasPurchased(false);
      }
    },
    []
  );

  const handleMoodVote = async (moodId: number) => {
    if (!user || !movieData) {
      toast.error("Please log in to vote");
      return;
    }

    if (!hasPurchased) {
      toast.error("You must purchase a ticket for this movie to vote");
      return;
    }

    setIsLoadingMoods(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/votemood/change`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movie_id: movieData.id,
          customer_id: parseInt(user.id),
          mood_id: moodId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to toggle mood vote");
      }

      // Refresh mood votes and user votes
      await fetchMoodVotes(movieData.id);
      await fetchUserMoodVotes(parseInt(user.id), movieData.id);
      
      toast.success("Vote updated!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoadingMoods(false);
    }
  };


  useEffect(() => {
    if (movieId) {
      fetchMovieDetails(movieId, tag);
      fetchMoodOptions();
      fetchMoodVotes(movieId);
      
      // If user is logged in, fetch their votes and purchase status
      if (user) {
        fetchUserMoodVotes(parseInt(user.id), movieId);
        checkPurchaseStatus(parseInt(user.id), movieId);
      }
    } else {
      setError("Invalid Movie ID provided.");
      setIsLoading(false);
    }
  }, [movieId, user, fetchMovieDetails, fetchMoodOptions, fetchMoodVotes, fetchUserMoodVotes, checkPurchaseStatus]);

  const isLoggedIn = !!user;

  // --- Showtime Filtering and Grouping ---
  const filteredShowtimes = useMemo(() => {
    if (!showtimesData.length) return [];

    const selectedDateStr = format(selectedDate, "dd/MM/yyyy");

    const filtered = showtimesData.filter((st) => st.Date === selectedDateStr);

    return filtered.map((st) => {
      const parseDDMMYYYY = (dateStr: string) => {
        const [day, month, year] = dateStr.split("/");
        return `${year}-${month}-${day}`; // -> 2025-11-23
      };

      const normalizeTime = (timeStr: string) => {
        return timeStr.length === 5 ? timeStr + ":00" : timeStr;
      };

      // Use start time to create date object for comparison
      const startDateTime = new Date(
        `${parseDDMMYYYY(st.Date)}T${normalizeTime(st.Start_time)}`
      );

      return {
        id: st.Showtime_id,
        branchName: st.Branch_name,
        branchAddress: st.Branch_address,
        startTime: st.Start_time.substring(0, 5),
        hallName: `Hall ${st.Hall_number}`,
        format: st.Format,
        subtitle: st.Subtitle,
        branchId: st.Branch_id,
        date: startDateTime,
      };
    });
  }, [showtimesData, selectedDate]);

  const groupedShowtimes = useMemo(() => {
    const grouped: Record<string, EventShowtime[]> = {};
    filteredShowtimes.forEach((st) => {
      if (!grouped[st.branchName]) grouped[st.branchName] = [];
      grouped[st.branchName].push(st);
    });
    return grouped;
  }, [filteredShowtimes]);

  // --- Date Picker Handler ---
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value; // format: YYYY-MM-DD
    if (dateValue) {
      // Convert YYYY-MM-DD string back to a Date object at the start of the day
      const newDate = startOfDay(parse(dateValue, "yyyy-MM-dd", new Date()));
      setSelectedDate(newDate);
    }
  };

  // --- Action Handlers ---
  const handleSelectShowtime = (showtimeId: number) => {
    if (!movieData) return;
    router.push(
      `/movies/${movieData.id}/booking?showtimeId=${showtimeId}&date=${format(
        selectedDate,
        "yyyy-MM-dd" // Use ISO format for URL param
      )}`
    );
  };

  const handleAddReview = async (newReviewData: {
    rating: number;
    comment: string;
  }) => {
    if (!user || !movieData) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/movies/${movieData.id}/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customer_id: parseInt(user.id),
            rating: newReviewData.rating,
            comment: newReviewData.comment,
            spoiler: tag,
          }),
        },
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to submit review");
      }

      const data = await res.json();
      if (data.result) {
        toast.success("Review submitted successfully!");
      } else {
        toast.error(
          data.message || "Failed to submit review. Please try again.",
        );
        return;
      }
      // Refresh reviews
      fetchMovieDetails(movieData.id, tag);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // =========================================================================
  // 🎨 RENDER LOGIC
  // =========================================================================

  // --- Conditional Render: Loading/Error ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <RotateCw className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-lg">Loading movie details...</span>
      </div>
    );
  }

  if (error || !movieData) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4 p-8">
            <h2 className="text-2xl font-bold text-red-500">
              {error || "Movie Not Found"}
            </h2>
            <p className="text-muted-foreground">
              {error
                ? "Please try again later."
                : "The movie you are looking for does not exist."}
            </p>
            <Link href="/movies">
              <Button variant="outline">Go Back to Movies</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const movie = movieData as MovieData;

  // --- Main Content Render ---
  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Movie Header */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          {/* Poster */}
          <div className="md:col-span-3 lg:col-span-3">
            <div className="relative rounded-xl overflow-hidden bg-secondary border border-border shadow-2xl group">
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {movie.averageRating > 0 && (
                <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 text-sm border border-white/10">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  {movie.averageRating.toFixed(1)}
                </div>
              )}
            </div>
          </div>

          {/* Movie Info */}
          <div className="md:col-span-9 lg:col-span-9 flex flex-col justify-center">
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-sm font-bold px-2.5 py-0.5 border-2",
                    movie.ageRating.includes("18")
                      ? "border-red-500 text-red-500"
                      : movie.ageRating.includes("PG")
                      ? "border-green-500 text-green-500"
                      : "border-yellow-500 text-yellow-500"
                  )}
                >
                  {movie.ageRating}
                </Badge>
                <span className="text-muted-foreground">•</span>
                <span className="text-foreground font-medium">
                  {movie.duration} min
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-foreground font-medium">
                  {movie.language}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight leading-tight">
                {movie.title}
              </h1>

              {/* Genres & Formats */}
              <div className="flex flex-wrap gap-2 mb-6">
                {movie.genres.map((genre, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="bg-secondary/50 hover:bg-secondary"
                  >
                    {genre}
                  </Badge>
                ))}
                {movie.formats.map((fmt, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="border-primary/50 text-primary"
                  >
                    {fmt}
                  </Badge>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mb-8 text-sm">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-secondary/50 text-primary shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-muted-foreground font-medium mb-0.5">
                      Director
                    </p>
                    <p className="text-foreground font-semibold leading-snug">
                      {movie.director}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-secondary/50 text-primary shrink-0">
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-muted-foreground font-medium mb-0.5">
                      Release Year
                    </p>
                    <p className="text-foreground font-semibold">
                      {movie.releaseYear}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-secondary/30 rounded-xl p-6 border border-border/50">
                <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" /> Storyline
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {movie.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab("showtimes")}
              className={cn(
                "px-8 py-4 font-bold text-lg transition-all relative",
                activeTab === "showtimes"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Showtimes
              {activeTab === "showtimes" && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={cn(
                "px-8 py-4 font-bold text-lg transition-all relative",
                activeTab === "reviews"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Reviews
              <Badge variant="secondary" className="ml-2 text-xs">
                {reviewsData.length}
              </Badge>
              {activeTab === "reviews" && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full" />
              )}
            </button>
          </div>
        </div>

        {/* Showtimes Tab */}
        {activeTab === "showtimes" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 📅 Date Picker Input (Replaces Navigation Strip) */}
            <Card className="border-border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3 shrink-0">
                  <CalendarIcon className="w-6 h-6 text-primary" />
                  <span className="text-lg font-bold text-foreground">
                    Selected Date: {format(selectedDate, "EEEE, MMM d, yyyy")}
                  </span>
                </div>

                <input
                  type="date"
                  // Value must be in 'YYYY-MM-DD' format for <input type="date">
                  value={format(selectedDate, "yyyy-MM-dd")}
                  onChange={handleDateChange}
                  className="px-3 py-2 rounded-lg border border-input bg-secondary text-foreground cursor-pointer focus:ring-2 focus:ring-primary h-10 w-fit"
                />
              </div>
            </Card>

            {/* Grouped Showtimes */}
            <div className="space-y-6">
              {Object.entries(groupedShowtimes).length === 0 ? (
                <Card className="p-10 text-center text-muted-foreground">
                  <p>No showtimes available for this date.</p>
                </Card>
              ) : (
                Object.entries(groupedShowtimes).map(
                  ([branchName, showtimes]) => {
                    const firstShowtime = showtimes[0];
                    const isPreSelected =
                      initialCinemaId &&
                      firstShowtime.branchId === Number(initialCinemaId);

                    return (
                      <Card
                        key={branchName}
                        className={cn(
                          "border-border overflow-hidden transition-all duration-500",
                          isPreSelected
                            ? "ring-2 ring-primary shadow-lg bg-primary/5"
                            : "bg-card hover:shadow-md"
                        )}
                      >
                        <div className="p-6 border-b border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-bold flex items-center gap-2">
                              <MapPin className="w-5 h-5 text-primary" />
                              {branchName}
                            </h3>
                            <p className="text-sm text-muted-foreground ml-7">
                              {firstShowtime.branchAddress}
                            </p>
                          </div>
                          {isPreSelected && (
                            <Badge className="w-fit bg-primary text-primary-foreground">
                              Selected Cinema
                            </Badge>
                          )}
                        </div>

                        <div className="p-6">
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {showtimes.map((st) => (
                              <div key={st.id} className="group relative">
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full h-auto py-4 flex flex-col items-center justify-center gap-1 border-2 hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all"
                                  )}
                                  disabled={st.date < new Date()}
                                  onClick={() => handleSelectShowtime(st.id)}
                                >
                                  <span className="text-2xl font-mono font-bold tracking-tight">
                                    {st.startTime}
                                  </span>
                                  <div className="flex flex-col items-center gap-1 text-xs opacity-80">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold uppercase bg-secondary/50 px-1.5 rounded text-foreground group-hover:text-primary-foreground">
                                        {st.format}
                                      </span>
                                      <span>•</span>
                                      <span>{st.hallName}</span>
                                    </div>
                                    <span className="text-[10px] opacity-70">
                                      {st.subtitle}
                                    </span>
                                  </div>
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </Card>
                    );
                  }
                )
              )}
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === "reviews" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Write Review Section - TOP */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Write a Review</CardTitle>
              </CardHeader>
              <CardContent>
                {!isLoggedIn ? (
                  <div className="text-center py-6 space-y-4">
                    <p className="text-muted-foreground">
                      Please log in to share your experience.
                    </p>
                    <Link href="/auth/login">
                      <Button variant="outline" className="w-full">
                        Log In
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <AddReviewForm onSubmit={handleAddReview} />
                )}
              </CardContent>
            </Card>

            {/* Mood Voting Section */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  How did this movie make you feel?
                </CardTitle>
                {!isLoggedIn && (
                  <p className="text-sm text-muted-foreground mt-2">
                    🔒 Log in to vote
                  </p>
                )}
                {isLoggedIn && !hasPurchased && (
                  <p className="text-sm text-amber-500 mt-2">
                    🔒 Purchase a ticket for this movie to vote
                  </p>
                )}
              </CardHeader>
              <CardContent>
                {/* Facebook-style mood row */}
                <div className="flex flex-wrap gap-3 mb-6">
                  {moodOptions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Loading moods... (If this persists, check console for errors)
                    </p>
                  ) : (
                    moodOptions.map((mood) => {
                      const voteData = moodVotes.find(
                        (v) => v.mood_id === mood.mood_id
                      );
                      const voteCount = voteData?.count || 0;
                      const isVoted = userMoodVotes.includes(mood.mood_id);
                      const canVote = isLoggedIn && hasPurchased;

                      return (
                        <button
                          key={mood.mood_id}
                          onClick={() => canVote && handleMoodVote(mood.mood_id)}
                          disabled={!canVote || isLoadingMoods}
                          className={cn(
                            "flex items-center gap-2 px-4 py-2.5 rounded-full border-2 transition-all",
                            "hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60",
                            isVoted
                              ? "bg-primary border-primary text-primary-foreground shadow-lg"
                              : "bg-secondary/30 border-border hover:border-primary/50"
                          )}
                        >
                          <img
                            src={mood.symbol}
                            alt={mood.name}
                            className="w-6 h-6"
                            onError={(e) => {
                              console.error("Failed to load mood icon:", mood.symbol);
                              e.currentTarget.style.display = "none";
                            }}
                          />
                          <span className="font-semibold text-sm">
                            {mood.name}
                          </span>
                          <span
                            className={cn(
                              "text-xs font-bold px-2 py-0.5 rounded-full",
                              isVoted
                                ? "bg-primary-foreground/20"
                                : "bg-muted"
                            )}
                          >
                            {voteCount}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Show loading state */}
                {isLoadingMoods && (
                  <p className="text-sm text-muted-foreground text-center">
                    Updating votes...
                  </p>
                )}
              </CardContent>
            </Card>

            {/* User Reviews Section - BOTTOM */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" /> User Reviews
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {reviewsData.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No reviews yet. Be the first to share your thoughts!</p>
                  </div>
                ) : (
                  reviewsData.map((review, index) => (
                    <div
                      key={index}
                      className="border-b border-border pb-6 last:border-b-0 last:pb-0"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-foreground">
                          {review.Customer_name}
                        </span>
                        <div className="flex items-center gap-0.5 text-yellow-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "w-3 h-3",
                                i < review.Rating
                                  ? "fill-current"
                                  : "text-muted stroke-muted-foreground"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {review.Comment}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Reviewed on: {review.Review_date}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

// Helper Review Form Component
function AddReviewForm({
  onSubmit,
}: {
  onSubmit: (data: { rating: number; comment: string }) => void;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !comment.trim()) {
      toast.error("Please provide a rating and a comment.");
      return;
    }
    onSubmit({ rating, comment: comment.trim() });
    setRating(0);
    setComment("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-bold text-foreground mb-3">
          Rate this movie
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="focus:outline-none transition-transform hover:scale-110"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
            >
              <Star
                className={cn(
                  "w-8 h-8 transition-colors",
                  (hoverRating || rating) >= star
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-muted-foreground"
                )}
              />
            </button>
          ))}
        </div>
      </div>
      <div>
        <label
          htmlFor="comment"
          className="block text-sm font-bold text-foreground mb-2"
        >
          Your Review
        </label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="w-full p-3 bg-background border border-input rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none"
          placeholder="Tell us what you liked or disliked..."
        />
      </div>
      <Button
        type="submit"
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6"
      >
        Submit Review
      </Button>
    </form>
  );
}
