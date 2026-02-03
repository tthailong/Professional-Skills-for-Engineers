// --- USER TYPES ---

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  loyaltyPoints?: number; // specific to the 'Loyalty' tab mentioned
  dob?: string;
  createdAt: Date;
}

/**
 * Default user object for initializing state or placeholders.
 * Represents a logged-out or generic guest user.
 */
export const DEFAULT_USER: User = {
  id: "00000000-0000-0000-0000-000000000000",
  name: "Guest User",
  email: "guest@example.com",
  createdAt: new Date(0), // Jan 1, 1970 UTC
  // Optional fields are omitted
};

// --- ADMIN TYPES ---

// The discriminator attribute
export type AdminRole = "primary" | "regular";

export interface Admin {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;

  /**
   * IDENTIFIER:
   * 'primary' = Dashboard, Movie, Events, Admin Mgmt, Product, Voucher (Full Access)
   * 'regular' = Dashboard, Booking, Branch Operations (Operational Access)
   */
  role: AdminRole;
  assignedBranchId?: string;
  assignedBranchName?: string;
  gender?: string;
  dateOfBirth?: string;
  phone?: string;
}

/**
 * Default Primary Admin object for initializing state or testing full access.
 */
export const DEFAULT_ADMIN_PRIMARY: Admin = {
  id: "admin-primary-default-id",
  name: "primary_admin_test",
  email: "primary@test.com",
  role: "primary",
  assignedBranchId: undefined, // Primary admins are typically not assigned to a specific branch
};

/**
 * Default Regular Admin object for initializing state or testing operational access.
 */
export const DEFAULT_ADMIN_REGULAR: Admin = {
  id: "admin-regular-default-id",
  name: "regular_admin_test",
  email: "regular@test.com",
  role: "regular",
  assignedBranchId: "branch_default_001", // Regular admins typically need a branch ID
};
