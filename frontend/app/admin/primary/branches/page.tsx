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
          payload
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
    <div className="min-h-screen bg-linear-to-b from-background to-secondary">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Building className="w-8 h-8 text-primary" />
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
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              >
                <Plus className="w-4 h-4" /> Add New Branch
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-card border-border">
              <DialogHeader>
                <DialogTitle>
                  {isEditing ? "Edit Branch Details" : "Add New Branch"}
                </DialogTitle>
                <DialogDescription>
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
                    className="bg-secondary border-border"
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
                    className="bg-secondary border-border"
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
                      className="pl-10 bg-secondary border-border"
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
                      className="pl-10 bg-secondary border-border"
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
                    className="flex h-10 w-full items-center justify-between rounded-md border border-border bg-secondary px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    <option value="">-- Select an Admin --</option>
                    {availableManagers.map((admin) => {
                      const managedBranch = branches.find(
                        (b) => b.managerId === admin.id
                      );
                      const isCurrentManager = formData.managerId === admin.id; // Currently selected in form
                      const isManagingOther =
                        managedBranch && managedBranch.id !== currentBranchId;

                      return (
                        <option key={admin.id} value={admin.id}>
                          {admin.name} ({admin.email})
                          {isManagingOther
                            ? ` - Manages ${managedBranch.name} (Will Swap)`
                            : " - Free"}
                        </option>
                      );
                    })}
                  </select>
                  <p className="text-[0.8rem] text-muted-foreground">
                    Only "Regular" admins can be assigned.
                  </p>
                </div>

                <DialogFooter className="mt-4">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
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
            <DialogContent className="sm:max-w-[700px] bg-card border-border max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  Manage Halls - {currentBranchForHalls?.name}
                </DialogTitle>
                <DialogDescription>
                  Create, update, and delete halls for this branch.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 py-4">
                {/* Create/Edit Form */}
                <div className="p-4 border rounded-lg bg-secondary/30">
                  <h3 className="text-sm font-semibold mb-3">
                    {editingHall ? "Edit Hall" : "Add New Hall"}
                  </h3>
                  <form
                    onSubmit={handleSaveHall}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div>
                      <Label htmlFor="hallNumber">Hall Number</Label>
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
                        placeholder="1"
                        required
                        disabled={!!editingHall} // Cannot change ID when editing
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Type</Label>
                      <select
                        id="type"
                        value={hallForm.type}
                        onChange={(e) =>
                          setHallForm({ ...hallForm, type: e.target.value })
                        }
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="Standard">Standard</option>
                        <option value="IMAX">IMAX</option>
                        <option value="4DX">4DX</option>
                        <option value="2D Class">2D</option>
                        <option value="3D Class">3D</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="seatCapacity">Seat Capacity</Label>
                      <Input
                        id="seatCapacity"
                        type="number"
                        value={hallForm.seatCapacity}
                        readOnly
                        className="bg-muted"
                        placeholder="Auto-calculated"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="rowCount">Rows</Label>
                        <Input
                          id="rowCount"
                          type="number"
                          min="1"
                          value={hallForm.rowCount}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (val < 0) return; // Prevent negative
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
                      <div>
                        <Label htmlFor="colCount">Cols</Label>
                        <Input
                          id="colCount"
                          type="number"
                          min="1"
                          value={hallForm.colCount}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (val < 0) return; // Prevent negative
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

                    <div className="col-span-2 flex justify-end gap-2 mt-2">
                      {editingHall && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={cancelEditHall}
                        >
                          Cancel
                        </Button>
                      )}
                      <Button type="submit" size="sm">
                        {editingHall ? "Update Hall" : "Add Hall"}
                      </Button>
                    </div>
                  </form>
                </div>

                {/* Hall List */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">Existing Halls</h3>
                  {isHallLoading ? (
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  ) : halls.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No halls found.
                    </p>
                  ) : (
                    <div className="border rounded-md divide-y">
                      {halls.map((hall) => (
                        <div
                          key={hall.hallNumber}
                          className="p-3 flex justify-between items-center hover:bg-muted/50"
                        >
                          <div>
                            <div className="font-medium">
                              Hall {hall.hallNumber} ({hall.type})
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {hall.seatCapacity} Seats ({hall.rowCount}x
                              {hall.colCount})
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
            </DialogContent>
          </Dialog>
        </div>

        {/* Search & Sort Controls */}
        <Card className="border-border bg-card mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search branches by name, city, or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-secondary border-border text-foreground"
                />
              </div>
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px] bg-secondary border-border">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Branch_id">ID</SelectItem>
                    <SelectItem value="Name">Name</SelectItem>
                    <SelectItem value="City">City</SelectItem>
                    <SelectItem value="Address">Address</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-secondary border-border"
                  onClick={() =>
                    setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC")
                  }
                >
                  <ArrowUpDown
                    className={`h-4 w-4 ${
                      sortOrder === "DESC" ? "rotate-180" : ""
                    } transition-transform`}
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
                className="border-border bg-card hover:shadow-lg transition-all"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-bold text-foreground">
                        {branch.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" /> {branch.address}
                      </CardDescription>
                      <CardDescription className="flex items-center gap-1 mt-1 text-xs">
                        {branch.city}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Manager Info */}
                    <div className="p-3 bg-secondary rounded-lg border border-border">
                      <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">
                        Branch Manager
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-1.5 rounded-full">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <span
                          className={`text-sm font-medium ${
                            !branch.managerId
                              ? "text-muted-foreground italic"
                              : "text-foreground"
                          }`}
                        >
                          {getManagerName(branch.managerId)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 pt-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full"
                        onClick={() => handleOpenHallManager(branch)}
                      >
                        Manage Halls
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleOpenEdit(branch)}
                          variant="outline"
                          className="flex-1 border-border bg-transparent hover:bg-secondary"
                        >
                          <Edit className="w-4 h-4 mr-2" /> Edit
                        </Button>
                        <Button
                          onClick={() => handleDelete(branch.id)}
                          variant="outline"
                          className="flex-1 border-border bg-transparent hover:bg-secondary text-destructive hover:text-destructive"
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
          <div className="flex justify-center items-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
