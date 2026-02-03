// src/store/useAdminStore.ts

import { Admin, AdminRole } from "@/types/user";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware"; // 1. Import Middleware

// ---------------------
// Types
// ---------------------

export interface RegisterDataAdmin {
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  password: string;
  branchId: string;
  role: AdminRole;
}

export interface changePasswordRequirement {
  old_password: string;
  new_password: string;
  admin_id: string;
}

export interface Branch {
  id: string;
  name: string;
  city: string;
  address: string;
  managerId?: string;
  phone?: string;
}

export interface Hall {
  hallNumber: number;
  type: string;
  seatCapacity: number;
  rowCount: number;
  colCount: number;
}

export interface LowOccupancyAlert {
  Movie_Name: string;
  Branch_Name: string;
  Duration: number;
  Start_time: string;
  Date: string;
  Total_Capacity: number;
  Booked_Seats: number;
  Occupancy_Rate: number;
}

interface AdminState {
  admin: Admin | null;
  admins: Admin[];
  branches: Branch[];
  totalBranches: number;
  alerts: LowOccupancyAlert[];
  totalAlerts: number; // New state
  isLoading: boolean;
  error: string | null;

  loginAdmin: (admin: Admin) => void;
  logoutAdmin: () => void;
  addAdminToList: (admin: Admin) => void;

  registerAdmin: (data: RegisterDataAdmin) => Promise<void>;
  fetchAdmins: () => Promise<void>;
  fetchBranches: (params?: {
    search?: string;
    sortBy?: string;
    order?: string;
    page?: number;
    limit?: number;
  }) => Promise<void>;
  createBranch: (data: Omit<Branch, "id">) => Promise<void>;
  updateBranch: (id: string, data: Omit<Branch, "id">) => Promise<void>;
  deleteBranch: (id: string) => Promise<void>;
  changePassword: (data: changePasswordRequirement) => Promise<void>;

  // Hall Management
  fetchHalls: (branchId: string) => Promise<Hall[]>;
  createHall: (branchId: string, data: Hall) => Promise<void>;
  updateHall: (
    branchId: string,
    hallNumber: number,
    data: Hall
  ) => Promise<void>;
  deleteHall: (branchId: string, hallNumber: number) => Promise<void>;

  // Alerts
  fetchLowOccupancyAlerts: (
    month: number,
    year: number,
    threshold: number,
    branchId?: number,
    page?: number,
    limit?: number
  ) => Promise<void>;
}

// ---------------------
// API CALLS
// ---------------------

const API_BASE_URL = "http://127.0.0.1:8000";

interface LowOccupancyAlertResponse {
  data: LowOccupancyAlert[];
  total: number;
  page: number;
  limit: number;
}

const fetchLowOccupancyAlertsApiCall = async (
  month: number,
  year: number,
  threshold: number,
  branchId?: number,
  page: number = 1,
  limit: number = 10
): Promise<LowOccupancyAlertResponse> => {
  const queryParams = new URLSearchParams({
    month: month.toString(),
    year: year.toString(),
    threshold: threshold.toString(),
    page: page.toString(),
    limit: limit.toString(),
  });
  if (branchId) queryParams.append("branch_id", branchId.toString());

  const res = await fetch(
    `${API_BASE_URL}/admin/dashboard/alerts/low-occupancy?${queryParams}`
  );
  if (!res.ok) throw new Error("Failed to fetch alerts");
  return res.json();
};

// --- Hall API Calls ---
async function fetchHallsApiCall(branchId: string): Promise<Hall[]> {
  const res = await fetch(`${API_BASE_URL}/branches/${branchId}/halls`);
  if (!res.ok) throw new Error("Failed to fetch halls");
  const data = await res.json();
  return data.map((item: any) => ({
    hallNumber: item.Hall_number,
    type: item.Type,
    seatCapacity: item.Seat_capacity,
    rowCount: item.Row_count,
    colCount: item.Col_count,
  }));
}

async function createHallApiCall(branchId: string, data: Hall): Promise<void> {
  const payload = {
    Hall_number: data.hallNumber,
    Type: data.type,
    Seat_capacity: data.seatCapacity,
    Row_count: data.rowCount,
    colCount: data.colCount,
  };
  const res = await fetch(`${API_BASE_URL}/branches/${branchId}/halls`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "Failed to create hall");
  }
}

