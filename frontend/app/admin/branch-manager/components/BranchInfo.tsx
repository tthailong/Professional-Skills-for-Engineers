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
    <Card className="border-border bg-card">
      {" "}
      <CardHeader>
        <CardTitle>Branch Information</CardTitle>{" "}
        <CardDescription>Update your branch's public details.</CardDescription>{" "}
      </CardHeader>{" "}
      <CardContent className="space-y-4">
        {" "}
        <div className="grid gap-2">
          <Label htmlFor="name">Branch Name</Label>{" "}
          <Input
            id="name"
            name="name"
            value={branchData.name}
            onChange={handleInfoChange}
            className="bg-secondary border-border"
          />{" "}
        </div>{" "}
        <div className="grid gap-2">
          <Label htmlFor="city">City</Label>{" "}
          <Input
            id="city"
            name="city"
            value={branchData.city || ""}
            onChange={handleInfoChange}
            className="bg-secondary border-border"
          />{" "}
        </div>{" "}
        <div className="grid gap-2">
          <Label htmlFor="location">Location</Label>{" "}
          <div className="relative">
            {" "}
            <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />{" "}
            <Input
              id="location"
              name="location"
              value={branchData.location}
              onChange={handleInfoChange}
              className="pl-10 bg-secondary border-border"
            />{" "}
          </div>{" "}
        </div>{" "}
        <div className="grid gap-2">
          <Label htmlFor="phone">Phone</Label>{" "}
          <div className="relative">
            {" "}
            <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />{" "}
            <Input
              id="phone"
              name="phone"
              value={branchData.phone || ""}
              onChange={handleInfoChange}
              className="pl-10 bg-secondary border-border"
              placeholder="0281234567"
            />{" "}
          </div>{" "}
        </div>{" "}
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
    <Card className="border-border bg-card">
      {" "}
      <CardHeader>
        <CardTitle>Admin Profile</CardTitle>{" "}
        <CardDescription>Manage your personal login details.</CardDescription>{" "}
      </CardHeader>{" "}
      <CardContent className="space-y-6">
        {/* Name and Email */}{" "}
        <div className="space-y-4 border-b pb-4 border-border">
          {" "}
          <div className="grid gap-2">
            <Label htmlFor="admin-name">Name</Label>{" "}
            <Input
              id="admin-name"
              name="name"
              value={adminForm.name}
              onChange={handleAdminInfoChange}
              className="bg-secondary border-border"
            />{" "}
          </div>{" "}
          <div className="grid gap-2">
            <Label htmlFor="admin-email">Email</Label>{" "}
            <Input
              id="admin-email"
              name="email"
              value={adminForm.email}
              type="email"
              onChange={handleAdminInfoChange}
              className="bg-secondary border-border"
              disabled
            />{" "}
          </div>{" "}
          <div className="grid gap-2">
            <Label htmlFor="admin-phone">Phone</Label>{" "}
            <Input
              id="admin-phone"
              name="phone"
              value={adminForm.phone || ""}
              onChange={handleAdminInfoChange}
              className="bg-secondary border-border"
              placeholder="0901234567"
            />{" "}
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
            <Label htmlFor="old-password">Current Password</Label>{" "}
            <Input
              id="old-password"
              name="oldPassword"
              type="password"
              value={adminForm.oldPassword}
              onChange={handleAdminInfoChange}
              className="bg-secondary border-border"
            />{" "}
          </div>{" "}
          <div className="grid gap-2">
            {" "}
            <Label htmlFor="new-password">
              New Password (min 8 chars)
            </Label>{" "}
            <Input
              id="new-password"
              name="newPassword"
              type="password"
              value={adminForm.newPassword}
              onChange={handleAdminInfoChange}
              className="bg-secondary border-border"
            />{" "}
          </div>{" "}
          <div className="grid gap-2">
            {" "}
            <Label htmlFor="confirm-password">Confirm New Password</Label>{" "}
            <Input
              id="confirm-password"
              name="confirmNewPassword"
              type="password"
              value={adminForm.confirmNewPassword}
              onChange={handleAdminInfoChange}
              className="bg-secondary border-border"
            />{" "}
          </div>
        </div>{" "}
      </CardContent>{" "}
      <CardFooter className="justify-end">
        {" "}
        <Button
          onClick={changeAdminPassword}
          className="bg-red-600 hover:bg-red-700 gap-2"
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
