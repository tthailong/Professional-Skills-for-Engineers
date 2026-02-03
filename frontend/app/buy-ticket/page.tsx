"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Calendar as CalendarIcon,
  Clock,
  Search,
  Film,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { format, addDays, isSameDay, startOfDay } from "date-fns";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Navbar } from "../navbar";
import { mockMovies } from "../movies/mockData";
import { cn } from "@/lib/utils";

// --- Mock Data for Cinemas ---
type Cinema = {
  id: string;
  name: string;
  city: string;
};

const CINEMAS: Cinema[] = [
  { id: "hcm-01", name: "CinemaPlus Cantavil", city: "Ho Chi Minh" },
  { id: "hcm-02", name: "CinemaPlus Go Vap", city: "Ho Chi Minh" },
  { id: "hcm-03", name: "CinemaPlus Phu Tho", city: "Ho Chi Minh" },
  { id: "hcm-04", name: "CinemaPlus Cong Hoa", city: "Ho Chi Minh" },
  { id: "hn-01", name: "CinemaPlus Landmark", city: "Ha Noi" },
  { id: "hn-02", name: "CinemaPlus Ha Dong", city: "Ha Noi" },
  { id: "hn-03", name: "CinemaPlus Long Bien", city: "Ha Noi" },
  { id: "dn-01", name: "CinemaPlus Da Nang", city: "Da Nang" },
  { id: "ct-01", name: "CinemaPlus Can Tho", city: "Can Tho" },
];

// Group cinemas by city
const CINEMAS_BY_CITY = CINEMAS.reduce((acc, cinema) => {
  if (!acc[cinema.city]) acc[cinema.city] = [];
  acc[cinema.city].push(cinema);
  return acc;
}, {} as Record<string, Cinema[]>);

const CITIES = Object.keys(CINEMAS_BY_CITY);

// --- Mock Data for Showtimes ---
const FORMATS = ["2D", "IMAX", "4DX"];
const TIMES = [
  "09:00",
  "10:30",
  "11:45",
  "13:15",
  "14:30",
  "16:00",
  "17:45",
  "19:30",
  "20:15",
  "21:45",
  "23:00",
];

// Helper to generate random showtimes for demo
const getMockShowtimes = (
  movieId: number | null,
  cinemaId: string | null,
  date: Date
) => {
  if (!movieId || !cinemaId) return [];

  // Deterministic pseudo-random based on inputs to keep UI stable during re-renders
  const seed = movieId + cinemaId.length + date.getDate();
  const count = (seed % 5) + 2; // 2 to 6 showtimes

  const showtimes = [];
  for (let i = 0; i < count; i++) {
    const timeIndex = (seed + i) % TIMES.length;
    const formatIndex = (seed + i) % FORMATS.length;
    showtimes.push({
      id: `st-${i}`,
      time: TIMES[timeIndex],
      format: FORMATS[formatIndex],
      seatsAvailable: 100 - ((seed * i) % 50),
    });
  }
  return showtimes.sort((a, b) => a.time.localeCompare(b.time));
};

