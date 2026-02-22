"use client";

import React, { useEffect, useState } from "react";
import { Admin, AdminRole } from "@/types/user"; // Ensure AdminRole is available
import {
  PlusCircle,
  Trash2,
  User,
  Mail,
  Lock,
  Phone,
  Calendar,
  AlertTriangle,
  Loader2,
  Users,
  Edit2,
  Edit,
} from "lucide-react";

// Assuming you have these components:
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RegisterDataAdmin, useAdminStore } from "@/store/useAdminStore";
import { Navbar } from "@/app/navbar";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { API_BASE_URL } from "@/store/useUserStore";

// Initial state for the creation form (matches RegisterDataAdmin, excluding phone/dob/gender for simplicity if not needed)
const initialNewAdminState: Omit<
  RegisterDataAdmin,
  "phone" | "dob" | "gender"
> & { phone: string; dob: string; gender: string; role: AdminRole } = {
  name: "",
  email: "",
  password: "",
  branchId: "",
  phone: "",
  dob: "",
  gender: "",
  role: "regular", // Default role
};

export default function AdminManagementPage() {
  const admin = useAdminStore((state) => state.admin);
  const admins = useAdminStore((state) => state.admins);
  const isLoading = useAdminStore((state) => state.isLoading);
  const error = useAdminStore((state) => state.error);
  const fetchAdmins = useAdminStore((state) => state.fetchAdmins);
  const fetchBranches = useAdminStore((state) => state.fetchBranches);
  const branches = useAdminStore((state) => state.branches);
  const registerAdmin = useAdminStore((state) => state.registerAdmin);
  console.log("admin:", admin);

  const [newAdminData, setNewAdminData] = useState(initialNewAdminState);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localError, setLocalError] = useState("");
  const router = useRouter();

  // --- CHANGE PASSWORD STATE ---
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");

  // --- EDIT PROFILE STATE (PRIMARY ADMIN) ---
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState({
    name: "",
    email: "",
    gender: "",
    dob: "",
    phone: "",
    branchId: "", // Should be empty/null for primary
  });

  // --- EDIT ADMIN STATE (REGULAR ADMIN) ---
  const [isEditAdminOpen, setIsEditAdminOpen] = useState(false);
  const [editingAdminId, setEditingAdminId] = useState<number | null>(null);
  const [editAdminForm, setEditAdminForm] = useState({
    name: "",
    email: "",
    gender: "",
    dob: "",
    phone: "",
    branchId: "",
  });

  // 1. Fetch data on component mount
  useEffect(() => {
    // Fetch the list of admins only once when the component mounts
    if (admins.length === 0) {
      fetchAdmins();
    }
    if (branches.length === 0) {
      fetchBranches();
    }
  }, [fetchAdmins, fetchBranches, admins.length, branches.length]);

  // Initialize profile form when admin data is loaded
  useEffect(() => {
    if (admin) {
      setEditProfileForm({
        name: admin.name || "",
        email: admin.email || "",
        gender: admin.gender || "",
        dob: admin.dateOfBirth
          ? admin.dateOfBirth.split("T")[0] // Handle YYYY-MM-DD or ISO
          : "",
        phone: admin.phone || "",
        branchId: "",
      });
    }
  }, [admin]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setNewAdminData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChangeInput = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    setPasswordError("");
  };

  const handleChangePasswordSubmit = async () => {
    if (!admin?.id) return;
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/admin/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: admin.id,
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

  const handleEditProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setEditProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditAdminChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setEditAdminForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditProfileSubmit = async () => {
    if (!admin?.id) return;
    try {
      const res = await fetch(`${API_BASE_URL}/auth/admin/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: admin.id,
          name: editProfileForm.name,
          email: editProfileForm.email,
          gender: editProfileForm.gender,
          dob: editProfileForm.dob,
          phone: editProfileForm.phone,
          branch_id: admin.assignedBranchId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to update profile");

      // Update the store with the new admin data
      const updatedAdmin: Admin = {
        ...admin,
        name: editProfileForm.name,
        email: editProfileForm.email,
        gender: editProfileForm.gender,
        dateOfBirth: editProfileForm.dob,
        phone: editProfileForm.phone,
      };
      useAdminStore.getState().loginAdmin(updatedAdmin);

      toast.success("Profile updated successfully!");
      setIsEditProfileOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openEditAdminModal = (adminItem: Admin) => {
    setEditingAdminId(parseInt(adminItem.id));
    setEditAdminForm({
      name: adminItem.name,
      email: adminItem.email || "",
      gender: adminItem.gender || "",
      dob: adminItem.dateOfBirth ? adminItem.dateOfBirth.split("T")[0] : "",
      phone: adminItem.phone || "",
      branchId: adminItem.assignedBranchId
        ? adminItem.assignedBranchId.toString()
        : "",
    });
    setIsEditAdminOpen(true);
  };

  const handleEditAdminSubmit = async () => {
    if (!editingAdminId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/auth/admin/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingAdminId,
          name: editAdminForm.name,
          email: editAdminForm.email,
          gender: editAdminForm.gender,
          dob: editAdminForm.dob,
          phone: editAdminForm.phone,
          branch_id: editAdminForm.branchId
            ? parseInt(editAdminForm.branchId)
            : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to update admin");

      toast.success("Admin updated successfully!");
      setIsEditAdminOpen(false);
      fetchAdmins(); // Refresh the list
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(""); // Clear local errors

    // Client-side validation
    // if (newAdminData.role === "regular" && !newAdminData.branchId) {
    //   setLocalError("Regular admin must have a Branch ID.");
    //   return;
    // }

    // Pass the data to the store action
    await registerAdmin(newAdminData);

    // Check the global error state after the async operation completes
    if (!useAdminStore.getState().error) {
      setIsModalOpen(false); // Close modal on success
      setNewAdminData(initialNewAdminState); // Reset form
    }
    // If there's an error, the store's 'error' state will be updated and displayed below.
  };

  // Helper function to render admin list rows
  const renderAdminRows = (adminList: Admin[]) => {
    return adminList.map((adminItem) => (
      <tr key={adminItem.id} className="border-b hover:bg-muted/50">
        <td className="p-3 font-medium">{adminItem.name}</td>
        <td className="p-3">{adminItem.email}</td>
        <td className="p-3">{adminItem.phone || "-"}</td>
        <td className="p-3">{adminItem.gender || "-"}</td>
        <td className="p-3">
          {adminItem.dateOfBirth
            ? new Date(adminItem.dateOfBirth).toLocaleDateString()
            : "-"}
        </td>
        <td className="p-3">
          <span
            className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-medium border shadow-sm transition-all ${
              adminItem.role === "primary"
                ? "bg-primary/10 text-primary border-primary/20"
                : "bg-muted text-muted-foreground border-border"
            }`}
          >
            {adminItem.role === "primary" ? (
              <>
                <Lock className="mr-1.5 h-3 w-3" /> Primary
              </>
            ) : (
              "Regular"
            )}
          </span>
        </td>
        <td className="p-3 text-muted-foreground">
          {adminItem.assignedBranchName || adminItem.assignedBranchId || "-"}
        </td>

        <td className="p-3 text-right">
          {/* Example action: Delete Admin */}
          {adminItem.role !== "primary" && (
            <Button
              variant={"ghost"}
              size="sm"
              className="text-foreground hover:bg-primary/10"
              onClick={() => openEditAdminModal(adminItem)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </td>
      </tr>
    ));
  };
  useEffect(() => {
    // This code runs *after* the initial render is complete.
    if (!admin) {
      // If admin is null, it might be loading or truly unauthorized
      // You might want to wait for isLoading state here if fetching auth status
      router.push("/movies");
    }

    // Check for authorization role
    if (admin && admin.role !== "primary") {
      router.push("/movies");
    }
  }, [admin, router]);
  return (
    <div className="p-6 pt-0 space-y-6">
      <Navbar />
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Users className="w-7 h-7 text-primary" /> Admin Management
      </h1>

      {/* --- PRIMARY ADMIN PROFILE CARD --- */}
      {admin && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5" /> My Profile (Primary Admin)
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditProfileOpen(true)}
              >
                <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground block">Name</span>
                <span className="font-medium">{admin.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Email</span>
                <span className="font-medium">{admin.email}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Gender</span>
                <span className="font-medium">{admin.gender}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">
                  Date of Birth
                </span>
                <span className="font-medium">
                  {admin.dateOfBirth
                    ? new Date(admin.dateOfBirth).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">Phone</span>
                <span className="font-medium">{admin.phone || "N/A"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">
          Monitor system administrators and create new accounts.
        </p>

        <div className="flex gap-2">
          {/* --------------------- CHANGE PASSWORD TRIGGER --------------------- */}
          <Dialog
            open={isChangePasswordOpen}
            onOpenChange={setIsChangePasswordOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <Lock className="mr-2 h-4 w-4" /> Change My Password
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Change My Password</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {passwordError && (
                  <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                    {passwordError}
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input
                    name="oldPassword"
                    type="password"
                    value={passwordForm.oldPassword}
                    onChange={handlePasswordChangeInput}
                  />
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input
                    name="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChangeInput}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input
                    name="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChangeInput}
                  />
                </div>
                <Button
                  onClick={handleChangePasswordSubmit}
                  className="w-full mt-2"
                >
                  Update Password
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* --------------------- CREATE ADMIN MODAL TRIGGER --------------------- */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> New Admin
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Admin Account</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateAdmin} className="grid gap-4 py-4">
                {/* Name and Email */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    name="name"
                    value={newAdminData.name}
                    onChange={handleInputChange}
                    placeholder="Full Name"
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    name="email"
                    type="email"
                    value={newAdminData.email}
                    onChange={handleInputChange}
                    placeholder="admin@cinema.com"
                    className="col-span-3"
                    required
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    Phone
                  </Label>
                  <Input
                    name="phone"
                    value={newAdminData.phone}
                    onChange={handleInputChange}
                    placeholder="090..."
                    className="col-span-3"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="gender" className="text-right">
                    Gender
                  </Label>
                  <select
                    name="gender"
                    value={newAdminData.gender}
                    onChange={handleInputChange}
                    className="col-span-3 border p-2 rounded h-10"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dob" className="text-right">
                    Date of Birth
                  </Label>
                  <Input
                    name="dob"
                    type="date"
                    value={newAdminData.dob}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>

                {/* Password and Role */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">
                    Password
                  </Label>
                  <Input
                    name="password"
                    type="password"
                    value={newAdminData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    Role
                  </Label>
                  <select
                    name="role"
                    value={newAdminData.role}
                    onChange={handleInputChange}
                    className="col-span-3 border p-2 rounded h-10"
                    required
                  >
                    <option value="regular">Regular</option>
                    <option value="primary">Primary (Full Access)</option>
                  </select>
                </div>

                {/* Branch ID (Conditional) */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="branchId" className="text-right">
                    Branch
                  </Label>
                  <select
                    name="branchId"
                    value={newAdminData.branchId}
                    onChange={handleInputChange}
                    className="col-span-3 border p-2 rounded h-10 bg-background"
                    disabled={newAdminData.role === "primary"}
                  >
                    <option value="">No Branch (Optional)</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.id} - {branch.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Error Display */}
                {(localError || error) && (
                  <div className="p-2 bg-red-100 text-red-600 border border-red-300 rounded text-sm">
                    <AlertTriangle className="inline h-4 w-4 mr-1" />{" "}
                    {localError || error}
                  </div>
                )}

                <Button type="submit" disabled={isLoading} className="mt-4">
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Create Admin Account"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Admin List ({admins.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {/* --------------------- LOADING/ERROR STATES --------------------- */}
          {isLoading && admins.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground flex justify-center items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading admin data...
            </div>
          ) : error && admins.length === 0 ? (
            <div className="p-4 bg-red-100 text-red-800 rounded flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Error: {error}
            </div>
          ) : admins.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No administrators found.
            </div>
          ) : (
            // --------------------- ADMIN TABLE ---------------------
            <div className="overflow-x-auto border rounded-lg">
              <table className="min-w-full divide-y divide-border">
                <thead>
                  <tr className="bg-secondary/50 text-left text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                    <th className="p-3">Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Gender</th>
                    <th className="p-3">DOB</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Branch</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {renderAdminRows(admins)}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* --- EDIT PROFILE DIALOG (PRIMARY) --- */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit My Profile</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Name</Label>
              <Input
                name="name"
                value={editProfileForm.name}
                onChange={handleEditProfileChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Email</Label>
              <Input
                name="email"
                value={editProfileForm.email}
                onChange={handleEditProfileChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Gender</Label>
              <select
                name="gender"
                value={editProfileForm.gender}
                onChange={handleEditProfileChange}
                className="col-span-3 border p-2 rounded h-10"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">DOB</Label>
              <Input
                type="date"
                name="dob"
                value={editProfileForm.dob}
                onChange={handleEditProfileChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Phone</Label>
              <Input
                name="phone"
                value={editProfileForm.phone}
                onChange={handleEditProfileChange}
                className="col-span-3"
              />
            </div>
            <Button onClick={handleEditProfileSubmit} className="mt-2">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- EDIT ADMIN DIALOG (REGULAR) --- */}
      <Dialog open={isEditAdminOpen} onOpenChange={setIsEditAdminOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Admin</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Name</Label>
              <Input
                name="name"
                value={editAdminForm.name}
                onChange={handleEditAdminChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Email</Label>
              <Input
                name="email"
                value={editAdminForm.email}
                onChange={handleEditAdminChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Gender</Label>
              <select
                name="gender"
                value={editAdminForm.gender}
                onChange={handleEditAdminChange}
                className="col-span-3 border p-2 rounded h-10"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">DOB</Label>
              <Input
                type="date"
                name="dob"
                value={editAdminForm.dob}
                onChange={handleEditAdminChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Phone</Label>
              <Input
                name="phone"
                value={editAdminForm.phone}
                onChange={handleEditAdminChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Branch</Label>
              <select
                name="branchId"
                value={editAdminForm.branchId}
                onChange={handleEditAdminChange}
                className="col-span-3 border p-2 rounded h-10 bg-background"
              >
                <option value="">Select Branch</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.id} - {branch.name}
                  </option>
                ))}
              </select>
            </div>
            <Button onClick={handleEditAdminSubmit} className="mt-2">
              Update Admin
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
