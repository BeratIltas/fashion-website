"use client";

import { Fragment, Suspense, useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  getSellerOrders,
  updateSellerOrderStatus,
  type SellerOrder,
  type AdminOrderItem,
} from "@/lib/adminApi";
import {
  ChevronDown,
  ChevronUp,
  CheckCheck,
  Clock,
  Loader2,
  Package,
  Search,
  Truck,
  XCircle,
} from "lucide-react";
import Link from "next/link";

type Status = "PENDING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

const STATUSES: Status[] = ["PENDING", "SHIPPED", "DELIVERED", "CANCELLED"];
const FILTER_TABS = ["All", ...STATUSES] as const;

const STATUS_CONFIG: Record<Status, { bg: string; text: string; dot: string; icon: React.ReactNode }> = {
  PENDING:   { bg: "bg-amber-50",    text: "text-amber-700",   dot: "bg-amber-400",   icon: <Clock size={11} />      },
  SHIPPED:   { bg: "bg-sky-50",      text: "text-sky-700",     dot: "bg-sky-400",     icon: <Truck size={11} />      },
  DELIVERED: { bg: "bg-emerald-50",  text: "text-emerald-700", dot: "bg-emerald-400", icon: <CheckCheck size={11} /> },
  CANCELLED: { bg: "bg-neutral-100", text: "text-neutral-500", dot: "bg-neutral-300", icon: <XCircle size={11} />   },
};

