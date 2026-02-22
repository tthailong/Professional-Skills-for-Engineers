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

  useEffect(() => {
    const fetchHalls = async () => {
      if (!newShowtime.format || !branchData.id) return;

      setIsLoadingHalls(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/admin_regular/branch/halls/${branchData.id}?format=${encodeURIComponent(newShowtime.format)}`,
        );
        if (res.ok) {
          const halls = await res.json();
          setAvailableHalls(halls);

          if (
            newShowtime.hall_number &&
            !halls.find(
              (h: Hall) => h.hall_number.toString() === newShowtime.hall_number,
            )
          ) {
            setNewShowtime((prev) => ({ ...prev, hall_number: "" }));
          }
        } else {
          toast.error("Failed to fetch halls");
          setAvailableHalls([]);
        }
      } catch {
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

    const d = new Date(newShowtime.date);
    const formatted = `${String(d.getDate()).padStart(2, "0")}/${String(
      d.getMonth() + 1,
    ).padStart(2, "0")}/${d.getFullYear()}`;

    addShowtime({
      movie_id: selectedMovieId,
      start_time: newShowtime.time,
      date: formatted,
      format: newShowtime.format,
      subtitle: newShowtime.subtitle,
      hall_number: parseInt(newShowtime.hall_number),
    });

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* SEARCH */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 w-4 h-4 text-rose-400" />
        <Input
          placeholder="Search movies..."
          className="pl-10 bg-white border-rose-200 focus-visible:ring-rose-400 shadow-sm"
          value={searchQueries.movies}
          onChange={(e) =>
            setSearchQueries((prev) => ({
              ...prev,
              movies: e.target.value,
            }))
          }
        />
      </div>

      {/* MOVIES */}
      {paginatedMovies.map((movie) => {
        const current =
          branchData.movies.find((m) => m.movie_id === movie.movie_id) || movie;

        return (
          <Card
            key={movie.movie_id}
            className={`rounded-2xl border border-rose-100 bg-white/80 backdrop-blur-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
              current.isActive
                ? "ring-2 ring-green-400/40"
                : "opacity-90 hover:opacity-100"
            }`}
          >
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* INFO */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          current.isActive
                            ? "bg-green-100 text-green-600"
                            : "bg-rose-50 text-rose-400"
                        }`}
                      >
                        <Film className="w-5 h-5" />
                      </div>

                      <div>
                        <h3 className="text-xl font-bold flex items-center gap-2">
                          {movie.title}
                          {current.isActive && (
                            <span className="text-xs bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-0.5 rounded-full">
                              Active
                            </span>
                          )}
                        </h3>

                        <p className="text-sm text-gray-400">
                          {movie.duration} mins • {movie.age_rating}
                        </p>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      onClick={() =>
                        toggleMovieActive(movie.movie_id, current.isActive)
                      }
                      className={
                        current.isActive
                          ? "bg-white border border-red-400 text-red-500 hover:bg-red-50"
                          : "bg-gradient-to-r from-rose-500 to-pink-500 text-white"
                      }
                    >
                      {current.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </div>

                  {!current.isActive && (
                    <p className="text-sm italic text-gray-400 mt-2">
                      Activate this movie to manage showtimes.
                    </p>
                  )}
                </div>

                {/* SHOWTIMES */}
                {current.isActive && (
                  <div className="flex-1 md:border-l md:pl-6">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="font-semibold flex items-center gap-2">
                        <Clock className="w-4 h-4 text-rose-500" />
                        Showtimes
                      </Label>

                      <Button
                        size="sm"
                        onClick={() => handleOpenAddModal(movie.movie_id)}
                        className="bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {current.showtimes.length === 0 ? (
                        <span className="text-xs text-red-500 bg-red-50 px-3 py-1 rounded-full flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          No showtimes set
                        </span>
                      ) : (
                        current.showtimes.map((s) => (
                          <div
                            key={s.showtime_id}
                            className="relative group bg-white border border-rose-100 rounded-xl px-4 py-3 text-sm shadow hover:shadow-md transition"
                          >
                            <div className="text-xs text-gray-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {s.date}
                            </div>

                            <div className="font-bold text-lg text-rose-500">
                              {s.start_time.slice(0, 5)}
                            </div>

                            <div className="text-xs text-gray-400">
                              Hall {s.hall_number} • {s.format} • {s.subtitle}
                            </div>

                            <button
                              onClick={() =>
                                removeShowtime(movie.movie_id, s.showtime_id)
                              }
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition"
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

      {/* MODAL */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl bg-white border border-rose-100 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-rose-500">
              Add New Showtime
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <Input
              type="date"
              value={newShowtime.date}
              onChange={(e) =>
                setNewShowtime({ ...newShowtime, date: e.target.value })
              }
            />

            <Input
              type="time"
              value={newShowtime.time}
              onChange={(e) =>
                setNewShowtime({ ...newShowtime, time: e.target.value })
              }
            />

            <Select
              value={newShowtime.format}
              onValueChange={(v) =>
                setNewShowtime({ ...newShowtime, format: v })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
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

            <Select
              value={newShowtime.hall_number}
              onValueChange={(v) =>
                setNewShowtime({ ...newShowtime, hall_number: v })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Hall" />
              </SelectTrigger>
              <SelectContent>
                {availableHalls.map((h) => (
                  <SelectItem
                    key={h.hall_number}
                    value={h.hall_number.toString()}
                  >
                    Hall {h.hall_number} ({h.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={newShowtime.subtitle}
              onValueChange={(v) =>
                setNewShowtime({ ...newShowtime, subtitle: v })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Subtitle" />
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

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddShowtimeSubmit}
              className="bg-gradient-to-r from-rose-500 to-pink-500 text-white"
            >
              Add Showtime
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
