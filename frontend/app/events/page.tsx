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
    <div className="min-h-screen bg-gradient-to-br from-white via-rose-50 to-white">
      <Navbar />

      <main className="container mx-auto px-4 py-10">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3 bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
              <Calendar className="w-9 h-9 text-rose-500" />
              Event Management
            </h1>
            <p className="text-gray-500 mt-2">
              Manage cinema events and screenings
            </p>
          </div>
        </div>

        {/* SEARCH */}
        <Card className="mb-8 rounded-2xl border border-rose-100 bg-white/70 backdrop-blur-xl shadow-lg">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-rose-400" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 bg-white border-rose-200 focus-visible:ring-rose-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* LOADING */}
        {isLoading && (
          <div className="py-16 flex justify-center items-center gap-3 text-rose-500 font-medium">
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
              <div className="text-center text-gray-400 py-16">
                No events found.
              </div>
            ) : (
              paginatedEvents.map((event) => {
                const statusColor =
                  event.status === "Upcoming"
                    ? "bg-blue-100 text-blue-600"
                    : event.status === "Ongoing"
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-200 text-gray-600";

                return (
                  <Card
                    key={event.id}
                    className="group rounded-2xl border border-rose-100 bg-white/80 backdrop-blur-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <CardContent className="p-5 flex flex-col md:flex-row gap-6 items-center">
                      {/* POSTER */}
                      <div className="w-full md:w-28 h-28 rounded-xl overflow-hidden bg-rose-50 flex items-center justify-center">
                        {event.poster.includes("placeholder") ? (
                          <Film className="w-10 h-10 text-rose-300" />
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
                          <h3 className="font-semibold text-lg group-hover:text-rose-500 transition">
                            {event.title}
                          </h3>
                          <span
                            className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor}`}
                          >
                            {event.status}
                          </span>
                        </div>

                        <p className="text-sm text-gray-500 line-clamp-1">
                          {event.description}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDateDisplay(event.startDate)} –{" "}
                            {formatDateDisplay(event.endDate)}
                          </span>

                          <span className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-2 py-0.5 rounded-full text-xs">
                            {event.Type}
                          </span>
                        </div>
                      </div>

                      {/* ACTION */}
                      <Link href={`/events/${event.id}`}>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:opacity-90 shadow-md"
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
          <div className="flex items-center justify-between pt-6 border-t border-rose-100">
            <div className="text-sm text-gray-400">
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
                className="border-rose-200 hover:bg-rose-50"
              >
                <ChevronLeft />
              </Button>

              <span className="font-medium text-gray-600">
                Page {currentPage} / {totalPages}
              </span>

              <Button
                size="icon"
                variant="outline"
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="border-rose-200 hover:bg-rose-50"
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
