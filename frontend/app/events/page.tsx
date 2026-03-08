"use client";

import { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/app/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  Search,
  Eye,
  Film,
  ChevronRight,
  ChevronLeft,
  RotateCw,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { format } from "date-fns";
import { API_BASE_URL } from "@/store/useUserStore";

export interface ApiEvent {
  Event_id: number;
  Title: string;
  Image: string | null;
  Description: string;
  Start_date: string;
  End_date: string;
  Type: string;
}

export interface Event {
  id: string;
  title: string;
  poster: string;
  description: string;
  startDate: string;
  endDate: string;
  status: "Upcoming" | "Ongoing" | "Completed" | "Ended";
  Type: string;
}

const transformApiEvent = (apiEvent: ApiEvent): Event => {
  const [sd, sm, sy] = apiEvent.Start_date.split("/");
  const [ed, em, ey] = apiEvent.End_date.split("/");

  const startISO = `${sy}-${sm}-${sd}`;
  const endISO = `${ey}-${em}-${ed}`;

  return {
    id: apiEvent.Event_id.toString(),
    title: apiEvent.Title,
    poster: apiEvent.Image || "/placeholder.svg?height=400&width=300",
    description: apiEvent.Description,
    startDate: startISO,
    endDate: endISO,
    status: getEventStatus(startISO, endISO),
    Type: apiEvent.Type,
  };
};

export const getEventStatus = (
  startDateStr: string,
  endDateStr: string,
): "Upcoming" | "Ongoing" | "Completed" | "Ended" => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const start = new Date(startDateStr);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDateStr);
  end.setHours(23, 59, 59, 999);

  if (now < start) return "Upcoming";
  if (now >= start && now <= end) return "Ongoing";
  return "Completed";
};

export default function EventsManagementPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/events`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const apiEvents: ApiEvent[] = await res.json();
      const mapped = apiEvents.map(transformApiEvent);

      setEvents(
        mapped.map((e) => ({
          ...e,
          status: getEventStatus(e.startDate, e.endDate),
        })),
      );
    } catch (e: any) {
      setError(e.message);
      toast.error("Failed to load events.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEvents = filteredEvents.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handlePrevious = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  const formatDateDisplay = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "dd/MM/yyyy");
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden text-foreground">
      {/* Aurora Blurs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent/5 blur-[120px] -z-10" />
      <Navbar />

      <main className="container mx-auto px-4 py-10">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
              <Calendar className="w-9 h-9 text-primary" />
              Event Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage cinema events and screenings
            </p>
          </div>
        </div>

        {/* SEARCH */}
        <Card className="mb-8 rounded-2xl border border-border/50 bg-card/70 backdrop-blur-xl shadow-lg">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-primary" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 bg-muted border-border focus-visible:ring-primary text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </CardContent>
        </Card>

        {/* LOADING */}
        {isLoading && (
          <div className="py-16 flex justify-center items-center gap-3 text-primary font-medium">
            <RotateCw className="animate-spin w-5 h-5" />
            Loading events...
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="text-center py-10 rounded-xl bg-red-50 text-red-500 border border-red-200">
            Error: {error}
          </div>
        )}

        {/* LIST */}
        {!isLoading && !error && (
          <div className="grid gap-6 mb-8">
            {paginatedEvents.length === 0 ? (
              <div className="text-center text-muted-foreground py-16">
                No events found.
              </div>
            ) : (
              paginatedEvents.map((event) => {
                const statusColor =
                  event.status === "Upcoming"
                    ? "bg-blue-500/10 text-blue-500"
                    : event.status === "Ongoing"
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-muted text-muted-foreground";

                return (
                  <Card
                    key={event.id}
                    className="group rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <CardContent className="p-5 flex flex-col md:flex-row gap-6 items-center">
                      {/* POSTER */}
                      <div className="w-full md:w-28 h-28 rounded-xl overflow-hidden bg-muted flex items-center justify-center">
                        {event.poster.includes("placeholder") ? (
                          <Film className="w-10 h-10 text-muted-foreground/30" />
                        ) : (
                          <img
                            src={event.poster}
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>

                      {/* INFO */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg group-hover:text-primary transition">
                            {event.title}
                          </h3>
                          <span
                            className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor}`}
                          >
                            {event.status}
                          </span>
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {event.description}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDateDisplay(event.startDate)} –{" "}
                            {formatDateDisplay(event.endDate)}
                          </span>

                          <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white px-2 py-0.5 rounded-full text-xs">
                            {event.Type}
                          </span>
                        </div>
                      </div>

                      {/* ACTION */}
                      <Link href={`/events/${event.id}`}>
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90 text-white hover:opacity-90 shadow-md"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* PAGINATION */}
        {filteredEvents.length > 0 && !isLoading && !error && (
          <div className="flex items-center justify-between pt-6 border-t border-border/50">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1}–
              {Math.min(startIndex + itemsPerPage, filteredEvents.length)} of{" "}
              {filteredEvents.length}
            </div>

            <div className="flex items-center gap-3">
              <Button
                size="icon"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className="border-border hover:bg-muted"
              >
                <ChevronLeft />
              </Button>

              <span className="font-medium text-foreground">
                Page {currentPage} / {totalPages}
              </span>

              <Button
                size="icon"
                variant="outline"
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="border-border hover:bg-muted"
              >
                <ChevronRight />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
