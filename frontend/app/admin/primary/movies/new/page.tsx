"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/app/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Add New Movie
        </h1>
        <p className="text-muted-foreground mb-8">
          Fill in the movie details below
        </p>

        <div className="w-full">
          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image URL Section */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Movie Poster URL
                  </label>
                  <div className="flex gap-4 items-start">
                    <div className="flex-1">
                      <div className="relative">
                        <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          name="image"
                          value={formData.image}
                          onChange={handleChange}
                          placeholder="https://example.com/poster.jpg"
                          className="pl-9 bg-secondary border-border text-foreground"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Enter a direct link to the movie poster image
                      </p>
                    </div>

                    {/* Preview */}
                    {formData.image && (
                      <div className="w-32 h-48 rounded-lg overflow-hidden border border-border bg-secondary flex-shrink-0">
                        <img
                          src={formData.image}
                          alt="Poster preview"
                          className="w-full h-full object-cover"
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Movie Title
                    </label>
                    <Input
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Enter movie title"
                      className="bg-secondary border-border text-foreground"
                      required
                    />
                  </div>

                  {/* Multi-value Genre */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Genres
                    </label>
                    <div className="flex gap-2 mb-2">
                      <select
                        value={newGenre}
                        onChange={(e) => setNewGenre(e.target.value)}
                        className="flex-1 bg-secondary border border-border rounded px-3 py-2 text-foreground"
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
                        size="sm"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {genres.map((g, idx) => (
                        <span
                          key={idx}
                          className="bg-primary/20 text-primary px-2 py-1 rounded text-xs flex items-center gap-1"
                        >
                          {g}
                          <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={() => removeItem(g, genres, setGenres)}
                          />
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Director
                    </label>
                    <Input
                      name="director"
                      value={formData.director}
                      onChange={handleChange}
                      placeholder="Director name"
                      className="bg-secondary border-border text-foreground"
                    />
                  </div>

                  {/* Multi-value Actor */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Actors
                    </label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={newActor}
                        onChange={(e) => setNewActor(e.target.value)}
                        placeholder="Add actor"
                        className="flex-1 bg-secondary border-border text-foreground"
                      />
                      <Button
                        type="button"
                        onClick={() =>
                          addItem(newActor, actors, setActors, setNewActor)
                        }
                        size="sm"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {actors.map((a, idx) => (
                        <span
                          key={idx}
                          className="bg-primary/20 text-primary px-2 py-1 rounded text-xs flex items-center gap-1"
                        >
                          {a}
                          <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={() => removeItem(a, actors, setActors)}
                          />
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Duration (minutes)
                    </label>
                    <Input
                      name="duration"
                      type="number"
                      min="1"
                      value={formData.duration}
                      onChange={handleChange}
                      placeholder="120"
                      className="bg-secondary border-border text-foreground"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Age Rating
                    </label>
                    <select
                      name="ageRating"
                      value={formData.ageRating}
                      onChange={handleChange}
                      className="w-full bg-secondary border border-border rounded px-3 py-2 text-foreground"
                    >
                      <option value="P">P - General Audience</option>
                      <option value="K">K - Under 13 with Guardian</option>
                      <option value="T13">T13 - 13+</option>
                      <option value="T16">T16 - 16+</option>
                      <option value="T18">T18 - 18+</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Language
                    </label>
                    <Input
                      name="language"
                      value={formData.language}
                      onChange={handleChange}
                      placeholder="e.g., English, Hindi, Tamil"
                      className="bg-secondary border-border text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Release Date
                    </label>
                    <Input
                      name="release_date"
                      type="date"
                      value={formData.release_date}
                      onChange={handleChange}
                      className="bg-secondary border-border text-foreground"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Multi-value Format */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Formats
                    </label>
                    <div className="flex gap-2 mb-2">
                      <select
                        value={newFormat}
                        onChange={(e) => setNewFormat(e.target.value)}
                        className="flex-1 bg-secondary border border-border rounded px-3 py-2 text-foreground"
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
                        size="sm"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formats.map((f, idx) => (
                        <span
                          key={idx}
                          className="bg-primary/20 text-primary px-2 py-1 rounded text-xs flex items-center gap-1"
                        >
                          {f}
                          <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={() => removeItem(f, formats, setFormats)}
                          />
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Multi-value Subtitle */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Subtitles
                    </label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={newSubtitle}
                        onChange={(e) => setNewSubtitle(e.target.value)}
                        placeholder="Add subtitle"
                        className="flex-1 bg-secondary border-border text-foreground"
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
                        size="sm"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {subtitles.map((s, idx) => (
                        <span
                          key={idx}
                          className="bg-primary/20 text-primary px-2 py-1 rounded text-xs flex items-center gap-1"
                        >
                          {s}
                          <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={() =>
                              removeItem(s, subtitles, setSubtitles)
                            }
                          />
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter movie description..."
                    rows={4}
                    className="w-full bg-secondary border border-border rounded px-3 py-2 text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                {error && (
                  <div className="bg-destructive/20 border border-destructive text-destructive p-3 rounded flex items-center gap-2 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={submitted}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {submitted ? "Saving..." : "Add Movie"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => router.back()}
                    variant="outline"
                    className="border-border text-foreground hover:bg-card"
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
