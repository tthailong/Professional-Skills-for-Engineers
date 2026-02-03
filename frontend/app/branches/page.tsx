// app/cinema-locations/page.tsx

"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  MapPin,
  Phone,
  Calendar as CalendarIcon,
  ChevronRight,
  Film,
  Monitor,
  Speaker,
  Clock,
  RotateCw,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "../navbar";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { API_BASE_URL } from "@/store/useUserStore"; // Ensure you have this or replace with string

// =========================================================================
// 🌎 API INTERFACES
// =========================================================================

interface BranchOut {
  Branch_id: number;
  City: string;
  Address: string;
  Name: string;
}

interface ShowtimeInBranchOut {
  Showtime_id: number;
  Date: string; // dd/mm/yyyy
  Start_time: string; // HH:MM
  Format: string;
  Subtitle: string;
  Hall_number: number;
  Hall_type: string;
}

interface MovieInBranchOut {
  Movie_id: number;
  Title: string;
  Image: string | null;
  Release_date: string | null;
  Language: string;
  Age_rating: string;
  Duration: number | null;
  Description: string | null;
  showtimes: ShowtimeInBranchOut[];
}

interface BranchDetailOut {
  branch: BranchOut;
  movies: MovieInBranchOut[];
}

// Helper for Sidebar Grouping
interface CityGroup {
  name: string;
  branches: BranchOut[];
}

// =========================================================================
// 🚀 MAIN COMPONENT
// =========================================================================

