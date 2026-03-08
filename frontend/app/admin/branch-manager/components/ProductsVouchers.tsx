// components/branch_manager/ProductsVouchersTab.tsx

import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Power, CheckCircle } from "lucide-react";
import { BranchData } from "../types";
import { PaginationControls } from "./PaginationControls";

interface ProductsVouchersProps {
  branchData: BranchData;
  paginatedProducts: any[];
  totalProductPages: number;
  searchQueries: { products: string };
  setSearchQueries: React.Dispatch<
    React.SetStateAction<{ movies: string; events: string; products: string }>
  >;
  toggleItem: (
    listKey: "activeEventIds" | "activeProductIds",
    itemId: string
  ) => void;
  pages: any;
  setPages: any;
}

export const ProductsVouchersTab: React.FC<ProductsVouchersProps> = ({
  branchData,
  paginatedProducts,
  totalProductPages,
  searchQueries,
  setSearchQueries,
  toggleItem,
  pages,
  setPages,
}) => (
  <div className="space-y-6">
    <div className="relative max-w-md mb-4">
      <Search className="absolute left-3 top-3 w-4 h-4 text-primary" />
      <Input
        placeholder="Search products & vouchers..."
        className="pl-10 bg-muted border-border text-foreground placeholder-muted-foreground"
        value={searchQueries.products}
        onChange={(e) =>
          setSearchQueries((prev) => ({
            ...prev,
            products: e.target.value,
          }))
        }
      />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {paginatedProducts.map((product) => {
        const isActive = branchData.activeProductIds.includes(product.id);
        return (
          <Card
            key={product.id}
            className={`border border-border/50 bg-card/80 backdrop-blur-xl transition-colors ${
              isActive ? "border-primary/50 ring-1 ring-primary/20" : ""
            }`}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold bg-muted px-2 py-1 rounded text-muted-foreground uppercase">
                  {product.type}
                </span>
                <div
                  className={`w-3 h-3 rounded-full ${
                    isActive ? "bg-emerald-500" : "bg-destructive"
                  }`}
                />
              </div>
              <CardTitle className="text-lg mt-2">{product.name}</CardTitle>
            </CardHeader>
            <CardFooter>
              <Button
                variant={isActive ? "destructive" : "default"}
                className={`w-full h-8 ${
                  isActive
                    ? ""
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
                onClick={() => toggleItem("activeProductIds", product.id)}
              >
                {isActive ? (
                  <span className="flex items-center gap-2">
                    <Power className="w-3 h-3" /> Deactivate
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3" /> Activate
                  </span>
                )}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
    <PaginationControls
      type="products"
      totalPages={totalProductPages}
      pages={pages}
      setPages={setPages}
    />
  </div>
);
