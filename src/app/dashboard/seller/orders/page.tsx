"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getAdminOrders, type AdminOrder } from "@/lib/adminApi";
import { Search, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

const STATUSES = ["All", "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

const STATUS_STYLES: Record<string, string> = {
  SHIPPED: "bg-green-50 text-green-700",
  DELIVERED: "bg-green-50 text-green-700",
  PENDING: "bg-yellow-50 text-yellow-700",
  PROCESSING: "bg-blue-50 text-blue-700",
  CANCELLED: "bg-neutral-100 text-neutral-600",
  CANCELED: "bg-neutral-100 text-neutral-600",
};

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n);
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getFirstImage(allImages: string | undefined): string | null {
  if (!allImages) return null;
  try {
    const parsed = JSON.parse(allImages);
    if (Array.isArray(parsed)) return parsed[0] ?? null;
    return null;
  } catch {
    if (allImages.startsWith("http")) return allImages;
    return null;
  }
}

export default function SellerOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState<(typeof STATUSES)[number]>("All");
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getAdminOrders(user.firstName)
      .then(setOrders)
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Failed to load orders.";
        console.error("[SellerOrders]", err);
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      const matchStatus = activeStatus === "All" || o.status.toUpperCase() === activeStatus;
      const matchSearch =
        !q ||
        String(o.id).includes(q) ||
        `${o.user.firstName} ${o.user.lastName}`.toLowerCase().includes(q) ||
        o.user.email.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [orders, activeStatus, search]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const o of orders) {
      const s = o.status.toUpperCase();
      map[s] = (map[s] ?? 0) + 1;
    }
    return map;
  }, [orders]);

  return (
    <div className="px-10 pb-20 pt-10 max-w-[1600px]">
      {/* Header */}
      <section className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-[32px] font-semibold tracking-tight text-black leading-tight">
            Orders
          </h1>
          <p className="text-base text-neutral-500 mt-1">
            All customer orders for your store.
          </p>
        </div>
        <div className="text-[11px] uppercase tracking-widest font-semibold text-neutral-500">
          {loading ? "…" : `${orders.length} total`}
        </div>
      </section>

      {/* Status tabs + Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-6 border-b border-neutral-200 mb-2">
        <div className="flex gap-6 flex-wrap">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setActiveStatus(s)}
              className={`text-[12px] tracking-widest font-semibold uppercase flex items-center gap-1.5 transition-colors ${
                activeStatus === s
                  ? "text-black border-b-2 border-black pb-1"
                  : "text-neutral-400 hover:text-black"
              }`}
            >
              {s}
              {s !== "All" && counts[s] ? (
                <span className="bg-neutral-100 text-neutral-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {counts[s]}
                </span>
              ) : null}
            </button>
          ))}
        </div>
        <div className="relative flex items-center">
          <Search size={16} className="absolute left-3 text-neutral-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-neutral-100 border-none rounded-sm text-xs focus:ring-1 focus:ring-black w-64 outline-none"
            placeholder="Search by name, email, order ID…"
          />
        </div>
      </div>

      {/* Table */}
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
            {search || activeStatus !== "All" ? "No orders match your filters." : "No orders yet."}
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50">
                <th className="w-10" />
                {["Order ID", "Customer", "Date", "Items", "Status", "Total"].map((h, i) => (
                  <th
                    key={h}
                    className={`px-6 py-4 text-[11px] uppercase tracking-widest font-semibold text-neutral-500 ${
                      i === 5 ? "text-right" : ""
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => {
                const isExpanded = expanded === order.id;
                return (
                  <>
                    <tr
                      key={order.id}
                      className="border-t border-neutral-100 hover:bg-neutral-50/50 transition-colors cursor-pointer"
                      onClick={() => setExpanded(isExpanded ? null : order.id)}
                    >
                      <td className="pl-4 py-5">
                        {isExpanded ? (
                          <ChevronUp size={14} className="text-neutral-400" />
                        ) : (
                          <ChevronDown size={14} className="text-neutral-400" />
                        )}
                      </td>
                      <td className="px-6 py-5 text-sm font-semibold text-black">#{order.id}</td>
                      <td className="px-6 py-5">
                        <div>
                          <p className="text-sm font-medium text-black">
                            {order.user.firstName} {order.user.lastName}
                          </p>
                          <p className="text-xs text-neutral-400">{order.user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm text-neutral-500">{fmtDate(order.orderDate)}</td>
                      <td className="px-6 py-5 text-sm text-neutral-600">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</td>
                      <td className="px-6 py-5">
                        <span
                          className={`px-2 py-1 text-[10px] font-bold uppercase rounded-sm ${
                            STATUS_STYLES[order.status.toUpperCase()] ?? "bg-neutral-100 text-neutral-600"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm font-semibold text-black text-right">
                        {fmt(order.totalAmount)}
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr key={`${order.id}-detail`} className="bg-neutral-50/50 border-t border-neutral-100">
                        <td colSpan={7} className="px-10 py-4">
                          <div className="space-y-3">
                            {order.items.map((item) => {
                              const img = getFirstImage(item.product.allImages);
                              return (
                                <div
                                  key={item.id}
                                  className="flex items-center gap-4 p-3 bg-white border border-neutral-100"
                                >
                                  <div className="w-12 h-16 bg-neutral-100 flex-shrink-0 overflow-hidden">
                                    {img ? (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img
                                        src={img}
                                        alt={item.product.title}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-neutral-300 text-[10px]">
                                        No img
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-grow min-w-0">
                                    <p className="text-sm font-semibold text-black line-clamp-1">
                                      {item.product.title}
                                    </p>
                                    <p className="text-xs text-neutral-400 mt-0.5">
                                      {item.product.brandName} · {item.product.category}
                                    </p>
                                  </div>
                                  <div className="flex-shrink-0 text-right">
                                    <p className="text-sm font-semibold text-black">
                                      {fmt(item.priceAtPurchase)}
                                    </p>
                                    <p className="text-xs text-neutral-400">
                                      Qty: {item.quantity}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          {order.user.address && (
                            <p className="mt-3 text-xs text-neutral-400">
                              Ship to: {order.user.address}, {order.user.city}, {order.user.country}
                            </p>
                          )}
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
  );
}
