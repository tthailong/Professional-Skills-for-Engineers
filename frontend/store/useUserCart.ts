import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// --- Types matching your Backend Pydantic Models ---

export interface CartProduct {
  product_id: number;
  quantity: number;
  // UI Helpers (Optional, for display only)
  name?: string;
  price?: number;
}

export interface CartTicket {
  movie_name: string;
  movie_id: number;
  showtime_id: number;
  branch_id: number;
  hall_number: number;
  seat_number: string;
  price: number; // The price per ticket
  // UI Helpers
  seat_type?: string;
}

interface VoucherData {
  cv_id: number;
  code?: string;
  discount: number;
}

// --- Store State & Actions ---
interface CartState {
  // Data
  tickets: CartTicket[];
  products: CartProduct[];
  voucher: VoucherData | null;

  // Actions
  setTickets: (tickets: CartTicket[]) => void;
  addProduct: (product: CartProduct) => void;
  removeProduct: (productId: number) => void;
  updateProductQuantity: (productId: number, quantity: number) => void;
  setProducts: (products: CartProduct[]) => void; // Bulk set
  applyVoucher: (voucher: VoucherData) => void;
  removeVoucher: () => void;
  clearCart: () => void;

  // Computed / Helpers
  getTotalPrice: () => number;
}

export const useUserCart = create<CartState>()(
  persist(
    (set, get) => ({
      tickets: [],
      products: [],
      voucher: null,

      setTickets: (tickets) => set({ tickets }),

      addProduct: (product) =>
        set((state) => {
          const existing = state.products.find(
            (p) => p.product_id === product.product_id
          );
          if (existing) {
            return {
              products: state.products.map((p) =>
                p.product_id === product.product_id
                  ? { ...p, quantity: p.quantity + product.quantity }
                  : p
              ),
            };
          }
          return { products: [...state.products, product] };
        }),

      removeProduct: (productId) =>
        set((state) => ({
          products: state.products.filter((p) => p.product_id !== productId),
        })),

      updateProductQuantity: (productId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              products: state.products.filter(
                (p) => p.product_id !== productId
              ),
            };
          }
          return {
            products: state.products.map((p) =>
              p.product_id === productId ? { ...p, quantity } : p
            ),
          };
        }),

      setProducts: (products) => set({ products }),

      applyVoucher: (voucher) => set({ voucher }),

      removeVoucher: () => set({ voucher: null }),

      clearCart: () => set({ tickets: [], products: [], voucher: null }),

      getTotalPrice: () => {
        const state = get();
        const ticketsTotal = state.tickets.reduce((sum, t) => sum + t.price, 0);
        const productsTotal = state.products.reduce(
          (sum, p) => sum + (p.price || 0) * p.quantity,
          0
        );

        let total = ticketsTotal + productsTotal;

        // Apply Voucher (percentage discount)
        if (state.voucher) {
          total = Math.max(0, total - (state.voucher.discount * total) / 100);
        }

        return total;
      },
    }),
    {
      name: "cinema-user-cart", // Name in LocalStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);
