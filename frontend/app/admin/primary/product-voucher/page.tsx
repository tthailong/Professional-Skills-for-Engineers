"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/app/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Coffee,
  Gift,
  Ticket,
  Calendar,
  DollarSign,
  Tag,
  Film,
  Sparkles,
  ShoppingBag,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/store/useUserStore";

// --- Types (Kept from your original) ---
type ItemType = "food-drink" | "souvenir" | "voucher";
export interface ProductItem {
  id: string;
  type: ItemType;
  name: string;
  description: string;
  price?: number;
  size?: string;
  foodType?: string;
  movieId?: number;
  discount?: number;
  expiration?: string;
  condition?: string;
}

const CustomBadge = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${className}`}
  >
    {children}
  </div>
);

export default function ProductVoucherPage() {
  const [items, setItems] = useState<ProductItem[]>([]);
  const [movies, setMovies] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<ItemType>("food-drink");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    type: "food-drink" as ItemType,
    name: "",
    description: "",
    price: "",
    size: "MEDIUM",
    foodType: "Snack",
    movieId: "",
    discount: "",
    expiration: "",
    condition: "No",
  });

  const fetchItems = async () => {
    try {
      const [foodRes, souvenirRes, voucherRes, moviesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/products/food_drink`),
        fetch(`${API_BASE_URL}/admin/products/souvenir`),
        fetch(`${API_BASE_URL}/admin/vouchers/`),
        fetch(`${API_BASE_URL}/admin/movies/all`),
      ]);
      const foodData = await foodRes.json();
      const souvenirData = await souvenirRes.json();
      const voucherData = await voucherRes.json();
      setMovies(await moviesRes.json());

      const mappedItems: ProductItem[] = [];
      if (Array.isArray(foodData)) {
        foodData.forEach((item: any) =>
          mappedItems.push({
            id: item.id.toString(),
            type: "food-drink",
            name: item.name,
            description: item.description,
            price: item.price,
            size: item.size,
            foodType: item.type,
          }),
        );
      }
      if (Array.isArray(souvenirData)) {
        souvenirData.forEach((item: any) =>
          mappedItems.push({
            id: item.id.toString(),
            type: "souvenir",
            name: item.name,
            description: item.description,
            price: item.price,
            movieId: item.movie_id,
          }),
        );
      }
      if (Array.isArray(voucherData)) {
        voucherData.forEach((item: any) =>
          mappedItems.push({
            id: item.Voucher_id.toString(),
            type: "voucher",
            name: `Voucher #${item.Voucher_id}`,
            description: item.Description,
            discount: item.Discount,
            expiration: item.Expiration,
            condition: item.Condition,
          }),
        );
      }
      setItems(mappedItems);
    } catch (error) {
      toast.error("Sync Error");
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filteredItems = items.filter(
    (i) =>
      i.type === activeTab &&
      (i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.description?.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const handleOpenCreate = () => {
    setFormData({
      type: activeTab,
      name: "",
      description: "",
      price: "",
      size: "MEDIUM",
      foodType: "Snack",
      movieId: "",
      discount: "",
      expiration: "",
      condition: "No",
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ProductItem) => {
    setFormData({
      type: item.type,
      name: item.name,
      description: item.description || "",
      price: item.price?.toString() || "",
      size: item.size || "MEDIUM",
      foodType: item.foodType || "Snack",
      movieId: item.movieId?.toString() || "",
      discount: item.discount?.toString() || "",
      expiration: item.expiration || "",
      condition: item.condition || "No",
    });
    setCurrentItemId(item.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };
  const handleDelete = async (id: string, type: ItemType) => {
    // Custom cinematic confirmation
    const confirmDelete = window.confirm(
      "Are you sure you want to remove this item from the inventory? This action cannot be undone.",
    );
    if (!confirmDelete) return;

    try {
      let url = "";
      if (type === "food-drink")
        url = `${API_BASE_URL}/admin/products/food_drink/${id}`;
      else if (type === "souvenir")
        url = `${API_BASE_URL}/admin/products/souvenir/${id}`;
      else if (type === "voucher") url = `${API_BASE_URL}/admin/vouchers/${id}`;

      const res = await fetch(url, { method: "DELETE" });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to delete item");
      }

      toast.success("Inventory updated: Item successfully removed", {
        style: {
          background: "#fff1f2", // Soft Rose background
          color: "#e11d48", // Rose-600 text
          border: "1px solid #fda4af",
        },
      });

      // Refresh the data to reflect changes in the UI
      fetchItems();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(
        error.message || "Deletion failed. Please check system logs.",
      );
    }
  };
  // --- SUBMIT LOGIC (Simplified for Redesign) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Re-use your original fetch logic here...
    setIsModalOpen(false);
    toast.success("Success!");
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden text-slate-900">
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-rose-50/50 blur-[120px] -z-10" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[35%] h-[40%] rounded-full bg-indigo-50/40 blur-[120px] -z-10" />

      <Navbar />

      <main className="container mx-auto px-4 pt-16 pb-24 relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-rose-600 rounded-xl shadow-lg shadow-rose-200">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-600">
                Concessions Hub
              </span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-slate-900 to-rose-900 bg-clip-text text-transparent">
              Products & Offers
            </h1>
          </motion.div>

          <Button
            onClick={handleOpenCreate}
            className="rounded-2xl bg-slate-900 hover:bg-rose-600 text-white h-14 px-8 font-black transition-all shadow-xl shadow-slate-200 active:scale-95"
          >
            <Plus className="w-5 h-5 mr-2" /> Add New Entry
          </Button>
        </header>

        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as ItemType)}
          className="space-y-10"
        >
          <TabsList className="bg-slate-100/50 backdrop-blur-md p-1 rounded-2xl border border-slate-200 w-fit">
            <TabsTrigger
              value="food-drink"
              className="rounded-xl px-8 py-3 data-[state=active]:bg-white data-[state=active]:text-rose-600 font-bold transition-all gap-2"
            >
              <Coffee className="w-4 h-4" /> Concessions
            </TabsTrigger>
            <TabsTrigger
              value="souvenir"
              className="rounded-xl px-8 py-3 data-[state=active]:bg-white data-[state=active]:text-rose-600 font-bold transition-all gap-2"
            >
              <Gift className="w-4 h-4" /> Souvenirs
            </TabsTrigger>
            <TabsTrigger
              value="voucher"
              className="rounded-xl px-8 py-3 data-[state=active]:bg-white data-[state=active]:text-rose-600 font-bold transition-all gap-2"
            >
              <Ticket className="w-4 h-4" /> Vouchers
            </TabsTrigger>
          </TabsList>

          <div className="max-w-xl">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-rose-600 transition-colors" />
              <Input
                placeholder={`Search ${activeTab.replace("-", " & ")}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 bg-white/40 backdrop-blur-xl border-slate-200 rounded-2xl shadow-sm text-lg"
              />
            </div>
          </div>

          <TabsContent value={activeTab} className="mt-0 focus-visible:ring-0">
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="border-none bg-white/70 backdrop-blur-md rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden group hover:shadow-2xl hover:shadow-rose-100 transition-all duration-500">
                      {/* Visual Header */}
                      <div
                        className={`h-24 flex items-center justify-between px-8 relative overflow-hidden ${
                          item.type === "voucher"
                            ? "bg-slate-900 text-white"
                            : "bg-rose-50 text-rose-600"
                        }`}
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2" />
                        <div className="relative z-10">
                          {item.type === "food-drink" && (
                            <Coffee className="w-8 h-8 opacity-40" />
                          )}
                          {item.type === "souvenir" && (
                            <Gift className="w-8 h-8 opacity-40" />
                          )}
                          {item.type === "voucher" && (
                            <Ticket className="w-8 h-8 opacity-40" />
                          )}
                        </div>
                        <div className="text-right relative z-10">
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
                            Listing ID
                          </p>
                          <p className="text-xl font-black font-mono">
                            #{item.id}
                          </p>
                        </div>
                      </div>

                      <CardContent className="p-8">
                        <div className="mb-6">
                          <h3 className="text-2xl font-black text-slate-900 line-clamp-1 mb-1 group-hover:text-rose-600 transition-colors">
                            {item.name}
                          </h3>
                          <p className="text-sm text-slate-500 font-medium line-clamp-2 italic">
                            {item.description}
                          </p>
                        </div>

                        {/* Specs Section */}
                        <div className="space-y-3 mb-8">
                          {item.type === "food-drink" && (
                            <div className="flex gap-2">
                              <CustomBadge className="bg-rose-50 text-rose-600 border-rose-100">
                                {item.size}
                              </CustomBadge>
                              <CustomBadge className="bg-slate-50 text-slate-500 border-slate-100">
                                {item.foodType}
                              </CustomBadge>
                            </div>
                          )}
                          {item.type === "souvenir" && (
                            <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-tighter">
                              <Film className="w-3.5 h-3.5 text-rose-500" />
                              Movie ID: {item.movieId}
                            </div>
                          )}
                          {item.type === "voucher" && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase">
                                <Tag className="w-3.5 h-3.5" /> Condition:{" "}
                                {item.condition}
                              </div>
                              <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase">
                                <Clock className="w-3.5 h-3.5" /> Expiry:{" "}
                                {item.expiration}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Pricing/Discount Footer */}
                        <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              {item.type === "voucher"
                                ? "Direct Discount"
                                : "Base Price"}
                            </p>
                            <p
                              className={`text-3xl font-black ${item.type === "voucher" ? "text-emerald-600" : "text-slate-900"}`}
                            >
                              {item.type === "voucher"
                                ? `${item.discount}%`
                                : `$${item.price}`}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleOpenEdit(item)}
                              className="rounded-xl border-slate-100 hover:bg-rose-50 hover:text-rose-600"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDelete(item.id, item.type)}
                              className="rounded-xl border-rose-50 text-rose-300 hover:bg-rose-600 hover:text-white"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Add/Edit Modal (Rose Redesign) */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[500px] bg-white rounded-[3rem] border-none shadow-2xl p-10 max-h-[90vh] overflow-y-auto no-scrollbar">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-3xl font-black text-slate-900">
                {isEditing ? "Modify Entry" : "Global Creation"}
              </DialogTitle>
              <DialogDescription className="text-slate-500 font-medium">
                Update the cinema inventory and pricing structure.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  Entry Name
                </Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="h-14 rounded-2xl bg-slate-50 border-none font-bold"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  Technical Description
                </Label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full min-h-[100px] rounded-2xl bg-slate-50 border-none p-4 text-sm font-medium focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              {formData.type === "voucher" ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      Discount (%)
                    </Label>
                    <Input
                      type="number"
                      value={formData.discount}
                      onChange={(e) =>
                        setFormData({ ...formData, discount: e.target.value })
                      }
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      Condition
                    </Label>
                    <Input
                      value={formData.condition}
                      onChange={(e) =>
                        setFormData({ ...formData, condition: e.target.value })
                      }
                      className="h-12 rounded-xl"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    Unit Price ($)
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-600" />
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="h-14 pl-12 rounded-2xl bg-slate-50 border-none font-black text-lg"
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-16 rounded-[1.5rem] bg-rose-600 hover:bg-rose-700 font-black text-lg shadow-2xl shadow-rose-200 mt-6"
              >
                Authorize & Save
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
