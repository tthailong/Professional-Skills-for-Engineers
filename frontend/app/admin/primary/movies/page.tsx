"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/app/navbar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Trash2, Plus, Search, Film, Save, X, Loader2 } from "lucide-react";
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
    movie.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // 4. Handlers
  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/movies/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to delete movie");
      }

      // Refresh list
      fetchMovies();
      alert("Movie deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting movie:", error);
      alert(`Error: ${error.message}`);
    }
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
        (item: string) => item !== itemToRemove,
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
    <div className="min-h-screen bg-background relative overflow-hidden text-foreground">
      {/* Aurora Blurs */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] -z-10" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[40%] rounded-full bg-accent/5 blur-[120px] -z-10" />
      
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-[var(--foreground)] to-[var(--primary)] bg-clip-text text-transparent mb-2 flex items-center gap-3">
              <Film className="w-9 h-9 text-primary" />
              Manage Movies
            </h1>
            <p className="text-muted-foreground">
              Add, edit, or remove movies from your catalog
            </p>
          </div>
          {/* Note: You can keep the Add button as a separate page if you prefer */}
          <Link href="/admin/primary/movies/new">
            <Button className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2 rounded-xl shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4" />
              Add New Movie
            </Button>
          </Link>
        </div>

        {/* Search */}
        <Card className="border border-border/50 bg-card/80 backdrop-blur-xl rounded-2xl shadow-xl mb-8 overflow-hidden">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-primary" />
              <Input
                placeholder="Search movies by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 bg-muted border-border text-foreground h-11 rounded-xl shadow-inner placeholder:text-muted-foreground"
              />
            </div>
          </CardContent>
        </Card>

        {/* Movies Table */}
        <Card className="border border-border/50 bg-card/80 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
            <CardTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
               <Film className="w-5 h-5 text-primary" /> Movie Catalog
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {filteredMovies.length} movies in total
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="text-center p-12 text-muted-foreground flex justify-center items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-primary" /> Loading movies...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 text-left text-xs font-bold uppercase text-muted-foreground tracking-wider border-b border-border/50">
                      <th className="p-4">Title</th>
                      <th className="p-4">Genre</th>
                      <th className="p-4">Duration</th>
                      <th className="p-4">Age Rating</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {filteredMovies.map((movie) => (
                      <tr
                        key={movie.id}
                        className="hover:bg-muted/50 transition-colors group"
                      >
                        <td className="p-4 text-foreground font-bold flex items-center gap-3">
                          <Film className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                          {movie.title}
                        </td>
                        <td className="p-4 text-foreground/80">
                          {movie.genre}
                        </td>
                        <td className="p-4 text-foreground/80">
                          {movie.duration} min
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                            {movie.ageRating}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex gap-2">
                            {/* Changed from Link to onClick Handler */}
                             <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditClick(movie)}
                              className="border-border/50 bg-muted/20 hover:bg-muted text-foreground rounded-xl h-9 w-9 p-0"
                            >
                              <Edit className="w-4 h-4 text-primary" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                 <Button
                                  size="sm"
                                  variant="destructive"
                                  className="bg-destructive/10 hover:bg-destructive text-destructive hover:text-white border border-destructive/20 rounded-xl h-9 w-9 p-0 transition-all"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-card border border-border/50 shadow-2xl rounded-2xl">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Are you absolutely sure?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will
                                    permanently delete the movie "
                                    {movie.title}" from the catalog.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                 <AlertDialogFooter>
                                  <AlertDialogCancel className="bg-muted border-border font-bold rounded-xl text-foreground">
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(movie.id)}
                                    className="bg-destructive hover:bg-destructive/90 text-white font-bold rounded-xl"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
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
        <DialogContent className="sm:max-w-[700px] bg-card border border-border/50 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto p-0 overflow-hidden">
          <div className="p-6 bg-muted/30 border-b border-border/50">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-primary">Edit Movie Catalog</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Update cinematic production details. Click save when done.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-6">
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
                    className="col-span-3 bg-muted border-border text-foreground rounded-xl"
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
                      className="flex-1 bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground"
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
                      className="rounded-xl bg-primary hover:bg-primary/90 text-white"
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
                      className="flex-1 bg-muted border-border text-foreground rounded-xl text-sm"
                    />
                    <Button
                      type="button"
                      onClick={() => addItem(newActor, "actors", setNewActor)}
                      className="rounded-xl bg-primary hover:bg-primary/90 text-white"
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
                  className="col-span-3 bg-muted border-border text-foreground rounded-xl"
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
                      className="flex-1 bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground"
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
                      className="rounded-xl bg-primary hover:bg-primary/90 text-white"
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
                      className="flex-1 bg-muted border-border text-foreground rounded-xl text-sm"
                    />
                    <Button
                      type="button"
                      onClick={() =>
                        addItem(newSubtitle, "subtitles", setNewSubtitle)
                      }
                      className="rounded-xl bg-primary hover:bg-primary/90 text-white"
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
               <DialogFooter className="mt-6">
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-white font-bold px-8 rounded-xl h-11 shadow-lg shadow-primary/20"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
