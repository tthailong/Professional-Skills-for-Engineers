"use client";

import { Navbar } from "@/app/navbar";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Calendar } from "lucide-react"; // Added Calendar icon
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
// You can import the mock data from the parent page or define it here for simplicity
// In a real app, this would come from an API
import { API_BASE_URL } from "@/store/useUserStore";
import { getEventStatus, Event } from "../page";
import { Button } from "@/components/ui/button";

export default function EventDetailsPage() {
  const params = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/events/${params.id}`);
        if (!res.ok) throw new Error("Event not found");
        const data = await res.json();

        // Transform data to match Event interface
        const transformedEvent: Event = {
          ...data,
          id: data.id.toString(),
          status: getEventStatus(data.startDate, data.endDate),
        };
        setEvent(transformedEvent);
      } catch (error) {
        console.error("Error fetching event:", error);
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchEvent();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              Event Not Found
            </h2>
            <p className="text-muted-foreground">
              The event you are looking for does not exist or has been removed.
            </p>
            <Link href="/admin/primary/events">
              <Button variant="outline">Back to Events</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Helper to determine status badge styling
  const getStatusColor = (status: string) => {
    if (status === "Upcoming")
      return "bg-blue-500/20 text-blue-500 border-blue-500/20";
    if (status === "Ongoing")
      return "bg-green-500/20 text-green-500 border-green-500/20";
    return "bg-gray-500/20 text-gray-400 border-gray-500/20"; // Ended/Completed
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Back Navigation */}
        <Link
          href="/admin/primary/events"
          className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events List
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Left Column: Poster */}
          <div className="md:col-span-1">
            <Card className="border-border bg-card overflow-hidden shadow-2xl sticky top-24">
              <div className="aspect-[2/3] relative">
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
                      event.status
                    )}`}
                  >
                    {event.status}
                  </span>

                  {/* Date Range */}
                  <div className="flex items-center gap-2 text-lg">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span className="font-medium text-foreground">
                      {event.startDate}
                    </span>
                    <span className="text-muted-foreground/50 mx-1">—</span>
                    <span className="font-medium text-foreground">
                      {event.endDate}
                    </span>
                  </div>

                  {/* Event Type */}
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-secondary text-foreground border border-border">
                    {event.type}
                  </span>
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
