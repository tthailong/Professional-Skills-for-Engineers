"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LayoutDashboard, Mail, Lock, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAdminStore } from "@/store/useAdminStore";
import { Admin } from "@/types/user";
import { API_BASE_URL } from "@/store/useUserStore";

// ------------------------------------------------------------------
// PHẦN GIẢ LẬP GỌI API ĐĂNG NHẬP ADMIN
// ------------------------------------------------------------------
interface AdminLoginData {
  email: string;
  password: string;
}

const loginAdminApiCall = async ({
  email,
  password,
}: AdminLoginData): Promise<Admin> => {
  // 1. Prepare the API request
  const response = await fetch(`${API_BASE_URL}/auth/admin/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // Mapped Request Body to FastAPI's LoginRequest model
    body: JSON.stringify({
      email: email,
      password: password,
    }),
  });

  // 2. Handle Errors (e.g., 401 Unauthorized)
  if (!response.ok) {
    const errorBody = await response.json();
    // Throwing the error with the detailed message from the backend's HTTPException
    throw new Error(errorBody.detail || "Admin authentication failed.");
  }

  // 3. Process Successful Response (200 OK)
  const adminData = await response.json();

  // 4. Transform the AdminOut response into the local 'Admin' type
  // Note: The 'Role' field is now correctly included by the stored procedure's CASE statement.
  console.log("admin data", adminData);
  const loggedInAdmin: Admin = {
    id: String(adminData.Admin_id),
    name: adminData.Name,
    email: adminData.Email,
    gender: adminData.Gender,
    dateOfBirth: adminData.Date_of_birth,
    phone: adminData.Phone,
    role: adminData.Role as "primary" | "regular",
    assignedBranchId: adminData.Branch_id
      ? String(adminData.Branch_id)
      : undefined,
    assignedBranchName: adminData.Branch_Name,
  };

  return loggedInAdmin;
};
// ------------------------------------------------------------------

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Quản lý trạng thái cục bộ
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Lấy action loginAdmin từ store (sử dụng mock hook)
  const loginAdmin = useAdminStore((state) => state.loginAdmin);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoading(true);

    try {
      // 1. GỌI API ĐỂ ĐĂNG NHẬP ADMIN
      const adminData = await loginAdminApiCall({ email, password });

      // 2. CẬP NHẬT DỮ LIỆU ADMIN VÀO ZUSTAND STORE
      loginAdmin(adminData);
      if (adminData.role === "primary") {
        router.push("/admin/primary/movies");
      } else {
        router.push("/admin/dashboard");
      }
    } catch (error) {
      // 4. XỬ LÝ LỖI
      console.error("Admin Login failed:", error);
      setLoginError(
        error instanceof Error
          ? error.message
          : "An unknown error occurred during login."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-secondary flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <LayoutDashboard className="w-8 h-8 text-accent" />
          </div>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>Access the admin dashboard</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-secondary border-border text-foreground"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-secondary border-border text-foreground"
                  required
                />
              </div>
            </div>

            {/* HIỂN THỊ LỖI CỤC BỘ */}
            {loginError && (
              <div className="bg-destructive/20 border border-destructive text-destructive p-3 rounded text-sm text-center">
                {loginError}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Admin Sign In"
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            <Link href="/auth/login" className="text-primary hover:underline">
              Back to Customer Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
