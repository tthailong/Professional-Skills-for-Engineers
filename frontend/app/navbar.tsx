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
import { useState } from "react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logoutUser } = useUserStore();
  // Assuming admin object contains role info, e.g., { name: "...", role: "primary" }
  const { admin, logoutAdmin } = useAdminStore();
  const router = useRouter();
  const pathname = usePathname();
  const logout = () => {
    if (user) {
      logoutUser();
    }
    if (admin) {
      logoutAdmin();
    }
    router.push("/");
  };

  // --- ADMIN CHANGE PASSWORD STATE ---
  const [isAdminChangePasswordOpen, setIsAdminChangePasswordOpen] =
    useState(false);
  const [adminPasswordForm, setAdminPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [adminPasswordError, setAdminPasswordError] = useState("");

  const handleAdminPasswordChangeInput = (
    e: React.ChangeEvent<HTMLInputElement>
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

      if (!res.ok) {
        throw new Error(data.detail || "Failed to change password");
      }

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

  // --- Navigation Configuration ---

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
    {
      href: "/admin/primary/movies",
      label: "Movies",
      icon: Film,
    },
    {
      href: "/admin/primary/events",
      label: "Events",
      icon: Calendar,
    },
    {
      href: "/admin/primary/admins",
      label: "Admin",
      icon: Users,
    }, // Manage other admins
    {
      href: "/admin/primary/branches",
      label: "Branch (Admin)",
      icon: MapPin,
    },
    {
      href: "/admin/primary/product-voucher",
      label: "Product & Voucher",
      icon: ShoppingBag,
    },
  ];

  const adminRegularLinks = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/bookings", label: "Booking", icon: CreditCard },
    // Grouping Showtime, Movie, Events under one Branch Manager link
    {
      href: "/admin/branch-manager",
      label: "Branch Manager",
      icon: Clapperboard,
    },
  ];

  // --- Logic to determine active links ---
  const getActiveLinks = () => {
    if (!admin) return userLinks;

    // CHECK: Adjust 'primary' to match your actual database role string
    if (admin.role === "primary") {
      return adminPrimaryLinks;
    }

    return adminRegularLinks;
  };

  const navLinks = getActiveLinks();

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Film className="w-6 h-6 text-primary" />
          <span className="text-xl font-bold text-foreground">
            HCMUT Cinema
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {/* Dynamic Links Mapping */}
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-md ${
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-foreground hover:text-primary hover:bg-secondary"
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}

          {/* Auth Section */}
          <div className="flex items-center gap-3 ml-4 border-l pl-4 border-border/50">
            {/* ... (Auth buttons) */}
            {!admin && user && user.email && (
              <span className="text-sm text-muted-foreground max-w-[100px] truncate">
                <Link href={"/profile"}>{user.name}</Link>
              </span>
            )}

            {/* Show Admin Name */}
            {admin && (
              <span className="text-sm font-semibold text-primary">
                {admin.name || "Admin"}
              </span>
            )}

            {/* User Logout */}
            {!admin && user && user.email && (
              <Button
                onClick={logout}
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            )}

            {/* Admin Logout */}
            {admin && (
              <Button
                // Assuming useAdminStore has a logout function, otherwise implement logic here
                onClick={logout}
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            )}

            {/* Sign In Button (Only show if no one is logged in) */}
            {!user && !admin && (
              <Link href="/auth/login">
                <Button size="sm">Sign In</Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-foreground p-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="text-2xl">☰</span>
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-card border-t border-border p-4 flex flex-col gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-2 py-2 text-foreground hover:text-primary"
              onClick={() => setIsOpen(false)}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          ))}

          <div className="border-t border-border my-2 pt-2">
            {!user && !admin ? (
              <Link
                href="/auth/login"
                className="block py-2 text-primary font-medium"
              >
                Sign In
              </Link>
            ) : (
              <>
                <button
                  onClick={() => {
                    if (admin && logoutAdmin) logoutAdmin();
                    else logoutUser();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-2 py-2 text-destructive w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* --- ADMIN CHANGE PASSWORD DIALOG --- */}
      <Dialog
        open={isAdminChangePasswordOpen}
        onOpenChange={setIsAdminChangePasswordOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Admin Change Password</DialogTitle>
            <DialogDescription>
              Update your administrative account password.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {adminPasswordError && (
              <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                {adminPasswordError}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Password</label>
              <Input
                name="oldPassword"
                type="password"
                value={adminPasswordForm.oldPassword}
                onChange={handleAdminPasswordChangeInput}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">New Password</label>
              <Input
                name="newPassword"
                type="password"
                value={adminPasswordForm.newPassword}
                onChange={handleAdminPasswordChangeInput}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Confirm New Password
              </label>
              <Input
                name="confirmPassword"
                type="password"
                value={adminPasswordForm.confirmPassword}
                onChange={handleAdminPasswordChangeInput}
              />
            </div>
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
    </nav>
  );
}
