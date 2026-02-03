"use client";

import type React from "react";
import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/app/navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Lock,
  CreditCard,
  Smartphone,
  Landmark,
  Ticket,
  Search,
  ChevronLeft,
  ChevronRight,
  Tag,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL, useUserStore } from "@/store/useUserStore";
import { useUserCart } from "@/store/useUserCart"; // <--- IMPORT STORE

// --- Interfaces ---
interface Voucher {
  CV_id: number;
  Voucher_id: number;
  Status: string;
  Discount: number;
  Expiration: string;
  Condition: string;
  Description: string;
}

const ITEMS_PER_PAGE = 3;

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUserStore();

  // --- STORE HOOKS ---
  const {
    tickets,
    products,
    voucher: appliedVoucher,
    applyVoucher,
    removeVoucher,
    getTotalPrice,
    clearCart,
  } = useUserCart();

  // --- Display Data (from URL params, purely for UI) ---
  // The actual transaction data is in the Store, but we use URL for titles/dates

  // --- Payment State ---
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardData, setCardData] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    name: "",
  });
  const [upiData, setUpiData] = useState({ upiId: "" });
  const [bankData, setBankData] = useState({ accountNumber: "", ifscCode: "" });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  // --- Voucher State ---
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loadingVouchers, setLoadingVouchers] = useState(true);

  // Search & Pagination State
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // --- 1. Safety Check: Empty Cart ---
  // Since we removed persistence, a refresh wipes the cart.
  // We should warn the user or redirect if tickets are missing.
  useEffect(() => {
    if (tickets.length === 0) {
      toast.warning("Your session has expired or cart is empty.");
      router.push("/movies"); // Redirect to home/movies
    }
  }, [tickets, router]);

  // --- 2. Fetch Vouchers ---
  useEffect(() => {
    const fetchVouchers = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(`${API_BASE_URL}/vouchers/${user.id}`);
        if (!res.ok) {
          if (res.status === 404) {
            setVouchers([]);
            return;
          }
          throw new Error("Failed to load vouchers");
        }
        const data = await res.json();
        setVouchers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingVouchers(false);
      }
    };

    fetchVouchers();
  }, [user?.id]);

  // --- 3. Filter & Pagination Logic ---
  const filteredVouchers = useMemo(() => {
    return vouchers.filter((v) =>
      v.Condition.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [vouchers, searchQuery]);

  const totalPages = Math.ceil(filteredVouchers.length / ITEMS_PER_PAGE);

  const paginatedVouchers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredVouchers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredVouchers, currentPage]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleApplyVoucher = (voucher: Voucher) => {
    // Check if already applied
    if (appliedVoucher?.cv_id === voucher.CV_id) {
      removeVoucher(); // Deselect
      toast.info("Voucher removed");
    } else {
      // Update Store
      applyVoucher({
        cv_id: voucher.CV_id,
        code: `V${voucher.Voucher_id}`, // Mock code if not in API
        discount: voucher.Discount,
      });
      toast.success(`Applied discount: $${voucher.Discount}`);
    }
  };

  // --- 4. Price Calculation for UI ---
  const priceBreakdown = useMemo(() => {
    const subtotalTickets = tickets.reduce((sum, t) => sum + t.price, 0);
    const subtotalProducts = products.reduce(
      (sum, p) => sum + (p.price || 0) * p.quantity,
      0
    );
    const grossTotal = subtotalTickets + subtotalProducts;

    // Discount
    const discount = appliedVoucher ? appliedVoucher.discount : 0;
    const afterDiscount = Math.max(
      0,
      grossTotal - (discount * grossTotal) / 100
    );

    // Tax (18% of the discounted amount)

    // Final
    const finalTotal = afterDiscount;

    return {
      subtotalTickets,
      subtotalProducts,
      grossTotal,
      discount,
      finalTotal,
    };
  }, [tickets, products, appliedVoucher]);

  // --- Payment Input Handlers ---
  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardData((prev) => ({
      ...prev,
      [name]: value
        .replace(/\D/g, "")
        .slice(0, name === "cardNumber" ? 16 : name === "cvv" ? 4 : 4),
    }));
  };

  const formatCardNumber = (value: string) => {
    return value
      .replace(/\s/g, "")
      .replace(/(\d{4})/g, "$1 ")
      .trim();
  };

  const validatePayment = () => {
    setError("");
    if (paymentMethod === "card") {
      if (cardData.cardNumber.length < 16 || cardData.cvv.length < 3) {
        setError("Please enter valid card details");
        return false;
      }
    } else if (paymentMethod === "upi") {
      if (!upiData.upiId.includes("@")) {
        setError("Please enter a valid UPI ID");
        return false;
      }
    } else if (paymentMethod === "bank") {
      if (!bankData.accountNumber || !bankData.ifscCode) {
        setError("Please enter bank details");
        return false;
      }
    }
    return true;
  };

  const getCurrentDateFormatted = () => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // --- API CALL TO CREATE RECEIPT ---
  const handlePayment = async () => {
    if (!validatePayment()) return;
    if (!user) {
      toast.error("You must be logged in to pay");
      return;
    }

    console.log("Ticket:", tickets);
    setProcessing(true);

    try {
      // 1. Map Method to Enum
      let dbMethod = "CARD";
      if (paymentMethod === "upi") dbMethod = "UPI";
      if (paymentMethod === "bank") dbMethod = "BANK";

      // 2. Build Payload from STORE data
      const payload = {
        receipt_date: getCurrentDateFormatted(),
        method: dbMethod,
        customer_id: user.id,
        cv_id: appliedVoucher ? appliedVoucher.cv_id : null,

        // Map Products
        products: products.map((p) => ({
          product_id: p.product_id,
          quantity: p.quantity,
        })),

        // Map Tickets
        tickets: tickets.map((t) => ({
          movie_id: t.movie_id,
          showtime_id: t.showtime_id,
          branch_id: t.branch_id,
          hall_number: t.hall_number,
          seat_number: t.seat_number,
          price: t.price,
        })),
      };
      console.log("Buying:", JSON.stringify(payload));

      const response = await fetch(`${API_BASE_URL}/receipts/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Payment failed");
      }

      toast.success("Payment Successful!");

      // 4. Redirect
      router.push(`/bookings/confirmation?bookingId=${data.receipt_id}`);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (tickets.length === 0) {
    // Fallback UI while redirecting or if empty
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold">Cart is empty</h2>
          <p className="text-muted-foreground">Redirecting you back...</p>
          <Button className="mt-4" onClick={() => router.push("/movies")}>
            Go to Movies
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Complete Payment
        </h1>
        <p className="text-muted-foreground mb-8">
          Secure and fast payment for your booking
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* --- SECTION: VOUCHERS --- */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-primary" />
                  Select Voucher
                </CardTitle>
                <CardDescription>
                  Search and apply vouchers to your booking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative mb-4">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search by condition..."
                    className="pl-9 bg-secondary border-border"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>

                {loadingVouchers ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : filteredVouchers.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-sm border-dashed border rounded-md">
                    No vouchers found.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {paginatedVouchers.map((voucher) => {
                      const getMinSpend = (cond: string) => {
                        if (!cond) return 0;
                        const match = cond.match(/\$(\d+)/);
                        return match ? parseFloat(match[1]) : 0;
                      };

                      const isSelected =
                        appliedVoucher?.cv_id === voucher.CV_id;
                      const isUsable = voucher.Status === "Unused";
                      const isBlocked =
                        getMinSpend(voucher.Condition) >
                        priceBreakdown.grossTotal;

                      return (
                        <div
                          key={voucher.CV_id}
                          className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          } ${
                            !isUsable || isBlocked ? "opacity-60 grayscale" : ""
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`p-2 rounded-full ${
                                isSelected ? "bg-primary/20" : "bg-secondary"
                              }`}
                            >
                              <Tag
                                className={`w-4 h-4 ${
                                  isSelected
                                    ? "text-primary"
                                    : "text-muted-foreground"
                                }`}
                              />
                            </div>
                            <div>
                              <div className="font-semibold text-foreground flex items-center gap-2">
                                Save {voucher.Discount}%
                                {!isUsable && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Used
                                  </Badge>
                                )}
                                {isBlocked && isUsable && (
                                  <Badge
                                    variant="destructive"
                                    className="text-xs"
                                  >
                                    Min spend not met
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {voucher.Description}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-1">
                                Expires: {voucher.Expiration}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant={isSelected ? "default" : "outline"}
                            disabled={!isUsable || isBlocked}
                            onClick={() => handleApplyVoucher(voucher)}
                          >
                            {isSelected ? "Applied" : "Apply"}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>

              {totalPages > 1 && (
                <CardFooter className="flex justify-between py-3 border-t border-border/50">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardFooter>
              )}
            </Card>

            {/* --- SECTION: PAYMENT METHODS --- */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  Select Payment Method
                </CardTitle>
                <CardDescription>Choose how you want to pay</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={paymentMethod} onValueChange={setPaymentMethod}>
                  <TabsList className="grid w-full grid-cols-3 bg-secondary mb-6">
                    <TabsTrigger
                      value="card"
                      className="flex items-center gap-2"
                    >
                      <CreditCard className="w-4 h-4" /> Card
                    </TabsTrigger>
                    <TabsTrigger
                      value="upi"
                      className="flex items-center gap-2"
                    >
                      <Smartphone className="w-4 h-4" /> UPI
                    </TabsTrigger>
                    <TabsTrigger
                      value="bank"
                      className="flex items-center gap-2"
                    >
                      <Landmark className="w-4 h-4" /> Bank
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="card" className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Cardholder Name
                      </label>
                      <Input
                        name="name"
                        placeholder="John Doe"
                        value={cardData.name}
                        onChange={handleCardChange}
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Card Number
                      </label>
                      <Input
                        name="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={formatCardNumber(cardData.cardNumber)}
                        onChange={handleCardChange}
                        maxLength={19}
                        className="bg-secondary border-border tracking-widest"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Expiry Date
                        </label>
                        <Input
                          name="expiry"
                          placeholder="MM/YY"
                          value={cardData.expiry}
                          onChange={handleCardChange}
                          className="bg-secondary border-border"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          CVV
                        </label>
                        <Input
                          name="cvv"
                          type="password"
                          placeholder="123"
                          value={cardData.cvv}
                          onChange={handleCardChange}
                          maxLength={4}
                          className="bg-secondary border-border"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="upi" className="space-y-4">
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
                      <p className="text-sm text-muted-foreground">
                        Enter UPI ID
                      </p>
                    </div>
                    <Input
                      placeholder="user@bank"
                      value={upiData.upiId}
                      onChange={(e) =>
                        setUpiData({ ...upiData, upiId: e.target.value })
                      }
                      className="bg-secondary border-border"
                    />
                  </TabsContent>

                  <TabsContent value="bank" className="space-y-4">
                    <Input
                      placeholder="Account Number"
                      value={bankData.accountNumber}
                      onChange={(e) =>
                        setBankData({
                          ...bankData,
                          accountNumber: e.target.value,
                        })
                      }
                      className="bg-secondary border-border mb-4"
                    />
                    <Input
                      placeholder="IFSC"
                      value={bankData.ifscCode}
                      onChange={(e) =>
                        setBankData({
                          ...bankData,
                          ifscCode: e.target.value.toUpperCase(),
                        })
                      }
                      className="bg-secondary border-border"
                    />
                  </TabsContent>
                </Tabs>

                {error && (
                  <div className="bg-destructive/20 border border-destructive text-destructive p-3 rounded mt-4 text-sm">
                    {error}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border bg-card/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Lock className="w-4 h-4 text-primary" />
                  Your payment is protected with 256-bit SSL encryption
                </div>
              </CardContent>
            </Card>
          </div>

          {/* --- RIGHT COLUMN: ORDER SUMMARY --- */}
          <div className="space-y-4">
            <Card className="border-border bg-card sticky top-20">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm border-b border-border pb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Movie</span>
                    <span className="text-foreground font-semibold text-right max-w-[200px] truncate">
                      {tickets.at(0)?.movie_name}
                    </span>
                  </div>

                  {/* Tickets Breakdown */}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Seats ({tickets.length})
                    </span>
                    <span className="text-foreground font-semibold">
                      {tickets.map((t) => t.seat_number).join(", ")}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground pl-2">
                    <span>Ticket Cost</span>
                    <span>${priceBreakdown.subtotalTickets.toFixed(0)}</span>
                  </div>

                  {/* Products Breakdown */}
                  {products.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Snacks & Drinks
                      </span>
                      <span className="text-foreground font-semibold">
                        ${priceBreakdown.subtotalProducts.toFixed(0)}
                      </span>
                    </div>
                  )}

                  {/* Discount Row */}
                  {appliedVoucher && (
                    <div className="flex justify-between text-green-500">
                      <span className="flex items-center gap-1">
                        <Ticket className="w-3 h-3" /> Voucher
                      </span>
                      <span className="font-semibold">
                        -{appliedVoucher.discount.toFixed(0)}%
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between">
                  <span className="font-semibold text-foreground">
                    Total Payable
                  </span>
                  <span className="text-2xl font-bold text-primary">
                    ${priceBreakdown.finalTotal.toFixed(0)}
                  </span>
                </div>

                <Button
                  onClick={handlePayment}
                  disabled={processing}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 font-semibold"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />{" "}
                      Processing...
                    </>
                  ) : (
                    `Pay $${priceBreakdown.finalTotal.toFixed(0)}`
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By clicking pay, you agree to our terms and conditions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
