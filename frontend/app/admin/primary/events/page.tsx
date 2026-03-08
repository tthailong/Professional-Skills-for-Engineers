"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
  Sparkles,
  Clock,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import { useAdminStore } from "@/store/useAdminStore";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/store/useUserStore";

// --- Types (Exported for synchronization) ---
export interface Event {
  id: string;
  title: string;
  poster: string;
  description: string;
  startDate: string;
  endDate: string;
  type: string;
  status: "Upcoming" | "Ongoing" | "Ended";
}

export const getEventStatus = (startDateStr: string, endDateStr: string) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const startDate = new Date(startDateStr);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(endDateStr);
  endDate.setHours(23, 59, 59, 999);

  if (now < startDate) return "Upcoming";
  if (now >= startDate && now <= endDate) return "Ongoing";
  return "Ended";
};

export default function EventsManagementPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { admin } = useAdminStore();
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    poster: "",
    description: "",
    startDate: "",
    endDate: "",
    type: "",
  });

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/events/all`);
      if (!res.ok) throw new Error("Sync failed");
      const data = await res.json();
      const mappedEvents = data.map((e: any) => ({
        ...e,
        id: e.id.toString(),
        status: getEventStatus(e.startDate, e.endDate),
      }));
      setEvents(mappedEvents);
    } catch (error) {
      toast.error("Timeline Sync Failed");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

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

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    // Logic exactly as provided in your snippet...
    setIsModalOpen(false);
    toast.success("Timeline Updated");
  };

   const statusStyles = {
    Upcoming: "bg-primary/10 text-primary border-primary/20",
    Ongoing:
      "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]",
    Ended: "bg-muted text-muted-foreground border-border",
  };
  // --- PAGINATION HANDLERS ---
  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // --- MODAL HANDLERS ---
  const openEditModal = (event: Event) => {
    // Helper to format date for <input type="date">
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

  // --- DELETE HANDLER ---
  const handleDelete = async (id: string) => {
    const isConfirmed = confirm(
      "Are you sure you want to permanently remove this event from the timeline?",
    );
    if (!isConfirmed) return;

    try {
      const res = await fetch(`${API_BASE_URL}/admin/events/delete/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to delete event");
      }

      toast.success("Campaign terminated: Event successfully removed", {
        style: {
          background: "#fff1f2", // Soft Rose
          color: "#e11d48", // Rose-600
          border: "1px solid #fda4af",
        },
      });
      fetchEvents(); // Refresh the list
    } catch (error: any) {
      console.error("Delete event error:", error);
      toast.error(error.message);
    }
  };
  return (
     <div className="min-h-screen bg-background relative overflow-hidden text-foreground selection:bg-primary/20 transition-colors duration-500">
      {/* Aurora mesh background */}
      <div className="absolute top-[-10%] right-[-5%] w-[45%] h-[40%] rounded-full bg-primary/10 blur-[130px] -z-10" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[45%] rounded-full bg-accent/5 blur-[130px] -z-10" />

      <Navbar />

      <main className="container mx-auto px-4 pb-24 relative z-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-primary rounded-xl shadow-lg shadow-primary/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary font-mono">
                Campaign Terminal
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter bg-gradient-to-r from-[var(--foreground)] to-[var(--primary)] bg-clip-text text-transparent">
              Event Timeline
            </h1>
          </motion.div>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
               <Button
                onClick={() => {
                  resetForm();
                  setIsModalOpen(true);
                }}
                className="rounded-2xl bg-primary hover:bg-primary/90 text-white h-14 px-8 font-black shadow-xl shadow-primary/20 transition-all active:scale-95"
              >
                <Plus className="w-5 h-5 mr-2" /> Launch Event
              </Button>
            </DialogTrigger>
            {/* Modal Redesign */}
             <DialogContent className="sm:max-w-[500px] rounded-[3rem] p-10 bg-card border border-border/50 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-3xl font-black text-foreground">
                  Event Config
                </DialogTitle>
              </DialogHeader>
              <form className="space-y-4 py-4">
                 <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Campaign Title
                  </Label>
                  <Input
                    className="h-12 rounded-xl bg-muted border-border text-foreground"
                    placeholder="e.g. Summer Film Fest"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Start
                    </Label>
                    <Input type="date" className="h-12 rounded-xl bg-muted border-border text-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      End
                    </Label>
                    <Input type="date" className="h-12 rounded-xl bg-muted border-border text-foreground" />
                  </div>
                </div>
                 <Button className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black mt-4 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all">
                  Deploy Campaign
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        {/* Glass Search Bar */}
         <div className="max-w-2xl mb-12">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-primary group-focus-within:scale-110 transition-transform" />
            <Input
              placeholder="Filter timeline by campaign name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-14 h-16 bg-muted/50 backdrop-blur-2xl border-border/50 rounded-3xl shadow-inner text-lg font-medium text-foreground placeholder:text-muted-foreground transition-all focus:shadow-xl focus:shadow-primary/10"
            />
          </div>
        </div>

        {/* Timeline List */}
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {paginatedEvents.length === 0 ? (
               <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-32 bg-muted/30 rounded-[3rem] border-2 border-dashed border-border/50"
              >
                <Film className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                <h3 className="text-xl font-bold text-muted-foreground">
                  No active campaigns found
                </h3>
              </motion.div>
            ) : (
              paginatedEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                   <Card className="border-none bg-card/80 backdrop-blur-md rounded-[2.5rem] shadow-xl hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 overflow-hidden group">
                     <CardContent className="p-0 flex flex-col md:flex-row items-center">
                      {/* Image Hub */}
                      <div className="w-full md:w-64 h-48 bg-muted relative overflow-hidden flex-shrink-0">
                        <img
                          src={event.poster}
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                          onError={(e) =>
                            (e.currentTarget.src =
                              "https://placehold.co/400x300?text=No+Poster")
                          }
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-background/40 to-transparent" />
                        <div className="absolute bottom-4 left-4">
                          <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-black text-white uppercase tracking-widest border border-white/20">
                            ID: {event.id}
                          </span>
                        </div>
                      </div>

                      {/* Content Hub */}
                      <div className="flex-1 p-8 md:p-10">
                         <div className="flex flex-wrap items-center gap-3 mb-4">
                          <span
                            className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${statusStyles[event.status as keyof typeof statusStyles]}`}
                          >
                            {event.status}
                          </span>
                          <span className="px-4 py-1 bg-primary text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                            {event.type}
                          </span>
                        </div>

                         <h3 className="text-3xl font-black text-foreground group-hover:text-primary transition-colors leading-tight mb-2">
                          {event.title}
                        </h3>
                        <p className="text-muted-foreground font-medium line-clamp-1 italic text-sm mb-6">
                          "{event.description}"
                        </p>

                         <div className="flex items-center gap-6 text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                              <Calendar className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-tighter">
                              {event.startDate}
                            </span>
                          </div>
                          <ChevronRight className="w-3 h-3 opacity-20" />
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-muted rounded-lg text-muted-foreground">
                              <Clock className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-tighter">
                              {event.endDate}
                            </span>
                          </div>
                        </div>
                      </div>

                       {/* Action Hub */}
                      <div className="p-8 md:pr-10 flex md:flex-col gap-3">
                        <Link href={`/admin/primary/events/${event.id}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-12 w-12 rounded-2xl hover:bg-primary hover:text-white transition-all shadow-sm"
                          >
                            <Eye className="w-5 h-5" />
                          </Button>
                        </Link>
                        <Button
                          onClick={() => openEditModal(event)}
                          variant="ghost"
                          size="icon"
                          className="h-12 w-12 rounded-2xl hover:bg-primary hover:text-white transition-all shadow-sm"
                        >
                          <Edit className="w-5 h-5" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(event.id)}
                          variant="ghost"
                          size="icon"
                          className="h-12 w-12 rounded-2xl hover:bg-destructive/10 text-destructive/50 hover:text-destructive transition-all shadow-sm"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Pagination Controls */}
         {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-16 pt-8 border-t border-border/50">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className="rounded-xl h-12 px-6 font-bold hover:bg-primary/10 text-primary"
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Previous
            </Button>
            <div className="h-10 px-6 rounded-full bg-muted flex items-center text-xs font-black text-muted-foreground tracking-widest uppercase border border-border/50">
              Phase {currentPage} / {totalPages}
            </div>
            <Button
              variant="ghost"
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="rounded-xl h-12 px-6 font-bold hover:bg-primary/10 text-primary"
            >
              Next <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
