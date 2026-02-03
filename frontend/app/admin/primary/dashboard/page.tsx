"use client";

import { useEffect, useState } from "react";
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
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Download,
  Filter,
  TrendingUp,
  DollarSign,
  Ticket,
  Users,
  AlertTriangle,
  Calendar,
  Clock,
  Film,
} from "lucide-react";
import { useUserStore, API_BASE_URL } from "@/store/useUserStore";
import { useAdminStore } from "@/store/useAdminStore";

interface ChartData {
  name?: string;
  date?: string;
  value?: number;
  ticket_revenue?: number;
  product_revenue?: number;
  total_revenue?: number;
  [key: string]: any;
}

interface DashboardData {
  branch_id?: number;
  period: {
    start: string;
    end: string;
  };
  financials?: {
    net_revenue: number;
    avg_receipt_value: number;
  };
  stats?: {
    net_revenue: number;
    occupancy_rate: number;
  };
  system_stats?: {
    total_admins: number;
    total_bookings: number;
    total_movies: number;
    occupancy_rate?: number;
  };
  charts: {
    top_movies: ChartData[];
    revenue_trend: ChartData[];
  };
}

const formatCurrency = (amount: number) => {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)}B`; // Billion
  } else if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`; // Million
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export default function PrimaryDashboard() {
  const { user } = useUserStore();
  const { admin, alerts, totalAlerts, fetchLowOccupancyAlerts } =
    useAdminStore();
  // Default to current month
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [alertPage, setAlertPage] = useState(1);
  const alertLimit = 5;

  useEffect(() => {
    const fetchData = async () => {
      if (!admin) return;

      setLoading(true);
      try {
        const endpoint = admin.assignedBranchId
          ? `/admin/dashboard/regular/${admin.assignedBranchId}`
          : `/admin/dashboard/primary`;

        const queryParams = new URLSearchParams({
          startDate,
          endDate,
        });

        const res = await fetch(`${API_BASE_URL}${endpoint}?${queryParams}`);
        if (res.ok) {
          const jsonData = await res.json();
          setData(jsonData);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [admin, startDate, endDate]);

  // Fetch Alerts when page or date changes
  useEffect(() => {
    const fetchAlerts = async () => {
      if (!admin) return;
      const end = new Date(endDate);
      await fetchLowOccupancyAlerts(
        end.getMonth() + 1,
        end.getFullYear(),
        20.0, // Threshold
        admin.assignedBranchId ? parseInt(admin.assignedBranchId) : undefined,
        alertPage,
        alertLimit
      );
    };
    fetchAlerts();
  }, [admin, endDate, alertPage, fetchLowOccupancyAlerts]);

  const COLORS = ["#dc2626", "#ea580c", "#f59e0b", "#10b981", "#3b82f6"];

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-destructive">Failed to load dashboard data.</p>
      </div>
    );
  }

  // Determine which stats to show based on role
  const isBranch = !!admin?.assignedBranchId;

  const summaryCards = isBranch
    ? [
        {
          label: "Net Revenue",
          value: data?.stats?.net_revenue || 0,
          change: "Selected Period",
          icon: DollarSign,
          color: "text-primary",
        },
        {
          label: "Occupancy Rate",
          value: `${data?.stats?.occupancy_rate?.toFixed(1)}%` || "0%",
          change: "Avg for Period",
          icon: Users,
          color: "text-blue-600",
        },
      ]
    : [
        {
          label: "Total Net Revenue",
          value: data?.financials?.net_revenue || 0,
          change: "Selected Period",
          icon: DollarSign,
          color: "text-primary",
        },
        {
          label: "Total Seats",
          value: data?.system_stats?.total_bookings || 0,
          change: "All Time",
          icon: Ticket,
          color: "text-accent",
        },
        {
          label: "Avg Order Value",
          value: data?.financials?.avg_receipt_value || 0,
          change: "Selected Period",
          icon: TrendingUp,
          color: "text-green-600",
        },
        {
          label: "Occupancy Rate",
          value: `${data?.system_stats?.occupancy_rate?.toFixed(1)}%` || "0%",
          change: "Avg for Period",
          icon: Users,
          color: "text-blue-600",
        },
      ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              {isBranch ? "Branch Dashboard" : "System Overview"}
            </h1>
            <p className="text-muted-foreground">
              {isBranch
                ? `Monitor performance for Branch ID: ${data?.branch_id}`
                : "Overview of system-wide performance"}
            </p>
          </div>
        </div>

        {/* Filters Bar */}
        <Card className="border-border bg-card mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="text-sm text-muted-foreground block mb-2">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-[180px] bg-secondary border-border"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-2">
                  End Date
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-[180px] bg-secondary border-border"
                />
              </div>

              <Button
                variant="outline"
                className="border-border bg-transparent text-foreground hover:bg-card ml-auto"
                onClick={() => {
                  // Refresh logic if needed, currently auto-refreshes on state change
                }}
              >
                <Filter className="w-4 h-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div
          className={`grid grid-cols-1 md:grid-cols-2 ${
            !isBranch ? "lg:grid-cols-4" : ""
          } gap-6 mb-8`}
        >
          {summaryCards.map((item, i) => (
            <Card key={i} className="border-border bg-card">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {item.label}
                    </p>
                    <div className="text-2xl font-bold text-foreground">
                      {typeof item.value === "number" &&
                      (item.label.includes("Revenue") ||
                        item.label.includes("Value"))
                        ? formatCurrency(item.value as number)
                        : item.value}
                    </div>
                    <p className="text-xs text-green-600 mt-1">{item.change}</p>
                  </div>
                  <item.icon className={`w-8 h-8 ${item.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <Tabs defaultValue="movies" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-secondary">
            <TabsTrigger value="movies">Top Movies</TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              Low Occupancy Alerts
            </TabsTrigger>
          </TabsList>

          {/* Top Movies */}
          <TabsContent value="movies">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle>Top Movies by Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={data?.charts.top_movies || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {(data?.charts.top_movies || []).map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle>Movie Performance List</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(data?.charts.top_movies || []).map((movie, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 bg-secondary rounded"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-foreground text-sm">
                            {movie.name}
                          </p>
                          <div className="w-full bg-border rounded-full h-1.5 mt-1">
                            <div
                              className="bg-primary h-1.5 rounded-full"
                              style={{
                                width: `${
                                  (movie.value! /
                                    (data?.charts.top_movies[0]?.value || 1)) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <span className="text-primary font-bold ml-4 text-sm whitespace-nowrap">
                          {formatCurrency(movie.value!)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  Low Occupancy Alerts
                </CardTitle>
                <CardDescription>
                  Showtimes with occupancy rate below 20% for the selected
                  month.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {alerts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No low occupancy alerts found for this period.
                  </div>
                ) : (
                  <>
                    <div className="border rounded-md overflow-hidden mb-4">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-secondary text-muted-foreground font-medium">
                          <tr>
                            <th className="p-3">Movie</th>
                            <th className="p-3">Branch</th>
                            <th className="p-3">Date & Time</th>
                            <th className="p-3 text-right">Occupancy</th>
                            <th className="p-3 text-right">Booked / Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {alerts.map((alert, idx) => (
                            <tr key={idx} className="hover:bg-muted/50">
                              <td className="p-3 font-medium">
                                {alert.Movie_Name}
                              </td>
                              <td className="p-3">{alert.Branch_Name}</td>
                              <td className="p-3">
                                <div className="flex flex-col">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />{" "}
                                    {alert.Date}
                                  </span>
                                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="w-3 h-3" />{" "}
                                    {alert.Start_time}
                                  </span>
                                </div>
                              </td>
                              <td className="p-3 text-right">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
                                  {alert.Occupancy_Rate}%
                                </span>
                              </td>
                              <td className="p-3 text-right text-muted-foreground">
                                {alert.Booked_Seats} / {alert.Total_Capacity}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {/* Pagination Controls */}
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Showing {(alertPage - 1) * alertLimit + 1} to{" "}
                        {Math.min(alertPage * alertLimit, totalAlerts)} of{" "}
                        {totalAlerts} alerts
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setAlertPage((p) => Math.max(1, p - 1))
                          }
                          disabled={alertPage === 1}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAlertPage((p) => p + 1)}
                          disabled={alertPage * alertLimit >= totalAlerts}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
