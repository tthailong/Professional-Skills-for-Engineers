// src/store/useUserStore.ts

import { User } from "@/types/user";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware"; // 1. Import Middleware

// 💡 Define the expected data structure for registration
interface RegisterData {
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  password: string;
}

// 💡 Update UserState interface to include loading and error
interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  loginUser: (user: User) => void;
  logoutUser: () => void;
  registerUser: (data: RegisterData) => Promise<void>;
}
const formatDobForBackend = (dateInput: string | Date): string => {
  let date: Date;

  if (dateInput instanceof Date) {
    date = dateInput;
  } else {
    // Assuming string is in a standard format (e.g., YYYY-MM-DD or ISO)
    // Note: Using new Date() on 'DD/MM/YYYY' is often unreliable,
    // which is why we handle conversion to that format here.
    date = new Date(dateInput);
  }

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return ""; // Return empty string for invalid dates
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};
export const API_BASE_URL = "http://127.0.0.1:8000";

async function registerApiCall(data: RegisterData): Promise<User> {
  const nameParts = data.name.trim().split(/\s+/); // Split by one or more spaces
  const lastName = nameParts.pop(); // Remove and capture the last word
  const firstName = nameParts.join(" "); // Join everything else
  const formattedDob = formatDobForBackend(data.dob);
  const response = await fetch(`${API_BASE_URL}/auth/customer/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // 2. Send the registration data to the FastAPI endpoint
    body: JSON.stringify({
      fname: firstName,
      lname: lastName,
      gender: data.gender,
      email: data.email,
      dob: formattedDob,
      memid: 1, // Assuming a default membership ID
      loyalpoint: 0,
      phone: data.phone,
      password: data.password,
    }),
  });

  // 3. Check for non-200 status codes (FastAPI returns 400 or 401 on error)
  if (!response.ok) {
    // Parse the error detail returned by your FastAPI endpoint
    const errorBody = await response.json();

    // Throw an error with the detailed message from the backend
    throw new Error(
      errorBody.detail || "Registration failed due to server error."
    );
  }

  // 4. If successful (200 OK), parse the returned customer data
  const customerData = await response.json();

  // 5. Transform the FastAPI CustomerOut response into the local 'User' type
  const newUser: User = {
    id: String(customerData.Customer_id), // Ensure ID is a string if necessary
    name: `${customerData.FName} ${customerData.LName}`,
    email: customerData.Email,
    phone: data.phone, // Assuming phone number isn't returned in CustomerOut
    createdAt: new Date(), // This might need to be fetched from a dedicated DB column
    loyaltyPoints: customerData.Loyal_point,
    dob: customerData.Date_of_birth,
  };

  return newUser;
}
// 2. Wrap with persist middleware
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,

      loginUser: (userData) => {
        set({ user: userData, error: null, isLoading: false });
      },

      // When logging out, this clears the state AND removes it from localStorage
      logoutUser: () => set({ user: null, error: null, isLoading: false }),

      registerUser: async (data) => {
        set({ isLoading: true, error: null });

        try {
          const newUser = await registerApiCall(data);
          get().loginUser(newUser);
        } catch (err: any) {
          set({
            error:
              err.message || "Registration failed. Please check your details.",
            isLoading: false,
          });
        }
      },
    }),
    {
      name: "user-storage", // 3. Unique name for localStorage key
      storage: createJSONStorage(() => localStorage), // 4. Use localStorage

      // 5. IMPORTANT: Only persist the 'user' object.
      // We do NOT want to save 'isLoading' or 'error' to localStorage.
      partialize: (state) => ({ user: state.user }),
    }
  )
);
