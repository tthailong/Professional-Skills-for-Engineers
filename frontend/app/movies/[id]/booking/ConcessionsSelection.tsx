// =========================================================================
// 🧩 NEW COMPONENT: ConcessionsSelection
// =========================================================================

import { ProductItem } from "@/app/admin/primary/product-voucher/page";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag, Ticket, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartItem } from "./page";
import { Input } from "@/components/ui/input";

export interface PriceCalculation {
  subtotalSeats: number;
  subtotalConcessions: number;
  subtotal: number;
  discount: number;
  gst: number;
  total: number;
}

interface ConcessionsSelectionProps {
  concessions: ProductItem[];
  concessionCart: CartItem[];
  setConcessionCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  prices: PriceCalculation;
  handleProceedToPayment: () => void;
  selectedSeatsCount: number;
}

// Define items per page for concessions menu
const ITEMS_PER_PAGE = 4;

export const ConcessionsSelection: React.FC<ConcessionsSelectionProps> = ({
  concessions,
  concessionCart,
  setConcessionCart,
  prices,
  handleProceedToPayment,
}) => {
  // --- New State for Search and Pagination ---
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const updateQuantity = (item: ProductItem, quantity: number) => {
    const newQuantity = Math.max(0, quantity); // Ensure non-negative
    setConcessionCart((prevCart) => {
      if (newQuantity === 0) {
        return prevCart.filter((i) => i.item.id !== item.id);
      }
      const existingItem = prevCart.find((i) => i.item.id === item.id);
      if (existingItem) {
        return prevCart.map((i) =>
          i.item.id === item.id ? { ...i, quantity: newQuantity } : i
        );
      } else {
        return [...prevCart, { item, quantity: newQuantity }];
      }
    });
  };

  const getQuantity = (itemId: string) => {
    return concessionCart.find((i) => i.item.id === itemId)?.quantity || 0;
  };

  const hasConcessions = concessionCart.length > 0;

  // --- Filtering and Pagination Logic ---
  const { paginatedItems, totalPages, totalFilteredCount } = useMemo(() => {
    const query = searchQuery.toLowerCase();

    // 1. Filter based on search query
    const filtered = concessions.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
    );

    const totalCount = filtered.length;
    const pages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    // 2. Reset page if filtering changes the maximum page number
    let validPage = currentPage;
    if (currentPage > pages && pages > 0) {
      validPage = pages;
    } else if (pages === 0) {
      validPage = 1;
    }

    const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
    const paginated = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // We update currentPage only if it changed to prevent infinite loops in the memo
    if (currentPage !== validPage) {
      // Warning: In a highly optimized context, setting state here inside useMemo
      // might cause issues. However, for filtering and reset logic, it's often necessary.
      // We ensure it only runs if the page actually needs resetting.
      if (validPage !== currentPage) {
        // Use setTimeout to avoid synchronous state update during render/memoization
        setTimeout(() => setCurrentPage(validPage), 0);
      }
    }

    return {
      paginatedItems: paginated,
      totalPages: pages,
      totalFilteredCount: totalCount,
    };
  }, [concessions, searchQuery, currentPage]);

  // --- Pagination Handlers ---
  const handleNext = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const handlePrevious = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  return (
    <div className="space-y-4">
      {/* Price Breakdown Card (Updated) */}
      <Card className="border-border bg-card top-20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-primary" />
            Booking Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm">
            {/* Breakdown */}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Seats Subtotal</span>
              <span className="text-foreground font-semibold">
                ${prices.subtotalSeats}
              </span>
            </div>
            {hasConcessions && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Product Subtotal</span>
                <span className="text-foreground font-semibold">
                  ${prices.subtotalConcessions}
                </span>
              </div>
            )}

            <div className="border-t border-border pt-2 flex justify-between">
              <span className="font-semibold text-foreground">
                Total Subtotal
              </span>
              <span className="font-semibold text-primary">
                ${prices.subtotal}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">GST (18%)</span>
              <span className="text-foreground font-semibold">
                ${prices.gst}
              </span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between">
              <span className="font-bold text-foreground">Total Amount</span>
              <span className="text-lg font-bold text-primary">
                ${prices.total}
              </span>
            </div>
          </div>

          <Button
            onClick={handleProceedToPayment}
            disabled={prices.subtotalSeats === 0}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Proceed to Payment
          </Button>
        </CardContent>
      </Card>

      {/* Concessions Menu Card (Updated with Search & Pagination) */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex flex-col md:flex-row md:items-center md:justify-between text-lg gap-3">
            <div className="flex items-center gap-2 shrink-0">
              <Tag className="w-5 h-5 text-accent" />
              Add Product ({totalFilteredCount})
            </div>
            {/* Search Bar */}
            <div className="relative w-full md:max-w-xs">
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to page 1 on search
                }}
                className="pl-8 bg-secondary border-border text-foreground h-9"
              />
              <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Items List */}
          {paginatedItems.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No products found matching your search.
            </p>
          ) : (
            paginatedItems.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center border-b border-border/50 pb-3 last:border-b-0 last:pb-0"
              >
                <div className="flex-1 pr-4">
                  <p className="font-semibold text-foreground">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                  <p className="text-sm font-bold text-primary mt-1">
                    ${item.price}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-8 h-8 shrink-0"
                    onClick={() =>
                      updateQuantity(item, getQuantity(item.id) - 1)
                    }
                    disabled={getQuantity(item.id) === 0}
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    value={getQuantity(item.id)}
                    readOnly
                    className="w-12 text-center bg-secondary h-8"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-8 h-8 shrink-0"
                    onClick={() =>
                      updateQuantity(item, getQuantity(item.id) + 1)
                    }
                  >
                    +
                  </Button>
                </div>
              </div>
            ))
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && totalFilteredCount > 0 && (
            <div className="flex justify-between items-center pt-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Cart Summary */}
          {hasConcessions && (
            <div className="pt-2 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                Items in Cart:{" "}
                {concessionCart.reduce((sum, item) => sum + item.quantity, 0)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
