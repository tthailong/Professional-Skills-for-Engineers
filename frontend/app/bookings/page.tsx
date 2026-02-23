"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/app/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserStore, API_BASE_URL } from "@/store/useUserStore";
import {
  Search,
  X,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Ticket,
  MapPin,
  CalendarDays,
  CreditCard,
  Gift,
} from "lucide-react";

// --- Keep your interfaces exactly as they were ---
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

const CustomBadge = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${className}`}
  >
    {children}
  </div>
);

export default function MyBookingsPage() {
  const { user } = useUserStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [membershipInfo, setMembershipInfo] = useState<MembershipInfo | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 3;

  // --- Keep your useEffect Fetch Logic exactly as it was ---
  useEffect(() => {
    if (user?.id) {
      fetch(`${API_BASE_URL}/customers/${user.id}/membership`)
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            if (data.membership) setMembershipInfo(data.membership);
            if (Array.isArray(data.receipts)) {
              const mappedBookings: Booking[] = data.receipts.map((r: any) => {
                const firstTicket = r.tickets[0] || {};
                const totalAmount =
                  r.total_amount !== undefined ? r.total_amount : 0;
                return {
                  receipt_id: r.receipt_id,
                  movie_title: firstTicket.movie_title || "Unknown Movie",
                  branch_name: firstTicket.branch_name || "Unknown Branch",
                  showtime_date: firstTicket.showtime?.date || "",
                  showtime_time: firstTicket.showtime?.start
                    ? new Date(
                        `1970-01-01T${firstTicket.showtime.start}`,
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "",
                  payment_method: r.method,
                  booking_date: r.date ? r.date.split(" ")[0] : "",
                  total_amount: totalAmount,
                  status: "Confirmed",
                  seats: r.tickets.map((t: any) => t.seat),
                  products: r.products || [],
                };
              });
              mappedBookings.sort((a, b) => b.receipt_id - a.receipt_id);
              setBookings(mappedBookings);
            }
          }
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [user?.id]);

  const filteredBookings = bookings.filter(
    (booking) =>
      String(booking.receipt_id).includes(searchQuery) ||
      booking.movie_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.branch_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when the user starts searching
  };
  const BookingCard = ({ booking }: { booking: Booking }) => {
    const statusConfig = {
      Confirmed: {
        color: "bg-emerald-50 text-emerald-600 border-emerald-100",
        icon: <CheckCircle className="w-3.5 h-3.5" />,
      },
      Pending: {
        color: "bg-amber-50 text-amber-600 border-amber-100",
        icon: <Clock className="w-3.5 h-3.5" />,
      },
      Cancelled: {
        color: "bg-rose-50 text-rose-600 border-rose-100",
        icon: <X className="w-3.5 h-3.5" />,
      },
    };

    const config =
      statusConfig[booking.status as keyof typeof statusConfig] ||
      statusConfig.Confirmed;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-none bg-white/60 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] overflow-hidden group hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)] transition-all duration-500">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row">
              {/* Left Side: Movie & Status */}
              <div className="p-8 md:w-2/3 border-b md:border-b-0 md:border-r border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                  <CustomBadge className={config.color}>
                    <span className="flex items-center gap-1.5">
                      {config.icon} {booking.status}
                    </span>
                  </CustomBadge>
                  <span className="text-xs font-medium text-slate-400">
                    ID: #{booking.receipt_id}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  {booking.movie_title}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  <div className="flex items-center gap-3 text-slate-600">
                    <div className="p-2 bg-slate-50 rounded-xl">
                      <MapPin className="w-4 h-4 text-indigo-500" />
                    </div>
                    <span className="text-sm font-medium">
                      {booking.branch_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <div className="p-2 bg-slate-50 rounded-xl">
                      <CalendarDays className="w-4 h-4 text-indigo-500" />
                    </div>
                    <span className="text-sm font-medium">
                      {booking.showtime_date} @ {booking.showtime_time}
                    </span>
                  </div>
                </div>

                {booking.products.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {booking.products.map((p, i) => (
                      <span
                        key={i}
                        className="text-[10px] uppercase tracking-wider font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-lg"
                      >
                        {p.name} x{p.quantity}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Side: Total & Seats */}
              <div className="p-8 md:w-1/3 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">
                    Seats Assigned
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {booking.seats.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-1 bg-white border border-slate-200 rounded-md text-xs font-bold text-indigo-600"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-8 text-right">
                  <p className="text-xs text-slate-400 font-medium">
                    {booking.payment_method}
                  </p>
                  <p className="text-3xl font-black text-slate-900">
                    ${booking.total_amount}
                  </p>
                  <Button
                    variant="ghost"
                    className="mt-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 h-8 text-xs font-bold rounded-lg"
                  >
                    View Receipt
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden text-slate-900">
      {/* Aurora Blurs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-100/50 blur-[120px] -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-rose-100/30 blur-[120px] -z-10" />

      <Navbar />

      <main className="container mx-auto px-4 pt-16 pb-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-4 bg-gradient-to-br from-rose-500 to-rose-500 bg-clip-text text-transparent">
            My Bookings
          </h1>
          <p className="text-slate-500 text-lg font-medium">
            Manage your tickets and membership rewards.
          </p>
        </motion.div>

        {/* Premium Membership Card */}
        {membershipInfo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-none bg-gradient-to-br from-rose-600 to-tomato-600 text-white rounded-[2.5rem] shadow-2xl shadow-indigo-200 mb-12 overflow-hidden relative">
              {/* Decorative Circles */}
              <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl" />

              <CardContent className="p-8 md:p-12 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Gift className="w-6 h-6 text-indigo-200" />
                      <span className="uppercase tracking-[0.2em] text-xs font-bold text-indigo-200">
                        Membership Program
                      </span>
                    </div>
                    <h2 className="text-4xl font-black">
                      {membershipInfo.type} Tier
                    </h2>
                    <p className="text-indigo-100 mt-2 opacity-80">
                      Active since {membershipInfo.start_date}
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-[2rem] text-center min-w-[160px]">
                    <p className="text-xs uppercase font-bold text-indigo-100 mb-1">
                      Available Points
                    </p>
                    <p className="text-4xl font-black">
                      {membershipInfo.points}
                    </p>
                  </div>
                </div>

                {membershipInfo.privileges?.length > 0 && (
                  <div className="mt-10 pt-8 border-t border-white/10">
                    <p className="text-sm font-bold uppercase tracking-widest text-indigo-200 mb-4">
                      Your Privileges
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {membershipInfo.privileges.map((p) => (
                        <div
                          key={p.privilege_id}
                          className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors"
                        >
                          <div className="bg-emerald-400 rounded-full p-1">
                            <CheckCircle className="w-3 h-3 text-indigo-900" />
                          </div>
                          <span className="text-sm font-bold">{p.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Search Bar */}
        <div className="max-w-xl mb-8">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <Input
              placeholder="Search by ID or Movie..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-12 h-14 bg-white border-slate-200 rounded-2xl shadow-sm focus:shadow-md transition-all text-lg"
            />
          </div>
        </div>

        {/* List Section */}
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              [1, 2].map((i) => (
                <div
                  key={i}
                  className="h-40 rounded-[2rem] bg-slate-100 animate-pulse"
                />
              ))
            ) : paginatedBookings.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200"
              >
                <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900">
                  No bookings yet
                </h3>
                <Link href="/movies">
                  <Button className="mt-4 rounded-xl bg-indigo-600 hover:bg-indigo-700">
                    Find a Movie
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <>
                {paginatedBookings.map((booking) => (
                  <BookingCard key={booking.receipt_id} booking={booking} />
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-6 mt-12">
                    <Button
                      variant="ghost"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="rounded-xl hover:bg-slate-100 font-bold"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                    </Button>
                    <span className="text-sm font-bold text-slate-400">
                      {currentPage}{" "}
                      <span className="mx-1 text-slate-200">/</span>{" "}
                      {totalPages}
                    </span>
                    <Button
                      variant="ghost"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="rounded-xl hover:bg-slate-100 font-bold"
                    >
                      Next <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
