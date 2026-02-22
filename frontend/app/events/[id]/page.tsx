"use client";

import { Navbar } from "@/app/navbar";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Calendar, RotateCw } from "lucide-react"; // Added RotateCw for loading
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
// Import types and getEventStatus helper from the list page
import { Event, ApiEvent, getEventStatus } from "../page";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { API_BASE_URL } from "@/store/useUserStore";

// Helper to convert API date format 'dd/MM/yyyy' to 'yyyy-MM-dd'
const convertApiDateToIso = (dateStr: string): string => {
  try {
    const [day, month, year] = dateStr.split("/");
    if (day && month && year) {
      return `${year}-${month}-${day}`;
    }
  } catch (e) {
    console.error("Failed to parse date string:", dateStr);
  }
  return dateStr; // Return original string as fallback
};

// Helper to transform a single API event response
const transformSingleApiEvent = (apiEvent: ApiEvent): Event => {
  const startDateISO = convertApiDateToIso(apiEvent.Start_date);
  const endDateISO = convertApiDateToIso(apiEvent.End_date);

  const status = getEventStatus(startDateISO, endDateISO);

  return {
    id: apiEvent.Event_id.toString(),
    title: apiEvent.Title,
    poster: apiEvent.Image || "/placeholder.svg?height=400&width=300",
    description: apiEvent.Description,
    startDate: startDateISO,
    endDate: endDateISO,
    status: status,
    Type: apiEvent.Type,
  };
};

export default function EventDetailsPage() {
  const params = useParams();
  // Ensure the ID is a string, which is what useParams returns
  const eventId = typeof params.id === "string" ? params.id : null;

  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true); // New state for loading
  const [error, setError] = useState<string | null>(null); // New state for error

  const fetchEventDetails = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    setEvent(null); // Clear previous event

    try {
      // API call to GET /events/{event_id}
      const response = await fetch(`${API_BASE_URL}/events/${id}`);

      if (response.status === 404) {
        setError("Event not found (404)");
        toast.error(`Event with ID ${id} not found.`);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const apiEvent: ApiEvent = await response.json();

      // Transform API data to component data structure
      const transformedEvent = transformSingleApiEvent(apiEvent);

      setEvent(transformedEvent);
    } catch (e: any) {
      const errorMessage = e.message || "An unknown error occurred.";
      setError(errorMessage);
      toast.error(`Failed to load event details: ${errorMessage}`);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (eventId) {
      // Check if eventId is a string and is not null
      fetchEventDetails(eventId);
    } else if (params.id) {
      // Handle case where params.id is present but not a simple string (e.g., string array)
      setError("Invalid event ID format.");
      setIsLoading(false);
    } else {
      // Handle case where params.id is missing entirely
      setError("No event ID provided in the URL.");
      setIsLoading(false);
    }
  }, [eventId, fetchEventDetails, params.id]); // eventId is the derived dependency

  // Helper to format date for display (DD/MM/YYYY)
  const formatDateDisplay = (dateStr: string) => {
    try {
      // dateStr is YYYY-MM-DD
      return format(new Date(dateStr), "dd/MM/yyyy");
    } catch (e) {
      return dateStr; // Fallback
    }
  };

  // Helper to determine status badge styling (unchanged)
  const getStatusColor = (status: string) => {
    if (status === "Upcoming")
      return "bg-blue-500/20 text-blue-500 border-blue-500/20";
    if (status === "Ongoing")
      return "bg-green-500/20 text-green-500 border-green-500/20";
    return "bg-gray-500/20 text-gray-400 border-gray-500/20"; // Ended/Completed
  };

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4 text-primary flex items-center gap-2">
            <RotateCw className="w-6 h-6 animate-spin" />
            <h2 className="text-2xl font-bold">Loading Event Details...</h2>
          </div>
        </div>
      </div>
    );
  }

  // --- Not Found/Error State ---
  if (!event || error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              {error ? "Error Loading Event" : "Event Not Found"}
            </h2>
            <p className="text-muted-foreground">
              {error ||
                "The event you are looking for does not exist or has been removed."}
            </p>
            <Link href="/events" passHref>
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Events
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- Event Details Render ---
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Back Navigation */}
        <Link
          href="/events"
          className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors"
          passHref
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events List
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Left Column: Poster */}
          <div className="md:col-span-1">
            <Card className="border-border bg-card overflow-hidden shadow-2xl sticky top-24">
              <div className="aspect-2/3 relative">
                <img
                  src={event.poster}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </Card>
          </div>

          {/* Right Column: Details */}
          <div className="md:col-span-2 flex flex-col justify-center">
            <div className="space-y-8">
              <div>
                <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
                  {event.title}
                </h1>

                {/* Status and Date Section */}
                <div className="flex flex-wrap items-center gap-6 border-b border-border pb-6">
                  {/* Status Badge */}
                  <span
                    className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-wide border ${getStatusColor(
                      event.status,
                    )}`}
                  >
                    {event.status}
                  </span>

                  {/* Date Range */}
                  <div className="flex items-center gap-2 text-lg">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span className="font-medium text-foreground">
                      {formatDateDisplay(event.startDate)}
                    </span>
                    <span className="text-muted-foreground/50 mx-1">—</span>
                    <span className="font-medium text-foreground">
                      {formatDateDisplay(event.endDate)}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-base font-medium bg-red-500/50 text-white`}
                    >
                      {event.Type}
                    </span>
                  </div>
                </div>
              </div>

              <div className="prose prose-invert max-w-none">
                <h3 className="text-2xl font-semibold text-primary mb-4">
                  About This Event
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