function statusCfg(s: string) {
  return STATUS_CONFIG[s?.toUpperCase() as Status] ?? STATUS_CONFIG.PENDING;
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n);
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function parseItemImage(product: AdminOrderItem["product"]): string | null {
  if (product.images && product.images.length > 0) return product.images[0].imageUrl;
  const raw = product.allImages;
  if (!raw) return null;
  if (typeof raw === "string") {
    if (raw.startsWith("http")) return raw;
    if (raw.startsWith("[")) {
      try {
        const parsed = JSON.parse(raw.replace(/'/g, '"')) as string[];
        if (parsed.length > 0) return parsed[0];
      } catch { /* */ }
    }
  }
  return null;
}

function SellerOrdersContent() {
  const searchParams = useSearchParams();
  const expandParam = searchParams.get("expand");

  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<(typeof FILTER_TABS)[number]>("All");
  const [expanded, setExpanded] = useState<number | null>(
    expandParam ? parseInt(expandParam) : null
  );
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
    getSellerOrders()
      .then((data) => {
        setOrders(data);
        if (expandParam) setExpanded(parseInt(expandParam));
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load orders."))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      const matchTab = activeTab === "All" || o.status.toUpperCase() === activeTab;
      const matchSearch =
        !q ||
        String(o.id).includes(q) ||
        `${o.user.firstName} ${o.user.lastName}`.toLowerCase().includes(q) ||
        o.user.email.toLowerCase().includes(q);
      return matchTab && matchSearch;
    });
  }, [orders, activeTab, search]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const o of orders) {
      const s = o.status.toUpperCase();
      map[s] = (map[s] ?? 0) + 1;
    }
    return map;
  }, [orders]);

  const handleStatusChange = async (order: SellerOrder, newStatus: Status) => {
    if (order.status.toUpperCase() === newStatus) return;
    setUpdatingId(order.id);
    setUpdateError(null);
    try {
      const updated = await updateSellerOrderStatus(order.id, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)));
    } catch (e: unknown) {
      setUpdateError(e instanceof Error ? e.message : "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="px-10 pb-20 pt-10 max-w-[1600px]">
      <section className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-[32px] font-semibold tracking-tight text-black leading-tight">Orders</h1>
          <p className="text-base text-neutral-500 mt-1">Manage and update your customer orders.</p>
        </div>
        <span className="text-[11px] uppercase tracking-widest font-semibold text-neutral-400">
          {loading ? "…" : `${orders.length} total`}
        </span>
      </section>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-5 border-b border-neutral-200 mb-2">
        <div className="flex gap-6 flex-wrap">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-[12px] tracking-widest font-semibold uppercase flex items-center gap-1.5 transition-colors pb-1 ${
                activeTab === tab
                  ? "text-black border-b-2 border-black"
                  : "text-neutral-400 hover:text-black border-b-2 border-transparent"
              }`}
            >
              {tab}
              {tab !== "All" && (counts[tab] ?? 0) > 0 && (
                <span className="bg-neutral-100 text-neutral-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {counts[tab]}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="relative flex items-center">
          <Search size={14} className="absolute left-3 text-neutral-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-neutral-100 text-xs focus:ring-1 focus:ring-black w-64 outline-none placeholder:text-neutral-400"
            placeholder="Search by name, email, order ID…"
          />
        </div>
      </div>

      {updateError && (
        <div className="mt-3 mb-1 px-4 py-2.5 bg-red-50 border border-red-100 text-xs text-red-600">
          {updateError}
        </div>
      )}

      <div className="bg-white border border-neutral-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-neutral-400">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Loading orders…</span>
          </div>
        ) : error ? (
          <div className="py-20 text-center text-sm text-red-500">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-sm text-neutral-400">
            {search || activeTab !== "All" ? "No orders match your filters." : "No orders yet."}
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-100">
                <th className="w-10" />
                {["Order ID", "Customer", "Date", "Items", "Status", "Total"].map((h, i) => (
                  <th
                    key={h}
                    className={`px-5 py-4 text-[11px] uppercase tracking-widest font-semibold text-neutral-500 ${i === 5 ? "text-right" : ""}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => {
                const isExpanded = expanded === order.id;
                const cfg = statusCfg(order.status);
                const isUpdating = updatingId === order.id;
                return (
                  <Fragment key={order.id}>
                    <tr
                      className="border-t border-neutral-100 hover:bg-neutral-50/60 transition-colors cursor-pointer"
                      onClick={() => setExpanded(isExpanded ? null : order.id)}
                    >
                      <td className="pl-4 py-5">
                        {isExpanded
                          ? <ChevronUp size={13} className="text-neutral-400" />
                          : <ChevronDown size={13} className="text-neutral-400" />}
                      </td>
                      <td className="px-5 py-5 text-sm font-semibold text-black">#{order.id}</td>
                      <td className="px-5 py-5">
                        <div>
                          <p className="text-sm font-medium text-black">{order.user.firstName} {order.user.lastName}</p>
                          <p className="text-xs text-neutral-400">{order.user.email}</p>
                        </div>
                      </td>
                      <td className="px-5 py-5 text-sm text-neutral-500">{fmtDate(order.orderDate)}</td>
                      <td className="px-5 py-5 text-sm text-neutral-500">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</td>
                      <td className="px-5 py-5" onClick={(e) => e.stopPropagation()}>
                        {isUpdating ? (
                          <Loader2 size={14} className="animate-spin text-neutral-400" />
                        ) : (
                          <div className="relative inline-block">
                            <select
                              value={order.status.toUpperCase()}
                              onChange={(e) => handleStatusChange(order, e.target.value as Status)}
                              className={`appearance-none pl-2.5 pr-6 py-1 text-[10px] font-bold uppercase cursor-pointer outline-none border-0 ${cfg.bg} ${cfg.text}`}
                            >
                              {STATUSES.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                            <ChevronDown size={9} className={`absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none ${cfg.text}`} />
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-5 text-sm font-semibold text-black text-right">{fmt(order.totalAmount)}</td>
                    </tr>

                    {isExpanded && (
                      <tr className="border-t border-neutral-100">
                        <td colSpan={7} className="bg-neutral-50/50 px-10 py-5">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">Order Items</p>
                          <div className="space-y-2.5 mb-5">
                            {order.items.map((item) => {
                              const img = parseItemImage(item.product);
                              return (
                                <Link
                                  key={item.id}
                                  href={`/dashboard/seller/inventory/${item.product.asin}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex items-center gap-4 p-3 bg-white border border-neutral-100 hover:border-black transition-colors group"
                                >
                                  <div className="w-12 h-14 bg-neutral-100 shrink-0 overflow-hidden">
                                    {img ? (
                                      <img
                                        src={img}
                                        alt={item.product.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Package size={14} className="text-neutral-300" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-grow min-w-0">
                                    <p className="text-sm font-semibold text-black line-clamp-1 group-hover:text-orange-600 transition-colors">
                                      {item.product.title}
                                    </p>
                                    <p className="text-xs text-neutral-400 mt-0.5">
                                      {item.product.brandName}{item.product.category ? ` · ${item.product.category}` : ""}
                                    </p>
                                  </div>
                                  <div className="shrink-0 text-right">
                                    <p className="text-sm font-semibold text-black">{fmt(item.priceAtPurchase)}</p>
                                    <p className="text-xs text-neutral-400">Qty: {item.quantity}</p>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-start gap-6 pt-4 border-t border-neutral-200">
                            <div className="flex-1">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Customer</p>
                              <p className="text-sm font-medium text-black">{order.user.firstName} {order.user.lastName}</p>
                              <p className="text-xs text-neutral-500">{order.user.email}</p>
                              {order.user.phone && <p className="text-xs text-neutral-500 mt-0.5">{order.user.phone}</p>}
                              {(order.user.address || order.user.city) && (
                                <p className="text-xs text-neutral-400 mt-1">
                                  {[order.user.address, order.user.city, order.user.country].filter(Boolean).join(", ")}
                                </p>
                              )}
                            </div>

                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Update Status</p>
                              <div className="flex flex-wrap gap-2">
                                {STATUSES.map((s) => {
                                  const c = STATUS_CONFIG[s];
                                  const isCurrent = order.status.toUpperCase() === s;
                                  return (
                                    <button
                                      key={s}
                                      disabled={isCurrent || isUpdating}
                                      onClick={(e) => { e.stopPropagation(); handleStatusChange(order, s); }}
                                      className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all disabled:cursor-default ${
                                        isCurrent
                                          ? `${c.bg} ${c.text} ring-1 ring-inset ring-current`
                                          : "bg-white border border-neutral-200 text-neutral-500 hover:border-black hover:text-black"
                                      }`}
                                    >
                                      <span className={`h-1.5 w-1.5 rounded-full ${isCurrent ? c.dot : "bg-neutral-300"}`} />
                                      {s}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default function SellerOrdersPage() {
  return (
    <Suspense>
      <SellerOrdersContent />
    </Suspense>
  );
}
