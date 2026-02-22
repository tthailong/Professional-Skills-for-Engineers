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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  MapPin,
  Plus,
  Search,
  Edit,
  User,
  Building,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Phone,
  Layers,
  Map as MapIcon,
  Monitor,
  LayoutGrid,
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
import { cn } from "@/lib/utils";

export default function BranchManagementPage() {
  const {
    admins,
    fetchAdmins,
    branches,
    totalBranches,
    fetchBranches,
    createBranch,
    updateBranch,
    deleteBranch,
    isLoading,
    fetchHalls,
    createHall,
    updateHall,
    deleteHall,
  } = useAdminStore();

  // Search & Sort State
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("Branch_id");
  const [sortOrder, setSortOrder] = useState("ASC");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBranchId, setCurrentBranchId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    location: "",
    managerId: "",
    phone: "",
  });

  // Hall Management State
  const [isHallModalOpen, setIsHallModalOpen] = useState(false);
  const [currentBranchForHalls, setCurrentBranchForHalls] = useState<any>(null);
  const [halls, setHalls] = useState<any[]>([]);
  const [isHallLoading, setIsHallLoading] = useState(false);
  const [editingHall, setEditingHall] = useState<any>(null);
  const [hallForm, setHallForm] = useState({
    hallNumber: "",
    type: "Standard",
    seatCapacity: "",
    rowCount: "",
    colCount: "",
  });

  // Effects
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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
  ]);

  // Handlers
  const handleOpenCreate = () => {
    setFormData({ name: "", city: "", location: "", managerId: "", phone: "" });
    setIsEditing(false);
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

  const handleOpenHallManager = async (branch: any) => {
    setCurrentBranchForHalls(branch);
    setIsHallModalOpen(true);
    setIsHallLoading(true);
    try {
      const data = await fetchHalls(branch.id);
      setHalls(data);
    } catch {
      toast.error("Failed to load halls");
    } finally {
      setIsHallLoading(false);
    }
  };

  const getManagerName = (id: string | undefined) => {
    if (!id) return "Unassigned";
    const manager = admins.find((a) => a.id === id);
    return manager ? manager.name : "Unknown Admin";
  };

  const totalPages = Math.ceil(totalBranches / itemsPerPage);

  return (
    <div className="min-h-screen bg-white relative overflow-hidden text-slate-900 selection:bg-rose-100">
      {/* Rose Aurora Mesh background */}
      <div className="absolute top-[-10%] right-[-5%] w-[45%] h-[40%] rounded-full bg-rose-50/60 blur-[130px] -z-10" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[45%] rounded-full bg-indigo-50/40 blur-[130px] -z-10" />

      <Navbar />

      <main className="container mx-auto px-4 pt-16 pb-24 relative z-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-rose-600 rounded-xl shadow-lg shadow-rose-200">
                <Building className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-600">
                Infrastructure
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter bg-gradient-to-r from-rose-500 via-rose-500 to-rose-500 bg-clip-text text-transparent">
              Branch Network
            </h1>
          </motion.div>

          <Button
            onClick={handleOpenCreate}
            className="rounded-2xl bg-slate-900 hover:bg-rose-600 text-white h-14 px-8 font-black transition-all shadow-xl shadow-slate-200 active:scale-95"
          >
            <Plus className="w-5 h-5 mr-2" /> Register Branch
          </Button>
        </header>

        {/* Search & Filters Glass Bar */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="p-2 rounded-[2rem] bg-white/40 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(225,29,72,0.05)]">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="relative flex-1 group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-rose-600 transition-colors" />
                <Input
                  placeholder="Find branches by city or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-14 h-14 bg-transparent border-none text-lg font-medium focus-visible:ring-0 placeholder:text-slate-300"
                />
              </div>
              <div className="h-10 w-[1px] bg-slate-200 hidden md:block self-center mx-2" />
              <div className="flex items-center gap-2 px-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px] border-none bg-transparent font-bold text-slate-600 focus:ring-0">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-2xl">
                    <SelectItem value="Branch_id">ID</SelectItem>
                    <SelectItem value="Name">Name</SelectItem>
                    <SelectItem value="City">City</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-xl hover:bg-rose-50 text-rose-600"
                  onClick={() =>
                    setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC")
                  }
                >
                  <ArrowUpDown
                    className={cn(
                      "w-4 h-4 transition-transform duration-300",
                      sortOrder === "DESC" && "rotate-180",
                    )}
                  />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Branch Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {branches.map((branch, index) => (
              <motion.div
                key={branch.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Card className="border-none bg-white/70 backdrop-blur-md rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:shadow-rose-100 transition-all duration-500 group overflow-hidden">
                  {/* Visual Header */}
                  <div className="h-32 bg-slate-900 p-8 flex justify-between items-start relative overflow-hidden text-white">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-600/20 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2" />
                    <div className="relative z-10">
                      <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">
                        Venue ID: #{branch.id}
                      </p>
                      <h3 className="text-2xl font-black truncate">
                        {branch.name}
                      </h3>
                    </div>
                    <Layers className="text-white/20 w-12 h-12" />
                  </div>

                  <CardContent className="p-8">
                    <div className="space-y-4 mb-8">
                      <div className="flex items-center gap-3 text-slate-500">
                        <div className="p-2 bg-rose-50 rounded-lg">
                          <MapPin className="w-4 h-4 text-rose-500" />
                        </div>
                        <span className="text-sm font-bold truncate">
                          {branch.address}, {branch.city}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500">
                        <div className="p-2 bg-rose-50 rounded-lg">
                          <User className="w-4 h-4 text-rose-500" />
                        </div>
                        <span className="text-sm font-bold">
                          Manager: {getManagerName(branch.managerId)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-6 border-t border-slate-50">
                      <Button
                        variant="secondary"
                        className="rounded-xl h-12 bg-slate-50 hover:bg-slate-900 hover:text-white font-bold transition-all"
                        onClick={() => handleOpenHallManager(branch)}
                      >
                        Manage Halls
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-12 w-12 rounded-xl border-slate-100 hover:bg-rose-50 hover:text-rose-600 transition-all"
                          onClick={() => handleOpenEdit(branch)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-12 w-12 rounded-xl border-rose-50 text-rose-300 hover:bg-rose-600 hover:text-white transition-all"
                          onClick={() => deleteBranch(branch.id)}
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
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-6 mt-16">
            <Button
              variant="ghost"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-xl hover:bg-rose-50 font-bold"
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Previous
            </Button>
            <div className="flex gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={cn(
                    "w-10 h-10 rounded-xl font-bold transition-all",
                    currentPage === i + 1
                      ? "bg-slate-900 text-white shadow-lg"
                      : "text-slate-400 hover:bg-rose-50 hover:text-rose-600",
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <Button
              variant="ghost"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-xl hover:bg-rose-50 font-bold"
            >
              Next <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </main>

      {/* Modern Hall Management Modal */}
      <Dialog open={isHallModalOpen} onOpenChange={setIsHallModalOpen}>
        <DialogContent className="sm:max-w-[700px] bg-white rounded-[3rem] border-none shadow-2xl p-10 max-h-[85vh] overflow-y-auto no-scrollbar">
          <DialogHeader className="mb-8 text-center">
            <div className="mx-auto p-4 bg-rose-50 rounded-[2rem] w-fit mb-4">
              <Monitor className="w-8 h-8 text-rose-600" />
            </div>
            <DialogTitle className="text-3xl font-black tracking-tight">
              Manage Auditoriums
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-medium">
              Configure seating and technology for {currentBranchForHalls?.name}
              .
            </DialogDescription>
          </DialogHeader>

          {/* Hall Form... (Styled similar to the Create Branch modal below) */}
          <div className="space-y-6">
            {/* Simple Hall List UI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {halls.map((hall) => (
                <div
                  key={hall.hallNumber}
                  className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex justify-between items-center group hover:bg-white hover:shadow-xl transition-all"
                >
                  <div>
                    <p className="text-[10px] font-black uppercase text-rose-500 mb-1 tracking-widest">
                      {hall.type}
                    </p>
                    <h4 className="text-xl font-black text-slate-900">
                      Hall {hall.hallNumber}
                    </h4>
                    <p className="text-xs font-bold text-slate-400 mt-1">
                      {hall.seatCapacity} Seats
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-xl group-hover:bg-rose-50 group-hover:text-rose-600"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              ))}
            </div>
            <Button className="w-full h-14 rounded-2xl bg-slate-900 font-black">
              <Plus className="w-4 h-4 mr-2" /> Add New Hall
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
