// components/branch_manager/BranchInfoTab.tsx

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Save, Phone } from "lucide-react";
import { BranchData } from "../types";

// Define the interface for Admin form data structure
interface AdminForm {
  name: string;
  email: string;
  phone?: string; // Added phone
  oldPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
}

interface BranchInfoProps {
  branchData: BranchData;
  handleInfoChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  saveBranchInfo: () => void;
  // NEW PROPS FOR ADMIN MANAGEMENT
  adminForm: AdminForm;
  adminError: string;
  isSavingAdmin: boolean;
  handleAdminInfoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  saveAdminInfo: () => void;
  changeAdminPassword: () => void;
}

export const BranchInfoTab: React.FC<BranchInfoProps> = ({
  branchData,
  handleInfoChange,
  saveBranchInfo,
  adminForm,
  adminError,
  isSavingAdmin,
  handleAdminInfoChange,
  saveAdminInfo,
  changeAdminPassword,
}) => (
  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <Card className="border border-border/50 bg-card rounded-2xl shadow-lg">
      <CardHeader>
        <CardTitle className="text-foreground">Branch Information</CardTitle>
        <CardDescription className="text-muted-foreground">Update your branch's public details.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {" "}
        <div className="grid gap-2">
          <Label htmlFor="name" className="text-foreground">Branch Name</Label>
          <Input
            id="name"
            name="name"
            value={branchData.name}
            onChange={handleInfoChange}
            className="bg-muted border-border text-foreground"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="city" className="text-foreground">City</Label>
          <Input
            id="city"
            name="city"
            value={branchData.city || ""}
            onChange={handleInfoChange}
            className="bg-muted border-border text-foreground"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="location" className="text-foreground">Location</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-4 h-4 text-primary" />
            <Input
              id="location"
              name="location"
              value={branchData.location}
              onChange={handleInfoChange}
              className="pl-10 bg-muted border-border text-foreground"
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone" className="text-foreground">Phone</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 w-4 h-4 text-primary" />
            <Input
              id="phone"
              name="phone"
              value={branchData.phone || ""}
              onChange={handleInfoChange}
              className="pl-10 bg-muted border-border text-foreground"
              placeholder="0281234567"
            />
          </div>
        </div>
      </CardContent>{" "}
      <CardFooter>
        {" "}
        <Button
          onClick={saveBranchInfo}
          className="bg-primary hover:bg-primary/90"
        >
          Update Branch Info{" "}
        </Button>{" "}
      </CardFooter>{" "}
    </Card>
    {/* --------------------- 2. ADMIN PROFILE CARD --------------------- */}
    <Card className="border border-border/50 bg-card rounded-2xl shadow-lg">
      <CardHeader>
        <CardTitle className="text-foreground">Admin Profile</CardTitle>
        <CardDescription className="text-muted-foreground">Manage your personal login details.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Name and Email */}
        <div className="space-y-4 border-b pb-4 border-border/50">
          <div className="grid gap-2">
            <Label htmlFor="admin-name" className="text-foreground">Name</Label>
            <Input
              id="admin-name"
              name="name"
              value={adminForm.name}
              onChange={handleAdminInfoChange}
              className="bg-muted border-border text-foreground"
            />
          </div>{" "}
          <div className="grid gap-2">
            <Label htmlFor="admin-email" className="text-foreground">Email</Label>
            <Input
              id="admin-email"
              name="email"
              value={adminForm.email}
              type="email"
              onChange={handleAdminInfoChange}
              className="bg-muted/50 border-border text-muted-foreground cursor-not-allowed"
              disabled
            />
          </div>{" "}
          <div className="grid gap-2">
            <Label htmlFor="admin-phone" className="text-foreground">Phone</Label>
            <Input
              id="admin-phone"
              name="phone"
              value={adminForm.phone || ""}
              onChange={handleAdminInfoChange}
              className="bg-muted border-border text-foreground"
              placeholder="0901234567"
            />
          </div>{" "}
          <Button
            onClick={saveAdminInfo}
            className="w-full bg-primary hover:bg-primary/90 mt-2"
            disabled={isSavingAdmin}
          >
            {isSavingAdmin ? "Saving..." : "Update Profile Info"}
          </Button>
        </div>
        {/* Password Change Section */}
        <div className="space-y-4">
          <h4 className="text-md font-semibold text-foreground">
            Change Password
          </h4>
          {adminError && (
            <div className="text-sm text-destructive border border-destructive/50 bg-destructive/10 p-2 rounded">
              {adminError}
            </div>
          )}{" "}
          <div className="grid gap-2">
            <Label htmlFor="old-password" className="text-foreground">Current Password</Label>
            <Input
              id="old-password"
              name="oldPassword"
              type="password"
              value={adminForm.oldPassword}
              onChange={handleAdminInfoChange}
              className="bg-muted border-border text-foreground"
            />
          </div>{" "}
          <div className="grid gap-2">
            <Label htmlFor="new-password" className="text-foreground">
              New Password (min 8 chars)
            </Label>
            <Input
              id="new-password"
              name="newPassword"
              type="password"
              value={adminForm.newPassword}
              onChange={handleAdminInfoChange}
              className="bg-muted border-border text-foreground"
            />
          </div>{" "}
          <div className="grid gap-2">
            <Label htmlFor="confirm-password" className="text-foreground">Confirm New Password</Label>
            <Input
              id="confirm-password"
              name="confirmNewPassword"
              type="password"
              value={adminForm.confirmNewPassword}
              onChange={handleAdminInfoChange}
              className="bg-muted border-border text-foreground"
            />
          </div>
        </div>{" "}
      </CardContent>{" "}
      <CardFooter className="justify-end">
        {" "}
         <Button
          onClick={changeAdminPassword}
          className="bg-primary hover:bg-primary/90 gap-2 shadow-lg shadow-primary/20"
          disabled={
            isSavingAdmin || !adminForm.oldPassword || !adminForm.newPassword
          }
        >
          <Save className="w-4 h-4" />{" "}
          {isSavingAdmin ? "Saving..." : "Change Password"}{" "}
        </Button>{" "}
      </CardFooter>{" "}
    </Card>
  </div>
);
