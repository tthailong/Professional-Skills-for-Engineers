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

// Define the type for a booking item
interface Booking {
  id: string;
  customer: string;
  movie: string;
  seats: string;
  amount: number;
  status: string;
  date: string; // YYYY-MM-DD format
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

      const mappedBookings: Booking[] = data.map((item: any) => ({
        id: `${item.Receipt_id.toString()}`, // Format ID like BK001
        customer: item.Customer_Name,
        movie: item.Movie_Title || "N/A",
        seats: item.Seats || "N/A",
        amount: item.Total_Amount,
        status: "Completed", // Default status
        date: item.Date,
      }));

      // Sort by ID descending (newest first)
      mappedBookings.sort((a, b) => parseInt(b.id) - parseInt(a.id));

      setBookings(mappedBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Helper function to format VND
  const formatVND = (value: number) => {
    return new Intl.NumberFormat("us-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  // --- Filtering Logic using useMemo ---
  const filteredBookings = useMemo(() => {
    let filtered = bookings;

    // 1. Search Filtering
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (booking) =>
          booking.id.toLowerCase().includes(lowerCaseSearch) ||
          booking.customer.toLowerCase().includes(lowerCaseSearch) ||
          booking.movie.toLowerCase().includes(lowerCaseSearch)
      );
    }

    // 2. Date Range Filtering
    if (startDate || endDate) {
      filtered = filtered.filter((booking) => {
        const bookingDate = booking.date; // YYYY-MM-DD string

        const isAfterStart = startDate ? bookingDate >= startDate : true;
        const isBeforeEnd = endDate ? bookingDate <= endDate : true;

        return isAfterStart && isBeforeEnd;
      });
    }

    // Reset pagination to page 1 whenever filters change
    if (currentPage > 1) {
      // This might cause an infinite loop if not handled carefully,
      // but inside useMemo it's a side effect which is bad practice.
      // Better to use useEffect for resetting page.
    }

    return filtered;
  }, [bookings, searchTerm, startDate, endDate]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, startDate, endDate]);

  // --- Pagination Logic (applied to filtered data) ---
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentBookings = filteredBookings.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Tailwind placeholders for styling consistency
  const backgroundClass = "bg-[#18181B]"; // Dark background for the page (similar to background/secondary gradient)
  const cardBgClass = "bg-[#27272A] text-white"; // Dark card background
  const borderClass = "border-[#3F3F46]"; // Gray border color
  const primaryClass = "text-[#6366F1]"; // Indigo primary color

  return (
    <div className={`min-h-screen ${backgroundClass}`}>
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-2">All Bookings</h1>
        <p className="text-gray-400 mb-8">
          Manage and monitor all customer bookings across branches
        </p>

        {/* Search and Date Filter Card */}
        <Card className={`${borderClass} ${cardBgClass} mb-6 shadow-2xl`}>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* Search Input */}
              <div className="relative col-span-1 md:col-span-3 lg:col-span-1 order-2 lg:order-1">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                <Input
                  placeholder="Search by booking ID, customer, or movie..."
                  className={`pl-10 bg-[#3F3F46] ${borderClass} text-white h-10`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Date Filters */}
              <div className="flex items-center gap-4 col-span-1 md:col-span-2 order-1 lg:order-2">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full">
                  <Calendar className={`w-5 h-5 ${primaryClass} shrink-0`} />
                  <div className="flex items-center gap-2 w-full">
                    <Input
                      type="date"
                      title="Start Date"
                      className={`bg-[#3F3F46] ${borderClass} text-white h-10 flex-1`}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                    <span className="text-gray-500">-</span>
                    <Input
                      type="date"
                      title="End Date"
                      className={`bg-[#3F3F46] ${borderClass} text-white h-10 flex-1`}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate} // Prevent end date before start date
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings Table */}
        <Card className={`${borderClass} ${cardBgClass} shadow-2xl`}>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="py-10 text-center text-gray-400">
                Loading bookings...
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="py-10 text-center text-gray-500">
                <Film className={`w-12 h-12 mx-auto mb-4 ${primaryClass}/50`} />
                No bookings found matching your search or date criteria.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto mb-4">
                  <table className="w-full text-sm">
                    <thead className={`border-b ${borderClass}`}>
                      <tr className="text-gray-400">
                        <th className="text-left py-3 px-4 font-semibold">
                          Booking ID
                        </th>
                        <th className="text-left py-3 px-4 font-semibold">
                          Customer
                        </th>
                        <th className="text-left py-3 px-4 font-semibold">
                          Movie
                        </th>
                        <th className="text-left py-3 px-4 font-semibold">
                          Seats
                        </th>
                        <th className="text-left py-3 px-4 font-semibold">
                          Amount
                        </th>
                        <th className="text-left py-3 px-4 font-semibold">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 font-semibold">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentBookings.map((booking) => (
                        <tr
                          key={booking.id}
                          className={`border-b ${borderClass}/50 hover:bg-[#3F3F46] transition-colors`}
                        >
                          <td className="py-3 px-4 text-white font-mono">
                            {booking.id}
                          </td>
                          <td className="py-3 px-4 text-white">
                            {booking.customer}
                          </td>
                          <td className="py-3 px-4 text-white">
                            {booking.movie}
                          </td>
                          <td className="py-3 px-4 text-gray-500 text-xs">
                            {booking.seats}
                          </td>
                          <td
                            className={`py-3 px-4 ${primaryClass} font-semibold`}
                          >
                            {formatVND(booking.amount)}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                booking.status === "Completed"
                                  ? "bg-green-700/30 text-green-400"
                                  : booking.status === "Cancelled"
                                  ? "bg-red-700/30 text-red-400"
                                  : "bg-yellow-700/30 text-yellow-400"
                              }`}
                            >
                              {booking.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-500">
                            {booking.date}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div
                  className={`flex items-center justify-between border-t ${borderClass} pt-4`}
                >
                  <div className="text-sm text-gray-500">
                    Showing {startIndex + 1} to{" "}
                    {Math.min(
                      startIndex + itemsPerPage,
                      filteredBookings.length
                    )}{" "}
                    of {filteredBookings.length} entries
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevious}
                      disabled={currentPage === 1}
                      className={`h-8 w-8 p-0 border-gray-600 bg-[#27272A] text-white hover:bg-[#3F3F46]`}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-sm font-medium text-white">
                      Page {currentPage} of {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNext}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className={`h-8 w-8 p-0 border-gray-600 bg-[#27272A] text-white hover:bg-[#3F3F46]`}
                    >
                      <ChevronRight className="h-4 w-4" />
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
