"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { API_BASE_URL, useUserStore } from "@/store/useUserStore";
import { User } from "@/types/user";
import { Film, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

// ------------------------------------------------------------------
const loginApiCall = async (email: string, password: string): Promise<User> => {
  // 1. Prepare the API request
  const response = await fetch(`${API_BASE_URL}/auth/customer/login`, {
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

  // 2. Handle Errors (e.g., 401 Unauthorized, 400 Bad Request)
  if (!response.ok) {
    // Parse the error detail returned by your FastAPI endpoint
    const errorBody = await response.json();

    // 💡 Note: In the real app, the toast should be triggered by the
    // component watching the store's error state, but this function throws
    // the error that leads to the failure state.
    // toast.error("Authentication Failed: Wrong Password or Email");

    throw new Error(errorBody.detail || "Invalid email or password.");
  }

  // 3. Process Successful Response (200 OK)
  const customerData = await response.json();

  // toast.success("Authentication Success");

  // 4. Transform the CustomerOut response into the local 'User' type
  const loggedInUser: User = {
    id: String(customerData.Customer_id),
    // Combine FName and LName back into the 'name' field
    name: `${customerData.FName} ${customerData.LName}`,
    email: customerData.Email,
    phone: customerData.Phone,
    dob: customerData.Date_of_birth,
    loyaltyPoints: customerData.Loyal_point,

    // ⚠️ Placeholder: These fields are not returned by your CustomerOut model,
    // so we use mock/default values. If you need this data, you must update
    // your SQL stored procedure (login_customer) to return it.
    createdAt: new Date(),
  };

  return loggedInUser;
};
// ------------------------------------------------------------------

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Thêm state cho Loading và Error
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Lấy action loginUser từ store
  const loginUser = useUserStore((state) => state.loginUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoading(true);

    try {
      // 1. GỌI API ĐỂ ĐĂNG NHẬP
      // Hàm này sẽ trả về đối tượng User nếu thành công
      const userData = await loginApiCall(email, password);

      // 2. CẬP NHẬT DỮ LIỆU VÀO ZUSTAND STORE
      loginUser(userData);

      // 3. CHUYỂN HƯỚNG SAU KHI THÀNH CÔNG
      router.push("/movies");
    } catch (error) {
      // 4. XỬ LÝ LỖI
      toast.error("Wrong Password or Email");
      console.error("Login failed:", error);
      setLoginError(
        error instanceof Error ? error.message : "An unknown error occurred.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Film className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to book your movies</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
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
                  className="pl-10 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-lg hover:shadow-xl transition"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href="/auth/register"
              className="text-primary hover:underline"
            >
              Register here
            </Link>
          </div>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            <Link
              href="/auth/admin-login"
              className="text-accent hover:underline"
            >
              Admin Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
