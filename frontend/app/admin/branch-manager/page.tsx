// app/branch_manager/BranchManagerPage.tsx (Original file path)

"use client";

import { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/app/navbar";
import { Save } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Import types and data from the new module
import { BranchData, ITEMS_PER_PAGE } from "./types";

// Import the new tab components
import { BranchInfoTab } from "./components/BranchInfo";
import { MovieScheduleTab } from "./components/MovieSchedule";
import { useAdminStore } from "@/store/useAdminStore";
import { API_BASE_URL } from "@/store/useUserStore";

type PaginationType = "movies" | "events" | "products";
const TAB_STORAGE_KEY = "branchManagerActiveTab"; // Define a key for localStorage
export default function BranchManagerPage() {
  // --- Admin State ---
  const initialTab =
    typeof window !== "undefined"
      ? localStorage.getItem(TAB_STORAGE_KEY) || "info"
      : "info";

  const [activeTab, setActiveTab] = useState(initialTab);
  const { admin, changePassword } = useAdminStore();
  const [adminForm, setAdminForm] = useState({
    name: admin?.name || "",
    email: admin?.email || "",
    phone: "",
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [adminError, setAdminError] = useState("");
  const [isSavingAdmin, setIsSavingAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [branchData, setBranchData] = useState<BranchData>({
    id: "",
    name: "",
    city: "", // Initialize city
    location: "",
    phone: "",
    movies: [],
    activeEventIds: [],
    activeProductIds: [],
  });

  // --- Search & Pagination State ---
  const [searchQueries, setSearchQueries] = useState({
    movies: "",
    events: "",
    products: "",
  });
  const [pages, setPages] = useState<Record<PaginationType, number>>({
    movies: 1,
    events: 1,
    products: 1,
  });

  // Fetch Data
  const fetchData = async () => {
    if (!admin?.assignedBranchId) return;
    setIsLoading(true);
    try {
      const branchId = admin.assignedBranchId;

      // 1. Fetch Branch Details
      const branchRes = await fetch(`${API_BASE_URL}/branches/${branchId}`);

      if (!branchRes.ok) throw new Error("Failed to fetch branch data");
      const branchDataApi = await branchRes.json();

      // 2. Fetch Movies in Branch (Screen)
      const moviesInBranchRes = await fetch(
        `${API_BASE_URL}/admin_regular/branch/${branchId}/movies`
      );
      const moviesInBranch = moviesInBranchRes.ok
        ? await moviesInBranchRes.json()
        : [];

      // 3. Fetch Movies NOT in Branch
      const moviesNotInBranchRes = await fetch(
        `${API_BASE_URL}/admin_regular/branch/${branchId}/movies-not-in-branch`
      );
      const moviesNotInBranch = moviesNotInBranchRes.ok
        ? await moviesNotInBranchRes.json()
        : [];

      // 4. Fetch Showtimes
      const showtimesRes = await fetch(
        `${API_BASE_URL}/admin_regular/branch/showtimes/${branchId}`
      );
      const showtimes = showtimesRes.ok ? await showtimesRes.json() : [];

      // 5. Fetch Admin Details
      const adminsRes = await fetch(`${API_BASE_URL}/auth/admin/all`);
      let adminPhone = "";
      if (adminsRes.ok) {
        const admins = await adminsRes.json();
        const currentAdmin = admins.find(
          (a: any) => a.Admin_id.toString() === admin.id
        );
        if (currentAdmin) {
          adminPhone = currentAdmin.Phone || "";
          setAdminForm((prev) => ({
            ...prev,
            name: currentAdmin.Name,
            email: currentAdmin.Email,
            phone: currentAdmin.Phone || "",
          }));
        }
      }

      // Combine Movies and Showtimes
      const allMovies = [
        ...moviesInBranch.map((m: any) => ({
          ...m,
          isActive: true,
          showtimes: showtimes.filter((s: any) => s.movie_id === m.movie_id),
        })),
        ...moviesNotInBranch.map((m: any) => ({
          ...m,
          isActive: false,
          showtimes: [],
        })),
      ].sort((a, b) => a.movie_id - b.movie_id);

      setBranchData({
        id: branchDataApi.branch.Branch_id.toString(),
        name: branchDataApi.branch.Name,
        city: branchDataApi.branch.City,
        location: branchDataApi.branch.Address,
        phone: branchDataApi.branch.Phone || "",
        movies: allMovies,
        activeEventIds: [],
        activeProductIds: [],
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [admin]);

  // --- Handlers ---

  const saveConfiguration = async () => {
    if (!admin?.assignedBranchId) return;
    try {
      const res = await fetch(
        `${API_BASE_URL}/branches/${admin.assignedBranchId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Name: branchData.name,
            City: branchData.city,
            Address: branchData.location,
            Admin_id: admin.id,
            Phone: branchData.phone,
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to update branch");
      }

      toast.success("Branch configuration saved successfully!");
      fetchData(); // Refresh data
    } catch (error: any) {
      console.error("Error saving branch:", error);
      toast.error(error.message || "Failed to save branch configuration");
    }
  };

  const handleInfoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setBranchData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleMovieActive = useCallback(
    async (movieId: number, isActive: boolean) => {
      if (!admin?.assignedBranchId) return;
      const branchId = admin.assignedBranchId;

      try {
        if (isActive) {
          // Deactivate -> Delete Screen
          await fetch(
            `${API_BASE_URL}/admin_regular/branch/${branchId}/delete-screen/${movieId}`,
            { method: "DELETE" }
          );
          toast.success("Movie deactivated successfully");
        } else {
          // Activate -> Create Screen
          await fetch(
            `${API_BASE_URL}/admin_regular/branch/${branchId}/create-screen`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ movie_id: movieId }),
            }
          );
          toast.success("Movie activated successfully");
        }
        fetchData(); // Refresh to sync state
      } catch (error) {
        console.error("Error toggling movie:", error);
        toast.error("Failed to update movie status");
      }
    },
    [admin]
  );

  const addShowtime = useCallback(
    async (showtimeData: any) => {
      if (!admin?.assignedBranchId) return;
      try {
        const res = await fetch(
          `${API_BASE_URL}/admin_regular/branch/showtimes/${admin.assignedBranchId}/create`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(showtimeData),
          }
        );

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.detail || "Failed to create showtime");
        }

        toast.success("Showtime added successfully");
        fetchData();
      } catch (error: any) {
        console.error("Error adding showtime:", error);
        toast.error(error.message || "Failed to add showtime");
      }
    },
    [admin]
  );

  const removeShowtime = useCallback(
    async (movieId: number, showtimeId: number) => {
      if (!admin?.assignedBranchId) return;
      try {
        const res = await fetch(
          `${API_BASE_URL}/admin_regular/branch/showtimes/${admin.assignedBranchId}/${movieId}/${showtimeId}`,
          { method: "DELETE" }
        );

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.detail || "Failed to delete showtime");
        }

        toast.success("Showtime removed successfully");
        fetchData();
      } catch (error: any) {
        console.error("Error removing showtime:", error);
        toast.error(error.message || "Failed to remove showtime");
      }
    },
    [admin]
  );

  // --- Pagination Helper ---
  const getPaginatedData = (data: any[], type: PaginationType) => {
    // @ts-ignore
    const query = searchQueries[type]?.toLowerCase() || "";
    const filtered = data.filter((item) =>
      (item.title || item.name).toLowerCase().includes(query)
    );

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const start = (pages[type] - 1) * ITEMS_PER_PAGE;
    const paginatedItems = filtered.slice(start, start + ITEMS_PER_PAGE);

    return { paginatedItems, totalPages };
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );

  // --- Data Calculation ---
  const { paginatedItems: paginatedMovies, totalPages: totalMoviePages } =
    getPaginatedData(branchData.movies, "movies");

  const handleAdminInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAdminForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handler for saving Admin Profile Info (Name/Email/Phone)
  const saveAdminInfo = async () => {
    if (!admin) return;
    setIsSavingAdmin(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/admin/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: parseInt(admin.id),
          name: adminForm.name,
          gender: admin.gender || "Male", // Fallback if missing
          dob: admin.dateOfBirth || "2000-01-01", // Fallback if missing
          email: adminForm.email,
          branch_id: admin.assignedBranchId
            ? parseInt(admin.assignedBranchId)
            : null,
          phone: adminForm.phone,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to update profile");
      }

      toast.success("Admin profile updated successfully.");
      // Refresh admin data if needed, or update store
    } catch (error: any) {
      console.error("Error updating admin:", error);
      toast.error(error.message);
    } finally {
      setIsSavingAdmin(false);
    }
  };

  // Handler for changing Admin Password
  const changeAdminPassword = async () => {
    if (!admin) return;

    // Client-side validation
    if (adminForm.newPassword !== adminForm.confirmNewPassword) {
      setAdminError("New passwords do not match.");
      return;
    }
    if (adminForm.newPassword.length < 8) {
      setAdminError("New password must be at least 8 characters.");
      return;
    }

    setAdminError("");
    setIsSavingAdmin(true);

    try {
      await changePassword({
        admin_id: admin.id,
        old_password: adminForm.oldPassword,
        new_password: adminForm.newPassword,
      });

      toast.success("Password changed successfully!");
      setAdminForm((prev) => ({
        ...prev,
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      }));
    } catch (err: any) {
      setAdminError(err.message || "Failed to change password.");
      toast.error("Password update failed.");
    } finally {
      setIsSavingAdmin(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Branch Manager
            </h1>
            <p className="text-muted-foreground">
              Manage <strong>{branchData.name}</strong> operations and schedule.
            </p>
          </div>
          <Button
            onClick={saveConfiguration}
            className="bg-green-600 hover:bg-green-700 text-white gap-2"
          >
            <Save className="w-4 h-4" /> Save Branch Changes
          </Button>
        </div>

        <Tabs
          value={activeTab} // Controlled component using state
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3 bg-card border border-border">
            <TabsTrigger value="info">Info & Details</TabsTrigger>
            <TabsTrigger value="movies">Movies & Schedule</TabsTrigger>
            <TabsTrigger value="halls">Halls</TabsTrigger>
          </TabsList>

          {/* 1. BRANCH INFO TAB */}
          <TabsContent value="info">
            <BranchInfoTab
              branchData={branchData}
              handleInfoChange={handleInfoChange}
              saveBranchInfo={saveConfiguration}
              // 👇 NEW PROPS FOR ADMIN
              adminForm={adminForm}
              adminError={adminError}
              isSavingAdmin={isSavingAdmin}
              handleAdminInfoChange={handleAdminInfoChange}
              saveAdminInfo={saveAdminInfo}
              changeAdminPassword={changeAdminPassword}
            />
          </TabsContent>

          {/* 2. MOVIES & SCHEDULE TAB */}
          <TabsContent value="movies">
            <MovieScheduleTab
              branchData={branchData}
              paginatedMovies={paginatedMovies}
              totalMoviePages={totalMoviePages}
              searchQueries={searchQueries}
              setSearchQueries={setSearchQueries}
              toggleMovieActive={toggleMovieActive}
              addShowtime={addShowtime}
              removeShowtime={removeShowtime}
              pages={pages}
              setPages={setPages}
            />
          </TabsContent>

          {/* 3. HALLS TAB */}
          <TabsContent value="halls">
            <HallManagementTab branchId={branchData.id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// --- Hall Management Tab Component (Inline for now, can be extracted) ---
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function HallManagementTab({ branchId }: { branchId: string }) {
  const { fetchHalls, createHall, updateHall, deleteHall } = useAdminStore();
  const [halls, setHalls] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingHall, setEditingHall] = useState<any>(null);
  const [hallForm, setHallForm] = useState({
    hallNumber: "",
    type: "Standard",
    seatCapacity: "",
    rowCount: "",
    colCount: "",
  });

  const loadHalls = useCallback(async () => {
    if (!branchId) return;
    setIsLoading(true);
    try {
      const data = await fetchHalls(branchId);
      setHalls(data);
    } catch (error) {
      toast.error("Failed to load halls");
    } finally {
      setIsLoading(false);
    }
  }, [branchId, fetchHalls]);

  useEffect(() => {
    loadHalls();
  }, [loadHalls]);

  const handleSaveHall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchId) return;

    const payload = {
      hallNumber: parseInt(hallForm.hallNumber),
      type: hallForm.type,
      seatCapacity: parseInt(hallForm.seatCapacity),
      rowCount: parseInt(hallForm.rowCount),
      colCount: parseInt(hallForm.colCount),
    };

    try {
      if (editingHall) {
        await updateHall(branchId, editingHall.hallNumber, payload);
        toast.success("Hall updated successfully");
      } else {
        await createHall(branchId, payload);
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
      loadHalls();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteHall = async (hallNumber: number) => {
    if (!branchId) return;
    if (confirm("Are you sure you want to delete this hall?")) {
      try {
        await deleteHall(branchId, hallNumber);
        toast.success("Hall deleted successfully");
        loadHalls();
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

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Hall Management</CardTitle>
          <CardDescription>
            Create and manage halls for your branch.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {/* Form */}
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
                      setHallForm({ ...hallForm, hallNumber: e.target.value })
                    }
                    placeholder="1"
                    required
                    disabled={!!editingHall}
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
                    <option value="2D">2D</option>
                    <option value="3D">3D</option>
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

            {/* List */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Existing Halls</h3>
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : halls.length === 0 ? (
                <p className="text-sm text-muted-foreground">No halls found.</p>
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
        </CardContent>
      </Card>
    </div>
  );
}