async function updateHallApiCall(
  branchId: string,
  hallNumber: number,
  data: Hall
): Promise<void> {
  const payload = {
    Hall_number: data.hallNumber,
    Type: data.type,
    Seat_capacity: data.seatCapacity,
    Row_count: data.rowCount,
    colCount: data.colCount,
  };
  const res = await fetch(
    `${API_BASE_URL}/branches/${branchId}/halls/${hallNumber}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "Failed to update hall");
  }
}

async function deleteHallApiCall(
  branchId: string,
  hallNumber: number
): Promise<void> {
  const res = await fetch(
    `${API_BASE_URL}/branches/${branchId}/halls/${hallNumber}`,
    {
      method: "DELETE",
    }
  );
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "Failed to delete hall");
  }
}

async function fetchBranchesApiCall(params?: {
  search?: string;
  sortBy?: string;
  order?: string;
  page?: number;
  limit?: number;
}): Promise<{ branches: Branch[]; total: number }> {
  const queryParams = new URLSearchParams();
  if (params?.search) queryParams.append("search", params.search);
  if (params?.sortBy) queryParams.append("sort_by", params.sortBy);
  if (params?.order) queryParams.append("order", params.order);
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());

  const res = await fetch(
    `${API_BASE_URL}/branches/?${queryParams.toString()}`
  );
  if (!res.ok) {
    throw new Error("Failed to fetch branches");
  }
  const responseData = await res.json();

  // Handle both old (array) and new (object) response formats for backward compatibility during migration
  const dataList = Array.isArray(responseData)
    ? responseData
    : responseData.data;
  const total = Array.isArray(responseData)
    ? responseData.length
    : responseData.total;

  const branches = dataList.map((item: any) => ({
    id: item.Branch_id.toString(),
    name: item.Name,
    city: item.City,
    address: item.Address,
    managerId: item.Admin_id ? item.Admin_id.toString() : undefined,
    phone: item.Phone,
  }));

  return { branches, total };
}

async function createBranchApiCall(data: Omit<Branch, "id">): Promise<Branch> {
  const payload = {
    Name: data.name,
    City: data.city,
    Address: data.address,
    Admin_id: data.managerId ? parseInt(data.managerId) : null,
    Phone: data.phone,
  };
  const res = await fetch(`${API_BASE_URL}/branches/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "Failed to create branch");
  }
  const item = await res.json();
  return {
    id: item.Branch_id.toString(),
    name: item.Name,
    city: item.City,
    address: item.Address,
    managerId: item.Admin_id ? item.Admin_id.toString() : undefined,
    phone: item.Phone,
  };
}

async function updateBranchApiCall(
  id: string,
  data: Omit<Branch, "id">
): Promise<Branch> {
  const payload = {
    Name: data.name,
    City: data.city,
    Address: data.address,
    Admin_id: data.managerId ? parseInt(data.managerId) : null,
    Phone: data.phone,
  };
  const res = await fetch(`${API_BASE_URL}/branches/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "Failed to update branch");
  }
  const item = await res.json();
  return {
    id: item.Branch_id.toString(),
    name: item.Name,
    city: item.City,
    address: item.Address,
    managerId: item.Admin_id ? item.Admin_id.toString() : undefined,
    phone: item.Phone,
  };
}

async function deleteBranchApiCall(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/branches/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "Failed to delete branch");
  }
}

async function fetchAdminsApiCall(): Promise<Admin[]> {
  const res = await fetch(`${API_BASE_URL}/auth/admin/all`);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "Failed to fetch admins");
  }
  const data = await res.json();

  // Map backend response to frontend Admin interface
  return data.map((item: any) => ({
    id: item.Admin_id.toString(),
    name: item.Name,
    email: item.Email,
    gender: item.Gender,
    dateOfBirth: item.Date_of_birth,
    phone: item.Phone,
    role: item.Role,
    assignedBranchId: item.Branch_id ? item.Branch_id.toString() : undefined,
    assignedBranchName: item.Branch_Name,
  }));
}

async function registerApiCall(data: RegisterDataAdmin): Promise<Admin> {
  // Map frontend data to backend request model
  const payload = {
    name: data.name,
    email: data.email,
    password: data.password,
    gender: data.gender,
    dob: data.dob, // Ensure this is YYYY-MM-DD
    phone: data.phone,
    branch_id: data.branchId ? parseInt(data.branchId) : null,
    role: data.role,
  };

  const res = await fetch(`${API_BASE_URL}/auth/admin/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "Registration failed");
  }

  const item = await res.json();

  return {
    id: item.Admin_id.toString(),
    name: item.Name,
    email: item.Email,
    gender: item.Gender,
    dateOfBirth: item.Date_of_birth,
    phone: item.Phone,
    role: item.Role,
    assignedBranchId: item.Branch_id ? item.Branch_id.toString() : undefined,
    assignedBranchName: item.Branch_Name,
  };
}

