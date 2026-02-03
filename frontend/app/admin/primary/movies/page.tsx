"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/app/navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Trash2, Plus, Search, Film, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/store/useAdminStore";
import { API_BASE_URL } from "@/store/useUserStore";

export default function AdminMoviesPage() {
  const { admin } = useAdminStore();
  const router = useRouter();

  // 1. Movie Data
  const [movies, setMovies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 2. State for Search and Editing
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<any>(null);

  // Fetch movies on mount
  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/movies/all`);
      if (!res.ok) throw new Error("Failed to fetch movies");
      const data = await res.json();
      const mappedMovies = data.map((m: any) => ({
        id: m.movie_id,
        title: m.title,
        genre: m.genres[0] || "Unknown", // Take first genre or default
        duration: m.duration,
        ageRating: m.age_rating,
        // Keep other fields for editing
        director: m.director,
        release_date: m.release_date,
        language: m.language,
        description: m.description,
        actors: m.actors,
        formats: m.formats,
        subtitles: m.subtitles,
        genres: m.genres,
        image: m.image,
      }));
      setMovies(mappedMovies);
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Filter Logic
  const filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 4. Handlers
  const handleDelete = (id: number) => {
    // User requested no delete functionality
    alert("Delete functionality is disabled.");
  };

  const handleEditClick = (movie: any) => {
    setEditingMovie({
      ...movie,
      // Ensure arrays are initialized
      genres: Array.isArray(movie.genres) ? movie.genres : [],
      actors: Array.isArray(movie.actors) ? movie.actors : [],
      formats: Array.isArray(movie.formats) ? movie.formats : [],
      subtitles: Array.isArray(movie.subtitles) ? movie.subtitles : [],
    });
    setIsEditOpen(true);
  };
  const formatDateForBackend = (dateString: string) => {
    // Input: "YYYY-MM-DD" (from backend/input type="date") or "dd/mm/YYYY" (if already formatted)
    // Output: "dd/mm/YYYY"
    if (!dateString) return "01/01/2024";

    // Check if already in dd/mm/YYYY format
    if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) return dateString;

    // Assume YYYY-MM-DD
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "01/01/2024";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingMovie) return;

    try {
      const payload = {
        director: editingMovie.director || "Unknown",
        title: editingMovie.title,
        image: editingMovie.image || null,
        release_date: formatDateForBackend(editingMovie.release_date),
        language: editingMovie.language || "English",
        age_rating: editingMovie.ageRating, // Mapped from ageRating
        duration: editingMovie.duration,
        description: editingMovie.description || "",
        admin_id: admin?.id || 1, // Use logged in admin ID or default
        actor: editingMovie.actors.join(","),
        format: editingMovie.formats.join(","),
        subtitle: editingMovie.subtitles.join(","),
        genres: editingMovie.genres.join(","),
      };

      await fetch(`${API_BASE_URL}/admin/movies/${editingMovie.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Refresh list
      fetchMovies();
      setIsEditOpen(false);
    } catch (error) {
      console.error("Failed to update movie:", error);
      alert("Failed to update movie. See console for details.");
    }
  };

  // Helper to add item to list in editingMovie
  const addItem = (item: string, listName: string, setInput: Function) => {
    if (item.trim() && !editingMovie[listName].includes(item.trim())) {
      setEditingMovie({
        ...editingMovie,
        [listName]: [...editingMovie[listName], item.trim()],
      });
      setInput("");
    }
  };

  // Helper to remove item from list in editingMovie
  const removeItem = (itemToRemove: string, listName: string) => {
    setEditingMovie({
      ...editingMovie,
      [listName]: editingMovie[listName].filter(
        (item: string) => item !== itemToRemove
      ),
    });
  };

  // Local state for new inputs in modal
  const [newGenre, setNewGenre] = useState("");
  const [newActor, setNewActor] = useState("");
  const [newFormat, setNewFormat] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");

  if (!admin) {
    // Ideally handle this check with useEffect or middleware to avoid render issues
    // router.push("/auth/admin-login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Manage Movies
            </h1>
            <p className="text-muted-foreground">
              Add, edit, or remove movies from your catalog
            </p>
          </div>
          {/* Note: You can keep the Add button as a separate page if you prefer */}
          <Link href="/admin/primary/movies/new">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add New Movie
            </Button>
          </Link>
        </div>

        {/* Search */}
        <Card className="border-border bg-card mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-border text-foreground"
              />
            </div>
          </CardContent>
        </Card>

        {/* Movies Table */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Movie Catalog</CardTitle>
            <CardDescription>
              {filteredMovies.length} movies in total
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">Loading movies...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border">
                    <tr className="text-muted-foreground">
                      <th className="text-left py-3 px-4 font-semibold">
                        Title
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Genre
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Duration
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Age Rating
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMovies.map((movie) => (
                      <tr
                        key={movie.id}
                        className="border-b border-border/50 hover:bg-secondary/30"
                      >
                        <td className="py-3 px-4 text-foreground font-semibold flex items-center gap-2">
                          <Film className="w-4 h-4 text-primary" />
                          {movie.title}
                        </td>
                        <td className="py-3 px-4 text-foreground">
                          {movie.genre}
                        </td>
                        <td className="py-3 px-4 text-foreground">
                          {movie.duration} min
                        </td>
                        <td className="py-3 px-4 text-foreground">
                          {movie.ageRating}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            {/* Changed from Link to onClick Handler */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditClick(movie)}
                              className="border-border bg-secondary hover:bg-secondary/80"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {/* Delete Disabled */}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Edit Movie Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px] bg-card border-border text-foreground max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Movie</DialogTitle>
            <DialogDescription>
              Make changes to the movie details here. Click save when done.
            </DialogDescription>
          </DialogHeader>
          {editingMovie && (
            <form onSubmit={handleSaveEdit} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  value={editingMovie.title}
                  onChange={(e) =>
                    setEditingMovie({ ...editingMovie, title: e.target.value })
                  }
                  className="col-span-3 bg-secondary border-border"
                />
              </div>

              {/* Multi-value Genres */}
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">Genres</Label>
                <div className="col-span-3">
                  <div className="flex gap-2 mb-2">
                    <select
                      value={newGenre}
                      onChange={(e) => setNewGenre(e.target.value)}
                      className="flex-1 bg-secondary border border-border rounded px-3 py-2 text-sm"
                    >
                      <option value="">Select Genre</option>
                      <option value="Action">Action</option>
                      <option value="Drama">Drama</option>
                      <option value="Sci-Fi">Sci-Fi</option>
                      <option value="Comedy">Comedy</option>
                      <option value="Thriller">Thriller</option>
                      <option value="Romance">Romance</option>
                      <option value="Crime">Crime</option>
                      <option value="Other">Other</option>
                    </select>
                    <Button
                      type="button"
                      onClick={() => addItem(newGenre, "genres", setNewGenre)}
                      size="sm"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editingMovie.genres.map((g: string, idx: number) => (
                      <span
                        key={idx}
                        className="bg-primary/20 text-primary px-2 py-1 rounded text-xs flex items-center gap-1"
                      >
                        {g}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => removeItem(g, "genres")}
                        />
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Multi-value Actors */}
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">Actors</Label>
                <div className="col-span-3">
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newActor}
                      onChange={(e) => setNewActor(e.target.value)}
                      placeholder="Add actor"
                      className="flex-1 bg-secondary border-border text-sm"
                    />
                    <Button
                      type="button"
                      onClick={() => addItem(newActor, "actors", setNewActor)}
                      size="sm"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editingMovie.actors.map((a: string, idx: number) => (
                      <span
                        key={idx}
                        className="bg-primary/20 text-primary px-2 py-1 rounded text-xs flex items-center gap-1"
                      >
                        {a}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => removeItem(a, "actors")}
                        />
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="duration" className="text-right">
                  Duration
                </Label>
                <Input
                  id="duration"
                  type="number"
                  value={editingMovie.duration}
                  onChange={(e) =>
                    setEditingMovie({
                      ...editingMovie,
                      duration: Number(e.target.value),
                    })
                  }
                  className="col-span-3 bg-secondary border-border"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ageRating" className="text-right">
                  Rating
                </Label>
                <select
                  id="ageRating"
                  value={editingMovie.ageRating}
                  onChange={(e) =>
                    setEditingMovie({
                      ...editingMovie,
                      ageRating: e.target.value,
                    })
                  }
                  className="col-span-3 bg-secondary border border-border rounded px-3 py-2 text-sm"
                >
                  <option value="P">P</option>
                  <option value="K">K</option>
                  <option value="T13">T13</option>
                  <option value="T16">T16</option>
                  <option value="T18">T18</option>
                </select>
              </div>

              {/* Multi-value Formats */}
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">Formats</Label>
                <div className="col-span-3">
                  <div className="flex gap-2 mb-2">
                    <select
                      value={newFormat}
                      onChange={(e) => setNewFormat(e.target.value)}
                      className="flex-1 bg-secondary border border-border rounded px-3 py-2 text-sm"
                    >
                      <option value="">Select Format</option>
                      <option value="2D">2D</option>
                      <option value="3D">3D</option>
                      <option value="IMAX">IMAX</option>
                      <option value="4DX">4DX</option>
                    </select>
                    <Button
                      type="button"
                      onClick={() =>
                        addItem(newFormat, "formats", setNewFormat)
                      }
                      size="sm"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editingMovie.formats.map((f: string, idx: number) => (
                      <span
                        key={idx}
                        className="bg-primary/20 text-primary px-2 py-1 rounded text-xs flex items-center gap-1"
                      >
                        {f}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => removeItem(f, "formats")}
                        />
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Multi-value Subtitles */}
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">Subtitles</Label>
                <div className="col-span-3">
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newSubtitle}
                      onChange={(e) => setNewSubtitle(e.target.value)}
                      placeholder="Add subtitle"
                      className="flex-1 bg-secondary border-border text-sm"
                    />
                    <Button
                      type="button"
                      onClick={() =>
                        addItem(newSubtitle, "subtitles", setNewSubtitle)
                      }
                      size="sm"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editingMovie.subtitles.map((s: string, idx: number) => (
                      <span
                        key={idx}
                        className="bg-primary/20 text-primary px-2 py-1 rounded text-xs flex items-center gap-1"
                      >
                        {s}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => removeItem(s, "subtitles")}
                        />
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <select
                  id="status"
                  value={editingMovie.status}
                  onChange={(e) =>
                    setEditingMovie({ ...editingMovie, status: e.target.value })
                  }
                  className="col-span-3 bg-secondary border border-border rounded px-3 py-2 text-sm"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div> */}
              <DialogFooter>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
