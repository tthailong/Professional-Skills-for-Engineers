// components/branch_manager/MovieScheduleTab.tsx

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Film,
  Clock,
  Plus,
  X,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { BranchData, Movie } from "../types";
import { PaginationControls } from "./PaginationControls";
import { toast } from "sonner";
import { API_BASE_URL } from "@/store/useUserStore";

interface MovieScheduleProps {
  branchData: BranchData;
  paginatedMovies: Movie[];
  totalMoviePages: number;
  searchQueries: { movies: string };
  setSearchQueries: React.Dispatch<
    React.SetStateAction<{ movies: string; events: string; products: string }>
  >;
  toggleMovieActive: (movieId: number, isActive: boolean) => void;
  addShowtime: (showtimeData: any) => void;
  removeShowtime: (movieId: number, showtimeId: number) => void;
  pages: any;
  setPages: any;
}

interface Hall {
  hall_number: number;
  type: string;
  capacity: number;
}

export const MovieScheduleTab: React.FC<MovieScheduleProps> = ({
  branchData,
  paginatedMovies,
  totalMoviePages,
  searchQueries,
  setSearchQueries,
  toggleMovieActive,
  addShowtime,
  removeShowtime,
  pages,
  setPages,
}) => {
  // State for Add Showtime Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [newShowtime, setNewShowtime] = useState({
    date: "",
    time: "",
    format: "",
    subtitle: "",
    hall_number: "",
  });
  const [availableHalls, setAvailableHalls] = useState<Hall[]>([]);
  const [isLoadingHalls, setIsLoadingHalls] = useState(false);

  // Fetch halls when format changes
  useEffect(() => {
    const fetchHalls = async () => {
      if (!newShowtime.format || !branchData.id) return;

      setIsLoadingHalls(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/admin_regular/branch/halls/${
            branchData.id
          }?format=${encodeURIComponent(newShowtime.format)}`
        );
        if (response.ok) {
          const halls = await response.json();
          setAvailableHalls(halls);
          // Reset hall selection if current selection is not in the new list
          if (
            newShowtime.hall_number &&
            !halls.find(
              (h: Hall) => h.hall_number.toString() === newShowtime.hall_number
            )
          ) {
            setNewShowtime((prev) => ({ ...prev, hall_number: "" }));
          }
        } else {
          toast.error("Failed to fetch halls");
          setAvailableHalls([]);
        }
      } catch (error) {
        console.error("Error fetching halls:", error);
        toast.error("Failed to fetch halls");
        setAvailableHalls([]);
      } finally {
        setIsLoadingHalls(false);
      }
    };

    fetchHalls();
  }, [newShowtime.format, branchData.id]);

  const handleOpenAddModal = (movieId: number) => {
    setSelectedMovieId(movieId);
    setNewShowtime({
      date: "",
      time: "",
      format: "",
      subtitle: "",
      hall_number: "",
    });
    setAvailableHalls([]);
    setIsAddModalOpen(true);
  };

  const handleAddShowtimeSubmit = () => {
    if (
      !selectedMovieId ||
      !newShowtime.date ||
      !newShowtime.time ||
      !newShowtime.format ||
      !newShowtime.subtitle ||
      !newShowtime.hall_number
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    // Format date to dd/mm/yyyy
    const dateObj = new Date(newShowtime.date);
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    addShowtime({
      movie_id: selectedMovieId,
      start_time: newShowtime.time, // HH:mm
      date: formattedDate,
      format: newShowtime.format,
      subtitle: newShowtime.subtitle,
      hall_number: parseInt(newShowtime.hall_number),
    });

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="relative max-w-md mb-4">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search movies..."
          className="pl-10 bg-card border-border"
          value={searchQueries.movies}
          onChange={(e) =>
            setSearchQueries((prev) => ({
              ...prev,
              movies: e.target.value,
            }))
          }
        />
      </div>

      {paginatedMovies.map((movie) => {
        // Find the movie in branchData to get the latest state (isActive, showtimes)
        const currentMovieState =
          branchData.movies.find((m) => m.movie_id === movie.movie_id) || movie;

        return (
          <Card
            key={movie.movie_id}
            className={`border-border bg-card transition-all duration-300 ${
              currentMovieState.isActive
                ? "border-l-4 border-l-green-500 shadow-[0_0_15px_rgba(34,197,94,0.1)]"
                : "opacity-80 hover:opacity-100"
            }`}
          >
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Movie Info & Toggle */}
                <div className="flex-2">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          currentMovieState.isActive
                            ? "bg-green-100 text-green-600"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        <Film className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                          {movie.title}
                          {currentMovieState.isActive && (
                            <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                              Active
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {movie.duration} mins • {movie.age_rating}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={
                        currentMovieState.isActive ? "destructive" : "default"
                      }
                      onClick={() =>
                        toggleMovieActive(
                          movie.movie_id,
                          currentMovieState.isActive
                        )
                      }
                      className={
                        currentMovieState.isActive
                          ? "bg-white border-2 border-red-500 text-red-500 hover:bg-red-50"
                          : "bg-green-600 hover:bg-green-700"
                      }
                    >
                      {currentMovieState.isActive
                        ? "Deactivate"
                        : "Activate Movie"}
                    </Button>
                  </div>

                  {!currentMovieState.isActive && (
                    <p className="text-sm text-muted-foreground italic mt-2">
                      Activate this movie to manage showtimes.
                    </p>
                  )}
                </div>

                {/* Scheduler (Only visible if Active) */}
                {currentMovieState.isActive && (
                  <div className="flex-2 border-l justify-center pt-4 md:pt-0 md:pl-6 bg-secondary/20 py-6 pr-6 rounded-r-lg">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-semibold flex items-center gap-2">
                        <Clock className="w-4 h-4 text-white" /> Showtimes
                      </Label>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleOpenAddModal(movie.movie_id)}
                      >
                        <Plus className="w-4 h-4 mr-2" /> Add Showtime
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {currentMovieState.showtimes.length === 0 ? (
                        <span className="text-xs text-destructive italic flex items-center gap-1 bg-red-50 px-2 py-1 rounded">
                          <AlertCircle className="w-3 h-3" /> No showtimes set
                          (Movie won't appear on site)
                        </span>
                      ) : (
                        currentMovieState.showtimes.map((showtime) => (
                          <div
                            key={showtime.showtime_id}
                            className="bg-slate-200/10 border border-border text-foreground px-3 py-2 rounded-md text-sm font-medium flex flex-col gap-1 shadow-sm group relative pr-8"
                          >
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" /> {showtime.date}
                            </div>
                            <div className="font-bold text-lg">
                              {showtime.start_time.slice(0, 5)}
                            </div>
                            <div className="text-xs opacity-70">
                              Hall {showtime.hall_number} • {showtime.format} •{" "}
                              {showtime.subtitle}
                            </div>
                            <button
                              onClick={() =>
                                removeShowtime(
                                  movie.movie_id,
                                  showtime.showtime_id
                                )
                              }
                              className="absolute top-2 right-2 text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
      <PaginationControls
        type="movies"
        totalPages={totalMoviePages}
        pages={pages}
        setPages={setPages}
      />

      {/* Add Showtime Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground border-border">
          <DialogHeader>
            <DialogTitle>Add New Showtime</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Date */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                className="col-span-3 bg-secondary border-border"
                value={newShowtime.date}
                onChange={(e) =>
                  setNewShowtime({ ...newShowtime, date: e.target.value })
                }
              />
            </div>
            {/* Time */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time" className="text-right">
                Time
              </Label>
              <Input
                id="time"
                type="time"
                className="col-span-3 bg-secondary border-border"
                value={newShowtime.time}
                onChange={(e) =>
                  setNewShowtime({ ...newShowtime, time: e.target.value })
                }
              />
            </div>
            {/* Format */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="format" className="text-right">
                Format
              </Label>
              <Select
                value={newShowtime.format}
                onValueChange={(val) =>
                  setNewShowtime({ ...newShowtime, format: val })
                }
              >
                <SelectTrigger className="col-span-3 bg-secondary border-border">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  {/* Ideally fetch from movie details, but for now use common ones or fetch from selected movie */}
                  {selectedMovieId &&
                    branchData.movies
                      .find((m) => m.movie_id === selectedMovieId)
                      ?.formats.map((f) => (
                        <SelectItem key={f} value={f}>
                          {f}
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
            </div>
            {/* Hall */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="hall" className="text-right">
                Hall
              </Label>
              <Select
                value={newShowtime.hall_number}
                onValueChange={(val) =>
                  setNewShowtime({
                    ...newShowtime,
                    hall_number: val,
                  })
                }
                disabled={!newShowtime.format || isLoadingHalls}
              >
                <SelectTrigger className="col-span-3 bg-secondary border-border">
                  <SelectValue
                    placeholder={
                      !newShowtime.format
                        ? "Select format first"
                        : isLoadingHalls
                        ? "Loading halls..."
                        : availableHalls.length === 0
                        ? "No halls available for this format"
                        : "Select hall"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableHalls.map((hall) => (
                    <SelectItem
                      key={hall.hall_number}
                      value={hall.hall_number.toString()}
                    >
                      Hall {hall.hall_number} ({hall.type}) - Capacity:{" "}
                      {hall.capacity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Subtitle */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subtitle" className="text-right">
                Subtitle
              </Label>
              <Select
                value={newShowtime.subtitle}
                onValueChange={(val) =>
                  setNewShowtime({ ...newShowtime, subtitle: val })
                }
              >
                <SelectTrigger className="col-span-3 bg-secondary border-border">
                  <SelectValue placeholder="Select subtitle" />
                </SelectTrigger>
                <SelectContent>
                  {selectedMovieId &&
                    branchData.movies
                      .find((m) => m.movie_id === selectedMovieId)
                      ?.subtitles.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
              className="border-border text-foreground hover:bg-secondary"
            >
              Cancel
            </Button>
            <Button onClick={handleAddShowtimeSubmit}>Add Showtime</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
