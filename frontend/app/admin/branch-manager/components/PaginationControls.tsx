// components/branch_manager/PaginationControls.tsx

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationType = "movies" | "events" | "products";

interface PaginationProps {
  type: PaginationType;
  totalPages: number;
  pages: Record<PaginationType, number>;
  setPages: React.Dispatch<
    React.SetStateAction<Record<PaginationType, number>>
  >;
}

export const PaginationControls: React.FC<PaginationProps> = ({
  type,
  totalPages,
  pages,
  setPages,
}) => (
  <div className="flex items-center justify-end gap-2 mt-4">
    <Button
      variant="outline"
      size="sm"
      onClick={() =>
        setPages((prev) => ({ ...prev, [type]: Math.max(1, prev[type] - 1) }))
      }
      disabled={pages[type] === 1}
    >
      <ChevronLeft className="w-4 h-4" />
    </Button>
    <span className="text-sm text-muted-foreground">
      Page {pages[type]} of {totalPages || 1}
    </span>
    <Button
      variant="outline"
      size="sm"
      onClick={() =>
        setPages((prev) => ({
          ...prev,
          [type]: Math.min(totalPages, prev[type] + 1),
        }))
      }
      disabled={pages[type] === totalPages || totalPages === 0}
    >
      <ChevronRight className="w-4 h-4" />
    </Button>
  </div>
);
