"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Film, Ticket } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-linear-to-b from-background via-secondary to-background flex items-center justify-center">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="flex justify-center mb-6">
          <Film className="w-16 h-16 text-primary" />
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
          CineBook
        </h1>

        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Book your favorite movies, choose your seats, and enjoy the best
          cinema experience
        </p>

        <div className="flex flex-col md:flex-row gap-4 justify-center mb-12">
          <Link href="/movies">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            >
              <Ticket className="w-5 h-5" />
              Browse Movies
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button
              size="lg"
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10 bg-transparent"
            >
              Sign In
            </Button>
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          {[
            { title: "Easy Booking", desc: "Book tickets in minutes" },
            { title: "Best Seats", desc: "Choose your perfect seat" },
            { title: "Great Deals", desc: "Special discounts & vouchers" },
          ].map((feature, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-lg p-6"
            >
              <h3 className="text-lg font-semibold text-primary mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
