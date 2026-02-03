import type React from "react";
import type { Metadata } from "next";
import { Baloo_Chettan_2 } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Toast } from "@/components/ui/toast";
import { Toaster } from "sonner";

const balooFont = Baloo_Chettan_2({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CineBook - Movie Ticket Booking",
  description: "Book your favorite movie tickets online",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${balooFont.className} font-sans antialiased`}>
        {children}
        <Analytics />
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
