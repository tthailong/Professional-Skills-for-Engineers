"use client";

import { useState, useEffect } from "react";
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
  DialogTrigger,
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
} from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/store/useUserStore";

// --- Types ---
type ItemType = "food-drink" | "souvenir" | "voucher";

export interface ProductItem {
  id: string;
  type: ItemType;
  name: string; // Voucher description or Product name
  description: string;
  price?: number; // For Food/Souvenir
  // Food specific
  size?: string;
  foodType?: string;
  // Souvenir specific
  movieId?: number;
  // Voucher specific
  voucherCode?: string; // Not used in backend? Backend has ID.
  discount?: number;
  expiration?: string;
  condition?: string;
}

interface MovieOption {
  movie_id: number;
  title: string;
}

export default function ProductVoucherPage() {
  const [items, setItems] = useState<ProductItem[]>([]);
  const [movies, setMovies] = useState<MovieOption[]>([]); // Store movies
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<ItemType>("food-drink");

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);

  // Unified Form Data
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

  // --- Fetch Data ---
  const fetchItems = async () => {
    try {
      const [foodRes, souvenirRes, voucherRes, moviesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/products/food_drink`),
        fetch(`${API_BASE_URL}/admin/products/souvenir`),
        fetch(`${API_BASE_URL}/admin/vouchers/`),
        fetch(`${API_BASE_URL}/admin/movies/all`), // Fetch movies
      ]);

      const foodData = await foodRes.json();
      const souvenirData = await souvenirRes.json();
      const voucherData = await voucherRes.json();
      const moviesData = await moviesRes.json();

      setMovies(moviesData); // Set movies state

      const mappedItems: ProductItem[] = [];

      if (Array.isArray(foodData)) {
        foodData.forEach((item: any) => {
          mappedItems.push({
            id: item.id.toString(),
            type: "food-drink",
            name: item.name,
            description: item.description,
            price: item.price,
            size: item.size,
            foodType: item.type,
          });
        });
      }

      if (Array.isArray(souvenirData)) {
        souvenirData.forEach((item: any) => {
          mappedItems.push({
            id: item.id.toString(),
            type: "souvenir",
            name: item.name,
            description: item.description,
            price: item.price,
            movieId: item.movie_id,
          });
        });
      }

      if (Array.isArray(voucherData)) {
        voucherData.forEach((item: any) => {
          mappedItems.push({
            id: item.Voucher_id.toString(),
            type: "voucher",
            name: `Voucher ${item.Voucher_id}`, // Vouchers don't have names in DB, using ID
            description: item.Description,
            discount: item.Discount,
            expiration: item.Expiration,
            condition: item.Condition,
          });
        });
      }

      setItems(mappedItems);
    } catch (error) {
      console.error("Error fetching items:", error);
      toast.error("Failed to load items");
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // --- Helpers ---

  const filteredItems = items.filter(
    (item) =>
      item.type === activeTab &&
      (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const resetForm = (defaultType: ItemType = activeTab) => {
    setFormData({
      type: defaultType,
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
    setCurrentItemId(null);
  };

  // --- Handlers ---

  const handleOpenCreate = () => {
    resetForm(activeTab);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ProductItem) => {
    setFormData({
      type: item.type,
      name: item.name,
      description: item.description || "",
      price: item.price ? item.price.toString() : "",
      size: item.size || "MEDIUM",
      foodType: item.foodType || "Snack",
      movieId: item.movieId ? item.movieId.toString() : "",
      discount: item.discount ? item.discount.toString() : "",
      expiration: item.expiration || "",
      condition: item.condition || "No",
    });
    setCurrentItemId(item.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, type: ItemType) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      let url = "";
      if (type === "food-drink")
        url = `${API_BASE_URL}/admin/products/food_drink/${id}`;
      else if (type === "souvenir")
        url = `${API_BASE_URL}/admin/products/souvenir/${id}`;
      else if (type === "voucher") url = `${API_BASE_URL}/admin/vouchers/${id}`;

      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete item");

      toast.success("Item deleted successfully");
      fetchItems();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete item");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let url = "";
      let method = isEditing ? "PUT" : "POST";
      let body: any = {};

      if (formData.type === "food-drink") {
        url = `${API_BASE_URL}/admin/products/food_drink`;
        if (isEditing) url += `/${currentItemId}`;
        body = {
          name: formData.name,
          price: parseFloat(formData.price),
          description: formData.description,
          size: formData.size,
          type: formData.foodType,
        };
      } else if (formData.type === "souvenir") {
        url = `${API_BASE_URL}/admin/products/souvenir`;
        if (isEditing) url += `/${currentItemId}`;
        body = {
          name: formData.name,
          price: parseFloat(formData.price),
          description: formData.description,
          movie_id: parseInt(formData.movieId),
        };
      } else if (formData.type === "voucher") {
        url = `${API_BASE_URL}/admin/vouchers/`;
        if (isEditing) url += `${currentItemId}`;
        body = {
          discount: parseFloat(formData.discount),
          expiration: formData.expiration, // Assuming backend accepts YYYY-MM-DD or format it
          description: formData.description,
          condition: formData.condition,
        };
        // Backend expects dd/mm/yyyy for vouchers? Let's check.
        // admin_voucher.py says: expiration: str # dd/mm/yyyy
        // Input type="date" gives YYYY-MM-DD. Need to convert.
        if (formData.expiration) {
          const [year, month, day] = formData.expiration.split("-");
          body.expiration = `${day}/${month}/${year}`;
        }
      }

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to save item");
      }

      toast.success(
        isEditing ? "Item updated successfully" : "Item created successfully"
      );
      fetchItems();
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error.message);
    }
  };

  // Helper to get icon based on type
  const getTypeIcon = (type: ItemType) => {
    switch (type) {
      case "food-drink":
        return <Coffee className="w-5 h-5" />;
      case "souvenir":
        return <Gift className="w-5 h-5" />;
      case "voucher":
        return <Ticket className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Product & Voucher Management
            </h1>
            <p className="text-muted-foreground">
              Manage concessions, merchandise, and discount vouchers.
            </p>
          </div>

          <Button
            onClick={handleOpenCreate}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            <Plus className="w-4 h-4" /> Add New Item
          </Button>
        </div>

        {/* Main Content Tabs */}
        <Tabs
          defaultValue="food-drink"
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as ItemType)}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3 bg-card border border-border">
            <TabsTrigger value="food-drink" className="gap-2">
              <Coffee className="w-4 h-4" /> Food & Drink
            </TabsTrigger>
            <TabsTrigger value="souvenir" className="gap-2">
              <Gift className="w-4 h-4" /> Souvenirs
            </TabsTrigger>
            <TabsTrigger value="voucher" className="gap-2">
              <Ticket className="w-4 h-4" /> Vouchers
            </TabsTrigger>
          </TabsList>

          {/* Search Bar */}
          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder={`Search ${activeTab.replace("-", " & ")}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-secondary border-border text-foreground"
                />
              </div>
            </CardContent>
          </Card>

          {/* Items Grid */}
          <TabsContent value={activeTab} className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  No items found in this category.
                </div>
              ) : (
                filteredItems.map((item) => (
                  <Card
                    key={item.id}
                    className="border-border bg-card hover:shadow-lg transition-all"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-secondary rounded-full text-primary">
                            {getTypeIcon(item.type)}
                          </div>
                          <div>
                            <CardTitle className="text-lg font-bold text-foreground">
                              {item.name}
                            </CardTitle>
                            <CardDescription className="line-clamp-1 mt-1">
                              {item.type === "food-drink" &&
                                `${item.size} - ${item.foodType}`}
                              {item.type === "souvenir" &&
                                `Movie: ${
                                  movies.find(
                                    (m) => m.movie_id === Number(item.movieId)
                                  )?.title || item.movieId
                                }`}
                              {item.type === "voucher" &&
                                `Condition: ${item.condition}`}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 min-h-[40px]">
                        {item.description}
                      </p>

                      {/* Conditional Details based on Type */}
                      <div className="bg-secondary/50 rounded-lg p-3 mb-4 text-sm space-y-2">
                        {item.type === "voucher" ? (
                          <>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Discount
                              </span>
                              <span className="font-semibold text-foreground">
                                {item.discount}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> Expiration
                              </span>
                              <span className="text-xs font-medium text-foreground">
                                {item.expiration}
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Price</span>
                            <span className="font-bold text-lg text-primary">
                              ${item.price}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleOpenEdit(item)}
                          variant="outline"
                          size="sm"
                          className="flex-1 border-border bg-transparent hover:bg-secondary"
                        >
                          <Edit className="w-4 h-4 mr-2" /> Edit
                        </Button>
                        <Button
                          onClick={() => handleDelete(item.id, item.type)}
                          variant="outline"
                          size="sm"
                          className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10 bg-transparent"
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Add/Edit Dialog */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[500px] bg-card border-border text-foreground">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Edit Item" : "Create New Item"}
              </DialogTitle>
              <DialogDescription>
                {formData.type === "voucher"
                  ? "Configure voucher details and validity."
                  : "Set product details and pricing."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              {/* Common Fields */}
              {formData.type !== "voucher" && (
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Large Popcorn"
                    className="bg-secondary border-border"
                    required
                  />
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Short description of the item"
                  className="bg-secondary border-border"
                  required
                />
              </div>

              {/* Product Specific Fields */}
              {formData.type !== "voucher" && (
                <div className="grid gap-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="pl-10 bg-secondary border-border"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Food & Drink Specific */}
              {formData.type === "food-drink" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="size">Size</Label>
                    <select
                      id="size"
                      value={formData.size}
                      onChange={(e) =>
                        setFormData({ ...formData, size: e.target.value })
                      }
                      className="flex h-10 w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm"
                    >
                      <option value="SMALL">SMALL</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="LARGE">LARGE</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="foodType">Type</Label>
                    <Input
                      id="foodType"
                      value={formData.foodType}
                      onChange={(e) =>
                        setFormData({ ...formData, foodType: e.target.value })
                      }
                      placeholder="e.g. Snack, Drink"
                      className="bg-secondary border-border"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Souvenir Specific */}
              {formData.type === "souvenir" && (
                <div className="grid gap-2">
                  <Label htmlFor="movieId">Movie</Label>
                  <select
                    id="movieId"
                    value={formData.movieId}
                    onChange={(e) =>
                      setFormData({ ...formData, movieId: e.target.value })
                    }
                    className="flex h-10 w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Select a movie</option>
                    {movies.map((movie) => (
                      <option key={movie.movie_id} value={movie.movie_id}>
                        {movie.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Voucher Specific Fields */}
              {formData.type === "voucher" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="discount">Discount (%)</Label>
                      <Input
                        id="discount"
                        type="number"
                        min="1"
                        max="100"
                        step="0.01"
                        value={formData.discount}
                        onChange={(e) =>
                          setFormData({ ...formData, discount: e.target.value })
                        }
                        className="bg-secondary border-border"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="condition">Condition</Label>
                      <Input
                        id="condition"
                        value={formData.condition}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            condition: e.target.value,
                          })
                        }
                        placeholder="e.g. gt_$100"
                        className="bg-secondary border-border"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="expiration">Expiration Date</Label>
                    <Input
                      id="expiration"
                      type="date"
                      value={formData.expiration}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          expiration: e.target.value,
                        })
                      }
                      className="bg-secondary border-border"
                      required
                    />
                  </div>
                </>
              )}

              <DialogFooter className="mt-4">
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
                >
                  {isEditing ? "Save Changes" : "Create Item"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
