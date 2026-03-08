"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/store/useAdminStore";
import { motion } from "framer-motion";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { admin } = useAdminStore();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !admin) {
      router.push("/auth/admin-login");
    }
  }, [admin, router, isMounted]);

  if (!isMounted) return null;

  if (!admin) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background relative overflow-hidden">
        {/* Thematic background blurs during loading */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[100px]" />

        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="relative z-10 flex flex-col items-center"
        >
          <div className="w-16 h-16 border-4 border-muted border-t-primary rounded-full animate-spin mb-6 shadow-xl shadow-primary/20" />
          <p className="text-sm font-black text-primary uppercase tracking-widest animate-pulse">
            Authenticating Admin...
          </p>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
