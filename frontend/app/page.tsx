"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Film, Ticket } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen hero-glow flex items-center justify-center px-6 transition-colors duration-500">
      <div className="text-center max-w-5xl">
        {/* ICON */}
        <div className="mb-6 flex justify-center">
          <div className="p-6 rounded-full bg-card soft-shadow border border-border/50">
            <Film className="w-16 h-16 text-primary" />
          </div>
        </div>

        <h1
          className="text-6xl md:text-7xl font-extrabold mb-6 tracking-tight
            bg-gradient-to-r from-[var(--primary)] via-[var(--accent)] to-[var(--primary)]
            bg-clip-text text-transparent
            drop-shadow-[0_5px_15px_rgba(0,0,0,0.1)]
            transition-all duration-500
            hover:scale-105"
        >
          LDHK Cinema
        </h1>

        <p className="text-xl text-muted-foreground mb-12">
          Experience cinema like never before. Book tickets instantly. Choose
          seats beautifully.
        </p>

        <div className="flex flex-wrap gap-6 justify-center mb-24">
          <Link href="/movies">
            <Button className="rounded-full px-12 py-7 text-lg cinema-btn">
              <Ticket className="mr-2 w-5 h-5" />
              Browse Movies
            </Button>
          </Link>

          <Link href="/auth/login">
            <Button
              variant="outline"
              className="rounded-full px-12 py-7 text-lg border-primary text-primary hover:bg-primary/10 transition-all"
            >
              Login
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            ["⚡ Lightning Booking", "Finish booking in seconds"],
            ["💺 Perfect Seats", "AI suggests best seats"],
            ["🎁 Rewards", "Earn points every purchase"],
          ].map(([t, d], i) => (
            <div
              key={i}
              className="glow-card group bg-card border border-border rounded-2xl p-8 text-left soft-shadow hover:scale-105 transition-all duration-300 cursor-default"
            >
              <h3 className="font-bold text-lg mb-2 text-primary group-hover:text-white transition-colors duration-300">{t}</h3>
              <p className="text-muted-foreground group-hover:text-white/90 transition-colors duration-300">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