export default function CinemaLocationsPage() {
  // --- State: Data ---
  const [cities, setCities] = useState<CityGroup[]>([]);
  const [branchDetail, setBranchDetail] = useState<BranchDetailOut | null>(
    null
  );

  // --- State: UI & Selection ---
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());

  // --- State: Loading/Error ---
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // 1. Fetch Branch List (Sidebar)
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/branches/`);
        if (!res.ok) throw new Error("Failed to fetch branches");
        const responseJson = await res.json();
        const data: BranchOut[] = responseJson.data || [];

        // Group flat list by City
        const grouped = data.reduce((acc, branch) => {
          const existingCity = acc.find((c) => c.name === branch.City);
          if (existingCity) {
            existingCity.branches.push(branch);
          } else {
            acc.push({ name: branch.City, branches: [branch] });
          }
          return acc;
        }, [] as CityGroup[]);

        setCities(grouped);

        // Auto-select first branch if available
        if (data.length > 0 && !selectedBranchId) {
          setSelectedBranchId(data[0].Branch_id);
        }
      } catch (error) {
        console.error(error);
        toast.error("Could not load cinema locations");
      } finally {
        setIsLoadingList(false);
      }
    };

    fetchBranches();
  }, []);

  // 2. Fetch Branch Details (Main Content)
  useEffect(() => {
    if (!selectedBranchId) return;

    const fetchDetail = async () => {
      setIsLoadingDetail(true);
      try {
        const res = await fetch(`${API_BASE_URL}/branches/${selectedBranchId}`);
        if (!res.ok) throw new Error("Failed to fetch cinema details");
        const data: BranchDetailOut = await res.json();
        setBranchDetail(data);
      } catch (error) {
        console.error(error);
        toast.error("Could not load showtimes");
        setBranchDetail(null);
      } finally {
        setIsLoadingDetail(false);
      }
    };

    fetchDetail();
  }, [selectedBranchId]);

  // 3. Filter Showtimes by Selected Date
  // The API returns Date as "dd/mm/yyyy", we need to match it with date-fns format
  const filteredMovies = useMemo(() => {
    if (!branchDetail || !date) return [];

    const dateStr = format(date, "dd/MM/yyyy");

    return branchDetail.movies
      .map((movie) => {
        // Filter showtimes for this movie that match the selected date
        const validShowtimes = movie.showtimes.filter(
          (s) => s.Date === dateStr
        );

        // Group by Hall Type (Format) for UI display
        // e.g., { "IMAX": ["10:00", "12:00"], "2D Standard": ["14:00"] }
        const formatsObj = validShowtimes.reduce((acc, showtime) => {
          if (!acc[showtime.Hall_type]) {
            acc[showtime.Hall_type] = [];
          }
          acc[showtime.Hall_type].push({
            time: showtime.Start_time,
            id: showtime.Showtime_id,
          });
          return acc;
        }, {} as Record<string, { time: string; id: number }[]>);

        const formats = Object.entries(formatsObj).map(([type, times]) => ({
          type,
          times: times.sort((a, b) => a.time.localeCompare(b.time)),
        }));

        return { ...movie, formats };
      })
      .filter((m) => m.formats.length > 0); // Only show movies with showtimes today
  }, [branchDetail, date]);

  // --- Render Helpers ---

  if (isLoadingList) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RotateCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />

      <main className="container mx-auto px-4 py-8 flex-1 flex flex-col lg:flex-row gap-8">
        {/* --- LEFT SIDEBAR: CINEMA SELECTOR --- */}
        <aside className="w-full lg:w-80 shrink-0 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Cinemas</h2>
            <p className="text-muted-foreground text-sm">
              Select a location near you
            </p>
          </div>

          <Card className="border-border bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col max-h-[calc(100vh-250px)] overflow-y-auto scrollbar-thin scrollbar-thumb-secondary">
                {cities.map((city) => (
                  <div
                    key={city.name}
                    className="border-b border-border/50 last:border-0"
                  >
                    <div className="bg-secondary/30 px-5 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider sticky top-0 backdrop-blur-md z-10">
                      {city.name}
                    </div>
                    <div className="flex flex-col p-2 gap-1">
                      {city.branches.map((branch) => (
                        <button
                          key={branch.Branch_id}
                          onClick={() => setSelectedBranchId(branch.Branch_id)}
                          className={cn(
                            "text-left px-4 py-3 rounded-md text-sm transition-all duration-200 flex justify-between items-center group",
                            selectedBranchId === branch.Branch_id
                              ? "bg-primary text-primary-foreground shadow-md"
                              : "text-foreground hover:bg-secondary hover:text-foreground"
                          )}
                        >
                          <span className="font-medium truncate mr-2">
                            {branch.Name}
                          </span>
                          {selectedBranchId === branch.Branch_id && (
                            <ChevronRight className="w-4 h-4 animate-in fade-in slide-in-from-left-1" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* --- RIGHT CONTENT: DETAILS & SHOWTIMES --- */}
        <section className="flex-1 space-y-8">
          {isLoadingDetail || !branchDetail ? (
            <div className="h-[400px] flex items-center justify-center border rounded-xl bg-card/50">
              {isLoadingDetail ? (
                <RotateCw className="w-8 h-8 animate-spin text-primary" />
              ) : (
                <div className="text-muted-foreground flex flex-col items-center">
                  <AlertCircle className="w-8 h-8 mb-2" />
                  <p>Select a cinema to view details</p>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* 1. CINEMA HERO INFO */}
              <div className="relative rounded-2xl overflow-hidden border border-border shadow-lg bg-card group">
                <div className="absolute inset-0 z-0">
                  {/* Static placeholder for branch image, or dynamic if API provides it later */}
                  <div className="w-full h-full bg-[url('/placeholder.svg?height=400&width=1000')] bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-700 ease-out"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                </div>

                <div className="relative z-10 p-8 md:p-10 flex flex-col justify-end min-h-[300px]">
                  <div className="space-y-4 max-w-2xl">
                    <Badge
                      variant="outline"
                      className="w-fit bg-background/50 backdrop-blur border-primary/20 text-primary"
                    >
                      Now Showing
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
                      {branchDetail.branch.Name}
                    </h1>

                    <div className="flex flex-col gap-2 text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-5 h-5 mt-0.5 text-primary shrink-0" />
                        <p className="text-base">
                          {branchDetail.branch.Address},{" "}
                          {branchDetail.branch.City}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-5 h-5 text-primary shrink-0" />
                        <p className="text-base font-medium">
                          Contact Support via Website
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. DATE SELECTION */}
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    <CalendarIcon className="w-6 h-6 text-primary" />
                    Showtimes
                  </h3>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* 3. MOVIE LIST */}
                {filteredMovies.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground border border-dashed rounded-xl">
                    No showtimes available for this date.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredMovies.map((movie) => (
                      <Card
                        key={movie.Movie_id}
                        className="overflow-hidden border-border bg-card hover:shadow-md transition-all duration-300 group"
                      >
                        <div className="flex flex-col sm:flex-row">
                          {/* Poster */}
                          <div className="hidden sm:block w-40 shrink-0 relative overflow-hidden bg-secondary">
                            {movie.Image ? (
                              <img
                                src={movie.Image}
                                alt={movie.Title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Film className="w-10 h-10 text-muted-foreground/20" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 p-6 flex flex-col justify-between">
                            <div>
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-2">
                                <div>
                                  <div className="flex items-center gap-3 mb-2">
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        "font-bold px-2 py-0.5 text-xs border-2",
                                        movie.Age_rating === "P"
                                          ? "border-green-500 text-green-500"
                                          : movie.Age_rating.includes("18")
                                          ? "border-red-500 text-red-500"
                                          : "border-yellow-500 text-yellow-500"
                                      )}
                                    >
                                      {movie.Age_rating}
                                    </Badge>
                                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                                      {movie.Title}
                                    </h3>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    {movie.Duration && (
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />{" "}
                                        {movie.Duration} min
                                      </span>
                                    )}
                                    <span className="w-1 h-1 rounded-full bg-border" />
                                    <span>{movie.Language}</span>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  // Link to movie detail page if you have one
                                  onClick={() =>
                                    (window.location.href = `/movies/${movie.Movie_id}`)
                                  }
                                  className="self-start text-xs text-muted-foreground hover:text-white transition-all duration-500"
                                >
                                  More Info
                                  <ChevronRight className="w-3 h-3 ml-1" />
                                </Button>
                              </div>

                              {/* Showtimes Grid */}
                              <div className="space-y-4 mt-6">
                                {movie.formats.map((formatItem, idx) => (
                                  <div
                                    key={idx}
                                    className="border-t border-border/40 pt-4 first:border-0 first:pt-0"
                                  >
                                    <div className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
                                      {formatItem.type.includes("IMAX") ? (
                                        <Monitor className="w-4 h-4 text-primary" />
                                      ) : (
                                        <Speaker className="w-4 h-4 text-primary" />
                                      )}
                                      {formatItem.type}
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                      {formatItem.times.map((t) => {
                                        // t.time is "HH:MM"
                                        const [hourStr, minuteStr] = (
                                          t.time ?? ""
                                        ).split(":");
                                        const hour = Number(hourStr);
                                        const minute = Number(minuteStr);

                                        // If selected date is not set or time parsing failed, disable button.
                                        const disabledDueToMissing =
                                          !date ||
                                          Number.isNaN(hour) ||
                                          Number.isNaN(minute);

                                        // Build Date object for the selected day at the showtime
                                        const showDate = date ?? new Date();
                                        const showDateTime = new Date(
                                          showDate.getFullYear(),
                                          showDate.getMonth(),
                                          showDate.getDate(),
                                          hour,
                                          minute,
                                          0
                                        );

                                        // Optionally: if you want to disable after the show ended (add duration),
                                        // add minutes to showDateTime here. For now we disable based on start time.
                                        const isPast =
                                          Date.now() > showDateTime.getTime();

                                        return (
                                          <Button
                                            key={t.id ?? `${t.time}-${idx}`}
                                            variant="outline"
                                            onClick={() =>
                                              (window.location.href = `/movies/${movie.Movie_id}/booking?showtimeId=${t.id}`)
                                            }
                                            disabled={
                                              disabledDueToMissing || isPast
                                            }
                                            className="min-w-[5.5rem] border-border bg-background/50 hover:bg-primary hover:text-primary-foreground hover:border-primary group/time relative overflow-hidden transition-all"
                                          >
                                            <span className="relative z-10 font-mono text-sm font-medium">
                                              {t.time}
                                            </span>
                                            <div className="absolute inset-x-0 bottom-0 h-[2px] bg-primary/20 group-hover/time:bg-white/30" />
                                          </Button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
