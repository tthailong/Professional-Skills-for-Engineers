"use client";

import { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/app/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
  RotateCw, // Added for loading state
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { format } from "date-fns"; // Use date-fns for proper date parsing/formatting
import { API_BASE_URL } from "@/store/useUserStore";

// --- API Type Definitions ---
// Event type updated to match FastAPI's EventOut response keys (using snake_case in API)
export interface ApiEvent {
  Event_id: number; // Changed from string id to number
  Title: string;
  Image: string | null; // Renamed 'poster' to 'Image'
  Description: string;
  Start_date: string; // Date string format from API (e.g., '01/06/2025')
  End_date: string; // Date string format from API (e.g., '07/06/2025')
  Type: string;
}

// Event type used in the component's state (using camelCase for consistency)
export interface Event {
  id: string; // Will use Event_id, converted to string
  title: string;
  poster: string;
  description: string;
  startDate: string; // Date string (e.g., '2025-06-01')
  endDate: string; // Date string (e.g., '2025-06-07')
  status: "Upcoming" | "Ongoing" | "Completed" | "Ended";
  Type: string;
}

// Helper to convert API data to component state data and update status
const transformApiEvent = (apiEvent: ApiEvent): Event => {
  // Convert API date format 'dd/MM/yyyy' to 'yyyy-MM-dd' for easier JS Date parsing and Input component use
  const [startDay, startMonth, startYear] = apiEvent.Start_date.split("/");
  const startDateISO = `${startYear}-${startMonth}-${startDay}`;
  const [endDay, endMonth, endYear] = apiEvent.End_date.split("/");
  const endDateISO = `${endYear}-${endMonth}-${endDay}`;

  const status = getEventStatus(startDateISO, endDateISO);

  return {
    id: apiEvent.Event_id.toString(),
    title: apiEvent.Title,
    poster: apiEvent.Image || "/placeholder.svg?height=400&width=300", // Fallback if Image is null
    description: apiEvent.Description,
    startDate: startDateISO,
    endDate: endDateISO,
    status: status,
    Type: apiEvent.Type,
  };
};

// Event Status Logic (unchanged, but now accepts YYYY-MM-DD)
export const getEventStatus = (
  startDateStr: string,
  endDateStr: string
): "Upcoming" | "Ongoing" | "Completed" | "Ended" => {
  // Use date-fns for robust parsing, ensuring compatibility with YYYY-MM-DD
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const startDate = new Date(startDateStr);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(endDateStr);
  endDate.setHours(23, 59, 59, 999);

  if (now < startDate) {
    return "Upcoming";
  } else if (now >= startDate && now <= endDate) {
    return "Ongoing";
  } else {
    // Corrected to "Completed" as per original component logic, though 'Ended' was used in the function body
    return "Completed";
  }
};
// END OF HELPER FUNCTIONS AND TYPES

export default function EventsManagementPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true); // New state for loading
  const [error, setError] = useState<string | null>(null); // New state for error
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal & Editing State (Form logic removed for simplicity on API read page, but kept state for future expansion)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);

  // Form State (kept for handleSubmit/handleDelete placeholder)
  const [formData, setFormData] = useState({
    title: "",
    poster: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  // --- API Fetch Logic ---
  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Replace with your actual backend URL
      const response = await fetch(`${API_BASE_URL}/events`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiEvents: ApiEvent[] = await response.json();

      // Transform API data to component data structure
      const transformedEvents: Event[] = apiEvents.map(transformApiEvent);

      // Update the status for all fetched events (important if the backend doesn't handle status)
      const updatedEvents = transformedEvents.map((event) => ({
        ...event,
        status: getEventStatus(event.startDate, event.endDate),
      }));

      setEvents(updatedEvents);
    } catch (e: any) {
      setError("Failed to fetch events: " + e.message);
      toast.error("Failed to load events. Please check the API connection.");
      console.error(e);
      // Fallback to mock data on error (optional)
      // setEvents(initialEvents.map(event => ({...event, status: getEventStatus(event.startDate, event.endDate)})));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);
  // --- END API Fetch Logic ---

  // Filter Events
  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEvents = filteredEvents.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Handlers (kept mostly for completeness, but API call is read-only here)
  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Helper: Format date for display
  const formatDateDisplay = (dateStr: string) => {
    try {
      // dateStr is YYYY-MM-DD
      return format(new Date(dateStr), "dd/MM/yyyy");
    } catch (e) {
      return dateStr; // Fallback
    }
  };

  // Reset Form (kept for completeness)
  const resetForm = () => {
    setFormData({
      title: "",
      poster: "",
      description: "",
      startDate: "",
      endDate: "",
    });
    setIsEditing(false);
    setCurrentEventId(null);
  };

  // Handlers (kept for completeness)
  const openCreateModal = () => {
    // In a real app, this would open a dialog for creating a new event
    toast.info("Create modal is a placeholder in this example.");
  };

  const openEditModal = (event: Event) => {
    // In a real app, this would open a dialog for editing
    toast.info(`Editing event ${event.id} is a placeholder.`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for API POST/PUT logic
    toast.warning("Form submission is disabled in this API read-only example.");
    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    // Placeholder for API DELETE logic
    if (confirm(`Are you sure you want to delete event ${id}?`)) {
      toast.warning(
        `Deletion of event ${id} is disabled in this API read-only example.`
      );
    }
  };

  // --- Render Logic ---
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
          {/* Create Button (Placeholder) */}
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
                  setCurrentPage(1);
                }}
                className="pl-10 bg-secondary border-border text-foreground"
              />
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12 text-primary flex items-center justify-center gap-2">
            <RotateCw className="w-5 h-5 animate-spin" />
            Loading events...
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12 text-red-500 bg-red-500/10 border border-red-500/50 rounded-lg p-4">
            Error: {error}
          </div>
        )}

        {/* Events List Grid */}
        {!isLoading && !error && (
          <div className="grid gap-4 mb-6">
            {paginatedEvents.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No events found.
              </div>
            ) : (
              paginatedEvents.map((event) => {
                const currentStatus = event.status; // Status is already calculated on fetch

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
                        {event.poster.includes("placeholder") ? (
                          <div className="bg-primary/10 w-full h-full flex items-center justify-center">
                            <Film className="w-8 h-8 text-primary/40" />
                          </div>
                        ) : (
                          <img
                            src={event.poster}
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>

                      {/* Event Details */}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="hover:underline cursor-pointer">
                            <h3 className="font-bold text-lg">{event.title}</h3>
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${statusColor}`}
                          >
                            {currentStatus}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {event.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDateDisplay(event.startDate)} -{" "}
                            {formatDateDisplay(event.endDate)}
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium bg-red-500/50 text-white`}
                            >
                              {event.Type}
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 w-full md:w-auto justify-end mt-4 md:mt-0">
                        {/* View Details Link */}
                        <Link
                          href={`/events/${event.id}`}
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
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* Pagination Controls */}
        {filteredEvents.length > 0 && !isLoading && !error && (
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