async function changePasswordApiCall(
  req: changePasswordRequirement
): Promise<{ success: boolean }> {
  const payload = {
    id: parseInt(req.admin_id),
    old_password: req.old_password,
    new_password: req.new_password,
  };

  const res = await fetch(`${API_BASE_URL}/auth/admin/change-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "Password change failed.");
  }

  return { success: true };
}

// ---------------------
// STORE
// ---------------------

// 2. Use persist middleware
export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      admin: null,
      admins: [],
      branches: [],
      totalBranches: 0,
      alerts: [],
      totalAlerts: 0, // Initial state
      isLoading: false,
      error: null,

      loginAdmin: (adminData) =>
        set({ admin: adminData, error: null, isLoading: false }),

      // When this runs, persist middleware automatically clears it from localStorage too
      logoutAdmin: () => set({ admin: null, error: null, isLoading: false }),

      addAdminToList: (newAdmin) => {
        set((state) => ({
          admins: [newAdmin, ...state.admins],
        }));
      },

      registerAdmin: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const newAdmin = await registerApiCall(data);
          get().loginAdmin(newAdmin);
          get().addAdminToList(newAdmin);
        } catch (err: any) {
          set({
            error: err.message ?? "Registration failed.",
            isLoading: false,
          });
        }
      },

      fetchAdmins: async () => {
        set({ isLoading: true, error: null });
        try {
          const adminList = await fetchAdminsApiCall();
          set({ admins: adminList, isLoading: false });
        } catch (err: any) {
          set({
            error: err.message ?? "Failed to load admin list.",
            isLoading: false,
          });
        }
      },

      fetchBranches: async (params) => {
        // Don't set global loading here to avoid flickering if not needed
        try {
          const { branches, total } = await fetchBranchesApiCall(params);
          set({ branches, totalBranches: total });
        } catch (err: any) {
          console.error("Failed to fetch branches", err);
          // Optional: set error state if critical
        }
      },

      createBranch: async (data) => {
        set({ isLoading: true, error: null });
        try {
          await createBranchApiCall(data);
          await get().fetchBranches(); // Refresh list
          set({ isLoading: false });
        } catch (err: any) {
          set({
            error: err.message ?? "Failed to create branch.",
            isLoading: false,
          });
          throw err;
        }
      },

      updateBranch: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
          await updateBranchApiCall(id, data);
          await get().fetchBranches(); // Refresh list
          set({ isLoading: false });
        } catch (err: any) {
          set({
            error: err.message ?? "Failed to update branch.",
            isLoading: false,
          });
          throw err;
        }
      },

      deleteBranch: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await deleteBranchApiCall(id);
          await get().fetchBranches(); // Refresh list
          set({ isLoading: false });
        } catch (err: any) {
          set({
            error: err.message ?? "Failed to delete branch.",
            isLoading: false,
          });
          throw err;
        }
      },

      changePassword: async (data) => {
        set({ isLoading: true, error: null });
        try {
          await changePasswordApiCall(data);
          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Hall Management Implementation
      fetchHalls: async (branchId) => {
        // We don't necessarily need to store halls in global state if they are fetched per branch view
        // But we can return them for the component to use
        try {
          return await fetchHallsApiCall(branchId);
        } catch (error: any) {
          console.error("Fetch halls error:", error);
          throw error;
        }
      },

      createHall: async (branchId, data) => {
        set({ isLoading: true, error: null });
        try {
          await createHallApiCall(branchId, data);
          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      updateHall: async (branchId, hallNumber, data) => {
        set({ isLoading: true, error: null });
        try {
          await updateHallApiCall(branchId, hallNumber, data);
          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      deleteHall: async (branchId, hallNumber) => {
        set({ isLoading: true, error: null });
        try {
          await deleteHallApiCall(branchId, hallNumber);
          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Alerts Implementation
      fetchLowOccupancyAlerts: async (
        month,
        year,
        threshold,
        branchId,
        page = 1,
        limit = 10
      ) => {
        // Don't set global loading to avoid full page spinner for dashboard widgets
        try {
          console.log("Fetching alerts for:", {
            month,
            year,
            threshold,
            branchId,
            page,
            limit,
          });
          const response = await fetchLowOccupancyAlertsApiCall(
            month,
            year,
            threshold,
            branchId,
            page,
            limit
          );
          console.log("Fetched alerts response:", response);
          set({
            alerts: response.data,
            totalAlerts: response.total,
          });
        } catch (error: any) {
          console.error("Failed to fetch alerts", error);
          // Don't block UI, just log error
        }
      },
    }),
    {
      name: "admin-storage", // 3. Unique name for localStorage key
      storage: createJSONStorage(() => localStorage), // 4. Use localStorage

      // 5. IMPORTANT: Only persist the 'admin' field.
      // We don't want to persist loading states, errors, or stale lists.
      partialize: (state) => ({
        admin: state.admin,
      }),
    }
  )
);
