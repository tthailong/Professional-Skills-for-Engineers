"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/app/navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Gift,
  Star,
  Copy,
  CheckCircle,
  Ticket,
  Clock,
  Lock,
  Calendar,
  Phone,
  Mail,
  User,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useUserStore, API_BASE_URL } from "@/store/useUserStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Voucher {
  CV_id: number;
  Voucher_id: number;
  Status: string;
  Discount: number;
  Expiration: string;
  Condition: string;
  Description: string;
}

function formatDDMMYYYY(dateStr: string) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr; // fallback
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}
export default function ProfilePage() {
  // --- PROFILE STATE ---
  const { user } = useUserStore();
  console.log("user:", user);

  // start with empty strings so inputs are controlled
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "", // ISO date string 'YYYY-MM-DD' or empty
  });

  // when `user` becomes available, populate formData
  useEffect(() => {
    if (!user) return;

    // helper to convert different dob formats to YYYY-MM-DD
    const normalizeDob = (dob: any): string => {
      if (!dob) return "";

      // If already ISO 'YYYY-MM-DD' or full ISO, extract date portion
      if (typeof dob === "string") {
        // If it's DD/MM/YYYY -> convert
        const ddmmyyyy = /^\d{2}\/\d{2}\/\d{4}$/;
        const isoLike = /^\d{4}-\d{2}-\d{2}/;

        if (ddmmyyyy.test(dob)) {
          const [d, m, y] = dob.split("/");
          return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
        } else if (isoLike.test(dob)) {
          return dob.slice(0, 10); // keep YYYY-MM-DD
        } else {
          // attempt Date parse fallback
          const parsed = new Date(dob);
          if (!Number.isNaN(parsed.getTime()))
            return parsed.toISOString().slice(0, 10);
        }
      }

      // If it's a Date object
      if (dob instanceof Date && !Number.isNaN(dob.getTime())) {
        return dob.toISOString().slice(0, 10);
      }

      return "";
    };

    setFormData({
      name: user.name ?? "",
      email: user.email ?? "",
      phone: user.phone ?? "",
      dob: normalizeDob(user.dob),
    });
  }, [user]);
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);

  // --- MEMBERSHIP STATE ---
  interface Privilege {
    privilege_id: number;
    name: string;
    expiration: string;
    description: string;
  }

  interface MembershipData {
    customer_id: number;
    full_name: string;
    membership: {
      points: number;
      membership_id: number;
      type: string;
      start_date: string;
      privileges: Privilege[];
    };
    reviews: {
      movie_id: number;
      title: string;
      rating: number;
      date: string;
      comment: string;
    }[];
    receipts: {
      receipt_id: number;
      date: string;
      method: string;
      voucher_id: number | null;
      tickets: any[];
      products: any[];
      total_amount: number;
    }[];
  }

  const [membershipData, setMembershipData] = useState<MembershipData | null>(
    null
  );

  useEffect(() => {
    const fetchMembership = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(
          `${API_BASE_URL}/customers/${user.id}/membership`
        );
        if (res.ok) {
          const data = await res.json();
          console.log(data);
          setMembershipData(data);
        }
      } catch (err) {
        console.error("Error fetching membership:", err);
      }
    };
    fetchMembership();
  }, [user?.id]);

  // --- LOYALTY STATE & DATA ---
  // TODO: Fetch this from API as well if available

  // --- FETCH VOUCHERS ---
  useEffect(() => {
    const fetchVouchers = async () => {
      if (!user?.id) return;
      setLoadingVouchers(true);
      try {
        const res = await fetch(`${API_BASE_URL}/vouchers/${user.id}`);
        if (!res.ok) {
          if (res.status === 404) {
            setVouchers([]);
            return;
          }
          throw new Error("Failed to load vouchers");
        }
        const data = await res.json();
        setVouchers(data);
      } catch (err) {
        console.error("Error fetching vouchers:", err);
      } finally {
        setLoadingVouchers(false);
      }
    };

    fetchVouchers();
  }, [user?.id]);

  // Map API vouchers to UI format
  const myVouchers = vouchers.map((v) => ({
    id: v.CV_id.toString(),
    code: `VOUCHER-${v.Voucher_id}`, // Mock code generation
    title: v.Description || "Special Voucher",
    discount: `${v.Discount}% OFF`,
    desc: v.Condition,
    expiry: formatDDMMYYYY(v.Expiration),
    status: v.Status,
  }));

  // --- CHANGE PASSWORD STATE ---
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");

  // --- HANDLERS ---
  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSave = async () => {
    if (!user?.id) {
      toast.error("User not found");
      return;
    }

    try {
      // Split name into first and last name
      const nameParts = formData.name.trim().split(" ");
      const fname = nameParts[0] || "";
      const lname = nameParts.slice(1).join(" ") || nameParts[0]; // If no last name, use first name

      // Convert dob from YYYY-MM-DD to DD/MM/YYYY
      const convertToDDMMYYYY = (isoDate: string): string => {
        if (!isoDate) return "";
        const [year, month, day] = isoDate.split("-");
        return `${day}/${month}/${year}`;
      };

      const response = await fetch(`${API_BASE_URL}/auth/customer/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: user.id,
          fname: fname,
          lname: lname,
          gender: "Male", // Default gender - consider adding gender field to User type or form
          email: formData.email,
          dob: convertToDDMMYYYY(formData.dob),
          phone: formData.phone || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to update profile");
      }

      // Update local user store with new data
      useUserStore.setState({
        user: {
          ...user,
          name: formData.name,
          email: formData.email,
          phone: data.Phone || formData.phone,
          dob: formData.dob,
        },
      });

      toast.success("Profile updated successfully!");
      setSaved(true);
      setIsEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
      console.error("Profile update error:", error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const handlePasswordChangeInput = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    setPasswordError(""); // clear error on type
  };

  const handleChangePasswordSubmit = async () => {
    if (!user?.id) return;
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/customer/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          old_password: passwordForm.oldPassword,
          new_password: passwordForm.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to change password");
      }

      toast.success("Password changed successfully!");
      setIsChangePasswordOpen(false);
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      setPasswordError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">
          My Dashboard
        </h1>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-secondary border border-border">
            <TabsTrigger value="profile">Profile Details</TabsTrigger>
            <TabsTrigger value="loyalty">Loyalty Program</TabsTrigger>
            <TabsTrigger value="vouchers">My Vouchers</TabsTrigger>
          </TabsList>

          {/* --- TAB 1: PROFILE --- */}
          <TabsContent
            value="profile"
            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            <div className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Avatar & Quick Stats */}
                <Card className="border-border bg-card md:col-span-1 h-fit">
                  <CardContent className="pt-6 flex flex-col items-center text-center">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent p-1 mb-4 shadow-lg">
                      <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                        {/* Placeholder Avatar */}
                        <span className="text-4xl font-bold text-primary">
                          {formData.name
                            ? formData.name.charAt(0).toUpperCase()
                            : "U"}
                        </span>
                      </div>
                    </div>
                    <h2 className="text-xl font-bold text-foreground mb-1">
                      {formData.name || "User"}
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      {membershipData?.membership.type} Member
                    </p>

                    <div className="w-full grid grid-cols-2 gap-2 text-center border-t border-border pt-4 mt-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Points</p>
                        <p className="font-bold text-primary">
                          {membershipData?.membership.points}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Vouchers
                        </p>
                        <p className="font-bold text-primary">
                          {vouchers.length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Right Column: Form Details */}
                <Card className="border-border bg-card md:col-span-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">
                          Personal Information
                        </CardTitle>
                        <CardDescription>
                          Manage your account details
                        </CardDescription>
                      </div>
                      {!isEditing && (
                        <Button
                          onClick={() => setIsEditing(true)}
                          variant="outline"
                          size="sm"
                          className="gap-2"
                        >
                          Edit Details
                        </Button>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {saved && (
                      <div className="bg-green-500/10 border border-green-500/50 text-green-600 p-3 rounded-md text-sm flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                        <CheckCircle className="w-4 h-4" />
                        Profile updated successfully!
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <User className="w-4 h-4" /> Full Name
                        </label>
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleProfileChange}
                          disabled={!isEditing}
                          className={`bg-secondary/50 border-border ${
                            !isEditing
                              ? "border-transparent shadow-none px-0 bg-transparent font-semibold text-lg h-auto"
                              : ""
                          }`}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <Mail className="w-4 h-4" /> Email Address
                        </label>
                        <Input
                          name="email"
                          type="email"
                          value={formData.email}
                          disabled
                          className="bg-transparent border-transparent shadow-none px-0 font-semibold text-lg h-auto opacity-70"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <Phone className="w-4 h-4" /> Phone Number
                        </label>
                        <Input
                          name="phone"
                          value={formData.phone}
                          onChange={handleProfileChange}
                          disabled={!isEditing}
                          className={`bg-secondary/50 border-border ${
                            !isEditing
                              ? "border-transparent shadow-none px-0 bg-transparent font-semibold text-lg h-auto"
                              : ""
                          }`}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <Calendar className="w-4 h-4" /> Date of Birth
                        </label>
                        <Input
                          name="dob"
                          type="text"
                          value={
                            formData.dob ? formatDDMMYYYY(formData.dob) : ""
                          }
                          disabled
                          className="bg-transparent border-transparent shadow-none px-0 font-semibold text-lg h-auto opacity-70"
                        />
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex gap-3 pt-6 border-t border-border justify-end">
                        <Button
                          onClick={() => setIsEditing(false)}
                          variant="ghost"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleProfileSave}
                          className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[100px]"
                        >
                          Save Changes
                        </Button>
                      </div>
                    )}

                    {!isEditing && (
                      <div className="pt-4 border-t border-border">
                        <Button
                          variant="link"
                          className="text-muted-foreground hover:text-destructive p-0 h-auto text-sm flex items-center gap-2 transition-colors"
                          onClick={() => setIsChangePasswordOpen(true)}
                        >
                          <Lock className="w-3 h-3" />
                          Change Password
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* --- TAB 2: LOYALTY --- */}
          <TabsContent value="loyalty">
            <div className="space-y-6">
              {/* Loyalty Status Cards */}
              <Card className="border-border bg-gradient-to-br from-primary/10 to-accent/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Star className="w-5 h-5 text-orange-500 fill-orange-500" />
                    Loyalty Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">
                        Current Tier
                      </p>
                      <p className="text-4xl font-bold text-primary">
                        {membershipData?.membership.type}
                      </p>
                      {/* <p className="text-sm text-muted-foreground mt-1">
                        Member since {loyaltyData.memberSince}
                      </p> */}
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">
                        Current Points
                      </p>
                      <p className="text-4xl font-bold text-green-600">
                        {membershipData?.membership.points}
                      </p>
                    </div>
                  </div>

                  {/* <div className="bg-background/50 rounded p-4 border border-border/50">
                    <div className="flex justify-between text-sm mb-2 font-medium">
                      <span>Progress to Next Tier</span>
                      <span className="text-muted-foreground">
                        {Math.max(
                          0,
                          loyaltyData.nextTierPoints - loyaltyData.currentPoints
                        )}{" "}
                        pts needed
                      </span>
                    </div>
                    <div className="w-full bg-border rounded-full h-3">
                      <div
                        className="bg-primary h-3 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            100,
                            (loyaltyData.currentPoints /
                              loyaltyData.nextTierPoints) *
                              100
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>
                        Lifetime Earned: {loyaltyData.currentPoints} pts
                      </span>
                      <span>{loyaltyData.nextTierPoints} pts</span>
                    </div>
                  </div> */}
                </CardContent>
              </Card>

              {/* Loyalty Sub-Tabs */}
              <Tabs defaultValue="benefits" className="w-full">
                <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0">
                  <TabsTrigger
                    value="benefits"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                  >
                    Your Active Benefits
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="benefits" className="pt-6">
                  {membershipData?.membership.privileges &&
                  membershipData.membership.privileges.length > 0 ? (
                    <div className="space-y-4">
                      <Card className="border-border border-l-4 border-l-primary">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="font-bold flex items-center gap-2 text-lg">
                              {membershipData.membership.type} Member
                              <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                                ACTIVE
                              </span>
                            </h3>
                            <span className="text-xs text-muted-foreground">
                              Valid since{" "}
                              {formatDDMMYYYY(
                                membershipData.membership.start_date
                              )}
                            </span>
                          </div>
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {membershipData.membership.privileges.map(
                              (privilege) => (
                                <li
                                  key={privilege.privilege_id}
                                  className="text-sm text-muted-foreground flex items-start gap-2 bg-secondary/30 p-2 rounded"
                                >
                                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                  <div>
                                    <span className="font-medium text-foreground block">
                                      {privilege.name}
                                    </span>
                                    <span className="text-xs opacity-80">
                                      {privilege.description}
                                    </span>
                                    {privilege.expiration &&
                                      privilege.expiration !== "None" && (
                                        <span className="text-[10px] block text-orange-500 mt-1">
                                          Expires:{" "}
                                          {formatDDMMYYYY(privilege.expiration)}
                                        </span>
                                      )}
                                  </div>
                                </li>
                              )
                            )}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No active membership benefits found.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>

          {/* --- TAB 3: MY VOUCHERS (NEW) --- */}
          <TabsContent value="vouchers">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myVouchers.map((voucher) => (
                <Card
                  key={voucher.id}
                  className={`border-border overflow-hidden ${
                    voucher.status === "Expired" ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Left side (Visual) */}
                    <div className="bg-primary/10 p-6 flex flex-col items-center justify-center min-w-[120px] border-b sm:border-b-0 sm:border-r border-border border-dashed">
                      <Ticket className="w-8 h-8 text-primary mb-2" />
                      <span className="font-bold text-xl text-primary">
                        {voucher.discount}
                      </span>
                    </div>

                    {/* Right side (Info) */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-lg">{voucher.title}</h3>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              voucher.status === "Active"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {voucher.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {voucher.desc}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          Expires: {voucher.expiry}
                        </div>
                        {voucher.status === "Active" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs gap-2"
                            onClick={() => copyToClipboard(voucher.code)}
                          >
                            {voucher.code} <Copy className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* --- CHANGE PASSWORD DIALOG --- */}
      <Dialog
        open={isChangePasswordOpen}
        onOpenChange={setIsChangePasswordOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and a new password to update your
              account security.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {passwordError && (
              <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                {passwordError}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Password</label>
              <Input
                name="oldPassword"
                type="password"
                value={passwordForm.oldPassword}
                onChange={handlePasswordChangeInput}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">New Password</label>
              <Input
                name="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={handlePasswordChangeInput}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Confirm New Password
              </label>
              <Input
                name="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChangeInput}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsChangePasswordOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleChangePasswordSubmit}>
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Icon component import helper for compilation
function Users(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
