"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getAdminProducts, deleteProduct, type AdminProduct } from "@/lib/adminApi";
import { Plus, Filter, ArrowUpDown, Pencil, Trash2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";

const TABS = ["All Products", "Active", "Drafts", "Out of Stock"] as const;

export default function InventoryPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("All Products");
  const [page, setPage] = useState(0);
  const [deletingAsin, setDeletingAsin] = useState<string | null>(null);

  const PAGE_SIZE = 10;

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminProducts({ sellerId: user.id, page, size: 50 });
      setProducts(data);
    } catch {
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, [user, page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (asin: string) => {
    if (!confirm("Delete this product?")) return;
    setDeletingAsin(asin);
    try {
      await deleteProduct(asin);
      setProducts((prev) => prev.filter((p) => p.asin !== asin));
    } catch {
      alert("Failed to delete product.");
    } finally {
      setDeletingAsin(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const paginated = products.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const stats = {
    total: products.length,
    active: products.length,
    lowStock: 0,
    drafts: 0,
  };

  return (
    <div className="px-10 pb-20 pt-10 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-10">
        <div>
          <h1 className="text-[32px] font-semibold tracking-tight text-black leading-tight mb-2">
            Inventory Management
          </h1>
          <p className="text-sm text-neutral-500 max-w-md">
            Manage your seasonal collection, track stock levels, and curate your boutique&apos;s digital presence.
          </p>
        </div>
        <Link
          href="/dashboard/seller/inventory/add"
          className="mt-4 md:mt-0 bg-black text-white px-8 py-4 text-[12px] uppercase tracking-widest font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Plus size={16} />
          Add New Product
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
        <div className="bg-white border border-neutral-200 p-6">
          <p className="text-[11px] tracking-widest font-semibold text-neutral-400 uppercase mb-2">
            Total Products
          </p>
          <p className="text-[48px] font-semibold leading-none tracking-tight text-black">{stats.total}</p>
        </div>
        <div className="bg-white border border-neutral-200 p-6">
          <p className="text-[11px] tracking-widest font-semibold text-neutral-400 uppercase mb-2">
            Active Listings
          </p>
          <p className="text-[48px] font-semibold leading-none tracking-tight text-black">{stats.active}</p>
        </div>
        <div className="bg-white border border-neutral-200 p-6">
          <p className="text-[11px] tracking-widest font-semibold text-neutral-400 uppercase mb-2">
            Low Stock Items
          </p>
          <p className="text-[48px] font-semibold leading-none tracking-tight text-red-600">{stats.lowStock}</p>
        </div>
        <div className="bg-white border border-neutral-200 p-6">
          <p className="text-[11px] tracking-widest font-semibold text-neutral-400 uppercase mb-2">
            Drafts
          </p>
          <p className="text-[48px] font-semibold leading-none tracking-tight text-black">{stats.drafts}</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between py-6 border-b border-neutral-200 mb-2">
        <div className="flex gap-8">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-[12px] tracking-widest font-semibold uppercase transition-colors ${
                activeTab === tab
                  ? "text-black border-b-2 border-black pb-1"
                  : "text-neutral-400 hover:text-black"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 text-[10px] tracking-widest font-semibold text-neutral-500 border border-neutral-200 px-4 py-2 hover:bg-neutral-50 transition-colors uppercase">
            <Filter size={14} />
            Filter by Category
          </button>
          <button className="flex items-center gap-2 text-[10px] tracking-widest font-semibold text-neutral-500 border border-neutral-200 px-4 py-2 hover:bg-neutral-50 transition-colors uppercase">
            <ArrowUpDown size={14} />
            Sort: Newest
          </button>
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
            <Link href="/dashboard/seller/inventory/add" className="underline text-black">
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
                    className={`px-8 py-4 text-[11px] uppercase tracking-widest font-semibold text-neutral-500 ${
                      i === 4 ? "text-right" : ""
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {paginated.map((product) => {
                const thumb = Array.isArray(product.allImages)
                  ? product.allImages[0]
                  : undefined;
                return (
                  <tr key={product.asin} className="hover:bg-neutral-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-20 bg-neutral-100 flex-shrink-0 overflow-hidden">
                          {thumb ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={thumb}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-300 text-xs">
                              No img
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-black mb-1 line-clamp-2 leading-tight">
                            {product.title}
                          </p>
                          <p className="text-[10px] tracking-widest font-semibold text-neutral-400 uppercase">
                            {product.brandName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm text-neutral-600 max-w-[140px] truncate">
                      {product.category || "—"}
                    </td>
                    <td className="px-8 py-6 text-sm font-semibold text-black whitespace-nowrap">
                      {product.priceValue ? `$${product.priceValue}` : "—"}
                    </td>
                    <td className="px-8 py-6 text-sm text-neutral-600">
                      {product.ratingStars ? (
                        <span className="flex items-center gap-1">
                          <span className="text-black font-semibold">{product.ratingStars}</span>
                          <span className="text-neutral-400 text-xs">({product.ratingCount})</span>
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/dashboard/seller/inventory/${product.asin}/edit`}
                          className="p-2 text-neutral-500 hover:bg-neutral-100 hover:text-black transition-colors"
                        >
                          <Pencil size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.asin)}
                          disabled={deletingAsin === product.asin}
                          className="p-2 text-neutral-500 hover:bg-neutral-100 hover:text-red-600 transition-colors disabled:opacity-40"
                        >
                          {deletingAsin === product.asin ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {!loading && !error && products.length > 0 && (
          <div className="p-8 flex items-center justify-between border-t border-neutral-100">
            <p className="text-xs text-neutral-400">
              Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, products.length)} of{" "}
              {products.length} products
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="w-10 h-10 border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 transition-colors disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i).map((i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-10 h-10 border flex items-center justify-center text-xs font-bold transition-colors ${
                    page === i
                      ? "border-black bg-black text-white"
                      : "border-neutral-200 hover:bg-neutral-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
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
