"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/app/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  Search,
  Eye,
  Image as ImageIcon,
  ChevronRight,
  ChevronLeft,
  Film,
} from "lucide-react";
import { toast } from "sonner";
import { useAdminStore } from "@/store/useAdminStore";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/store/useUserStore";

// Event Type Definition
export interface Event {
  id: string;
  title: string;
  poster: string;
  description: string;
  startDate: string;
  endDate: string;
  type: string; // Added Type
  status: "Upcoming" | "Ongoing" | "Completed";
}

export const getEventStatus = (startDateStr: string, endDateStr: string) => {
  // 1. Get current date and reset time to 00:00:00 for accurate comparison
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // 2. Parse Start Date (set to beginning of the day)
  const startDate = new Date(startDateStr);
  startDate.setHours(0, 0, 0, 0);

  // 3. Parse End Date (set to end of the day)
  // This ensures the event is still "Ongoing" throughout the entire end date.
  const endDate = new Date(endDateStr);
  endDate.setHours(23, 59, 59, 999);

  // 4. Apply Logic
  if (now < startDate) {
    return "Upcoming";
  } else if (now >= startDate && now <= endDate) {
    return "Ongoing";
  } else {
    return "Ended";
  }
};

export default function EventsManagementPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { admin } = useAdminStore();
  const router = useRouter();

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal & Editing State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    poster: "",
    description: "",
    startDate: "",
    endDate: "",
    type: "", // Added Type
  });

  // Fetch Events
  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/events/all`);
      if (!res.ok) throw new Error("Failed to fetch events");
      const data = await res.json();
      // Map backend data to frontend Event interface if needed,
      // but backend response already matches mostly.
      // Backend returns: id, title, poster, description, startDate, endDate, type, status
      // Ensure dates are string YYYY-MM-DD for input type="date" compatibility if needed,
      // or handle formatting. The backend returns string dates.

      const mappedEvents = data.map((e: any) => ({
        ...e,
        id: e.id.toString(), // Ensure ID is string for frontend consistency
        status: getEventStatus(e.startDate, e.endDate), // Recalculate status client-side
      }));
      setEvents(mappedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load events");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Filter Events
  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  // 2. Pagination Logic (Applied AFTER filtering)
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEvents = filteredEvents.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Handlers
  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Reset Form
  const resetForm = () => {
    setFormData({
      title: "",
      poster: "",
      description: "",
      startDate: "",
      endDate: "",
      type: "",
    });
    setIsEditing(false);
    setCurrentEventId(null);
  };

  // Handlers
  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (event: Event) => {
    // Format dates for input type="date" (YYYY-MM-DD)
    // Assuming event.startDate is YYYY-MM-DD or similar parsable
    const formatDate = (dateStr: string) => {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      return date.toISOString().split("T")[0];
    };

    setFormData({
      title: event.title,
      poster: event.poster,
      description: event.description,
      startDate: formatDate(event.startDate),
      endDate: formatDate(event.endDate),
      type: event.type,
    });
    setCurrentEventId(event.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const formatDateForBackend = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title: formData.title,
      description: formData.description,
      image: formData.poster,
      type: formData.type,
      start_date: formatDateForBackend(formData.startDate),
      end_date: formatDateForBackend(formData.endDate),
      admin_id: admin?.id || 1,
    };

    try {
      let url = `${API_BASE_URL}/admin/events/create`;
      let method = "POST";

      if (isEditing && currentEventId) {
        url = `${API_BASE_URL}/admin/events/update/${currentEventId}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to save event");
      }

      toast.success(
        isEditing ? "Event updated successfully" : "Event created successfully"
      );
      fetchEvents(); // Refresh list
      setIsModalOpen(false);
      resetForm();
    } catch (error: any) {
      console.error("Save event error:", error);
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/events/delete/${id}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || "Failed to delete event");
        }

        toast.success("Event deleted");
        fetchEvents();
      } catch (error: any) {
        console.error("Delete event error:", error);
        toast.error(error.message);
      }
    }
  };
  if (!admin) {
    // router.push("/auth/admin-login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Calendar className="w-8 h-8 text-primary" />
              Event Management
            </h1>
            <p className="text-muted-foreground">
              Manage cinema events and screenings
            </p>
          </div>

          {/* Create/Edit Dialog */}
          <Dialog
            open={isModalOpen}
            onOpenChange={(open) => {
              setIsModalOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button
                onClick={openCreateModal}
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              >
                <Plus className="w-4 h-4" /> Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-card border-border">
              <DialogHeader>
                <DialogTitle>
                  {isEditing ? "Edit Event" : "Create New Event"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="bg-secondary border-border"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Event Type</Label>
                  <Input
                    id="type"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    placeholder="e.g. Festival, Marathon, Special Screening"
                    className="bg-secondary border-border"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="poster">Poster URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="poster"
                      value={formData.poster}
                      onChange={(e) =>
                        setFormData({ ...formData, poster: e.target.value })
                      }
                      className="bg-secondary border-border"
                      required
                    />
                    <Button type="button" variant="outline" size="icon">
                      <ImageIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="start">Start Date</Label>
                    <Input
                      id="start"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      className="bg-secondary border-border"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="end">End Date</Label>
                    <Input
                      id="end"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                      className="bg-secondary border-border"
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="flex min-h-[80px] w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    required
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isEditing ? "Save Changes" : "Create Event"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search Bar */}
        <Card className="border-border bg-card mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to page 1 on search
                }}
                className="pl-10 bg-secondary border-border text-foreground"
              />
            </div>
          </CardContent>
        </Card>

        {/* Events List Grid */}
        <div className="grid gap-4 mb-6">
          {paginatedEvents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No events found.
            </div>
          ) : (
            paginatedEvents.map((event) => {
              const currentStatus = getEventStatus(
                event.startDate,
                event.endDate
              );

              // Define colors based on status
              const statusColor =
                currentStatus === "Upcoming"
                  ? "bg-blue-500/20 text-blue-500"
                  : currentStatus === "Ongoing"
                  ? "bg-green-500/20 text-green-500"
                  : "bg-gray-500/20 text-gray-500"; // For "Completed"
              return (
                <Card
                  key={event.id}
                  className="border-border bg-card hover:bg-card/80 transition"
                >
                  <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center gap-6">
                    {/* Poster Thumbnail */}
                    <div className="w-full md:w-24 h-24 shrink-0 bg-secondary rounded-lg overflow-hidden flex items-center justify-center">
                      {event.poster && event.poster.includes("placeholder") ? (
                        <div className="bg-primary/10 w-full h-full flex items-center justify-center">
                          <Film className="w-8 h-8 text-primary/40" />
                        </div>
                      ) : (
                        <img
                          src={event.poster}
                          alt={event.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback if image fails
                            e.currentTarget.src =
                              "/placeholder.svg?height=400&width=300";
                          }}
                        />
                      )}
                    </div>

                    {/* Event Details */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-3">
                        {/* Replaced Link with a standard anchor/span for preview */}
                        <span className="hover:underline cursor-pointer">
                          <h3 className="font-bold text-lg">{event.title}</h3>
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${statusColor}`}
                        >
                          {currentStatus}
                        </span>
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-secondary text-foreground border border-border">
                          {event.type}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {event.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {event.startDate} -{" "}
                          {event.endDate}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 w-full md:w-auto justify-end mt-4 md:mt-0">
                      <Link
                        href={`/admin/primary/events/${event.id}`}
                        className="hover:underline"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 border-border bg-secondary hover:bg-secondary/80"
                        >
                          <Eye className="w-4 h-4 mr-2" /> View
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 border-blue-500/30 text-blue-500 hover:bg-blue-500/10 bg-transparent"
                        onClick={() => openEditModal(event)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 border-destructive/30 text-destructive hover:bg-destructive/10 bg-transparent"
                        onClick={() => handleDelete(event.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Pagination Controls */}
        {filteredEvents.length > 0 && (
          <div className="flex items-center justify-between border-t border-border pt-4">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to{" "}
              {Math.min(startIndex + itemsPerPage, filteredEvents.length)} of{" "}
              {filteredEvents.length} entries
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm font-medium text-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
