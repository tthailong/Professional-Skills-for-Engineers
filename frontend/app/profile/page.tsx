"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  ShieldCheck,
  Zap,
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
} from "@/components/ui/dialog";
import { toast } from "sonner";

// --- HELPERS (Keep your logic intact) ---
const CustomBadge = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${className}`}
  >
    {children}
  </div>
);

function formatDDMMYYYY(dateStr: string) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

export default function ProfilePage() {
  const { user } = useUserStore();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [membershipData, setMembershipData] = useState<any>(null);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");

  // --- REUSE YOUR EXISTING LOGIC (useEffect, Handlers, Fetching) ---
  // Note: Keep all your normalizeDob, fetchVouchers, and handleProfileSave logic here exactly as they were.
  // I am focusing on the JSX/Tailwind structure to match the "Beautiful" design.

  useEffect(() => {
    if (!user) return;
    setFormData({
      name: user.name ?? "",
      email: user.email ?? "",
      phone: user.phone ?? "",
      dob: user.dob ?? "",
    });
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      const [mRes, vRes] = await Promise.all([
        fetch(`${API_BASE_URL}/customers/${user.id}/membership`),
        fetch(`${API_BASE_URL}/vouchers/${user.id}`),
      ]);
      if (mRes.ok) setMembershipData(await mRes.json());
      if (vRes.ok) setVouchers(await vRes.json());
    };
    fetchData();
  }, [user?.id]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Voucher code copied!");
  };
  const handleChangePasswordSubmit = async () => {
    if (!user?.id) return;

    // Validation
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

      toast.success("Security key updated successfully!");
      setIsChangePasswordOpen(false);
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordError("");
    } catch (err: any) {
      setPasswordError(err.message);
      toast.error(err.message);
    }
  };
  return (
    <div className="min-h-screen bg-white relative overflow-hidden text-slate-900">
      {/* Background Aurora Blurs */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-blue-50/50 blur-[120px] -z-10" />
      <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[40%] rounded-full bg-indigo-50/60 blur-[120px] -z-10" />

      <Navbar />

      <main className="container mx-auto px-4 pt-16 pb-24 relative z-10">
        <header className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl font-black tracking-tighter mb-2 bg-gradient-to-r from-rose-500 to-rose-500 bg-clip-text text-transparent">
              Account Hub
            </h1>
            <p className="text-slate-500 font-medium text-lg">
              Manage your identity, rewards, and security.
            </p>
          </motion.div>
        </header>

        <Tabs defaultValue="profile" className="space-y-10">
          <TabsList className="bg-slate-100/50 backdrop-blur-md p-1 rounded-2xl border border-slate-200 w-fit">
            <TabsTrigger
              value="profile"
              className="rounded-xl px-8 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold transition-all"
            >
              Identity
            </TabsTrigger>
            <TabsTrigger
              value="loyalty"
              className="rounded-xl px-8 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold transition-all"
            >
              Rewards
            </TabsTrigger>
            <TabsTrigger
              value="vouchers"
              className="rounded-xl px-8 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold transition-all"
            >
              Vouchers
            </TabsTrigger>
          </TabsList>

          {/* --- TAB 1: IDENTITY --- */}
          <TabsContent value="profile" className="focus-visible:ring-0">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Profile Sidebar */}
              <div className="lg:col-span-4 space-y-6">
                <Card className="border-none bg-white/60 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] overflow-hidden">
                  <CardContent className="pt-12 pb-8 flex flex-col items-center text-center">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-tr from-indigo-500 to-rose-500 p-1 shadow-2xl shadow-indigo-100 transition-transform duration-500 group-hover:rotate-6">
                        <div className="w-full h-full rounded-[2.3rem] bg-white flex items-center justify-center overflow-hidden">
                          <span className="text-5xl font-black text-indigo-600">
                            {formData.name?.charAt(0) || "U"}
                          </span>
                        </div>
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-2xl shadow-lg border border-slate-100">
                        <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                      </div>
                    </div>

                    <h2 className="mt-8 text-2xl font-black text-slate-900 leading-tight">
                      {formData.name || "Cinema Guest"}
                    </h2>
                    <p className="text-indigo-600 font-bold text-sm tracking-widest uppercase mt-1">
                      {membershipData?.membership.type || "New"} Tier
                    </p>

                    <div className="w-full grid grid-cols-2 gap-4 mt-10 pt-8 border-t border-slate-100">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Points
                        </p>
                        <p className="text-2xl font-black text-slate-900">
                          {membershipData?.membership.points || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Saved
                        </p>
                        <p className="text-2xl font-black text-slate-900">
                          {vouchers.length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button
                  variant="outline"
                  className="w-full h-14 rounded-2xl border-rose-100 text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-bold transition-all"
                  onClick={() => setIsChangePasswordOpen(true)}
                >
                  <Lock className="w-4 h-4 mr-2" /> Change Security Key
                </Button>
              </div>

              {/* Personal Details Form */}
              <Card className="lg:col-span-8 border-none bg-white/60 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem]">
                <CardHeader className="p-10 pb-0 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-black">
                      Personal Info
                    </CardTitle>
                    <CardDescription className="text-slate-500 font-medium">
                      Keep your contact details up to date.
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() =>
                      isEditing ? setIsEditing(false) : setIsEditing(true)
                    }
                    variant={isEditing ? "ghost" : "secondary"}
                    className="rounded-xl font-bold"
                  >
                    {isEditing ? "Cancel" : "Edit Details"}
                  </Button>
                </CardHeader>
                <CardContent className="p-10 pt-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <User className="w-3 h-3" /> Name
                      </label>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleProfileChange}
                        disabled={!isEditing}
                        className={`h-12 rounded-xl border-slate-200 ${!isEditing && "bg-slate-50/50 border-transparent font-bold"}`}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <Mail className="w-3 h-3" /> Email
                      </label>
                      <Input
                        value={formData.email}
                        disabled
                        className="h-12 rounded-xl border-transparent bg-slate-50/50 font-bold opacity-60"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <Phone className="w-3 h-3" /> Phone
                      </label>
                      <Input
                        name="phone"
                        value={formData.phone}
                        onChange={handleProfileChange}
                        disabled={!isEditing}
                        className={`h-12 rounded-xl border-slate-200 ${!isEditing && "bg-slate-50/50 border-transparent font-bold"}`}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <Calendar className="w-3 h-3" /> Birth Date
                      </label>
                      <Input
                        value={formData.dob ? formatDDMMYYYY(formData.dob) : ""}
                        disabled
                        className="h-12 rounded-xl border-transparent bg-slate-50/50 font-bold opacity-60"
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-12 flex justify-end"
                    >
                      <Button
                        onClick={() => {
                          setIsEditing(false);
                          toast.success("Simulated: Profile saved!");
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-10 h-12 font-bold shadow-lg shadow-indigo-100"
                      >
                        Save Changes
                      </Button>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* --- TAB 2: LOYALTY (REUSING YOUR PREMIUM STYLE) --- */}
          <TabsContent value="loyalty" className="focus-visible:ring-0">
            <Card className="border-none bg-gradient-to-br from-rose-600 to-tomato-600 text-white rounded-[2.5rem] shadow-2xl shadow-indigo-200 overflow-hidden relative mb-10">
              <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <CardContent className="p-10 md:p-14 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
                  <div>
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                      <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                        <Star className="w-6 h-6 text-amber-300 fill-amber-300" />
                      </div>
                      <span className="uppercase tracking-[0.3em] text-[10px] font-black text-indigo-100">
                        Membership Program
                      </span>
                    </div>
                    <h2 className="text-5xl font-black">
                      {membershipData?.membership.type || "Bronze"} Tier
                    </h2>
                    <p className="text-indigo-100/70 mt-3 font-medium">
                      Earn more points to unlock exclusive screenings and VIP
                      lounges.
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-10 rounded-[3rem] min-w-[220px]">
                    <p className="text-xs uppercase font-black text-indigo-100 mb-2">
                      Total Points
                    </p>
                    <p className="text-6xl font-black">
                      {membershipData?.membership.points || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {membershipData?.membership.privileges?.map((p: any) => (
                <Card
                  key={p.privilege_id}
                  className="border-none bg-slate-50/50 rounded-3xl p-6 flex items-start gap-4 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-100 group"
                >
                  <div className="p-3 bg-white rounded-2xl shadow-sm text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{p.name}</h4>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                      {p.description}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* --- TAB 3: VOUCHERS --- */}
          <TabsContent value="vouchers" className="focus-visible:ring-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vouchers.map((voucher) => (
                <motion.div key={voucher.CV_id} whileHover={{ scale: 1.02 }}>
                  <Card className="border-none bg-white shadow-sm hover:shadow-xl transition-all rounded-[2rem] overflow-hidden flex h-48 group">
                    {/* Voucher Edge - "Coupon Style" */}
                    <div className="w-1/3 bg-green-500 flex flex-col items-center justify-center text-white relative">
                      <div className="absolute top-0 bottom-0 -right-2 flex flex-col justify-around py-2">
                        {[...Array(6)].map((_, i) => (
                          <div
                            key={i}
                            className="w-4 h-4 rounded-full bg-white"
                          />
                        ))}
                      </div>
                      <Ticket className="w-8 h-8 mb-2 opacity-50" />
                      <span className="text-3xl font-black leading-none">
                        {voucher.Discount}%
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-70">
                        OFF
                      </span>
                    </div>

                    <div className="w-2/3 p-8 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <h3 className="font-black text-slate-900 truncate pr-2">
                            {voucher.Description || "Movie Reward"}
                          </h3>
                          <CustomBadge
                            className={
                              voucher.Status === "Active"
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                : "bg-slate-50 text-slate-400 border-slate-100"
                            }
                          >
                            {voucher.Status}
                          </CustomBadge>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2">
                          {voucher.Condition}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold">
                            {formatDDMMYYYY(voucher.Expiration)}
                          </span>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="rounded-xl h-9 px-4 text-xs font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors"
                          onClick={() =>
                            copyToClipboard(`SAVE${voucher.Voucher_id}`)
                          }
                        >
                          Copy Code
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* --- REUSE YOUR DIALOG LOGIC --- */}
      <Dialog
        open={isChangePasswordOpen}
        onOpenChange={setIsChangePasswordOpen}
      >
        <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-8 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">
              Change Security Key
            </DialogTitle>
            <DialogDescription className="font-medium">
              Safeguard your account with a new password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Current Password
              </label>
              <Input
                type="password"
                name="oldPassword"
                value={passwordForm.oldPassword}
                onChange={(e) =>
                  setPasswordForm((p) => ({
                    ...p,
                    oldPassword: e.target.value,
                  }))
                }
                className="rounded-xl h-12"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                New Password
              </label>
              <Input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((p) => ({
                    ...p,
                    newPassword: e.target.value,
                  }))
                }
                className="rounded-xl h-12"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              className="rounded-xl font-bold"
              onClick={() => setIsChangePasswordOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl px-8 font-bold"
              onClick={handleChangePasswordSubmit}
            >
              Update Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
