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
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  MapPin,
  Plus,
  Search,
  Edit,
  Power,
  User,
  Building,
  MoreHorizontal,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Phone,
  Loader2,
} from "lucide-react";
import { useAdminStore } from "@/store/useAdminStore";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- Types ---
interface Branch {
  id: string;
  name: string;
  location: string;
  status: "Active" | "Inactive";
  managerId: string | null; // ID of the assigned admin
}

export default function BranchManagementPage() {
  // --- Store & State ---
  const {
    admins,
    fetchAdmins,
    branches,
    totalBranches, // New state from store
    fetchBranches,
    createBranch,
    updateBranch,
    deleteBranch,
    isLoading,
  } = useAdminStore();

  // Search, Sort, Pagination State
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("Branch_id");
  const [sortOrder, setSortOrder] = useState("ASC");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6); // Default 6 items per page

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to page 1 on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch Data on Change
  useEffect(() => {
    fetchAdmins();
    fetchBranches({
      search: debouncedSearch,
      sortBy,
      order: sortOrder,
      page: currentPage,
      limit: itemsPerPage,
    });
  }, [
    fetchAdmins,
    fetchBranches,
    debouncedSearch,
    sortBy,
    sortOrder,
    currentPage,
    itemsPerPage,
  ]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBranchId, setCurrentBranchId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    location: "",
    managerId: "",
    phone: "",
  });

  // --- Helpers ---

  // Get only 'Regular' admins who can manage branches
  const availableManagers = admins.filter((admin) => admin.role === "regular");

  // Reset Form
  const resetForm = () => {
    setFormData({
      name: "",
      city: "",
      location: "",
      managerId: "",
      phone: "",
    });
    setIsEditing(false);
    setCurrentBranchId(null);
  };

  // --- Handlers ---

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (branch: any) => {
    setFormData({
      name: branch.name,
      city: branch.city,
      location: branch.address,
      managerId: branch.managerId || "",
      phone: branch.phone || "",
    });
    setCurrentBranchId(branch.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this branch?")) {
      try {
        await deleteBranch(id);
        toast.success("Branch deleted successfully");
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing && currentBranchId) {
        // Update
        await updateBranch(currentBranchId, {
          name: formData.name,
          city: formData.city,
          address: formData.location,
          managerId: formData.managerId || undefined,
          phone: formData.phone || undefined,
        });
        toast.success("Branch updated successfully");
      } else {
        // Create
        await createBranch({
          name: formData.name,
          city: formData.city,
          address: formData.location,
          managerId: formData.managerId || undefined,
          phone: formData.phone || undefined,
        });
        toast.success("Branch created successfully");
      }
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Helper to find manager name by ID
  const getManagerName = (id: string | undefined) => {
    if (!id) return "Unassigned";
    const manager = admins.find((a) => a.id === id);
    return manager ? manager.name : "Unknown Admin";
  };

  // --- Hall Management State ---
  const [isHallModalOpen, setIsHallModalOpen] = useState(false);
  const [currentBranchForHalls, setCurrentBranchForHalls] = useState<any>(null);
  const [halls, setHalls] = useState<any[]>([]);
  const [isHallLoading, setIsHallLoading] = useState(false);
  const [editingHall, setEditingHall] = useState<any>(null); // If null, creating new
  const [hallForm, setHallForm] = useState({
    hallNumber: "",
    type: "Standard",
    seatCapacity: "",
    rowCount: "",
    colCount: "",
  });

  const { fetchHalls, createHall, updateHall, deleteHall } = useAdminStore();

  const handleOpenHallManager = async (branch: any) => {
    setCurrentBranchForHalls(branch);
    setIsHallModalOpen(true);
    loadHalls(branch.id);
  };

  const loadHalls = async (branchId: string) => {
    setIsHallLoading(true);
    try {
      const data = await fetchHalls(branchId);
      setHalls(data);
    } catch (error) {
      toast.error("Failed to load halls");
    } finally {
      setIsHallLoading(false);
    }
  };

  const handleSaveHall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBranchForHalls) return;

    const payload = {
      hallNumber: parseInt(hallForm.hallNumber),
      type: hallForm.type,
      seatCapacity: parseInt(hallForm.seatCapacity),
      rowCount: parseInt(hallForm.rowCount),
      colCount: parseInt(hallForm.colCount),
    };

    try {
      if (editingHall) {
        await updateHall(
          currentBranchForHalls.id,
          editingHall.hallNumber,
          payload,
        );
        toast.success("Hall updated successfully");
      } else {
        await createHall(currentBranchForHalls.id, payload);
        toast.success("Hall created successfully");
      }
      setEditingHall(null);
      setHallForm({
        hallNumber: "",
        type: "Standard",
        seatCapacity: "",
        rowCount: "",
        colCount: "",
      });
      loadHalls(currentBranchForHalls.id);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteHall = async (hallNumber: number) => {
    if (!currentBranchForHalls) return;
    if (confirm("Are you sure you want to delete this hall?")) {
      try {
        await deleteHall(currentBranchForHalls.id, hallNumber);
        toast.success("Hall deleted successfully");
        loadHalls(currentBranchForHalls.id);
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  };

  const startEditHall = (hall: any) => {
    setEditingHall(hall);
    setHallForm({
      hallNumber: hall.hallNumber.toString(),
      type: hall.type,
      seatCapacity: hall.seatCapacity.toString(),
      rowCount: hall.rowCount.toString(),
      colCount: hall.colCount.toString(),
    });
  };

  const cancelEditHall = () => {
    setEditingHall(null);
    setHallForm({
      hallNumber: "",
      type: "Standard",
      seatCapacity: "",
      rowCount: "",
      colCount: "",
    });
  };

  // Pagination Logic
  const totalPages = Math.ceil(totalBranches / itemsPerPage);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden text-foreground">
      {/* Aurora Blurs */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] -z-10" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[40%] rounded-full bg-accent/5 blur-[120px] -z-10" />
      
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-[var(--foreground)] to-[var(--primary)] bg-clip-text text-transparent mb-2 flex items-center gap-3">
              <Building className="w-9 h-9 text-primary" />
              Branch Management
            </h1>
            <p className="text-muted-foreground">
              Oversee cinema branches and assignments.
            </p>
          </div>

          <Dialog
            open={isModalOpen}
            onOpenChange={(open) => {
              setIsModalOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button
                onClick={handleOpenCreate}
                className="bg-primary hover:bg-primary/90 text-white gap-2 rounded-xl shadow-lg shadow-primary/20"
              >
                <Plus className="w-4 h-4" /> Add New Branch
              </Button>
            </DialogTrigger>
            <DialogOverlay className="bg-card/100 backdrop-blur-sm" />
            <DialogContent className="sm:max-w-[500px] bg-card border border-border/50 rounded-2xl shadow-xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-primary">
                  {isEditing ? "Edit Branch Details" : "Add New Branch"}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Configure the branch details and assign a manager.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Branch Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g., Downtown Cinema"
                      className="bg-muted border-border text-foreground rounded-xl"
                      required
                    />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      placeholder="e.g., Ho Chi Minh City"
                      className="bg-muted border-border text-foreground rounded-xl"
                      required
                    />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Location Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                        placeholder="123 Street Name, City"
                        className="pl-10 bg-muted border-border text-foreground rounded-xl"
                        required
                      />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="0901234567"
                        className="pl-10 bg-muted border-border text-foreground rounded-xl"
                      />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="manager">Assign Branch Manager</Label>
                  <select
                    id="manager"
                    value={formData.managerId}
                    onChange={(e) =>
                      setFormData({ ...formData, managerId: e.target.value })
                    }
                    className="flex h-11 w-full items-center justify-between rounded-xl border border-border bg-muted px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  >
                    <option value="">-- Select an Admin --</option>
                    {availableManagers.map((admin) => {
                      const managedBranch = branches.find(
                        (b) => b.managerId === admin.id,
                      );
                      const isCurrentManager = formData.managerId === admin.id; // Currently selected in form
                      const isManagingOther =
                        managedBranch && managedBranch.id !== currentBranchId;

                      return (
                        <option key={admin.id} value={admin.id}>
                        {admin.name} ({admin.email})
                        {isManagingOther
                          ? ` - Manages ${managedBranch.name}`
                          : " - Available"}
                      </option>
                      );
                    })}
                  </select>
                  <p className="text-[0.8rem] text-muted-foreground">
                    Only "Regular" admins can be assigned.
                  </p>
                </div>

                 <DialogFooter className="mt-4 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl border-border text-foreground hover:bg-muted"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-primary hover:bg-primary/90 text-white rounded-xl px-8"
                  >
                    {isLoading
                      ? "Saving..."
                      : isEditing
                        ? "Save Changes"
                        : "Create Branch"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* --- HALL MANAGEMENT MODAL --- */}
          <Dialog open={isHallModalOpen} onOpenChange={setIsHallModalOpen}>
             <DialogContent className="sm:max-w-[700px] bg-card border border-border/50 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-primary">
                  Manage Halls - {currentBranchForHalls?.name}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Create, update, and delete halls for this branch.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 py-4">
                {/* Create/Edit Form */}
                 <div className="p-5 border border-border/50 rounded-2xl bg-muted/30">
                  <h3 className="text-sm font-bold mb-4 text-foreground">
                    {editingHall ? "Edit Hall" : "Add New Hall"}
                  </h3>
                  <form
                    onSubmit={handleSaveHall}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="hallNumber" className="text-foreground">Hall Number</Label>
                      <Input
                        id="hallNumber"
                        type="number"
                        value={hallForm.hallNumber}
                        onChange={(e) =>
                          setHallForm({
                            ...hallForm,
                            hallNumber: e.target.value,
                          })
                        }
                        className="bg-muted border-border text-foreground rounded-xl"
                        placeholder="1"
                        required
                        disabled={!!editingHall}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type" className="text-foreground">Type</Label>
                      <select
                        id="type"
                        value={hallForm.type}
                        onChange={(e) =>
                          setHallForm({ ...hallForm, type: e.target.value })
                        }
                        className="flex h-10 w-full rounded-xl border border-border bg-muted px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="Standard">Standard</option>
                        <option value="IMAX">IMAX</option>
                        <option value="4DX">4DX</option>
                        <option value="2D Class">2D</option>
                        <option value="3D Class">3D</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="seatCapacity" className="text-foreground">Seat Capacity</Label>
                      <Input
                        id="seatCapacity"
                        type="number"
                        value={hallForm.seatCapacity}
                        readOnly
                        className="bg-muted/50 border-border text-muted-foreground cursor-not-allowed rounded-xl"
                        placeholder="Auto-calculated"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor="rowCount" className="text-foreground">Rows</Label>
                        <Input
                          id="rowCount"
                          type="number"
                          min="1"
                          value={hallForm.rowCount}
                          className="bg-muted border-border text-foreground rounded-xl"
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (val < 0) return;
                            const newRowCount = e.target.value;
                            const newCapacity =
                              parseInt(newRowCount || "0") *
                              parseInt(hallForm.colCount || "0");
                            setHallForm({
                              ...hallForm,
                              rowCount: newRowCount,
                              seatCapacity: newCapacity.toString(),
                            });
                          }}
                          placeholder="10"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="colCount" className="text-foreground">Cols</Label>
                        <Input
                          id="colCount"
                          type="number"
                          min="1"
                          value={hallForm.colCount}
                          className="bg-muted border-border text-foreground rounded-xl"
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (val < 0) return;
                            const newColCount = e.target.value;
                            const newCapacity =
                              parseInt(hallForm.rowCount || "0") *
                              parseInt(newColCount || "0");
                            setHallForm({
                              ...hallForm,
                              colCount: newColCount,
                              seatCapacity: newCapacity.toString(),
                            });
                          }}
                          placeholder="10"
                          required
                        />
                      </div>
                    </div>

                    <div className="col-span-2 flex justify-end gap-2 mt-4">
                      {editingHall && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={cancelEditHall}
                          className="rounded-xl text-muted-foreground hover:bg-muted"
                        >
                          Cancel
                        </Button>
                      )}
                      <Button type="submit" className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6">
                        {editingHall ? "Update Hall" : "Add Hall"}
                      </Button>
                    </div>
                  </form>
                </div>

                {/* Hall List */}
                <div>
                 <div className="space-y-3">
                  <h3 className="text-sm font-bold text-foreground">Existing Halls</h3>
                  {isHallLoading ? (
                    <div className="text-center p-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                    </div>
                  ) : halls.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">
                      No halls configured yet.
                    </p>
                  ) : (
                    <div className="border border-border/50 rounded-2xl divide-y divide-border/50 overflow-hidden bg-muted/20">
                      {halls.map((hall) => (
                        <div
                          key={hall.hallNumber}
                          className="p-4 flex justify-between items-center hover:bg-muted/50 transition-colors"
                        >
                          <div>
                            <div className="font-bold text-foreground">
                              Hall {hall.hallNumber}
                              <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] uppercase tracking-wider">
                                {hall.type}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {hall.seatCapacity} Seats • {hall.rowCount} Rows × {hall.colCount} Cols
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => startEditHall(hall)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteHall(hall.hallNumber)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            </DialogContent>
          </Dialog>
        </div>

         {/* Search & Sort Controls */}
        <Card className="border border-border/50 bg-card/80 backdrop-blur-xl rounded-2xl shadow-xl mb-8 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-5 h-5 text-primary" />
                <Input
                  placeholder="Search branches by name, city, or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 bg-muted border-border text-foreground h-11 rounded-xl shadow-inner placeholder:text-muted-foreground"
                />
              </div>
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px] bg-muted border-border text-foreground h-11 rounded-xl">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border shadow-2xl">
                    <SelectItem value="Branch_id">ID</SelectItem>
                    <SelectItem value="Name">Name</SelectItem>
                    <SelectItem value="City">City</SelectItem>
                    <SelectItem value="Address">Address</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-muted border-border text-foreground h-11 w-11 rounded-xl hover:bg-primary/10 transition-colors"
                  onClick={() =>
                    setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC")
                  }
                >
                  <ArrowUpDown
                    className={`h-4 w-4 ${
                      sortOrder === "DESC" ? "rotate-180" : ""
                    } transition-transform text-primary`}
                  />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Branch List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No branches found.
            </div>
          ) : (
            branches.map((branch) => (
               <Card
                key={branch.id}
                className="border border-border/50 bg-card/80 backdrop-blur-xl rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group"
              >
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Building className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                        <CardTitle className="text-xl font-bold text-foreground">
                          {branch.name}
                        </CardTitle>
                      </div>
                      <CardDescription className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-3 h-3 text-primary/60" /> {branch.address}
                      </CardDescription>
                      <CardDescription className="flex items-center gap-2 mt-1 text-xs text-muted-foreground/80 font-medium">
                        {branch.city}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                 <CardContent className="pb-6">
                  <div className="space-y-5">
                    {/* Manager Info */}
                    <div className="p-4 bg-muted/40 rounded-xl border border-border/50 shadow-inner group-hover:bg-muted/60 transition-colors">
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-2 flex items-center gap-1">
                         Manager
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-xl shadow-sm">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <span
                          className={`text-sm font-bold ${
                            !branch.managerId
                              ? "text-muted-foreground/60 italic"
                              : "text-foreground"
                          }`}
                        >
                          {getManagerName(branch.managerId)}
                        </span>
                      </div>
                    </div>

                     {/* Actions */}
                    <div className="flex flex-col gap-3 pt-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full bg-primary/5 hover:bg-primary/10 text-primary border-primary/10 rounded-xl h-10 font-bold shadow-sm"
                        onClick={() => handleOpenHallManager(branch)}
                      >
                         Manage Halls
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleOpenEdit(branch)}
                          variant="outline"
                          className="flex-1 border-border/50 bg-muted/20 hover:bg-muted text-foreground rounded-xl h-10 shadow-sm"
                        >
                          <Edit className="w-4 h-4 mr-2 text-primary" /> Edit
                        </Button>
                        <Button
                          onClick={() => handleDelete(branch.id)}
                          variant="outline"
                          className="flex-1 border-border/50 bg-muted/20 hover:bg-destructive/10 text-destructive hover:text-destructive rounded-xl h-10 shadow-sm"
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

         {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-6 mt-12 bg-card/50 backdrop-blur-lg p-4 rounded-2xl border border-border/50 w-fit mx-auto shadow-xl">
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl border-border h-10 w-10 hover:bg-primary/10 hover:text-primary transition-all"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
               <span className="text-sm font-bold text-foreground">
                Page {currentPage}
              </span>
              <span className="text-sm text-muted-foreground font-medium">
                of {totalPages}
              </span>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl border-border h-10 w-10 hover:bg-primary/10 hover:text-primary transition-all"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
