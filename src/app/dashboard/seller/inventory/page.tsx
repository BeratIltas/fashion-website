"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { getSellerProducts, getSellerStatistics, deleteProduct, type AdminProduct } from "@/lib/adminApi";
import {
  Plus, ArrowUpDown, Pencil, Trash2, ChevronLeft, ChevronRight,
  Loader2, Package, ChevronDown, AlertTriangle, ShoppingCart, Tag,
} from "lucide-react";
import Link from "next/link";

type SortKey = "newest" | "oldest" | "price_asc" | "price_desc" | "az";

const SORT_LABELS: Record<SortKey, string> = {
  newest:     "Newest",
  oldest:     "Oldest",
  price_asc:  "Price: Low to High",
  price_desc: "Price: High to Low",
  az:         "A → Z",
};

const PAGE_SIZE = 10;

function DeleteModal({ product, onConfirm, onCancel, loading }: {
  product: AdminProduct;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md mx-4 p-7 shadow-xl">
        <div className="flex items-start gap-4 mb-6">
          <div className="h-10 w-10 shrink-0 flex items-center justify-center bg-red-50 rounded-full">
            <AlertTriangle size={18} className="text-red-500" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-black mb-1">Delete Product</h2>
            <p className="text-sm text-neutral-500 leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="font-medium text-black">"{product.title}"</span>?{" "}
              This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InventoryPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [statsData, setStatsData] = useState<{ totalProducts: number; totalSales: number; pendingOrders: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [data, stats] = await Promise.all([
        getSellerProducts(),
        getSellerStatistics().catch(() => null),
      ]);
      setProducts(data);
      setStatsData({
        totalProducts: stats?.activeProductsCount ?? data.length,
        totalSales: stats?.totalSalesCount ?? 0,
        pendingOrders: stats?.pendingOrderCount ?? 0,
      });
    } catch {
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => { setPage(0); }, [sortKey]);

  const processed = useMemo(() => {
    const list = [...products];
    switch (sortKey) {
      case "oldest":     return list;
      case "newest":     return list.reverse();
      case "az":         return list.sort((a, b) => a.title.localeCompare(b.title));
      case "price_asc":  return list.sort((a, b) => parseFloat(a.priceValue || "0") - parseFloat(b.priceValue || "0"));
      case "price_desc": return list.sort((a, b) => parseFloat(b.priceValue || "0") - parseFloat(a.priceValue || "0"));
      default:           return list;
    }
  }, [products, sortKey]);

  const totalPages = Math.max(1, Math.ceil(processed.length / PAGE_SIZE));
  const paginated = processed.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProduct(deleteTarget.asin);
      setProducts((prev) => prev.filter((p) => p.asin !== deleteTarget.asin));
      setDeleteTarget(null);
    } catch {
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="px-10 pb-20 pt-10 max-w-7xl mx-auto">
      {deleteTarget && (
        <DeleteModal
          product={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      <div className="flex flex-col md:flex-row justify-between items-end mb-10">
        <div>
          <h1 className="text-[32px] font-semibold tracking-tight text-black leading-tight mb-2">Inventory</h1>
          <p className="text-sm text-neutral-500">Manage your products, pricing and availability.</p>
        </div>
        <Link
          href="/dashboard/seller/inventory/new"
          className="mt-4 md:mt-0 bg-black text-white px-8 py-4 text-[12px] uppercase tracking-widest font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Plus size={16} /> Add New Product
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-5 mb-10">
        <div className="relative bg-white border border-neutral-200 p-6 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-black" />
          <div className="flex justify-between items-start mb-3">
            <p className="text-[11px] tracking-widest font-semibold text-neutral-400 uppercase">Total Products</p>
            <Package size={15} className="text-neutral-300" />
          </div>
          <p className="text-[44px] font-semibold leading-none tracking-tight text-black">
            {statsData?.totalProducts ?? (loading ? "…" : products.length)}
          </p>
        </div>
        <div className="relative bg-white border border-neutral-200 p-6 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-emerald-400" />
          <div className="flex justify-between items-start mb-3">
            <p className="text-[11px] tracking-widest font-semibold text-neutral-400 uppercase">Total Sales</p>
            <ShoppingCart size={15} className="text-emerald-400" />
          </div>
          <p className="text-[44px] font-semibold leading-none tracking-tight text-black">
            {statsData?.totalSales ?? "—"}
          </p>
        </div>
        <div className="relative bg-white border border-neutral-200 p-6 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-amber-400" />
          <div className="flex justify-between items-start mb-3">
            <p className="text-[11px] tracking-widest font-semibold text-neutral-400 uppercase">Pending Orders</p>
            <Tag size={15} className="text-amber-400" />
          </div>
          <p className="text-[44px] font-semibold leading-none tracking-tight text-black">
            {statsData?.pendingOrders ?? "—"}
          </p>
        </div>
      </div>

      {/* Sort bar */}
      <div className="flex items-center justify-end py-4 border-b border-neutral-200 mb-2">
        <div ref={sortRef} className="relative">
          <button
            onClick={() => setSortOpen((v) => !v)}
            className="flex items-center gap-2 text-[10px] tracking-widest font-semibold text-neutral-500 border border-neutral-200 px-4 py-2.5 hover:bg-neutral-50 transition-colors uppercase"
          >
            <ArrowUpDown size={13} />
            {SORT_LABELS[sortKey]}
            <ChevronDown size={11} className="ml-1" />
          </button>
          {sortOpen && (
            <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-neutral-200 shadow-lg min-w-[180px]">
              {(Object.entries(SORT_LABELS) as [SortKey, string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => { setSortKey(key); setPage(0); setSortOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-neutral-50 transition-colors ${
                    sortKey === key ? "text-black font-semibold bg-neutral-50" : "text-neutral-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-neutral-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-neutral-400">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Loading inventory…</span>
          </div>
        ) : error ? (
          <div className="py-20 text-center text-sm text-red-500">{error}</div>
        ) : paginated.length === 0 ? (
          <div className="py-20 text-center text-sm text-neutral-400">
            No products found.{" "}
            <Link href="/dashboard/seller/inventory/new" className="underline text-black">
              Add your first product
            </Link>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50">
                {["Product", "Category", "Price", "Rating", "Actions"].map((h, i) => (
                  <th
                    key={h}
                    className={`px-8 py-4 text-[11px] uppercase tracking-widest font-semibold text-neutral-500 ${i === 4 ? "text-right" : ""}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {paginated.map((product) => {
                const thumb = Array.isArray(product.allImages) ? product.allImages[0] : undefined;
                return (
                  <tr key={product.asin} className="hover:bg-neutral-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <Link href={`/dashboard/seller/inventory/${product.asin}`} className="flex items-center gap-4">
                        <div className="w-14 shrink-0 overflow-hidden bg-neutral-100" style={{ height: 72 }}>
                          {thumb ? (
                            <img src={thumb} alt={product.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={14} className="text-neutral-300" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-black mb-1 line-clamp-2 leading-tight max-w-[260px] group-hover:text-neutral-600 transition-colors">
                            {product.title}
                          </p>
                          <p className="text-[10px] tracking-widest font-semibold text-neutral-400 uppercase">
                            {product.brandName || "—"}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-8 py-5 text-sm text-neutral-600 max-w-[140px] truncate">
                      {product.category || "—"}
                    </td>
                    <td className="px-8 py-5 text-sm font-semibold text-black whitespace-nowrap">
                      {product.priceValue ? `$${product.priceValue}` : "—"}
                    </td>
                    <td className="px-8 py-5 text-sm text-neutral-600">
                      {product.ratingStars ? (
                        <span className="flex items-center gap-1">
                          <span className="text-black font-semibold">{product.ratingStars}</span>
                          <span className="text-neutral-400 text-xs">({product.ratingCount})</span>
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/dashboard/seller/inventory/${product.asin}/edit`}
                          className="p-2 text-neutral-500 hover:bg-neutral-100 hover:text-black transition-colors"
                          title="Edit"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Pencil size={16} />
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(product)}
                          className="p-2 text-neutral-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {!loading && !error && processed.length > 0 && (
          <div className="p-8 flex items-center justify-between border-t border-neutral-100">
            <p className="text-xs text-neutral-400">
              Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, processed.length)} of {processed.length}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="w-10 h-10 border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 transition-colors disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              {(() => {
                const delta = 2;
                const range: (number | "…")[] = [];
                for (let i = 0; i < totalPages; i++) {
                  if (i === 0 || i === totalPages - 1 || (i >= page - delta && i <= page + delta)) {
                    range.push(i);
                  } else if (range[range.length - 1] !== "…") {
                    range.push("…");
                  }
                }
                return range.map((item, idx) =>
                  item === "…" ? (
                    <span key={`ellipsis-${idx}`} className="w-10 h-10 flex items-center justify-center text-neutral-400 text-xs">…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item as number)}
                      className={`w-10 h-10 border flex items-center justify-center text-xs font-bold transition-colors ${
                        page === item ? "border-black bg-black text-white" : "border-neutral-200 hover:bg-neutral-50"
                      }`}
                    >
                      {(item as number) + 1}
                    </button>
                  )
                );
              })()}
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="w-10 h-10 border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 transition-colors disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
