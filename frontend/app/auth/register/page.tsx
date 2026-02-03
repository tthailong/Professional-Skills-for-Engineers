// src/app/auth/register/page.tsx (or where your component is located)

"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Film, User, Mail, Lock } from "lucide-react";

// 1. Import the updated user store (assuming you have a RegisterData type in store or elsewhere)
import { useUserStore } from "@/store/useUserStore";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // 2. Keep this local state for client-side validation
  const [localError, setLocalError] = useState("");

  // 3. Get state and actions from the store
  const { registerUser } = useUserStore();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setLocalError("Passwords do not match");
      setIsLoading(false); // Make sure to set loading false on client-side fail!
      return;
    }

    const { confirmPassword, ...registerData } = formData;

    try {
      await registerUser(registerData as Parameters<typeof registerUser>[0]);

      // Only redirect if registerUser succeeded and updated the store
      const user = useUserStore.getState().user;
      if (user) {
        router.push("/movies");
      }
    } catch (error) {
      // If registerApiCall threw an error, it is caught here.
      console.error("Registration failed:", error);
      // The store action (registerUser) should have already set the error state,
      // but adding this catch prevents uncaught promises.
    } finally {
      setIsLoading(false); // Ensure loading is always stopped
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-secondary flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Film className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>Join CineBook to start booking</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* ... (Input fields remain the same) ... */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10 bg-secondary border-border text-foreground"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 bg-secondary border-border text-foreground"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Phone
              </label>
              <Input
                name="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={handleChange}
                className="bg-secondary border-border text-foreground"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Date of Birth
                </label>
                <Input
                  name="dob"
                  type="date"
                  value={formData.dob}
                  onChange={handleChange}
                  className="bg-secondary border-border text-foreground"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full bg-secondary border border-border rounded px-3 py-2 text-foreground h-10"
                  required
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 bg-secondary border-border text-foreground"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-10 bg-secondary border-border text-foreground"
                  required
                />
              </div>
            </div>

            {/* 8. Show local form error OR API error */}
            {localError && (
              <div className="bg-destructive/20 border border-destructive text-destructive p-3 rounded text-sm">
                {localError}
              </div>
            )}

            <Button
              type="submit"
              // 9. Use 'isLoading' from the store
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
