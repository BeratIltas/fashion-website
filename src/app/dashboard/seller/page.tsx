"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getSellerStatistics,
  getSellerOrders,
  type SellerStatistics,
  type SellerOrder,
} from "@/lib/adminApi";
import {
  CreditCard,
  ShoppingCart,
  Shirt,
  Truck,
  CheckCheck,
  XCircle,
  Clock,
  Loader2,
  ArrowRight,
  TrendingUp,
  LayoutGrid,
} from "lucide-react";
import Link from "next/link";

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  SHIPPED:    { bg: "bg-sky-50",      text: "text-sky-700"     },
  DELIVERED:  { bg: "bg-emerald-50",  text: "text-emerald-700" },
  PENDING:    { bg: "bg-amber-50",    text: "text-amber-700"   },
  PROCESSING: { bg: "bg-blue-50",     text: "text-blue-700"    },
  CANCELED:   { bg: "bg-neutral-100", text: "text-neutral-500" },
  CANCELLED:  { bg: "bg-neutral-100", text: "text-neutral-500" },
};

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function fmtShort(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function RevenueChart({ data }: { data: { date: string; revenue: number }[] }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  if (!data || data.length < 2) {
    return (
      <div className="h-[220px] flex items-center justify-center text-sm text-neutral-400 border border-dashed border-neutral-200">
        No revenue data yet
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.revenue), 1);
  const VW = 800;
  const VH = 180;
  const step = VW / (data.length - 1);
  const pts = data.map((d, i) => ({
    x: i * step,
    y: VH - (d.revenue / max) * VH * 0.88,
  }));
  const polyline = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `0,${VH} ${polyline} ${pts[pts.length - 1].x},${VH}`;

  const labelEvery = Math.ceil(data.length / 8);
  const labelIdxs = data.reduce<number[]>((acc, _, i) => {
    if (i % labelEvery === 0 || i === data.length - 1) acc.push(i);
    return acc;
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const raw = Math.round((relX / rect.width) * (data.length - 1));
    setHoverIdx(Math.max(0, Math.min(data.length - 1, raw)));
  };

  const hovered = hoverIdx !== null ? data[hoverIdx] : null;
  const hoveredPt = hoverIdx !== null ? pts[hoverIdx] : null;
  const tooltipLeftPct = hoverIdx !== null ? (hoverIdx / (data.length - 1)) * 100 : 0;

  return (
    <div
      ref={wrapperRef}
      className="relative select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoverIdx(null)}
    >
      {/* Tooltip */}
      {hovered && hoveredPt && (
        <div
          className="absolute z-10 -top-2 pointer-events-none transition-all duration-75"
          style={{
            left: `${tooltipLeftPct}%`,
            transform: tooltipLeftPct > 80 ? "translateX(-100%)" : tooltipLeftPct < 10 ? "translateX(0)" : "translateX(-50%)",
          }}
        >
          <div className="bg-black text-white text-[11px] font-semibold px-3 py-1.5 rounded-md whitespace-nowrap shadow-lg">
            {fmtShort(hovered.date)}: {fmt(hovered.revenue)}
          </div>
        </div>
      )}

      <svg
        className="w-full"
        viewBox={`0 0 ${VW} ${VH + 10}`}
        preserveAspectRatio="none"
        style={{ height: 180 }}
      >
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#revGrad)" />
        <polyline
          points={polyline}
          fill="none"
          stroke="#f97316"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* All dots — small */}
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={hoverIdx === i ? 5 : 3} fill="#f97316"
            opacity={hoverIdx !== null && hoverIdx !== i ? 0.4 : 1}
          />
        ))}
        {/* Hover vertical line */}
        {hoveredPt && (
          <line
            x1={hoveredPt.x} y1={0}
            x2={hoveredPt.x} y2={VH}
            stroke="#f97316"
            strokeWidth="1"
            strokeDasharray="4 3"
            opacity={0.5}
          />
        )}
      </svg>

      {/* X-axis labels */}
      <div className="flex justify-between mt-2 pointer-events-none">
        {labelIdxs.map((i) => (
          <span
            key={i}
            className={`text-[10px] transition-colors ${hoverIdx === i ? "text-orange-500 font-semibold" : "text-neutral-400"}`}
            style={{ minWidth: 0 }}
          >
            {fmtShort(data[i].date)}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<SellerStatistics | null>(null);
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let done = 0;
    const finish = () => { if (++done === 2) setLoading(false); };

    getSellerStatistics()
      .then(setStats)
      .catch(() => setError("Could not load statistics."))
      .finally(finish);

    getSellerOrders()
      .then(setOrders)
      .catch(() => {})
      .finally(finish);
  }, []);

  const recentOrders = orders.slice(0, 5);
  const categoryDist = stats?.categoryDistribution ?? [];
  const topCategories = [...categoryDist].sort((a, b) => b.count - a.count).slice(0, 5);
  const totalCatCount = topCategories.reduce((s, c) => s + c.count, 0) || 1;

  return (
    <div className="px-10 pb-20 pt-10 max-w-[1600px]">
      <section className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-[32px] font-semibold tracking-tight text-black leading-tight">Dashboard</h1>
          <p className="text-base text-neutral-500 mt-1">
            Welcome back, {user?.firstName}. Here&apos;s your store overview.
          </p>
        </div>
        <Link
          href="/dashboard/seller/orders"
          className="flex items-center gap-2 px-4 py-2.5 border border-neutral-200 hover:border-black transition-colors text-[11px] uppercase tracking-widest font-semibold text-neutral-600 hover:text-black"
        >
          View Orders <ArrowRight size={13} />
        </Link>
      </section>

      {loading ? (
        <div className="flex items-center justify-center py-40 gap-3 text-neutral-400">
          <Loader2 size={22} className="animate-spin" />
          <span className="text-sm">Loading dashboard…</span>
        </div>
      ) : error && !stats ? (
        <div className="py-40 text-center text-sm text-red-500">{error}</div>
      ) : (
        <>
          {/* Primary KPIs */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="p-6 bg-white border border-neutral-200">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[11px] tracking-widest font-semibold text-neutral-500 uppercase">Total Revenue</span>
                <CreditCard size={18} className="text-neutral-300" />
              </div>
              <div className="text-[48px] font-semibold leading-none tracking-tight text-black">
                {stats ? fmt(stats.totalRevenue) : "—"}
              </div>
              <p className="mt-2 text-xs text-neutral-400">All-time earnings</p>
            </div>

            <div className="p-6 bg-white border border-neutral-200">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[11px] tracking-widest font-semibold text-neutral-500 uppercase">Total Sales</span>
                <ShoppingCart size={18} className="text-neutral-300" />
              </div>
              <div className="text-[48px] font-semibold leading-none tracking-tight text-black">
                {stats ? stats.totalSalesCount.toLocaleString() : "—"}
              </div>
              <p className="mt-2 text-xs text-neutral-400">Completed orders</p>
            </div>

            <div className="p-6 bg-white border border-neutral-200">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[11px] tracking-widest font-semibold text-neutral-500 uppercase">Active Products</span>
                <Shirt size={18} className="text-neutral-300" />
              </div>
              <div className="text-[48px] font-semibold leading-none tracking-tight text-black">
                {stats ? stats.activeProductsCount : "—"}
              </div>
              <p className="mt-2 text-xs text-neutral-400">Live on store</p>
            </div>
          </section>

          {/* Order Status */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {[
              { label: "Pending",   count: stats?.pendingOrderCount,   icon: Clock,      bar: "bg-amber-400",   text: "text-amber-600"   },
              { label: "Shipped",   count: stats?.shippedOrderCount,   icon: Truck,      bar: "bg-sky-400",     text: "text-sky-600"     },
              { label: "Delivered", count: stats?.deliveredOrderCount, icon: CheckCheck, bar: "bg-emerald-400", text: "text-emerald-600" },
              { label: "Cancelled", count: stats?.cancelledOrderCount, icon: XCircle,    bar: "bg-neutral-300", text: "text-neutral-500" },
            ].map(({ label, count, icon: Icon, bar, text }) => (
              <div key={label} className="relative bg-white border border-neutral-200 p-5 overflow-hidden">
                <div className={`absolute inset-x-0 top-0 h-0.5 ${bar}`} />
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-neutral-400">{label}</span>
                  <Icon size={14} className={text} />
                </div>
                <p className="text-[36px] font-semibold leading-none tracking-tight text-black">{count ?? "—"}</p>
                <p className="mt-1 text-[10px] text-neutral-400">orders</p>
              </div>
            ))}
          </section>

          {/* Revenue Chart + Category Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            <div className="lg:col-span-2 bg-white border border-neutral-200 p-6">
              <div className="flex items-center gap-2 mb-8">
                <TrendingUp size={16} className="text-orange-500" />
                <h3 className="text-[16px] font-semibold text-black">Daily Revenue</h3>
              </div>
              <RevenueChart data={stats?.dailyRevenue ?? []} />
            </div>

            <div className="bg-white border border-neutral-200 p-6">
              <div className="flex items-center gap-2 mb-6">
                <LayoutGrid size={16} className="text-orange-500" />
                <h3 className="text-[16px] font-semibold text-black">Category Distribution</h3>
              </div>
              {topCategories.length > 0 ? (
                <div className="space-y-4">
                  {topCategories.map(({ category, count }) => {
                    const pct = Math.round((count / totalCatCount) * 100);
                    return (
                      <div key={category}>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-xs font-medium text-neutral-700 truncate max-w-[160px]">{category}</span>
                          <span className="text-xs text-neutral-400 shrink-0 ml-2">{count} · {pct}%</span>
                        </div>
                        <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                          <div className="h-1.5 bg-orange-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-sm text-neutral-400 border border-dashed border-neutral-200">
                  No category data yet
                </div>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[18px] font-semibold text-black">Recent Orders</h3>
              <Link
                href="/dashboard/seller/orders"
                className="text-neutral-500 text-[11px] uppercase tracking-widest font-semibold border-b border-transparent hover:border-black hover:text-black transition-all flex items-center gap-1.5"
              >
                View All <ArrowRight size={11} />
              </Link>
            </div>
            <div className="bg-white border border-neutral-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50">
                    {["Order ID", "Customer", "Date", "Status", "Total"].map((h, i) => (
                      <th
                        key={h}
                        className={`px-6 py-4 text-[11px] uppercase tracking-widest font-semibold text-neutral-500 ${i === 4 ? "text-right" : ""}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center text-sm text-neutral-400">No orders yet</td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => {
                      const s = STATUS_STYLES[order.status?.toUpperCase()] ?? STATUS_STYLES.PENDING;
                      return (
                        <tr
                          key={order.id}
                          className="hover:bg-neutral-50 transition-colors cursor-pointer"
                        >
                          <td className="px-6 py-4">
                            <Link
                              href={`/dashboard/seller/orders?expand=${order.id}`}
                              className="text-sm font-semibold text-black hover:text-orange-600 transition-colors"
                            >
                              #{order.id}
                            </Link>
                          </td>
                          <td className="px-6 py-4 text-sm text-neutral-700">
                            {order.user.firstName} {order.user.lastName}
                          </td>
                          <td className="px-6 py-4 text-sm text-neutral-500">{fmtDate(order.orderDate)}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${s.bg} ${s.text}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-black text-right">
                            <Link href={`/dashboard/seller/orders?expand=${order.id}`} className="hover:text-orange-600 transition-colors">
                              {fmt(order.totalAmount)}
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
