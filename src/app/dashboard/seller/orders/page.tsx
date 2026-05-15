"use client";

import { Fragment, Suspense, useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  getSellerOrders,
  getSellerReturns,
  resolveSellerReturn,
  updateSellerOrderStatus,
  type SellerOrder,
  type SellerReturn,
  type AdminOrderItem,
} from "@/lib/adminApi";
import {
  AlertCircle,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  Clock,
  Loader2,
  Package,
  RotateCcw,
  Search,
  Truck,
  X,
  XCircle,
} from "lucide-react";
import Link from "next/link";

type Status = "PENDING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
type ActiveTab = "All" | Status | "RETURNS";

const STATUSES: Status[] = ["PENDING", "SHIPPED", "DELIVERED", "CANCELLED"];
const FILTER_TABS: ActiveTab[] = ["All", "PENDING", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNS"];

const STATUS_CONFIG: Record<Status, { bg: string; text: string; dot: string; icon: React.ReactNode }> = {
  PENDING:   { bg: "bg-amber-50",    text: "text-amber-700",   dot: "bg-amber-400",   icon: <Clock size={11} />      },
  SHIPPED:   { bg: "bg-sky-50",      text: "text-sky-700",     dot: "bg-sky-400",     icon: <Truck size={11} />      },
  DELIVERED: { bg: "bg-emerald-50",  text: "text-emerald-700", dot: "bg-emerald-400", icon: <CheckCheck size={11} /> },
  CANCELLED: { bg: "bg-neutral-100", text: "text-neutral-500", dot: "bg-neutral-300", icon: <XCircle size={11} />   },
};

const RETURN_STATUS_CFG: Record<string, { bg: string; text: string }> = {
  PENDING:  { bg: "bg-rose-50",     text: "text-rose-600"    },
  APPROVED: { bg: "bg-emerald-50",  text: "text-emerald-700" },
  REJECTED: { bg: "bg-neutral-100", text: "text-neutral-500" },
};

function returnStatusCfg(s: string) {
  return RETURN_STATUS_CFG[s?.toUpperCase()] ?? RETURN_STATUS_CFG.PENDING;
}

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

// ─── Resolve Return Modal ─────────────────────────────────────────────────────

function ResolveReturnModal({
  ret,
  onClose,
  onSuccess,
}: {
  ret: SellerReturn;
  onClose: () => void;
  onSuccess: (updated: SellerReturn) => void;
}) {
  const [decision, setDecision] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const updated = await resolveSellerReturn(ret.id, decision, note.trim());
      onSuccess(updated);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to resolve return.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-rose-100 flex items-center justify-center">
              <RotateCcw size={14} className="text-rose-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-black">Resolve Return #{ret.id}</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Order #{ret.orderId} · User #{ret.userId}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-neutral-200 transition-colors text-neutral-400 hover:text-black">
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Customer reason */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Customer Reason</p>
            <div className="bg-neutral-50 border border-neutral-200 px-4 py-3">
              <p className="text-sm text-neutral-700 leading-relaxed">{ret.reason}</p>
            </div>
            <p className="text-[11px] text-neutral-400 mt-1.5">
              Requested {fmtDate(ret.requestDate)}
            </p>
          </div>

          {/* Decision toggle */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">Decision</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDecision("APPROVED")}
                className={`py-3 text-xs font-bold uppercase tracking-wider transition-all border-2 flex items-center justify-center gap-2 ${
                  decision === "APPROVED"
                    ? "bg-emerald-500 text-white border-emerald-500"
                    : "bg-white text-neutral-400 border-neutral-200 hover:border-emerald-400 hover:text-emerald-600"
                }`}
              >
                <CheckCheck size={13} />
                Approve
              </button>
              <button
                type="button"
                onClick={() => setDecision("REJECTED")}
                className={`py-3 text-xs font-bold uppercase tracking-wider transition-all border-2 flex items-center justify-center gap-2 ${
                  decision === "REJECTED"
                    ? "bg-red-500 text-white border-red-500"
                    : "bg-white text-neutral-400 border-neutral-200 hover:border-red-400 hover:text-red-600"
                }`}
              >
                <XCircle size={13} />
                Reject
              </button>
            </div>
          </div>

          {/* Seller note */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">
              Note to Customer{" "}
              <span className="text-neutral-300 normal-case tracking-normal font-normal">(optional)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Explain your decision to the customer…"
              className="w-full border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-black outline-none focus:border-black focus:bg-white placeholder:text-neutral-400 transition-colors resize-none"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 px-4 py-2.5">
              <AlertCircle size={13} className="text-red-500 shrink-0" />
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-neutral-200 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-600 hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider text-white disabled:opacity-50 transition-colors flex items-center justify-center gap-2 ${
                decision === "APPROVED" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"
              }`}
            >
              {submitting && <Loader2 size={13} className="animate-spin" />}
              {decision === "APPROVED" ? "Approve Return" : "Reject Return"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Content ─────────────────────────────────────────────────────────────

function SellerOrdersContent() {
  const searchParams = useSearchParams();
  const expandParam = searchParams.get("expand");

  // Orders
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<ActiveTab>("All");
  const [expanded, setExpanded] = useState<number | null>(expandParam ? parseInt(expandParam) : null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Returns
  const [returns, setReturns] = useState<SellerReturn[]>([]);
  const [returnsLoaded, setReturnsLoaded] = useState(false);
  const [returnsLoading, setReturnsLoading] = useState(false);
  const [returnsError, setReturnsError] = useState<string | null>(null);
  const [resolveTarget, setResolveTarget] = useState<SellerReturn | null>(null);

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

  useEffect(() => {
    if (activeTab === "RETURNS" && !returnsLoaded) {
      setReturnsLoading(true);
      setReturnsError(null);
      getSellerReturns()
        .then((data) => { setReturns(data); setReturnsLoaded(true); })
        .catch((e: unknown) => setReturnsError(e instanceof Error ? e.message : "Failed to load returns."))
        .finally(() => setReturnsLoading(false));
    }
  }, [activeTab, returnsLoaded]);

  const pendingReturnsCount = useMemo(
    () => returns.filter((r) => r.status?.toUpperCase() === "PENDING").length,
    [returns]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      const matchTab = activeTab === "All" || activeTab === "RETURNS" || o.status.toUpperCase() === activeTab;
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
      {resolveTarget && (
        <ResolveReturnModal
          ret={resolveTarget}
          onClose={() => setResolveTarget(null)}
          onSuccess={(updated) => {
            setReturns((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
            setResolveTarget(null);
          }}
        />
      )}

      <section className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-[32px] font-semibold tracking-tight text-black leading-tight">Orders</h1>
          <p className="text-base text-neutral-500 mt-1">Manage and update your customer orders.</p>
        </div>
        <span className="text-[11px] uppercase tracking-widest font-semibold text-neutral-400">
          {loading ? "…" : `${orders.length} total`}
        </span>
      </section>

      {/* ── Tabs bar ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-5 border-b border-neutral-200 mb-2">
        <div className="flex gap-6 flex-wrap items-center">
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
              {tab === "RETURNS" ? <RotateCcw size={10} /> : null}
              {tab}
              {tab === "RETURNS" && pendingReturnsCount > 0 && (
                <span className="bg-neutral-100 text-neutral-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {pendingReturnsCount}
                </span>
              )}
              {tab !== "All" && tab !== "RETURNS" && (counts[tab] ?? 0) > 0 && (
                <span className="bg-neutral-100 text-neutral-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {counts[tab]}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab !== "RETURNS" && (
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-3 text-neutral-400 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-neutral-100 text-xs focus:ring-1 focus:ring-black w-64 outline-none placeholder:text-neutral-400"
              placeholder="Search by name, email, order ID…"
            />
          </div>
        )}
      </div>

      {updateError && activeTab !== "RETURNS" && (
        <div className="mt-3 mb-1 px-4 py-2.5 bg-red-50 border border-red-100 text-xs text-red-600">
          {updateError}
        </div>
      )}

      {/* ── Orders table ── */}
      {activeTab !== "RETURNS" && (
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
      )}

      {/* ── Returns table ── */}
      {activeTab === "RETURNS" && (
        <div className="bg-white border border-neutral-100 overflow-hidden">
          {returnsLoading ? (
            <div className="flex items-center justify-center py-20 gap-3 text-neutral-400">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm">Loading returns…</span>
            </div>
          ) : returnsError ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2">
              <AlertCircle size={20} className="text-red-400" />
              <p className="text-sm text-red-500">{returnsError}</p>
            </div>
          ) : returns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-neutral-400">
              <RotateCcw size={28} className="text-neutral-200" />
              <p className="text-sm font-medium">No return requests yet</p>
              <p className="text-xs text-neutral-300">Return requests from customers will appear here.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-100">
                  {["Return", "Order", "Date", "Reason", "Status", "Resolved", "Action"].map((h) => (
                    <th key={h} className="px-5 py-4 text-[11px] uppercase tracking-widest font-semibold text-neutral-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {returns.map((ret) => {
                  const rcfg = returnStatusCfg(ret.status);
                  const isPending = ret.status?.toUpperCase() === "PENDING";
                  return (
                    <tr
                      key={ret.id}
                      className={`border-t border-neutral-100 transition-colors ${isPending ? "hover:bg-rose-50/30" : "hover:bg-neutral-50/60"}`}
                    >
                      <td className="px-5 py-4 text-sm font-semibold text-black">#{ret.id}</td>
                      <td className="px-5 py-4 text-sm font-medium text-neutral-600">#{ret.orderId}</td>
                      <td className="px-5 py-4 text-sm text-neutral-500 whitespace-nowrap">{fmtDate(ret.requestDate)}</td>
                      <td className="px-5 py-4 max-w-[260px]">
                        <p className="text-sm text-neutral-700 line-clamp-2 leading-snug">{ret.reason}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${rcfg.bg} ${rcfg.text}`}>
                          {isPending && <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />}
                          {ret.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-neutral-400 whitespace-nowrap">
                        {ret.resolvedDate ? fmtDate(ret.resolvedDate) : <span className="text-neutral-300">—</span>}
                      </td>
                      <td className="px-5 py-4">
                        {isPending ? (
                          <button
                            onClick={() => setResolveTarget(ret)}
                            className="px-3 py-1.5 bg-black text-white text-[10px] font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors whitespace-nowrap"
                          >
                            Resolve
                          </button>
                        ) : ret.sellerNote ? (
                          <p className="text-xs text-neutral-400 italic max-w-[160px] line-clamp-2">{ret.sellerNote}</p>
                        ) : (
                          <span className="text-neutral-300 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
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