export default function BuyTicketPage() {
  const router = useRouter();

  // State
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [selectedCinemaId, setSelectedCinemaId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(
    startOfDay(new Date())
  );
  const [searchMovie, setSearchMovie] = useState("");

  // Filtered Movies
  const filteredMovies = useMemo(() => {
    return mockMovies.filter((m) =>
      m.title.toLowerCase().includes(searchMovie.toLowerCase())
    );
  }, [searchMovie]);

  // Date Strip Logic
  const dates = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => addDays(new Date(), i));
  }, []);

  // Showtimes
  const showtimes = useMemo(() => {
    return getMockShowtimes(selectedMovieId, selectedCinemaId, selectedDate);
  }, [selectedMovieId, selectedCinemaId, selectedDate]);

  const handleShowtimeClick = (movieId: number) => {
    router.push(`/movies/${movieId}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-6 max-w-[1600px]">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Buy Tickets</h1>
          <div className="text-sm text-muted-foreground">
            Select a movie, cinema, and time to proceed.
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-180px)] min-h-[600px]">
          {/* --- COLUMN 1: SELECT MOVIE (3 cols) --- */}
          <Card className="lg:col-span-3 flex flex-col overflow-hidden border-border shadow-sm">
            <div className="p-4 border-b border-border bg-muted/30">
              <h2 className="font-semibold flex items-center gap-2 mb-3">
                <Film className="w-4 h-4 text-primary" /> Select Movie
              </h2>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search movies..."
                  className="pl-9 bg-background"
                  value={searchMovie}
                  onChange={(e) => setSearchMovie(e.target.value)}
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {filteredMovies.map((movie) => (
                  <button
                    key={movie.id}
                    onClick={() => setSelectedMovieId(movie.id)}
                    className={cn(
                      "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all border border-transparent",
                      selectedMovieId === movie.id
                        ? "bg-primary/10 border-primary/20 shadow-sm"
                        : "hover:bg-secondary/80"
                    )}
                  >
                    <div className="w-12 h-16 bg-muted rounded overflow-hidden shrink-0 shadow-sm">
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] px-1 py-0 h-4 border-muted-foreground/30",
                            movie.ageRating === "18"
                              ? "text-red-500 border-red-200"
                              : movie.ageRating === "PG"
                              ? "text-green-500 border-green-200"
                              : "text-yellow-600 border-yellow-200"
                          )}
                        >
                          {movie.ageRating}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {movie.duration}m
                        </span>
                      </div>
                      <h3
                        className={cn(
                          "font-bold text-sm truncate leading-tight",
                          selectedMovieId === movie.id
                            ? "text-primary"
                            : "text-foreground"
                        )}
                      >
                        {movie.title}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {movie.genre}
                      </p>
                    </div>
                    {selectedMovieId === movie.id && (
                      <div className="self-center">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </Card>

          {/* --- COLUMN 2: SELECT CINEMA (3 cols) --- */}
          <Card className="lg:col-span-3 flex flex-col overflow-hidden border-border shadow-sm">
            <div className="p-4 border-b border-border bg-muted/30 h-[88px] flex items-center">
              <h2 className="font-semibold flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" /> Select Cinema
              </h2>
            </div>

            <ScrollArea className="flex-1">
              <div className="flex flex-col">
                {CITIES.map((city) => (
                  <div key={city}>
                    <div className="sticky top-0 z-10 bg-secondary/90 backdrop-blur-sm px-4 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border/50">
                      {city}
                    </div>
                    <div className="p-2 space-y-1">
                      {CINEMAS_BY_CITY[city].map((cinema) => (
                        <button
                          key={cinema.id}
                          onClick={() => setSelectedCinemaId(cinema.id)}
                          className={cn(
                            "w-full text-left px-4 py-3 rounded-md text-sm transition-all flex justify-between items-center",
                            selectedCinemaId === cinema.id
                              ? "bg-primary text-primary-foreground shadow-md font-medium"
                              : "hover:bg-secondary text-foreground"
                          )}
                        >
                          <span>{cinema.name}</span>
                          {selectedCinemaId === cinema.id && (
                            <ChevronRight className="w-4 h-4 opacity-80" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>

          {/* --- COLUMN 3: SELECT TIME (6 cols) --- */}
          <Card className="lg:col-span-6 flex flex-col overflow-hidden border-border shadow-sm bg-secondary/10">
            <div className="p-4 border-b border-border bg-card">
              <h2 className="font-semibold flex items-center gap-2 mb-4">
                <CalendarIcon className="w-4 h-4 text-primary" /> Select Date &
                Time
              </h2>

              {/* Date Strip */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {dates.map((d) => {
                  const isSelected = isSameDay(d, selectedDate);
                  return (
                    <button
                      key={d.toISOString()}
                      onClick={() => setSelectedDate(d)}
                      className={cn(
                        "flex flex-col items-center justify-center min-w-[60px] h-[70px] rounded-lg border transition-all shrink-0",
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary shadow-md"
                          : "bg-background border-border text-muted-foreground hover:border-primary/50 hover:bg-secondary"
                      )}
                    >
                      <span className="text-[10px] font-medium uppercase">
                        {format(d, "EEE")}
                      </span>
                      <span className="text-xl font-bold">
                        {format(d, "d")}
                      </span>
                      <span className="text-[10px] opacity-80">
                        {format(d, "MMM")}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              {!selectedMovieId || !selectedCinemaId ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4 opacity-60">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                    <Clock className="w-8 h-8" />
                  </div>
                  <p className="text-center max-w-xs">
                    Please select a{" "}
                    <span className="font-semibold text-foreground">Movie</span>{" "}
                    and a{" "}
                    <span className="font-semibold text-foreground">
                      Cinema
                    </span>{" "}
                    to view showtimes.
                  </p>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-24 h-36 bg-muted rounded-lg shadow-md overflow-hidden shrink-0">
                      {/* Selected Movie Poster */}
                      <img
                        src={
                          mockMovies.find((m) => m.id === selectedMovieId)
                            ?.poster
                        }
                        alt="Poster"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">
                        {
                          mockMovies.find((m) => m.id === selectedMovieId)
                            ?.title
                        }
                      </h3>
                      <div className="flex items-center gap-2 text-muted-foreground mt-1">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {CINEMAS.find((c) => c.id === selectedCinemaId)?.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground mt-1">
                        <CalendarIcon className="w-4 h-4" />
                        <span>
                          {format(selectedDate, "EEEE, MMMM d, yyyy")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                      Available Showtimes
                    </h4>

                    {showtimes.length === 0 ? (
                      <div className="text-center py-10 text-muted-foreground">
                        No showtimes available for this date.
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {showtimes.map((st) => (
                          <Button
                            key={st.id}
                            variant="outline"
                            className="h-auto py-3 flex flex-col gap-1 border-border hover:border-primary hover:bg-primary/5 hover:text-primary transition-all group"
                            onClick={() => handleShowtimeClick(selectedMovieId)}
                          >
                            <span className="text-lg font-bold font-mono group-hover:scale-110 transition-transform">
                              {st.time}
                            </span>
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground group-hover:text-primary/80">
                              <span className="font-semibold">{st.format}</span>
                              <span>•</span>
                              <span>{st.seatsAvailable} seats</span>
                            </div>
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
