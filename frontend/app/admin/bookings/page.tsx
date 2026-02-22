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
import { Button } from "@/components/ui/button";
import { Navbar } from "@/app/navbar";
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
    <div className="min-h-screen bg-gradient-to-br from-white via-rose-50 to-white">
      <Navbar />

      <main className="container mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-800 tracking-tight">
            Bookings Dashboard
          </h1>
          <p className="text-gray-500 mt-2">
            Monitor and manage customer bookings across branches
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8 bg-white/70 backdrop-blur-xl border border-rose-100 shadow-xl">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-4 items-center">
              {/* Search */}
              <div className="relative md:col-span-1">
                <Search className="absolute left-3 top-3 w-5 h-5 text-rose-400" />
                <Input
                  placeholder="Search booking, customer, movie..."
                  className="pl-10 bg-white border-rose-200 focus:ring-2 focus:ring-rose-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Date */}
              <div className="flex gap-3 md:col-span-2">
                <Calendar className="text-rose-400 mt-2" />
                <Input
                  type="date"
                  className="bg-white border-rose-200"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <Input
                  type="date"
                  className="bg-white border-rose-200"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="bg-white/70 backdrop-blur-xl border border-rose-100 shadow-xl">
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-10 rounded-md bg-rose-100 animate-pulse"
                  />
                ))}
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-14 text-gray-500 animate-fade-in">
                <Film className="mx-auto w-12 h-12 mb-4 text-rose-400" />
                No bookings match your filters
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-rose-100 text-gray-500">
                        {[
                          "Booking ID",
                          "Customer",
                          "Movie",
                          "Seats",
                          "Amount",
                          "Status",
                          "Date",
                        ].map((h) => (
                          <th
                            key={h}
                            className="py-3 px-4 text-left font-semibold"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {currentBookings.map((b) => (
                        <tr
                          key={b.id}
                          className="border-b border-rose-50 hover:bg-rose-50 transition"
                        >
                          <td className="px-4 py-3 font-mono text-gray-800">
                            {b.id}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {b.customer}
                          </td>
                          <td className="px-4 py-3 text-gray-700">{b.movie}</td>
                          <td className="px-4 py-3 text-gray-400 text-xs">
                            {b.seats}
                          </td>
                          <td className="px-4 py-3 text-rose-500 font-semibold">
                            {formatMoney(b.amount)}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-3 py-1 rounded-full text-xs bg-rose-100 text-rose-500">
                              {b.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-400">{b.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center pt-6 border-t border-rose-100">
                  <p className="text-sm text-gray-500">
                    Showing {startIndex + 1} to{" "}
                    {Math.min(
                      startIndex + itemsPerPage,
                      filteredBookings.length,
                    )}{" "}
                    of {filteredBookings.length}
                  </p>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={currentPage === 1}
                      className="border-rose-200 hover:bg-rose-50"
                    >
                      <ChevronLeft />
                    </Button>

                    <span className="text-gray-700 text-sm">
                      Page {currentPage} / {totalPages || 1}
                    </span>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleNext}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="border-rose-200 hover:bg-rose-50"
                    >
                      <ChevronRight />
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
