"use client";

import { useEffect, useState } from "react";
import { getDashboardStats, type DashboardStats } from "@/lib/adminApi";
import AdminBell from "@/components/dashboard/AdminBell";
import AdminUserMenu from "@/components/dashboard/AdminUserMenu";
import {
  ArrowUpRight,
  Box,
  CreditCard,
  LoaderCircle,
  Search,
  ShoppingBag,
  Users,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

function fmt(n: number) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function revenueBarStyle(amount: number, maxRevenue: number) {
    if (amount <= 0 || maxRevenue <= 0) {
        return {
            background: "linear-gradient(to top, rgb(212 212 212), rgb(229 229 229))",
        };
    }

    const ratio = Math.min(amount / maxRevenue, 1);
    const hue = 32;
    const saturation = 18 + ratio * 72;
    const bottomLightness = 86 - ratio * 40;
    const topLightness = 92 - ratio * 28;

    return {
        background: `linear-gradient(to top, hsl(${hue} ${saturation}% ${bottomLightness}%), hsl(${hue + 6} ${Math.min(
            saturation + 8,
            100,
        )}% ${topLightness}%))`,
    };
}

const STAT_CARDS = [
  { key: "revenue", label: "Total Revenue", icon: CreditCard, accent: "bg-orange-500" },
  { key: "orders", label: "Total Orders", icon: ShoppingBag, accent: "bg-amber-400" },
  { key: "products", label: "Products", icon: Box, accent: "bg-neutral-700" },
  { key: "customers", label: "Customers", icon: Users, accent: "bg-neutral-500" },
];

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const maxRevenue = stats ? Math.max(...stats.last6MonthsRevenue.map((r) => r.amount), 1) : 1;

  const statValues = stats
    ? [
        { value: fmt(stats.totalSales), sub: `This month: ${fmt(stats.monthlyRevenue)}` },
        { value: stats.orderCount.toLocaleString(), sub: "All time" },
        { value: stats.productCount.toLocaleString(), sub: `${stats.lowStockProducts.length} low stock` },
        { value: stats.customerCount.toLocaleString(), sub: "Registered" },
      ]
    : [];

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center gap-4 border-b border-neutral-200 bg-white px-6 py-3 shrink-0">
        <div className="flex items-center gap-2 flex-1 max-w-sm rounded-lg border border-neutral-200 bg-neutral-50 px-3.5 py-2">
          <Search size={13} className="text-neutral-400 shrink-0" />
          <span className="text-xs text-neutral-400">Search anything...</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <AdminBell />
          <AdminUserMenu />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto bg-neutral-50">
        <div className="bg-white border-b border-neutral-200 px-6 py-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-orange-500 mb-1">Admin Console</p>
              <h1 className="text-[28px] font-semibold tracking-tight text-neutral-900">Dashboard</h1>
              <p className="mt-0.5 text-sm text-neutral-500">Platform overview — real-time data</p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-neutral-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
              Live data
            </div>
          </div>
        </div>

        <div className="px-6 py-6 space-y-5">
          {loading && (
            <div className="flex items-center justify-center py-24 text-neutral-400">
              <LoaderCircle size={20} className="animate-spin mr-2" /> Loading...
            </div>
          )}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">{error}</div>
          )}

          {stats && (
            <>
              {/* Stat cards */}
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {STAT_CARDS.map(({ key, label, icon: Icon, accent }, i) => (
                  <div key={key} className="relative bg-white rounded-xl border border-neutral-200 p-5 overflow-hidden">
                    <div className={`absolute inset-x-0 top-0 h-0.5 ${accent}`} />
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-[11px] uppercase tracking-widest font-semibold text-neutral-400">{label}</span>
                      <Icon size={16} className="text-neutral-300" />
                    </div>
                    <p className="text-[38px] font-semibold leading-none tracking-tight text-neutral-900">
                      {statValues[i]?.value ?? "—"}
                    </p>
                    <p className="mt-2 text-xs text-neutral-400">{statValues[i]?.sub}</p>
                  </div>
                ))}
              </div>

              {/* Revenue chart + Categories */}
              <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
                <div className="bg-white rounded-xl border border-neutral-200 p-6">
                  <div className="mb-6 flex items-start justify-between">
                    <div>
                      <h2 className="font-semibold text-neutral-900">Revenue Trend</h2>
                      <p className="text-xs text-neutral-400 mt-0.5">Last 6 months</p>
                    </div>
                    <span className="rounded-lg bg-orange-50 border border-orange-100 px-3 py-1.5 text-xs font-semibold text-orange-700">
                      {fmt(stats.last6MonthsRevenue.reduce((a, r) => a + r.amount, 0))} total
                    </span>
                  </div>
                    <div className="flex items-end gap-3 h-44">
                        {stats.last6MonthsRevenue.map((r, i) => {
                            const pct = Math.round((r.amount / maxRevenue) * 100);
                            return (
                                <div key={r.month} className="group flex flex-1 flex-col items-center gap-2">
                                    <div className="w-full flex flex-col items-center gap-1" style={{ height: "160px", justifyContent: "flex-end" }}>
                                        <span className="text-[9px] font-semibold text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {fmt(r.amount)}
                                        </span>
                                        <div
                                            className="w-full rounded-t transition-all duration-300 group-hover:brightness-105"
                                            style={{
                                                height: `${Math.max(pct, 4)}%`,
                                                ...revenueBarStyle(r.amount, maxRevenue),
                                            }}
                                        />
                                    </div>
                                    <span className="text-[10px] text-neutral-400 font-medium">{r.month?.slice(0, 3)}</span>
                                </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-neutral-200 p-6">
                  <h2 className="mb-5 font-semibold text-neutral-900">Top Categories</h2>
                  <div className="space-y-4">
                    {stats.topCategories.slice(0, 6).map(({ category, count }, i) => {
                      const maxCount = stats.topCategories[0]?.count ?? 1;
                      const pct = Math.round((count / maxCount) * 100);
                      const colors = ["bg-orange-500", "bg-amber-400", "bg-neutral-700", "bg-neutral-500", "bg-orange-300", "bg-amber-300"];
                      return (
                        <div key={category}>
                          <div className="mb-1.5 flex items-center justify-between">
                            <span className="text-xs text-neutral-700 truncate max-w-[160px]">{category || "Uncategorized"}</span>
                            <span className="text-xs font-semibold text-neutral-900 tabular-nums">{count}</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-neutral-100">
                            <div className={`h-1.5 rounded-full transition-all ${colors[i] ?? "bg-neutral-400"}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
                  <div>
                    <h2 className="font-semibold text-neutral-900">Recent Orders</h2>
                    <p className="text-[11px] text-neutral-400 mt-0.5">{stats.recentOrders.length} latest</p>
                  </div>
                  <Link href="/dashboard/admin/orders" className="flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-800 transition-colors">
                    View all <ArrowUpRight size={13} />
                  </Link>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-100 text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
                      <th className="px-6 py-3 text-left">Order</th>
                      <th className="px-6 py-3 text-left">Customer</th>
                      <th className="px-6 py-3 text-left">Date</th>
                      <th className="px-6 py-3 text-right">Amount</th>
                      <th className="px-6 py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50">
                    {stats.recentOrders.map((o) => (
                      <tr key={o.orderId} className="hover:bg-orange-50/30 transition-colors">
                        <td className="px-6 py-3.5 font-mono text-xs font-semibold text-neutral-500">#{o.orderId}</td>
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="h-7 w-7 shrink-0 rounded-full bg-orange-50 flex items-center justify-center text-[10px] font-bold text-orange-600">
                              {o.customerName?.[0]}
                            </div>
                            <span className="text-xs font-medium text-neutral-900">{o.customerName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-xs text-neutral-400">
                          {new Date(o.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </td>
                        <td className="px-6 py-3.5 text-right text-xs font-bold text-neutral-900">{fmt(o.amount)}</td>
                        <td className="px-6 py-3.5">
                          <span className="rounded px-2 py-1 text-[10px] font-semibold bg-neutral-100 text-neutral-600">
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </>
          )}
        </div>
      </div>
    </div>
  );
}
