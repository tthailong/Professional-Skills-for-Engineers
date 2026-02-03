"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { Navbar } from "@/app/navbar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  Check,
  RotateCw,
  Plus,
  Minus,
  ShoppingCart,
  Popcorn,
  Ticket,
} from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/store/useUserStore";
import { useUserCart } from "@/store/useUserCart"; // <--- Import Store

// --- Types ---
type ItemType = "food-drink" | "souvenir" | "voucher";

interface ProductItem {
  id: string;
  type: ItemType;
  name: string;
  description: string;
  status: "Active" | "Inactive";
  price: number;
}

export interface CartItem {
  item: ProductItem;
  quantity: number;
}

interface SeatOut {
  Seat_number: string;
  Seat_type: string;
  Status: string;
}

interface ShowtimeOut {
  Showtime_id: number;
  Movie_title: string;
  Date: string;
  Start_time: string;
  Format: string;
  Subtitle: string;
  Branch_name: string;
  Branch_id: number;
  Branch_address: string;
  Hall_number: number;
  Hall_type: string;
}

interface MovieShortOut {
  Movie_id: number;
  Title: string;
  Image: string;
  Duration: number;
}

interface ProductOut {
  Product_id: number;
  Name: string;
  Price: number;
  Description: string;
}

interface BookingPageOut {
  movie: MovieShortOut;
  showtime: ShowtimeOut;
  seats: SeatOut[];
  products: ProductOut[];
}

export interface PriceCalculation {
  subtotalSeats: number;
  subtotalConcessions: number;
  subtotal: number;
  discount: number;
  gst: number;
  total: number;
}

const SEAT_TYPES_MAP: Record<
  string,
  { name: string; price: number; color: string }
> = {
  Standard: { name: "Standard", price: 150, color: "bg-secondary" },
  VIP: { name: "VIP", price: 250, color: "bg-accent" },
  Couple: { name: "Couple", price: 400, color: "bg-primary" },
  Accessible: { name: "Accessible", price: 150, color: "bg-blue-600" },
};

interface ComponentSeat {
  id: string;
  type: keyof typeof SEAT_TYPES_MAP;
  isAvailable: boolean;
}

// ... (BookingSummaryHeader and SeatMapSection components remain exactly the same) ...
const BookingSummaryHeader: React.FC<{
  hallName: string;
  showtimeInfo: string;
}> = ({ hallName, showtimeInfo }) => (
  <div className="mb-8 p-6 bg-card rounded-xl border border-border shadow-sm">
    <h1 className="text-3xl font-bold text-foreground mb-2">
      Select Your Seats
    </h1>
    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 text-muted-foreground">
      <p className="text-lg text-primary font-medium flex items-center gap-2">
        <Ticket className="w-5 h-5" /> {showtimeInfo}
      </p>
      <span className="hidden md:inline text-border">|</span>
      <p className="text-sm font-medium border border-border px-3 py-1 rounded-full bg-secondary/50">
        {hallName}
      </p>
    </div>
  </div>
);

