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
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white relative overflow-hidden">
        {/* Rose background blurs during loading */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-rose-50/60 blur-[100px]" />

        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="relative z-10 flex flex-col items-center"
        >
          <div className="w-16 h-16 border-4 border-rose-100 border-t-rose-600 rounded-full animate-spin mb-6 shadow-xl shadow-rose-200" />
          <p className="text-sm font-black text-rose-600 uppercase tracking-widest animate-pulse">
            Authenticating Admin...
          </p>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
