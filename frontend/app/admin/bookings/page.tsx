"use client";

import { useMemo, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Film,
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/app/navbar";
import { Label } from "@/components/ui/label";
import { API_BASE_URL } from "@/store/useUserStore";
import { toast } from "sonner";
import { useAdminStore } from "@/store/useAdminStore";

interface Booking {
  id: string;
  customer: string;
  movie: string;
  seats: string;
  amount: number;
  status: string;
  date: string;
}

const itemsPerPage = 5;

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const admin = useAdminStore((state) => state.admin);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      let url = `${API_BASE_URL}/admin/bookings/all`;

      if (admin?.assignedBranchId) {
        url = `${API_BASE_URL}/admin/bookings/branch/${admin.assignedBranchId}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch bookings");
      const data = await res.json();

      const mapped: Booking[] = data.map((item: any) => ({
        id: `${item.Receipt_id}`,
        customer: item.Customer_Name,
        movie: item.Movie_Title || "N/A",
        seats: item.Seats || "N/A",
        amount: item.Total_Amount,
        status: "Completed",
        date: item.Date,
      }));

      mapped.sort((a, b) => parseInt(b.id) - parseInt(a.id));
      setBookings(mapped);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load bookings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const formatMoney = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);

  const filteredBookings = useMemo(() => {
    let filtered = bookings;

    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.id.toLowerCase().includes(s) ||
          b.customer.toLowerCase().includes(s) ||
          b.movie.toLowerCase().includes(s),
      );
    }

    if (startDate || endDate) {
      filtered = filtered.filter((b) => {
        const d = b.date;
        return (!startDate || d >= startDate) && (!endDate || d <= endDate);
      });
    }

    return filtered;
  }, [bookings, searchTerm, startDate, endDate]);

  useEffect(() => setCurrentPage(1), [searchTerm, startDate, endDate]);

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentBookings = filteredBookings.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handlePrevious = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  return (
     <div className="min-h-screen bg-background relative overflow-hidden text-foreground selection:bg-primary/20 transition-colors duration-500">
      {/* Aurora Blurs */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] -z-10" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[35%] h-[40%] rounded-full bg-accent/5 blur-[120px] -z-10" />

      <Navbar />

      <main className="container mx-auto px-4 py-10">
        {/* Header */}
         <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-[var(--foreground)] to-[var(--primary)] bg-clip-text text-transparent mb-2">
            Centralized Bookings
          </h1>
          <p className="text-muted-foreground font-medium mb-12">
            Monitor and coordinate global reservation flows across all regional branches.
          </p>
        </motion.div>

        {/* Filters */}
         <Card className="mb-10 border-none bg-card/60 backdrop-blur-md rounded-[2.5rem] shadow-xl border border-border/50">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-4 gap-6 items-end">
              {/* Search */}
              <div className="md:col-span-2 space-y-3">
                <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">
                  Query System
                </Label>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary group-focus-within:scale-110 transition-transform" />
                  <Input
                    placeholder="Search transaction ID, customer, or production..."
                    className="pl-12 h-14 rounded-2xl bg-muted/50 border-border text-foreground text-md placeholder:text-muted-foreground"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

               {/* Date */}
              <div className="md:col-span-2 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-primary" />
                  <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                    Theatrical Window
                  </Label>
                </div>
                <div className="flex gap-3">
                  <Input
                    type="date"
                    className="h-14 rounded-2xl bg-muted/50 border-border text-foreground font-bold"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <Input
                    type="date"
                    className="h-14 rounded-2xl bg-muted/50 border-border text-foreground font-bold"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
         <Card className="border-none bg-card/60 backdrop-blur-md rounded-[2.5rem] shadow-2xl border border-border/50 overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 space-y-6">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 rounded-2xl bg-primary/5 animate-pulse"
                  />
                ))}
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-24 text-muted-foreground animate-fade-in">
                <Film className="mx-auto w-16 h-16 mb-6 text-primary/30" />
                <p className="text-xl font-bold">No Records Found</p>
                <p className="text-sm">Adjust filters to broaden the search.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50 text-muted-foreground uppercase tracking-widest text-[10px] font-black">
                        {[
                          "Hash ID",
                          "Customer Profile",
                          "Feature Film",
                          "Allocated Seats",
                          "Net Amount",
                          "State",
                          "Timestamp",
                        ].map((h) => (
                          <th
                            key={h}
                            className="py-6 px-8 text-left"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
 
                    <tbody className="divide-y divide-border/30">
                      {currentBookings.map((b) => (
                        <tr
                          key={b.id}
                          className="group hover:bg-primary/5 transition-colors"
                        >
                          <td className="px-8 py-6 font-mono text-xs font-bold text-muted-foreground">
                            #{b.id}
                          </td>
                          <td className="px-8 py-6 font-black text-foreground">
                            {b.customer}
                          </td>
                          <td className="px-8 py-6 font-bold text-primary/80">{b.movie}</td>
                          <td className="px-8 py-6 font-mono text-xs text-muted-foreground">
                            {b.seats}
                          </td>
                          <td className="px-8 py-6 text-primary font-black text-lg">
                            {formatMoney(b.amount)}
                          </td>
                          <td className="px-8 py-6">
                            <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                              {b.status}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-muted-foreground font-medium">{b.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                 {/* Pagination */}
                <div className="p-8 flex justify-between items-center bg-muted/20 border-t border-border/50">
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Items {startIndex + 1} -{" "}
                    {Math.min(
                      startIndex + itemsPerPage,
                      filteredBookings.length,
                    )}{" "}
                    / {filteredBookings.length}
                  </p>
 
                  <div className="flex items-center gap-6">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handlePrevious}
                      disabled={currentPage === 1}
                      className="h-12 w-12 rounded-2xl hover:bg-primary hover:text-white transition-all shadow-sm"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </Button>
 
                    <span className="text-foreground font-black text-sm">
                      {currentPage} / {totalPages || 1}
                    </span>
 
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleNext}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="h-12 w-12 rounded-2xl hover:bg-primary hover:text-white transition-all shadow-sm"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
