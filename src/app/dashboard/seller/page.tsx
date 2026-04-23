"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getSellerDashboard,
  type SellerDashboard,
  type SellerRecentOrder,
} from "@/lib/adminApi";
import { Star, CreditCard, ShoppingCart, Shirt, MoreVertical, Loader2 } from "lucide-react";

const STATUS_STYLES: Record<SellerRecentOrder["status"], string> = {
  SHIPPED: "bg-green-50 text-green-700",
  DELIVERED: "bg-green-50 text-green-700",
  PENDING: "bg-yellow-50 text-yellow-700",
  PROCESSING: "bg-blue-50 text-blue-700",
  CANCELED: "bg-neutral-100 text-neutral-600",
};

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function ChartLine({
  data,
  stroke,
  dashed,
}: {
  data: number[];
  stroke: string;
  dashed?: boolean;
}) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const w = 800;
  const h = 200;
  const step = w / (data.length - 1);
  const points = data.map((v, i) => `${i * step},${h - (v / max) * h}`).join(" ");
  return (
    <polyline
      points={points}
      fill="none"
      stroke={stroke}
      strokeWidth={dashed ? 2 : 2.5}
      strokeDasharray={dashed ? "4" : undefined}
    />
  );
}

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<SellerDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSellerDashboard()
      .then(setData)
      .catch(() => setError("Could not load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

  const m = data?.metrics;
  const chart = data?.salesChart;
  const bestSellers = data?.bestSellers ?? [];
  const orders = data?.recentOrders ?? [];

  return (
    <div className="px-10 pb-20 pt-10 max-w-[1600px]">
      {/* Header */}
      <section className="mb-20 flex justify-between items-end">
        <div>
          <h1 className="text-[32px] font-semibold tracking-tight text-black leading-tight">
            Atelier Performance
          </h1>
          <p className="text-base text-neutral-500 mt-1">
            Welcome back, {user?.firstName}. Here&apos;s your boutique overview.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-neutral-200 hover:border-black transition-colors text-[11px] uppercase tracking-widest font-semibold">
            Last 30 Days
          </button>
          <button className="px-4 py-2 bg-black text-white text-[11px] uppercase tracking-widest font-semibold hover:opacity-80 transition-opacity">
            Export Report
          </button>
        </div>
      </section>

      {loading ? (
        <div className="flex items-center justify-center py-40 gap-3 text-neutral-400">
          <Loader2 size={22} className="animate-spin" />
          <span className="text-sm">Loading dashboard…</span>
        </div>
      ) : error ? (
        <div className="py-40 text-center text-sm text-red-500">{error}</div>
      ) : (
        <>
          {/* Metric Cards */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-20">
            {/* Total Sales */}
            <div className="p-6 bg-white border border-neutral-200">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[11px] tracking-widest font-semibold text-neutral-500 uppercase">Total Sales</span>
                <CreditCard size={20} className="text-neutral-300" />
              </div>
              <div className="text-[48px] font-semibold leading-none tracking-tight text-black">
                {m ? fmt(m.totalSales) : "—"}
              </div>
              {m && (
                <div className="mt-2 flex items-center gap-1">
                  <span className="text-xs font-semibold text-black">
                    {m.salesChangePercent >= 0 ? "+" : ""}{m.salesChangePercent.toFixed(1)}%
                  </span>
                  <span className="text-xs text-neutral-500">from last month</span>
                </div>
              )}
            </div>

            {/* Total Orders */}
            <div className="p-6 bg-white border border-neutral-200">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[11px] tracking-widest font-semibold text-neutral-500 uppercase">Total Orders</span>
                <ShoppingCart size={20} className="text-neutral-300" />
              </div>
              <div className="text-[48px] font-semibold leading-none tracking-tight text-black">
                {m ? m.totalOrders.toLocaleString() : "—"}
              </div>
              {m && (
                <div className="mt-2 flex items-center gap-1">
                  <span className="text-xs font-semibold text-black">
                    {m.ordersChangePercent >= 0 ? "+" : ""}{m.ordersChangePercent.toFixed(1)}%
                  </span>
                  <span className="text-xs text-neutral-500">from last month</span>
                </div>
              )}
            </div>

            {/* Active Products */}
            <div className="p-6 bg-white border border-neutral-200">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[11px] tracking-widest font-semibold text-neutral-500 uppercase">Active Products</span>
                <Shirt size={20} className="text-neutral-300" />
              </div>
              <div className="text-[48px] font-semibold leading-none tracking-tight text-black">
                {m ? m.activeProducts : "—"}
              </div>
              <div className="mt-2 flex items-center gap-1">
                <span className="text-xs font-semibold text-black">Live</span>
                <span className="text-xs text-neutral-500">on store</span>
              </div>
            </div>

            {/* Customer Rating */}
            <div className="p-6 bg-white border border-neutral-200">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[11px] tracking-widest font-semibold text-neutral-500 uppercase">Customer Rating</span>
                <Star size={20} className="text-neutral-300" />
              </div>
              <div className="text-[48px] font-semibold leading-none tracking-tight text-black">
                {m ? m.averageRating.toFixed(1) : "—"}
              </div>
              {m && m.averageRating > 0 && (
                <div className="mt-2 flex items-center gap-0.5 text-black">
                  {[...Array(Math.round(m.averageRating))].map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Chart + Best Sellers */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-20 mb-20">
            {/* Sales Overview */}
            <div className="lg:col-span-2 bg-white border border-neutral-200 p-6">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-[18px] font-semibold text-black">Sales Overview</h3>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-black" />
                    <span className="text-xs text-neutral-500">Current Period</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-neutral-200" />
                    <span className="text-xs text-neutral-500">Previous Period</span>
                  </div>
                </div>
              </div>

              {chart && chart.labels.length > 0 ? (
                <div className="relative h-[300px] w-full flex items-end justify-between border-b border-neutral-200 pt-10 px-4">
                  <div className="absolute inset-0 top-10">
                    <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 200">
                      <ChartLine data={chart.currentPeriod} stroke="black" />
                      <ChartLine data={chart.previousPeriod} stroke="#e5e5e5" dashed />
                    </svg>
                  </div>
                  <div className="w-full flex justify-between items-end relative z-10">
                    {chart.labels.map((l) => (
                      <span key={l} className="text-[12px] text-neutral-400 mb-[-24px]">{l}</span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-sm text-neutral-400 border border-dashed border-neutral-200 rounded">
                  No sales data yet
                </div>
              )}
            </div>

            {/* Best Sellers */}
            <div className="bg-white border border-neutral-200 p-6">
              <h3 className="text-[18px] font-semibold text-black mb-10">Best Sellers</h3>
              {bestSellers.length > 0 ? (
                <div className="space-y-6">
                  {bestSellers.slice(0, 3).map(({ asin, title, subtitle, price, unitsSold, imageUrl }) => (
                    <div key={asin} className="flex items-center gap-4">
                      <div className="h-14 w-12 bg-neutral-50 overflow-hidden flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="text-sm font-semibold text-black truncate">{title}</p>
                        <p className="text-xs text-neutral-500">{subtitle}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-semibold text-black">{fmt(price)}</p>
                        <p className="text-xs text-neutral-500">{unitsSold} Sold</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-sm text-neutral-400 border border-dashed border-neutral-200 rounded">
                  No sales data yet
                </div>
              )}
              <button className="w-full mt-10 py-3 border border-neutral-100 text-[11px] uppercase tracking-widest font-semibold text-neutral-500 hover:text-black hover:border-black transition-colors">
                View All Products
              </button>
            </div>
          </div>

          {/* Recent Orders */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[18px] font-semibold text-black">Recent Orders</h3>
              <button className="text-neutral-500 text-[11px] uppercase tracking-widest font-semibold border-b border-transparent hover:border-black transition-all">
                View All Orders
              </button>
            </div>
            <div className="bg-white border border-neutral-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50">
                    {["Order ID", "Customer", "Date", "Status", "Total", ""].map((h, i) => (
                      <th
                        key={i}
                        className={`px-6 py-4 text-[11px] uppercase tracking-widest font-semibold text-neutral-500 ${
                          i === 4 ? "text-right" : ""
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center text-sm text-neutral-400">
                        No orders yet
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.orderId} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-6 py-5 text-sm font-semibold text-black">#{order.orderId}</td>
                        <td className="px-6 py-5 text-sm text-neutral-800">{order.customerName}</td>
                        <td className="px-6 py-5 text-sm text-neutral-500">{fmtDate(order.orderDate)}</td>
                        <td className="px-6 py-5">
                          <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-sm ${STATUS_STYLES[order.status] ?? "bg-neutral-100 text-neutral-600"}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-sm font-semibold text-black text-right">
                          {fmt(order.totalAmount)}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button className="text-neutral-400 hover:text-black transition-colors p-1">
                            <MoreVertical size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
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
