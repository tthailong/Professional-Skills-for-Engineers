"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/app/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Ticket,
  Download,
  Share2,
  Calendar,
  MapPin,
  Clock,
  ShoppingBag,
} from "lucide-react";
import { useUserCart } from "@/store/useUserCart";

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const { tickets, products, getTotalPrice } = useUserCart();
  const [isMounted, setIsMounted] = React.useState(false);

  // Extract data passed from the payment page success redirect
  const bookingId = searchParams.get("bookingId") || "PENDING";
  const [paymentStatus, setPaymentStatus] = React.useState<string | null>(null);

  React.useEffect(() => {
    setIsMounted(true);
    
    // Trigger the backend to verify the payment status with ZaloPay
    if (bookingId !== "PENDING") {
      const urlStatus = searchParams.get("status");
      
      // If ZaloPay explicitly says it failed or was cancelled in the URL
      // (status 1 is success, anything else is usually a fail/cancel)
      if (urlStatus && urlStatus !== "1") {
        console.log("Payment failed based on URL status, deleting receipt...");
        fetch(`http://localhost:8000/receipts/${bookingId}`, { method: "DELETE" })
          .then(() => setPaymentStatus("Failed"))
          .catch(err => console.error("Error deleting failed receipt:", err));
      } else {
        // Otherwise, verify with the backend (which queries ZaloPay API)
        fetch(`http://localhost:8000/receipts/${bookingId}/status`)
          .then(res => res.json())
          .then(data => {
            console.log("Payment status verified:", data);
            setPaymentStatus(data.status);
          })
          .catch(err => console.error("Error verifying payment:", err));
      }
    }
  }, [bookingId]);

  // Derived data from Cart (only valid on client)
  const movieName = isMounted ? (tickets[0]?.movie_name || "Unknown Movie") : "Loading...";
  const seats = isMounted ? tickets.map((t) => t.seat_number).join(", ") : "";
  const totalAmount = isMounted ? getTotalPrice().toFixed(0) : "0";

  // Create a QR code URL (using a placeholder service for visual effect)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${bookingId}`;

  if (paymentStatus === "Failed") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="flex justify-center">
            <div className="bg-red-500/10 p-4 rounded-full">
              <CheckCircle className="w-16 h-16 text-red-500 rotate-45" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Payment Failed</h1>
          <p className="text-muted-foreground">
            Your payment was declined or cancelled. The seats have been released.
            Please try booking again if you still wish to watch this movie.
          </p>
          <div className="pt-4">
            <Link href="/movies">
              <Button className="w-full">Back to Movies</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Success Banner */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-20 h-20 text-green-500 animate-in zoom-in duration-300" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {paymentStatus === "Paid" ? "Booking Confirmed!" : "Verifying Payment..."}
          </h1>
          <p className="text-muted-foreground text-lg">
            {paymentStatus === "Paid" 
              ? `Your tickets are ready. Receipt ID: ${bookingId}`
              : "Please wait while we verify your transaction..."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ticket & Product Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Info */}
            <Card className="border-border bg-card overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-accent p-6 text-primary-foreground">
                <h2 className="text-2xl font-bold">{movieName}</h2>
                <p className="text-primary-foreground/80">
                  Thank you for your purchase!
                </p>
              </div>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <Ticket className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Seats ({tickets.length})
                      </p>
                      <p className="text-foreground font-semibold">
                        {seats || "No seats selected"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Hall</p>
                      <p className="text-foreground font-semibold">
                        {tickets[0]?.hall_number
                          ? `Hall ${tickets[0].hall_number}`
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Products Section */}
                {products.length > 0 && (
                  <div className="border-t border-border pt-6">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-primary" />
                      Snacks & Drinks
                    </h3>
                    <div className="space-y-2">
                      {products.map((product, index) => (
                        <div
                          key={index}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-muted-foreground">
                            {product.name || `Product ${product.product_id}`} (x
                            {product.quantity})
                          </span>
                          <span className="text-foreground font-medium">
                            $
                            {((product.price || 0) * product.quantity).toFixed(
                              0
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-border pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold text-foreground">
                      Receipt ID
                    </span>
                    <span className="text-primary font-mono font-bold">
                      {bookingId}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-foreground">
                      Total Amount
                    </span>
                    <span className="text-2xl font-bold text-primary">
                      ${totalAmount}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* E-Ticket */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-accent" />
                  Your E-Tickets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-secondary p-6 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Booking Reference
                    </p>
                    <p className="text-2xl font-bold text-primary font-mono">
                      {bookingId}
                    </p>
                  </div>
                  <div className="w-32 h-32 bg-white rounded border-2 border-border p-2">
                    <img
                      src={qrCodeUrl}
                      alt="QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Present this QR code at the cinema counter
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <Card className="border-border bg-card sticky top-20">
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/bookings">
                  <Button
                    variant="outline"
                    className="w-full border-border text-foreground hover:bg-card bg-transparent"
                  >
                    View All Bookings
                  </Button>
                </Link>
                <Link href="/movies">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    Book Another Movie
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Important Info */}
            <Card className="border-border bg-card/50">
              <CardHeader>
                <CardTitle className="text-base">Important Notes</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <p>• Arrive 15 minutes before showtime</p>
                <p>• Bring a valid ID for verification</p>
                <p>• No refunds after 30 minutes from booking</p>
                <p>• Check email for confirmation details</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
