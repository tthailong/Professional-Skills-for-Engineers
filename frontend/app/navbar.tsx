"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Film,
  LogOut,
  LayoutDashboard,
  Ticket,
  MapPin,
  Calendar,
  Users,
  ShoppingBag,
  CreditCard,
  Clapperboard,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useUserStore, API_BASE_URL } from "@/store/useUserStore";
import { useAdminStore } from "@/store/useAdminStore";
import { useRouter, usePathname } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function Navbar() {
  const { user, logoutUser } = useUserStore();
  const { admin, logoutAdmin } = useAdminStore();
  const router = useRouter();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [showNav, setShowNav] = useState(true);
  const [lastScroll, setLastScroll] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  const [isAdminChangePasswordOpen, setIsAdminChangePasswordOpen] =
    useState(false);

  const [adminPasswordForm, setAdminPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [adminPasswordError, setAdminPasswordError] = useState("");

  /* ---------------- SCROLL LOGIC (SMOOTH + OPTIMIZED) ---------------- */

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      const current = window.scrollY;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(current > 30);

          if (current > lastScroll && current > 120) {
            setShowNav(false);
          } else {
            setShowNav(true);
          }

          setLastScroll(current);
          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScroll]);

  /* ---------------- AUTH ---------------- */

  const logout = () => {
    if (user) logoutUser();
    if (admin) logoutAdmin();
    router.push("/");
  };

  /* ---------------- PASSWORD CHANGE ---------------- */

  const handleAdminPasswordChangeInput = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setAdminPasswordForm((prev) => ({ ...prev, [name]: value }));
    setAdminPasswordError("");
  };

  const handleAdminChangePasswordSubmit = async () => {
    if (!admin?.id) return;

    if (adminPasswordForm.newPassword !== adminPasswordForm.confirmPassword) {
      setAdminPasswordError("New passwords do not match.");
      return;
    }

    if (adminPasswordForm.newPassword.length < 8) {
      setAdminPasswordError("Password must be at least 8 characters.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/admin/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: admin.id,
          old_password: adminPasswordForm.oldPassword,
          new_password: adminPasswordForm.newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);

      toast.success("Password changed successfully!");
      setIsAdminChangePasswordOpen(false);
      setAdminPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      setAdminPasswordError(err.message);
    }
  };

  /* ---------------- LINKS ---------------- */

  const userLinks = [
    { href: "/bookings", label: "My Booking", icon: Ticket },
    { href: "/movies", label: "Movies", icon: Film },
    { href: "/branches", label: "Branch", icon: MapPin },
    { href: "/events", label: "Events", icon: Calendar },
  ];

  const adminPrimaryLinks = [
    {
      href: "/admin/primary/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    { href: "/admin/primary/movies", label: "Movies", icon: Film },
    { href: "/admin/primary/events", label: "Events", icon: Calendar },
    { href: "/admin/primary/admins", label: "Admin", icon: Users },
    { href: "/admin/primary/branches", label: "Branch", icon: MapPin },
    {
      href: "/admin/primary/product-voucher",
      label: "Products",
      icon: ShoppingBag,
    },
  ];

  const adminRegularLinks = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/bookings", label: "Booking", icon: CreditCard },
    {
      href: "/admin/branch-manager",
      label: "Branch Manager",
      icon: Clapperboard,
    },
  ];

  const getLinks = () => {
    if (!admin) return userLinks;
    if (admin.role === "primary") return adminPrimaryLinks;
    return adminRegularLinks;
  };

  const navLinks = getLinks();

  /* ---------------- UI ---------------- */

  return (
    <>
      {/* NAVBAR */}
      <nav
        className={`
fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[96%] max-w-7xl
transition-all duration-500 ease-out
${
  showNav
    ? "opacity-100 translate-y-0"
    : "opacity-0 -translate-y-8 pointer-events-none"
}
`}
      >
        <div
          className={`
rounded-full px-6 py-3 flex items-center justify-between
transition-all duration-500 backdrop-blur-xl
${
  scrolled
    ? "bg-white/80 border border-rose-200 shadow-xl"
    : "bg-white/40 border border-white/30"
}
`}
        >
          {/* LOGO */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-lg text-rose-600"
          >
            <Film className="w-5 h-5" />
            LDHK Cinema
          </Link>

          {/* DESKTOP LINKS */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const active = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300
                  ${
                    active
                      ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-300/40"
                      : "hover:bg-rose-100 text-foreground"
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}

            {/* USER / ADMIN INFO */}
            {admin && (
              <span className="ml-3 font-semibold text-rose-600">
                {admin.name || "Admin"}
              </span>
            )}

            {!admin && user && (
              <Link
                href="/profile"
                className="ml-3 text-sm font-medium hover:text-rose-600 transition"
              >
                {user.name}
              </Link>
            )}

            {/* AUTH BUTTON */}
            {!user && !admin ? (
              <Link href="/auth/login">
                <Button className="ml-3 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow hover:scale-105 transition">
                  Sign In
                </Button>
              </Link>
            ) : (
              <Button
                onClick={logout}
                variant="ghost"
                className="ml-3 rounded-full hover:bg-rose-100"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* MOBILE BUTTON */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-xl font-bold"
          >
            ☰
          </button>
        </div>

        {/* MOBILE MENU */}
        <div
          className={`
md:hidden mt-3 rounded-2xl p-5 space-y-2 backdrop-blur-xl
border border-rose-200 bg-white/90 shadow-xl
transition-all duration-300
${open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}
`}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 font-medium py-2 hover:text-rose-600 transition"
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          ))}

          <div className="pt-3 border-t">
            {!user && !admin ? (
              <Link href="/auth/login">Sign In</Link>
            ) : (
              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                className="flex items-center gap-2 text-red-500"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* CHANGE PASSWORD DIALOG */}
      <Dialog
        open={isAdminChangePasswordOpen}
        onOpenChange={setIsAdminChangePasswordOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admin Change Password</DialogTitle>
            <DialogDescription>
              Update your administrative account password.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {adminPasswordError && (
              <div className="text-sm text-red-500 bg-red-100 p-2 rounded">
                {adminPasswordError}
              </div>
            )}

            <Input
              placeholder="Current Password"
              name="oldPassword"
              type="password"
              value={adminPasswordForm.oldPassword}
              onChange={handleAdminPasswordChangeInput}
            />

            <Input
              placeholder="New Password"
              name="newPassword"
              type="password"
              value={adminPasswordForm.newPassword}
              onChange={handleAdminPasswordChangeInput}
            />

            <Input
              placeholder="Confirm Password"
              name="confirmPassword"
              type="password"
              value={adminPasswordForm.confirmPassword}
              onChange={handleAdminPasswordChangeInput}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAdminChangePasswordOpen(false)}
            >
              Cancel
            </Button>

            <Button onClick={handleAdminChangePasswordSubmit}>
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
