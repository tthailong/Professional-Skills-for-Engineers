"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/app/navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import {
  Filter,
  TrendingUp,
  DollarSign,
  Ticket,
  Users,
  AlertTriangle,
  Calendar,
  Clock,
  LayoutDashboard,
  RefreshCw,
} from "lucide-react";
import { useUserStore, API_BASE_URL } from "@/store/useUserStore";
import { useAdminStore } from "@/store/useAdminStore";

// --- ROSE THEME CONSTANTS ---
const ROSE_COLORS = ["#e11d48", "#fb7185", "#fda4af", "#fff1f2", "#f43f5e"];

const formatCurrency = (amount: number) => {
  if (amount >= 1000000000) return `${(amount / 1000000000).toFixed(1)}B`;
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export default function PrimaryDashboard() {
  const { admin, alerts, totalAlerts, fetchLowOccupancyAlerts } =
    useAdminStore();
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [alertPage, setAlertPage] = useState(1);
  const alertLimit = 5;

  // ... (Keep your existing useEffect Fetch Logic exactly as it was) ...
  useEffect(() => {
    const fetchData = async () => {
      if (!admin) return;
      setLoading(true);
      try {
        const endpoint = admin.assignedBranchId
          ? `/admin/dashboard/regular/${admin.assignedBranchId}`
          : `/admin/dashboard/primary`;
        const res = await fetch(
          `${API_BASE_URL}${endpoint}?${new URLSearchParams({ startDate, endDate })}`,
        );
        if (res.ok) setData(await res.json());
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [admin, startDate, endDate]);

  useEffect(() => {
    if (!admin) return;
    fetchLowOccupancyAlerts(
      new Date(endDate).getMonth() + 1,
      new Date(endDate).getFullYear(),
      20.0,
      admin.assignedBranchId ? parseInt(admin.assignedBranchId) : undefined,
      alertPage,
      alertLimit,
    );
  }, [admin, endDate, alertPage, fetchLowOccupancyAlerts]);

  const isBranch = !!admin?.assignedBranchId;

  const summaryCards = isBranch
    ? [
        {
          label: "Net Revenue",
          value: data?.stats?.net_revenue || 0,
          icon: DollarSign,
          color: "text-rose-600",
          bg: "bg-rose-50",
        },
        {
          label: "Occupancy Rate",
          value: `${data?.stats?.occupancy_rate?.toFixed(1)}%` || "0%",
          icon: Users,
          color: "text-rose-500",
          bg: "bg-rose-50",
        },
      ]
    : [
        {
          label: "Total Net Revenue",
          value: data?.financials?.net_revenue || 0,
          icon: DollarSign,
          color: "text-rose-600",
          bg: "bg-rose-50",
        },
        {
          label: "Total Tickets",
          value: data?.system_stats?.total_bookings || 0,
          icon: Ticket,
          color: "text-rose-500",
          bg: "bg-rose-50",
        },
        {
          label: "Avg Order Value",
          value: data?.financials?.avg_receipt_value || 0,
          icon: TrendingUp,
          color: "text-rose-400",
          bg: "bg-rose-50",
        },
        {
          label: "Occupancy Rate",
          value: `${data?.system_stats?.occupancy_rate?.toFixed(1)}%` || "0%",
          icon: Users,
          color: "text-rose-600",
          bg: "bg-rose-50",
        },
      ];

  if (loading && !data)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-rose-100 border-t-rose-600 rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-white relative overflow-hidden text-slate-900">
      {/* Rose Aurora Blurs */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-rose-50/60 blur-[120px] -z-10" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[40%] rounded-full bg-rose-100/40 blur-[120px] -z-10" />

      <Navbar />

      <main className="container mx-auto px-4 pt-16 pb-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-rose-600 rounded-xl shadow-lg shadow-rose-200">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-rose-600">
                Admin Control
              </span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-slate-900 to-rose-900 bg-clip-text text-transparent">
              {isBranch ? "Branch Metrics" : "System Core"}
            </h1>
          </div>

          {/* Rose Filter Bar */}
          <div className="p-2 bg-white/60 backdrop-blur-xl border border-rose-100 rounded-3xl shadow-xl flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 px-4">
              <Calendar className="w-4 h-4 text-rose-500" />
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border-none bg-transparent h-8 w-32 focus-visible:ring-0 font-bold p-0"
              />
              <span className="text-slate-300 mx-1">—</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border-none bg-transparent h-8 w-32 focus-visible:ring-0 font-bold p-0"
              />
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="rounded-2xl hover:bg-rose-50 text-rose-600"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Rose Summary Cards */}
        <div
          className={`grid grid-cols-1 md:grid-cols-2 ${!isBranch ? "lg:grid-cols-4" : ""} gap-8 mb-12`}
        >
          {summaryCards.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-none bg-white/80 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] overflow-hidden group hover:shadow-2xl hover:shadow-rose-100 transition-all duration-500">
                <CardContent className="p-8">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                        {item.label}
                      </p>
                      <div className="text-3xl font-black text-slate-900 leading-none">
                        {typeof item.value === "number" &&
                        item.label.includes("Revenue")
                          ? formatCurrency(item.value)
                          : item.value}
                      </div>
                    </div>
                    <div
                      className={`p-4 ${item.bg} rounded-[1.5rem] group-hover:scale-110 transition-transform duration-500`}
                    >
                      <item.icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="movies" className="space-y-8">
          <TabsList className="bg-rose-50/50 backdrop-blur-md p-1 rounded-2xl border border-rose-100 w-fit">
            <TabsTrigger
              value="movies"
              className="rounded-xl px-8 py-3 data-[state=active]:bg-white data-[state=active]:text-rose-600 font-bold transition-all"
            >
              Movie Performance
            </TabsTrigger>
            <TabsTrigger
              value="alerts"
              className="rounded-xl px-8 py-3 data-[state=active]:bg-white data-[state=active]:text-rose-600 font-bold transition-all gap-2"
            >
              <AlertTriangle className="w-4 h-4" /> System Alerts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="movies">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <Card className="lg:col-span-5 border-none bg-white shadow-xl shadow-slate-100 rounded-[2.5rem] p-6">
                <CardHeader>
                  <CardTitle className="font-black text-xl">
                    Revenue Share
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={data?.charts.top_movies || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {data?.charts.top_movies.map(
                          (_: any, index: number) => (
                            <Cell
                              key={index}
                              fill={ROSE_COLORS[index % ROSE_COLORS.length]}
                              stroke="none"
                            />
                          ),
                        )}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="lg:col-span-7 border-none bg-white shadow-xl shadow-slate-100 rounded-[2.5rem] p-8">
                <CardHeader>
                  <CardTitle className="font-black text-xl">
                    Top Ranking Movies
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {data?.charts.top_movies.map((movie: any, i: number) => (
                    <div key={i} className="flex items-center gap-4 group">
                      <span className="text-lg font-black text-rose-200">
                        0{i + 1}
                      </span>
                      <div className="flex-1">
                        <div className="flex justify-between mb-2">
                          <span className="font-bold text-slate-900 truncate">
                            {movie.name}
                          </span>
                          <span className="font-black text-rose-600">
                            {formatCurrency(movie.value)}
                          </span>
                        </div>
                        <div className="w-full bg-slate-50 rounded-full h-3 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${(movie.value / data.charts.top_movies[0].value) * 100}%`,
                            }}
                            className="bg-gradient-to-r from-rose-400 to-rose-600 h-full rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="alerts">
            <Card className="border-none bg-white shadow-2xl shadow-rose-100/50 rounded-[2.5rem] overflow-hidden">
              <CardHeader className="p-10 pb-4 border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-rose-50 rounded-2xl">
                    <AlertTriangle className="w-6 h-6 text-rose-600" />
                  </div>
                  <div>
                    <CardTitle className="font-black text-2xl">
                      Low Occupancy Watch
                    </CardTitle>
                    <CardDescription className="font-medium">
                      Showtimes below 20% capacity.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {alerts.length === 0 ? (
                  <div className="py-20 text-center text-slate-400 font-bold">
                    Safe! No low occupancy alerts found.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        <tr>
                          <th className="px-10 py-5">Movie Detail</th>
                          <th className="px-6 py-5">Branch</th>
                          <th className="px-6 py-5 text-right">Occupancy</th>
                          <th className="px-10 py-5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {alerts.map((alert, idx) => (
                          <tr
                            key={idx}
                            className="group hover:bg-rose-50/30 transition-colors"
                          >
                            <td className="px-10 py-6">
                              <p className="font-black text-slate-900">
                                {alert.Movie_Name}
                              </p>
                              <p className="text-xs text-slate-400 font-bold mt-1">
                                {alert.Date} @ {alert.Start_time}
                              </p>
                            </td>
                            <td className="px-6 py-6 font-bold text-slate-600 text-sm">
                              {alert.Branch_Name}
                            </td>
                            <td className="px-6 py-6 text-right">
                              <span className="px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-xs font-black">
                                {alert.Occupancy_Rate}%
                              </span>
                            </td>
                            <td className="px-10 py-6 text-right">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="rounded-xl text-xs font-bold hover:bg-rose-600 hover:text-white"
                              >
                                Notify Branch
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
