"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Navbar } from "@/app/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  RotateCw,
  ShieldCheck,
  Sparkles,
  Tag,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { API_BASE_URL } from "@/store/useUserStore";
// Ensure these are exported in ../page.tsx
import { Event, getEventStatus } from "../page";

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEventDetails = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      // Fetch all to find specific (or use detail endpoint if exists)
      const response = await fetch(`${API_BASE_URL}/admin/events/all`);
      if (!response.ok) throw new Error("Terminal connection failed");

      const data = await response.json();
      const found = data.find((e: any) => e.id.toString() === id);

      if (found) {
        setEvent({
          ...found,
          id: found.id.toString(),
          status: getEventStatus(found.startDate, found.endDate),
        });
      } else {
        toast.error("Campaign ID not found in database.");
      }
    } catch (e: any) {
      toast.error("Data Sync Error: " + e.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (params.id) fetchEventDetails(params.id as string);
  }, [params.id, fetchEventDetails]);

  if (isLoading)
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-rose-100 border-t-rose-600 rounded-full animate-spin mb-4" />
        <p className="text-xs font-black uppercase tracking-[0.3em] text-rose-600">
          Syncing Timeline...
        </p>
      </div>
    );

  if (!event)
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="p-6 bg-rose-50 rounded-[2.5rem] mb-6">
          <Info className="w-12 h-12 text-rose-600" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
          Campaign Missing
        </h2>
        <p className="text-slate-500 mb-8 max-w-xs">
          The event record has been removed or the ID is invalid.
        </p>
        <Button
          onClick={() => router.back()}
          className="rounded-2xl bg-slate-900 h-14 px-8 font-bold"
        >
          Return to Timeline
        </Button>
      </div>
    );

  return (
    <div className="min-h-screen bg-white relative overflow-hidden text-slate-900 selection:bg-rose-100">
      {/* Cinematic Aurora Mesh */}
      <div className="absolute top-0 left-0 w-full h-[70vh] -z-10 opacity-30 blur-[120px]">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-rose-200/50" />
        <div className="absolute bottom-0 left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-100/40" />
      </div>

      <Navbar />

      <main className="container mx-auto px-4 pt-12 pb-24 relative z-10 max-w-6xl">
        {/* Navigation */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-slate-400 hover:text-rose-600 font-bold text-sm uppercase tracking-widest transition-all mb-12"
        >
          <div className="p-2 rounded-xl bg-slate-50 group-hover:bg-rose-50 group-hover:text-rose-600 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Back to Timeline
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Left: Huge Poster Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-5"
          >
            <div className="relative group">
              <div className="aspect-[2/3] rounded-[3.5rem] overflow-hidden shadow-2xl shadow-rose-200 border-[12px] border-white group-hover:scale-[1.02] transition-transform duration-700">
                <img
                  src={event.poster}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
              </div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-rose-600 rounded-[2rem] flex items-center justify-center shadow-xl shadow-rose-900/30">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
            </div>
          </motion.div>

          {/* Right: Event Briefing */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-7 space-y-10"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-4 py-1.5 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
                  {event.type}
                </span>
                <span
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm ${
                    event.status === "Ongoing"
                      ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                      : "bg-rose-50 text-rose-600 border-rose-100"
                  }`}
                >
                  {event.status}
                </span>
              </div>
              <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-slate-900 leading-[0.9]">
                {event.title}
              </h1>
            </div>

            <Card className="border-none bg-white/60 backdrop-blur-2xl shadow-xl rounded-[3rem] p-10">
              <CardContent className="p-0 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="flex items-start gap-5">
                    <div className="p-4 bg-rose-50 rounded-2xl text-rose-600 shadow-inner">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">
                        Timeframe
                      </p>
                      <p className="text-xl font-black text-slate-900">
                        {event.startDate}
                      </p>
                      <p className="text-sm font-bold text-slate-400">
                        until {event.endDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-5">
                    <div className="p-4 bg-slate-50 rounded-2xl text-slate-600 shadow-inner">
                      <Tag className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">
                        Campaign Type
                      </p>
                      <p className="text-xl font-black text-slate-900">
                        {event.type || "Event"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-10 border-t border-slate-100">
                  <p className="text-[10px] font-black uppercase text-rose-600 tracking-widest mb-6 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Official Description
                  </p>
                  <p className="text-slate-600 text-lg leading-relaxed font-medium">
                    {event.description}
                  </p>
                </div>

                <div className="pt-6 flex flex-col sm:flex-row gap-4">
                  <Button className="flex-1 h-16 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-lg shadow-xl shadow-rose-200 transition-all active:scale-95">
                    Promote This Event
                  </Button>
                  <Button
                    variant="outline"
                    className="h-16 px-10 rounded-2xl border-slate-200 font-bold hover:bg-slate-50 transition-all"
                  >
                    Download Brief
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
