"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/app/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserStore, API_BASE_URL } from "@/store/useUserStore";

import {
  Search,
  Download,
  X,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Product {
  name: string;
  quantity: number;
  price: number;
}

interface Booking {
  receipt_id: number;
  movie_title: string;
  branch_name: string;
  showtime_date: string;
  showtime_time: string;
  payment_method: string;
  booking_date: string;
  total_amount: number;
  status: string;
  seats: string[];
  products: Product[];
}

interface Privilege {
  privilege_id: number;
  name: string;
  expiration: string;
  description: string;
}

interface MembershipInfo {
  points: number;
  membership_id: number;
  type: string;
  start_date: string;
  privileges: Privilege[];
}

export default function MyBookingsPage() {
  const { user } = useUserStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [membershipInfo, setMembershipInfo] = useState<MembershipInfo | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 3;

  useEffect(() => {
    if (user?.id) {
      fetch(`${API_BASE_URL}/customers/${user.id}/membership`)
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            if (data.membership) {
              setMembershipInfo(data.membership);
            }

            if (Array.isArray(data.receipts)) {
              const mappedBookings: Booking[] = data.receipts.map((r: any) => {
                // Assuming all tickets in a receipt are for the same movie/showtime/branch
                // If tickets is empty, we might have an issue, but let's handle it gracefully
                const firstTicket = r.tickets[0] || {};

                // Calculate total amount from tickets and products
                // Use backend total_amount if available, otherwise fallback to calculation
                const calculatedTotal =
                  r.tickets.reduce(
                    (sum: number, t: any) => sum + (t.price || 0),
                    0
                  ) +
                  (r.products || []).reduce(
                    (sum: number, p: any) =>
                      sum + (p.price || 0) * (p.quantity || 0),
                    0
                  );

                const totalAmount =
                  r.total_amount !== undefined
                    ? r.total_amount
                    : calculatedTotal;

                return {
                  receipt_id: r.receipt_id,
                  movie_title: firstTicket.movie_title || "Unknown Movie",
                  branch_name: firstTicket.branch_name || "Unknown Branch",
                  showtime_date: firstTicket.showtime?.date || "",
                  showtime_time: firstTicket.showtime?.start
                    ? new Date(
                        `1970-01-01T${firstTicket.showtime.start}`
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "",
                  payment_method: r.method,
                  booking_date: r.date ? r.date.split(" ")[0] : "", // Extract YYYY-MM-DD
                  total_amount: totalAmount,
                  status: "Confirmed", // Default status as API doesn't seem to return it yet
                  seats: r.tickets.map((t: any) => t.seat),
                  products: r.products || [],
                };
              });
              // Sort by booking date descending (newest first)
              // Note: r.date is "YYYY-MM-DD HH:mm:ss"
              mappedBookings.sort((a, b) => {
                // We need to compare the full date strings if available, but here we only have mapped booking_date
                // Let's use the original data index or sort by receipt_id if date is same
                return b.receipt_id - a.receipt_id;
              });

              setBookings(mappedBookings);
            } else {
              console.error("Invalid data format:", data);
              setBookings([]);
            }
          }
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch bookings:", err);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Filter bookings based on status and search
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      String(booking.receipt_id).includes(searchQuery) ||
      booking.movie_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.branch_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const BookingCard = ({ booking }: { booking: Booking }) => {
    // Determine status color/icon based on status (assuming "Confirmed" for now as per backend)
    // You can add logic here if status varies
    const statusColors: Record<string, string> = {
      Confirmed: "bg-blue-500/20 text-blue-600",
      Completed: "bg-green-500/20 text-green-600",
      Cancelled: "bg-red-500/20 text-red-600",
      Pending: "bg-yellow-500/20 text-yellow-600",
    };

    const statusIcons: Record<string, React.ReactNode> = {
      Confirmed: <Clock className="w-4 h-4" />,
      Completed: <CheckCircle className="w-4 h-4" />,
      Cancelled: <X className="w-4 h-4" />,
      Pending: <AlertCircle className="w-4 h-4" />,
    };

    return (
      <Card className="border-border bg-card hover:bg-card/80 transition">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Movie Info */}
            <div className="md:col-span-2">
              <h3 className="font-bold text-foreground text-lg mb-2">
                {booking.movie_title}
              </h3>
              <p className="text-sm text-muted-foreground mb-1">
                {booking.branch_name}
              </p>
              <p className="text-xs text-muted-foreground">
                Booking ID: {booking.receipt_id}
              </p>
              <p className="text-xs text-muted-foreground">
                Booked on {booking.booking_date}
              </p>
            </div>

            {/* Showtime Info */}
            <div>
              <p className="text-xs text-muted-foreground uppercase mb-1">
                Date & Time
              </p>
              <p className="font-semibold text-foreground">
                {booking.showtime_date}
              </p>
              <p className="font-semibold text-primary text-lg">
                {booking.showtime_time}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Seats: {booking.seats.join(", ")}
              </p>
              {booking.products.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground uppercase mb-1">
                    Products
                  </p>
                  {booking.products.map((product, idx) => (
                    <p key={idx} className="text-sm text-foreground">
                      {product.name}{" "}
                      <span className="text-muted-foreground">
                        x{product.quantity}
                      </span>
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Amount & Status */}
            <div className="flex flex-col justify-between items-end">
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase mb-1">
                  Amount
                </p>
                <p className="font-bold text-foreground text-xl">
                  ${booking.total_amount}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {booking.payment_method}
                </p>
              </div>

              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                  statusColors[booking.status] || statusColors.Confirmed
                }`}
              >
                {statusIcons[booking.status] || statusIcons.Confirmed}
                {booking.status}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            My Bookings
          </h1>
          <p className="text-muted-foreground">
            View and manage your movie tickets
          </p>
        </div>

        {/* Membership Info Card */}
        {membershipInfo && (
          <Card className="border-border bg-gradient-to-br from-primary/10 to-accent/10 mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                    {membershipInfo.type} Member
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                      {membershipInfo.points} Points
                    </span>
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Member since {membershipInfo.start_date}
                  </p>
                </div>
              </div>

              {membershipInfo.privileges &&
                membershipInfo.privileges.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <p className="text-sm font-semibold mb-2 text-foreground">
                      Your Active Privileges:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {membershipInfo.privileges.map((privilege) => (
                        <div
                          key={privilege.privilege_id}
                          className="bg-background/60 p-3 rounded-md border border-border/50 flex items-start gap-2"
                        >
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {privilege.name}
                            </p>
                            <p
                              className="text-xs text-muted-foreground line-clamp-1"
                              title={privilege.description}
                            >
                              {privilege.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <Card className="border-border bg-card mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by booking ID, movie, or branch..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 bg-secondary border-border text-foreground"
              />
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading bookings...
            </div>
          ) : paginatedBookings.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">No bookings found</p>
                <Link href="/movies">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    Book a Movie
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <>
              {paginatedBookings.map((booking) => (
                <BookingCard key={booking.receipt_id} booking={booking} />
              ))}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="bg-card border-border hover:bg-secondary"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="bg-card border-border hover:bg-secondary"
                  >
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
