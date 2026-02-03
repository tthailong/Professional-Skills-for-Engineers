// components/branch_manager/EventsTab.tsx

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Calendar, CheckCircle } from "lucide-react";
import { BranchData } from "../types";
import { PaginationControls } from "./PaginationControls";

interface EventsProps {
  branchData: BranchData;
  paginatedEvents: any[];
  totalEventPages: number;
  searchQueries: { events: string };
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

export const EventsTab: React.FC<EventsProps> = ({
  branchData,
  paginatedEvents,
  totalEventPages,
  searchQueries,
  setSearchQueries,
  toggleItem,
  pages,
  setPages,
}) => (
  <div className="space-y-6">
    <div className="relative max-w-md mb-4">
      <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
      <Input
        placeholder="Search events..."
        className="pl-10 bg-card border-border"
        value={searchQueries.events}
        onChange={(e) =>
          setSearchQueries((prev) => ({
            ...prev,
            events: e.target.value,
          }))
        }
      />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {paginatedEvents.map((event) => {
        const isActive = branchData.activeEventIds.includes(event.id);
        return (
          <Card
            key={event.id}
            className={`border-border bg-card cursor-pointer transition-all hover:shadow-md ${
              isActive ? "ring-2 ring-primary bg-primary/5" : ""
            }`}
            onClick={() => toggleItem("activeEventIds", event.id)}
          >
            <CardContent className="p-6 flex flex-col h-full">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-bold text-lg text-foreground">
                  {event.title}
                </h4>
                <div
                  className={`w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isActive
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-muted-foreground"
                  }`}
                >
                  {isActive && <CheckCircle className="w-4 h-4" />}
                </div>
              </div>
              <p className="text-sm text-primary font-medium flex items-center gap-1 mb-3">
                <Calendar className="w-4 h-4" /> {event.date}
              </p>
              <p className="text-sm text-muted-foreground">
                {event.description}
              </p>

              <div className="mt-auto pt-4 flex justify-end">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {isActive ? "Active at Branch" : "Inactive"}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
    <PaginationControls
      type="events"
      totalPages={totalEventPages}
      pages={pages}
      setPages={setPages}
    />
  </div>
);
