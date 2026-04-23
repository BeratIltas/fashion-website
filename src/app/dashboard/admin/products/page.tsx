"use client";

import { useEffect, useState } from "react";
import { getAdminProducts, type AdminProduct } from "@/lib/adminApi";
import AdminBell from "@/components/dashboard/AdminBell";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  LoaderCircle,
  Package,
  Search,
  Star,
  User,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

const PAGE_SIZE = 20;

function StarRating({ value }: { value: string }) {
  const n = parseFloat(value) || 0;
  const full = Math.floor(n);
  const pct = Math.round((n - full) * 100);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="relative h-3 w-3">
          <Star size={12} className="text-neutral-200 fill-neutral-200 absolute inset-0" />
          {i <= full && <Star size={12} className="text-amber-400 fill-amber-400 absolute inset-0" />}
          {i === full + 1 && pct > 0 && (
            <div className="absolute inset-0 overflow-hidden" style={{ width: `${pct}%` }}>
              <Star size={12} className="text-amber-400 fill-amber-400" />
            </div>
          )}
        </div>
      ))}
      <span className="ml-0.5 text-[10px] font-semibold text-neutral-500">{n.toFixed(1)}</span>
    </div>
  );
}

export default function AdminProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [sellerInput, setSellerInput] = useState("");
  const [appliedSeller, setAppliedSeller] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    setError(null);
    getAdminProducts({ sellerName: appliedSeller || undefined, page, size: PAGE_SIZE })
      .then((data) => {
        setProducts(data);
        setHasMore(data.length === PAGE_SIZE);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [page, appliedSeller]);

  const handleApply = () => { setPage(0); setAppliedSeller(sellerInput.trim()); };
  const handleClear = () => { setSellerInput(""); setPage(0); setAppliedSeller(""); };

  const visible = search
    ? products.filter(
        (p) =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.asin.toLowerCase().includes(search.toLowerCase()) ||
          p.brandName?.toLowerCase().includes(search.toLowerCase())
      )
    : products;

  function getImage(p: AdminProduct) {
    if (!p.allImages?.length) return null;
    return typeof p.allImages[0] === "string" ? p.allImages[0] : null;
  }

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center gap-4 border-b border-neutral-200 bg-white px-6 py-3 shrink-0">
        <div className="flex items-center gap-2 flex-1 max-w-sm rounded-lg border border-neutral-200 bg-neutral-50 px-3.5 py-2 focus-within:border-orange-400 focus-within:bg-white transition-colors">
          <Search size={13} className="text-neutral-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search within page..."
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
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-[28px] font-semibold tracking-tight text-neutral-900">Products</h1>
              <p className="mt-0.5 text-sm text-neutral-500">Page {page + 1} · {visible.length} shown</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center rounded-lg border border-neutral-200 bg-white focus-within:border-orange-400 transition-colors">
                <User size={13} className="ml-3 text-neutral-400 shrink-0" />
                <input
                  value={sellerInput}
                  onChange={(e) => setSellerInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleApply()}
                  placeholder="Filter by seller..."
                  className="px-2.5 py-2 text-xs outline-none placeholder:text-neutral-400 text-neutral-800 w-44 bg-transparent"
                />
                {sellerInput && (
                  <button onClick={handleClear} className="mr-2 text-neutral-400 hover:text-neutral-700">
                    <X size={11} />
                  </button>
                )}
              </div>
              <button
                onClick={handleApply}
                disabled={loading}
                className="rounded-lg bg-orange-500 px-4 py-2.5 text-xs font-semibold text-white hover:bg-orange-600 disabled:opacity-50 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
          {appliedSeller && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[11px] text-neutral-400">Filtered by:</span>
              <span className="flex items-center gap-1.5 rounded-full bg-orange-500 text-white px-3 py-1 text-[11px] font-semibold">
                Seller: {appliedSeller}
                <button onClick={handleClear} className="opacity-70 hover:opacity-100 ml-0.5">
                  <X size={10} />
                </button>
              </span>
            </div>
          )}
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">{error}</div>}

          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-20 text-neutral-400">
                <LoaderCircle size={18} className="animate-spin mr-2" /> Loading products...
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-100 text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
                    <th className="px-6 py-3.5 text-left">Product</th>
                    <th className="px-6 py-3.5 text-left">Category</th>
                    <th className="px-6 py-3.5 text-left">Rating</th>
                    <th className="px-6 py-3.5 text-right">Price</th>
                    <th className="px-6 py-3.5 text-left">Seller</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {visible.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-16 text-center">
                        <Package size={24} className="mx-auto mb-2 text-neutral-300" />
                        <p className="text-sm text-neutral-400">No products found</p>
                      </td>
                    </tr>
                  )}
                  {visible.map((p) => {
                    const img = getImage(p);
                    return (
                      <tr key={p.asin} className="hover:bg-orange-50/30 transition-colors group cursor-pointer">
                        <td className="px-6 py-4">
                          <Link href={`/dashboard/admin/products/${p.asin}`} className="flex items-center gap-3.5">
                            <div className="shrink-0">
                              {img ? (
                                <img src={img} alt="" className="h-11 w-11 object-cover rounded-lg bg-neutral-100 border border-neutral-100" />
                              ) : (
                                <div className="h-11 w-11 rounded-lg bg-neutral-100 flex items-center justify-center border border-neutral-100">
                                  <Package size={15} className="text-neutral-400" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate max-w-[220px] text-xs font-semibold text-neutral-900 group-hover:text-orange-600 transition-colors">
                                {p.title}
                              </p>
                              <p className="flex items-center gap-1.5 mt-0.5">
                                <span className="font-mono text-[10px] text-neutral-400">{p.asin}</span>
                                {p.brandName && (
                                  <>
                                    <span className="text-neutral-200">·</span>
                                    <span className="text-[10px] text-neutral-500">{p.brandName}</span>
                                  </>
                                )}
                              </p>
                            </div>
                            <ExternalLink size={11} className="ml-1 shrink-0 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          {p.category ? (
                            <span className="rounded-full px-2.5 py-1 text-[10px] font-semibold bg-neutral-100 text-neutral-700">
                              {p.category}
                            </span>
                          ) : (
                            <span className="text-xs text-neutral-300">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {p.ratingStars ? (
                            <div>
                              <StarRating value={p.ratingStars} />
                              {p.ratingCount && <p className="mt-0.5 text-[10px] text-neutral-400">{p.ratingCount} reviews</p>}
                            </div>
                          ) : (
                            <span className="text-xs text-neutral-300">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-semibold text-neutral-900">{p.priceValue || "—"}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="h-7 w-7 shrink-0 rounded-full bg-orange-50 flex items-center justify-center text-[10px] font-bold text-orange-600">
                              {p.ownerFullName?.[0] ?? "?"}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate max-w-[130px] text-xs font-medium text-neutral-800">{p.ownerFullName || "—"}</p>
                              <p className="truncate max-w-[130px] text-[10px] text-neutral-400">{p.ownerEmail}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-neutral-500">
              Page <span className="font-semibold text-neutral-900">{page + 1}</span>
              {!hasMore && <span className="ml-1 text-neutral-400">· Last page</span>}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page === 0 || loading}
                onClick={() => setPage((p) => p - 1)}
                className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-xs font-medium text-neutral-700 hover:border-orange-400 hover:text-orange-600 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={13} /> Prev
              </button>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-xs font-bold text-white">
                {page + 1}
              </span>
              <button
                disabled={!hasMore || loading}
                onClick={() => setPage((p) => p + 1)}
                className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-xs font-medium text-neutral-700 hover:border-orange-400 hover:text-orange-600 disabled:opacity-40 transition-colors"
              >
                Next <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