const SeatMapSection: React.FC<{
  seats: ComponentSeat[];
  selectedSeats: string[];
  toggleSeat: (id: string) => void;
}> = ({ seats, selectedSeats, toggleSeat }) => {
  // ... (Keep existing SeatMapSection logic)
  const seatsByRow = useMemo(() => {
    const rows = Array.from(new Set(seats.map((s) => s.id.charAt(0)))).sort();
    return rows.map((row) => ({
      row,
      seats: seats
        .filter((s) => s.id.startsWith(row))
        .sort((a, b) => parseInt(a.id.slice(1)) - parseInt(b.id.slice(1))),
    }));
  }, [seats]);

  return (
    <div className="lg:col-span-2">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Hall View</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* ... Seat Map Rendering Logic ... */}
          <div className="flex justify-center overflow-x-auto pb-4">
            <div className="space-y-3 inline-block">
              {seatsByRow.map(({ row, seats }) => (
                <div key={row} className="flex items-center gap-4">
                  <span className="w-4 text-center text-muted-foreground font-bold text-sm">
                    {row}
                  </span>
                  <div className="flex gap-2">
                    {seats.map((seat) => {
                      const isSelected = selectedSeats.includes(seat.id);
                      const seatType =
                        SEAT_TYPES_MAP[seat.type] || SEAT_TYPES_MAP.Standard;
                      return (
                        <button
                          key={seat.id}
                          onClick={() => toggleSeat(seat.id)}
                          disabled={!seat.isAvailable}
                          className={`relative w-8 h-8 rounded-t-lg rounded-b-sm text-[10px] font-medium transition-all duration-200 flex items-center justify-center ${
                            !seat.isAvailable
                              ? "bg-muted text-muted-foreground cursor-not-allowed opacity-40"
                              : isSelected
                              ? "bg-primary text-primary-foreground shadow-md scale-110 z-10 ring-2 ring-background"
                              : `${seatType.color} hover:brightness-110 hover:-translate-y-1`
                          }`}
                        >
                          {isSelected ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            seat.id.substring(1)
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ... (ConcessionsSelection component remains exactly the same) ...
const ConcessionsSelection: React.FC<{
  concessions: ProductItem[];
  concessionCart: CartItem[];
  setConcessionCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  prices: PriceCalculation;
  handleProceedToPayment: () => void;
  selectedSeatsCount: number;
}> = ({
  concessions,
  concessionCart,
  setConcessionCart,
  prices,
  handleProceedToPayment,
  selectedSeatsCount,
}) => {
  const updateQuantity = (product: ProductItem, delta: number) => {
    setConcessionCart((prev) => {
      const existing = prev.find((c) => c.item.id === product.id);
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) return prev.filter((c) => c.item.id !== product.id);
        return prev.map((c) =>
          c.item.id === product.id ? { ...c, quantity: newQty } : c
        );
      }
      if (delta > 0) return [...prev, { item: product, quantity: 1 }];
      return prev;
    });
  };

  const getItemQty = (id: string) =>
    concessionCart.find((c) => c.item.id === id)?.quantity || 0;

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Popcorn className="w-5 h-5 text-primary" /> Snacks & Drinks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full bg-secondary mb-4">
              <TabsTrigger value="all" className="flex-1">
                All Items
              </TabsTrigger>
              <TabsTrigger value="selected" className="flex-1">
                Selected ({concessionCart.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent
              value="all"
              className="max-h-[300px] overflow-y-auto pr-2 space-y-3"
            >
              {concessions.map((product) => (
                <div
                  key={product.id}
                  className="flex justify-between items-center p-3 border border-border rounded-lg hover:bg-secondary/20 transition"
                >
                  <div>
                    <p className="font-semibold text-sm">{product.name}</p>
                    <p className="text-sm font-bold text-primary mt-1">
                      ${product.price}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-secondary rounded-md p-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => updateQuantity(product, -1)}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-4 text-center text-sm font-mono">
                      {getItemQty(product.id)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => updateQuantity(product, 1)}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="selected" className="space-y-3">
              {concessionCart.map((cartItem) => (
                <div
                  key={cartItem.item.id}
                  className="flex justify-between items-center text-sm"
                >
                  <span>
                    {cartItem.quantity}x {cartItem.item.name}
                  </span>
                  <span className="font-mono">
                    ${cartItem.item.price * cartItem.quantity}
                  </span>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <Card className="border-border bg-card sticky top-20 shadow-lg">
        <CardHeader className="bg-secondary/30 pb-4">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" /> Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-6">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Seats ({selectedSeatsCount})
            </span>
            <span>${prices.subtotalSeats}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Food & Drink</span>
            <span>${prices.subtotalConcessions}</span>
          </div>
          <div className="border-t border-border my-2"></div>
          <div className="flex justify-between font-bold text-lg pt-2 text-primary">
            <span>Total</span>
            <span>${prices.total}</span>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full h-12 text-lg font-semibold shadow-md"
            onClick={handleProceedToPayment}
            disabled={selectedSeatsCount === 0}
          >
            Proceed to Pay
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

// =========================================================================
// 🚀 MAIN PAGE COMPONENT
// =========================================================================
export default function BookingPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  // --- STORE ACTIONS ---
  const { setTickets, setProducts, clearCart } = useUserCart();

  const movieId = params.id ? Number(params.id) : null;
  const showtimeId = searchParams.get("showtimeId");

  const [movieData, setMovieData] = useState<MovieShortOut | null>(null);
  const [showtimeData, setShowtimeData] = useState<ShowtimeOut | null>(null);
  const [seats, setSeats] = useState<ComponentSeat[]>([]);
  const [products, setProductsList] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [concessionCart, setConcessionCart] = useState<CartItem[]>([]);

  // Clear previous cart on mount so old data doesn't persist
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  const fetchBookingData = useCallback(async () => {
    if (movieId === null || showtimeId === null) {
      setError("Missing Movie ID or Showtime ID.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const url = `${API_BASE_URL}/movies/${movieId}/${showtimeId}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Data load failed.");
      const data: BookingPageOut = await response.json();

      setMovieData(data.movie);
      setShowtimeData(data.showtime);
      setSeats(
        data.seats.map((s) => ({
          id: s.Seat_number,
          type: (s.Seat_type.charAt(0).toUpperCase() +
            s.Seat_type.slice(1).toLowerCase()) as keyof typeof SEAT_TYPES_MAP,
          isAvailable: s.Status.toUpperCase() === "AVAILABLE",
        }))
      );
      setProductsList(
        data.products.map((p) => ({
          id: p.Product_id.toString(),
          type: "food-drink",
          name: p.Name,
          description: p.Description || "",
          status: "Active",
          price: p.Price,
        }))
      );
    } catch (e: any) {
      setError(e.message);
      toast.error(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [movieId, showtimeId]);

  useEffect(() => {
    fetchBookingData();
  }, [fetchBookingData]);

  const toggleSeat = (seatId: string) => {
    const seat = seats.find((s) => s.id === seatId);
    if (!seat || !seat.isAvailable) return;
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId]
    );
  };

  const calculatePrices = useMemo<PriceCalculation>(() => {
    let subtotalSeats = 0;
    selectedSeats.forEach((seatId) => {
      const seat = seats.find((s) => s.id === seatId);
      if (seat)
        subtotalSeats += SEAT_TYPES_MAP[seat.type || "Standard"]?.price || 0;
    });
    const subtotalConcessions = concessionCart.reduce(
      (acc, item) => acc + item.item.price * item.quantity,
      0
    );
    const subtotal = subtotalSeats + subtotalConcessions;
    return {
      subtotalSeats,
      subtotalConcessions,
      subtotal,
      discount: 0,
      gst: Math.round(subtotal * 0.18),
      total: subtotal + Math.round(subtotal * 0.18),
    };
  }, [selectedSeats, concessionCart, seats]);

  // --- ⚠️ CRITICAL FIX: DO NOT PUT OBJECTS IN URL ---
  const handleProceedToPayment = () => {
    if (selectedSeats.length === 0) {
      toast.error("Please select at least one seat.");
      return;
    }
    if (!showtimeData || !movieData) return;

    // 1. SAVE DATA TO STORE (Memory)
    const cartTickets = selectedSeats.map((seatId) => {
      const seatInfo = seats.find((s) => s.id === seatId);
      return {
        movie_name: movieData.Title,
        movie_id: movieId!,
        showtime_id: parseInt(showtimeId!),
        branch_id: showtimeData.Branch_id,
        hall_number: showtimeData.Hall_number,
        seat_number: seatId,
        price: SEAT_TYPES_MAP[seatInfo?.type || "Standard"].price,
        seat_type: seatInfo?.type,
      };
    });

    const cartProducts = concessionCart.map((c) => ({
      product_id: parseInt(c.item.id),
      quantity: c.quantity,
      name: c.item.name,
      price: c.item.price,
    }));

    console.log("Cart Ticket:", cartTickets);

    setTickets(cartTickets);
    setProducts(cartProducts);

    // 2. NAVIGATE WITH ONLY SIMPLE STRINGS (No Objects!)
    // We only pass metadata needed for titles/display, not the cart itself.

    // Ensure we convert the query object to string
    router.push(`/movies/${movieId}/payment`);
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RotateCw className="w-8 h-8 animate-spin" />
      </div>
    );
  if (error || !movieData || !showtimeData)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Error: {error}
      </div>
    );

  const hallName = `${showtimeData.Branch_name} - Hall ${showtimeData.Hall_number}`;
  const showtimeInfo = `${
    movieData.Title
  } | ${showtimeData.Start_time.substring(0, 5)} on ${showtimeData.Date}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <BookingSummaryHeader hallName={hallName} showtimeInfo={showtimeInfo} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <SeatMapSection
            seats={seats}
            selectedSeats={selectedSeats}
            toggleSeat={toggleSeat}
          />
          <ConcessionsSelection
            concessions={products}
            concessionCart={concessionCart}
            setConcessionCart={setConcessionCart}
            prices={calculatePrices}
            handleProceedToPayment={handleProceedToPayment}
            selectedSeatsCount={selectedSeats.length}
          />
        </div>
      </main>
    </div>
  );
}
