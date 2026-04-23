"use client";

import { useEffect, useState } from "react";
import { getAdminOrders, type AdminOrder } from "@/lib/adminApi";
import AdminBell from "@/components/dashboard/AdminBell";
import {
  ChevronDown,
  Filter,
  LoaderCircle,
  Package,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const STATUSES = ["DELIVERED", "SHIPPED", "PROCESSING", "PENDING", "CANCELLED"];

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  DELIVERED:  { bg: "bg-emerald-50",  text: "text-emerald-700", dot: "bg-emerald-400",  label: "Delivered"  },
  SHIPPED:    { bg: "bg-sky-50",      text: "text-sky-700",     dot: "bg-sky-400",      label: "Shipped"    },
  PROCESSING: { bg: "bg-amber-50",    text: "text-amber-700",   dot: "bg-amber-400",    label: "Processing" },
  PENDING:    { bg: "bg-neutral-100", text: "text-neutral-600", dot: "bg-neutral-400",  label: "Pending"    },
  CANCELLED:  { bg: "bg-red-50",      text: "text-red-600",     dot: "bg-red-400",      label: "Cancelled"  },
};

function cfg(s: string) { return STATUS_CONFIG[s?.toUpperCase()] ?? STATUS_CONFIG.PENDING; }

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AdminOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    getAdminOrders()
      .then(setOrders)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter((o) => {
    const name = `${o.user.firstName} ${o.user.lastName}`.toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase()) || String(o.id).includes(search) || o.user.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || o.status?.toUpperCase() === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusCounts = orders.reduce<Record<string, number>>((acc, o) => {
    const k = o.status?.toUpperCase() ?? "PENDING";
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});

  const totalRevenue = filtered.reduce((s, o) => s + o.totalAmount, 0);

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center gap-4 border-b border-neutral-200 bg-white px-6 py-3 shrink-0">
        <div className="flex items-center gap-2 flex-1 max-w-sm rounded-lg border border-neutral-200 bg-neutral-50 px-3.5 py-2">
          <Search size={13} className="text-neutral-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or order ID..."
            className="bg-transparent outline-none text-neutral-800 placeholder:text-neutral-400 text-xs w-full"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-neutral-400 hover:text-neutral-700">
              <X size={12} />
            </button>
          )}
        </div>
        <div className="ml-auto flex items-center gap-3">
          <AdminBell />
          <div className="flex items-center gap-2.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-[11px] font-bold text-white">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-neutral-900 leading-none">{user?.firstName}</p>
              <p className="text-[10px] text-neutral-400 leading-none mt-0.5">Administrator</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto bg-neutral-50">
        <div className="bg-white border-b border-neutral-200 px-6 py-6">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-orange-500 mb-1">Admin Console</p>
          <h1 className="text-[28px] font-semibold tracking-tight text-neutral-900">Orders</h1>
          <p className="mt-0.5 text-sm text-neutral-500">{filtered.length} orders · {fmt(totalRevenue)} total</p>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 mr-1">
              <Filter size={12} /> Filter:
            </div>
            <button
              onClick={() => setStatusFilter("")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold border transition-colors ${
                !statusFilter ? "bg-orange-500 text-white border-orange-500" : "bg-white border-neutral-200 text-neutral-600 hover:border-orange-400"
              }`}
            >
              All ({orders.length})
            </button>
            {STATUSES.map((s) => {
              const c = cfg(s);
              const count = statusCounts[s] ?? 0;
              if (!count) return null;
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(statusFilter === s ? "" : s)}
                  className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold border transition-colors ${
                    statusFilter === s
                      ? `${c.bg} ${c.text} border-current`
                      : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
                  {c.label} ({count})
                </button>
              );
            })}
          </div>

          {error && <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">{error}</div>}

          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            {loading && (
              <div className="flex items-center justify-center py-20 text-neutral-400">
                <LoaderCircle size={18} className="animate-spin mr-2" /> Loading orders...
              </div>
            )}
            {!loading && (
              <table className="w-full">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-100 text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
                    <th className="px-6 py-3.5 text-left">Order</th>
                    <th className="px-6 py-3.5 text-left">Customer</th>
                    <th className="px-6 py-3.5 text-left">Date</th>
                    <th className="px-6 py-3.5 text-center">Items</th>
                    <th className="px-6 py-3.5 text-right">Total</th>
                    <th className="px-6 py-3.5 text-left">Status</th>
                    <th className="px-6 py-3.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-16 text-center">
                        <ShoppingBag size={24} className="mx-auto mb-2 text-neutral-300" />
                        <p className="text-sm text-neutral-400">No orders found</p>
                      </td>
                    </tr>
                  )}
                  {filtered.map((o) => {
                    const c = cfg(o.status);
                    const isOpen = expanded === o.id;
                    return (
                      <>
                        <tr
                          key={o.id}
                          onClick={() => setExpanded(isOpen ? null : o.id)}
                          className="cursor-pointer hover:bg-orange-50/30 transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <span className="font-mono text-xs font-bold text-neutral-500">#{o.id}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 shrink-0 rounded-full bg-orange-50 flex items-center justify-center text-[11px] font-bold text-orange-600">
                                {o.user.firstName?.[0]}{o.user.lastName?.[0]}
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-neutral-900">{o.user.firstName} {o.user.lastName}</p>
                                <p className="text-[10px] text-neutral-400">{o.user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs text-neutral-500">{fmtDate(o.orderDate)}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-md bg-neutral-100 px-2 text-xs font-bold text-neutral-700">
                              {o.items.length}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-xs font-bold text-neutral-900">{fmt(o.totalAmount)}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${c.bg} ${c.text}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
                              {c.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <ChevronDown size={14} className={`text-neutral-300 group-hover:text-neutral-500 transition-all ${isOpen ? "rotate-180" : ""}`} />
                          </td>
                        </tr>
                        {isOpen && (
                          <tr key={`${o.id}-detail`}>
                            <td colSpan={7} className="bg-neutral-50 border-b border-neutral-100 px-6 py-4">
                              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Order Items</p>
                              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                {o.items.map((item) => (
                                  <div key={item.id} className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3">
                                    <div className="h-9 w-9 shrink-0 rounded-lg bg-neutral-100 flex items-center justify-center">
                                      <Package size={13} className="text-neutral-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="truncate text-xs font-semibold text-neutral-900">{item.product.title}</p>
                                      <p className="text-[10px] text-neutral-400">Qty {item.quantity} · {fmt(item.priceAtPurchase)}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
