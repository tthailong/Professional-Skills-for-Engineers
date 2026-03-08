"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/app/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Save, X, Plus, Link as LinkIcon } from "lucide-react";
import { useAdminStore } from "@/store/useAdminStore";
import { API_BASE_URL } from "@/store/useUserStore";

export default function NewMoviePage() {
  const router = useRouter();
  const { admin } = useAdminStore();

  const [formData, setFormData] = useState({
    title: "",
    director: "",
    duration: "",
    ageRating: "P", // Default to P
    description: "",
    language: "",
    release_date: "",
    image: "", // Changed to store URL string
  });

  // Multi-value states
  const [genres, setGenres] = useState<string[]>([]);
  const [actors, setActors] = useState<string[]>([]);
  const [formats, setFormats] = useState<string[]>([]);
  const [subtitles, setSubtitles] = useState<string[]>([]);

  // Input states for adding new values
  const [newGenre, setNewGenre] = useState("");
  const [newActor, setNewActor] = useState("");
  const [newFormat, setNewFormat] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");

  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Helper to add item to list
  const addItem = (
    item: string,
    list: string[],
    setList: Function,
    setInput: Function,
  ) => {
    if (item.trim() && !list.includes(item.trim())) {
      setList([...list, item.trim()]);
      setInput("");
    }
  };

  // Helper to remove item from list
  const removeItem = (
    itemToRemove: string,
    list: string[],
    setList: Function,
  ) => {
    setList(list.filter((item) => item !== itemToRemove));
  };

  const validateForm = () => {
    setError("");

    if (!formData.title) {
      setError("Movie title is required");
      return false;
    }
    if (Number.parseInt(formData.duration) <= 0) {
      setError("Duration must be greater than 0 minutes");
      return false;
    }
    if (genres.length === 0) {
      setError("Please add at least one genre");
      return false;
    }
    if (!formData.release_date) {
      setError("Release date is required");
      return false;
    }
    return true;
  };

  const formatDateForBackend = (dateString: string) => {
    if (!dateString) return "01/01/2024";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "01/01/2024";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitted(true);

    try {
      const payload = {
        director: formData.director || "Unknown",
        title: formData.title,
        image: formData.image || null,
        release_date: formatDateForBackend(formData.release_date),
        language: formData.language || "English",
        age_rating: formData.ageRating,
        duration: Number(formData.duration),
        description: formData.description || "",
        admin_id: admin?.id || 1,
        actor: actors.join(","),
        format: formats.join(","),
        subtitle: subtitles.join(","),
        genres: genres.join(","),
      };

      const res = await fetch(`${API_BASE_URL}/admin/movies/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to create movie");
      }

      alert(`Movie "${formData.title}" added successfully!`);
      router.push("/admin/primary/movies");
    } catch (err: any) {
      console.error("Error creating movie:", err);
      setError(err.message);
      setSubmitted(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden text-foreground selection:bg-primary/20 transition-colors duration-500">
      {/* Aurora Blurs */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] -z-10" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[35%] h-[40%] rounded-full bg-accent/5 blur-[120px] -z-10" />

      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-[var(--foreground)] to-[var(--primary)] bg-clip-text text-transparent mb-2">
            New Movie Registry
          </h1>
          <p className="text-muted-foreground font-medium mb-12">
            Configure metadata and assets for global theatrical distribution.
          </p>
        </motion.div>

        <div className="w-full">
          <Card className="border-none bg-card/80 backdrop-blur-md rounded-[2.5rem] shadow-2xl border border-border/50">
            <CardContent className="p-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image URL Section */}
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                    Movie Poster URL
                  </Label>
                  <div className="flex gap-8 items-start">
                    <div className="flex-1 space-y-4">
                      <div className="relative group">
                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary group-focus-within:scale-110 transition-transform" />
                        <Input
                          name="image"
                          value={formData.image}
                          onChange={handleChange}
                          placeholder="https://example.com/poster.jpg"
                          className="pl-12 h-14 rounded-2xl bg-muted/50 border-border text-foreground text-lg placeholder:text-muted-foreground"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground font-medium italic">
                        Enter a high-resolution direct link for the primary display asset.
                      </p>
                    </div>

                    {/* Preview Card */}
                    {formData.image && (
                      <div className="w-32 h-48 rounded-[1.5rem] overflow-hidden border-4 border-muted shadow-xl flex-shrink-0 group">
                        <img
                          src={formData.image}
                          alt="Poster preview"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://placehold.co/200x300?text=Invalid+URL";
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Existing Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-border/30">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                      Production Title
                    </Label>
                    <Input
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g. Interstellar Chronicles"
                      className="h-14 rounded-2xl bg-muted/50 border-border text-foreground text-lg font-bold"
                      required
                    />
                  </div>

                  {/* Multi-value Genre */}
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                      Genres
                    </Label>
                    <div className="flex gap-3">
                      <select
                        value={newGenre}
                        onChange={(e) => setNewGenre(e.target.value)}
                        className="flex-1 h-14 bg-muted/50 border border-border rounded-2xl px-4 text-foreground font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
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
                        onClick={() =>
                          addItem(newGenre, genres, setGenres, setNewGenre)
                        }
                        className="h-14 w-14 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all active:scale-95"
                      >
                        <Plus className="w-5 h-5" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {genres.map((g, idx) => (
                        <span
                          key={idx}
                          className="bg-primary/10 text-primary px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 border border-primary/20 hover:bg-primary/20 transition-colors"
                        >
                          {g}
                          <X
                            className="w-3.5 h-3.5 cursor-pointer hover:scale-125 transition-transform"
                            onClick={() => removeItem(g, genres, setGenres)}
                          />
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                      Director
                    </Label>
                    <Input
                      name="director"
                      value={formData.director}
                      onChange={handleChange}
                      placeholder="Lead Director Name"
                      className="h-14 rounded-2xl bg-muted/50 border-border text-foreground font-bold"
                    />
                  </div>

                  {/* Multi-value Actor */}
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                      Cast Members
                    </Label>
                    <div className="flex gap-3">
                      <Input
                        value={newActor}
                        onChange={(e) => setNewActor(e.target.value)}
                        placeholder="e.g. Matthew McConaughey"
                        className="h-14 rounded-2xl bg-muted/50 border-border text-foreground font-bold"
                      />
                      <Button
                        type="button"
                        onClick={() =>
                          addItem(newActor, actors, setActors, setNewActor)
                        }
                        className="h-14 w-14 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all active:scale-95"
                      >
                        <Plus className="w-5 h-5" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {actors.map((a, idx) => (
                        <span
                          key={idx}
                          className="bg-muted text-muted-foreground px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 border border-border/50 hover:bg-muted/80 transition-colors"
                        >
                          {a}
                          <X
                            className="w-3.5 h-3.5 cursor-pointer hover:scale-125 transition-transform"
                            onClick={() => removeItem(a, actors, setActors)}
                          />
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                      Run Time (Min)
                    </Label>
                    <Input
                      name="duration"
                      type="number"
                      min="1"
                      value={formData.duration}
                      onChange={handleChange}
                      placeholder="120"
                      className="h-14 rounded-2xl bg-muted/50 border-border text-foreground font-black text-xl"
                      required
                    />
                  </div>
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                      MPC Rating
                    </Label>
                    <select
                      name="ageRating"
                      value={formData.ageRating}
                      onChange={handleChange}
                      className="w-full h-14 bg-muted/50 border border-border rounded-2xl px-4 text-foreground font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    >
                      <option value="P">P - General Audience</option>
                      <option value="K">K - Under 13 with Guardian</option>
                      <option value="T13">T13 - 13+</option>
                      <option value="T16">T16 - 16+</option>
                      <option value="T18">T18 - 18+</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                      Audio/Locales
                    </Label>
                    <Input
                      name="language"
                      value={formData.language}
                      onChange={handleChange}
                      placeholder="e.g. English, Vietnamese (Sub)"
                      className="h-14 rounded-2xl bg-muted/50 border-border text-foreground font-bold"
                    />
                  </div>
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                      Theatrical Release
                    </Label>
                    <Input
                      name="release_date"
                      type="date"
                      value={formData.release_date}
                      onChange={handleChange}
                      className="h-14 rounded-2xl bg-muted/50 border-border text-foreground font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                      Theatrical Formats
                    </Label>
                    <div className="flex gap-3">
                      <select
                        value={newFormat}
                        onChange={(e) => setNewFormat(e.target.value)}
                        className="flex-1 h-14 bg-muted/50 border border-border rounded-2xl px-4 text-foreground font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
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
                          addItem(newFormat, formats, setFormats, setNewFormat)
                        }
                        className="h-14 w-14 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all active:scale-95"
                      >
                        <Plus className="w-5 h-5" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {formats.map((f, idx) => (
                        <span
                          key={idx}
                          className="bg-primary/10 text-primary px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 border border-primary/20 hover:bg-primary/20 transition-colors"
                        >
                          {f}
                          <X
                            className="w-3.5 h-3.5 cursor-pointer hover:scale-125 transition-transform"
                            onClick={() => removeItem(f, formats, setFormats)}
                          />
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                      Subtitles
                    </Label>
                    <div className="flex gap-3">
                      <Input
                        value={newSubtitle}
                        onChange={(e) => setNewSubtitle(e.target.value)}
                        placeholder="Add localized sub"
                        className="h-14 rounded-2xl bg-muted/50 border-border text-foreground font-bold"
                      />
                      <Button
                        type="button"
                        onClick={() =>
                          addItem(
                            newSubtitle,
                            subtitles,
                            setSubtitles,
                            setNewSubtitle,
                          )
                        }
                        className="h-14 w-14 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all active:scale-95"
                      >
                        <Plus className="w-5 h-5" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {subtitles.map((s, idx) => (
                        <span
                          key={idx}
                          className="bg-muted text-muted-foreground px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 border border-border/50 hover:bg-muted/80 transition-colors"
                        >
                          {s}
                          <X
                            className="w-3.5 h-3.5 cursor-pointer hover:scale-125 transition-transform"
                            onClick={() =>
                              removeItem(s, subtitles, setSubtitles)
                            }
                          />
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                    Production Brief / Description
                  </Label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter comprehensive movie description..."
                    rows={6}
                    className="w-full bg-muted/50 border border-border rounded-2xl p-4 text-foreground text-lg font-medium placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  />
                </div>

                {error && (
                  <div className="bg-destructive/20 border border-destructive text-destructive p-3 rounded flex items-center gap-2 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <div className="flex gap-4 pt-8 border-t border-border/30">
                  <Button
                    type="submit"
                    disabled={submitted}
                    className="flex-1 h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                  >
                    <Save className="w-5 h-5" />
                    {submitted ? "Syncing Logic..." : "Deploy Production"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => router.back()}
                    variant="outline"
                    className="h-16 px-10 rounded-2xl border-border bg-muted/20 font-black hover:bg-primary hover:text-white transition-all shadow-sm"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
