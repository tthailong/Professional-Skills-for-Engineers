"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/store/useAdminStore";
import { Loader2 } from "lucide-react";

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
    // Only check after component has mounted on the client
    if (isMounted && !admin) {
      router.push("/auth/admin-login");
    }
  }, [admin, router, isMounted]);

  // Prevent hydration mismatch: don't render anything until mounted
  if (!isMounted) {
    return null;
  }

  // If not admin, show nothing (or a loader) while redirecting
  if (!admin) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // If admin exists, render the requested admin page
  return <>{children}</>;
}
