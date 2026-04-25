"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getProductDetail, type ProductDetailDto } from "@/lib/adminApi";
import {
  ArrowLeft, Edit3, ExternalLink, Loader2, Package, Star,
  Tag, Truck, Layers, ShieldCheck,
} from "lucide-react";
import Link from "next/link";

function StarRow({ value }: { value: string }) {
  const n = parseFloat(value) || 0;
  const full = Math.floor(n);
  const partial = Math.round((n - full) * 100);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="relative h-4 w-4">
          <Star size={16} className="text-neutral-200 fill-neutral-200 absolute inset-0" />
          {i <= full && <Star size={16} className="text-amber-400 fill-amber-400 absolute inset-0" />}
          {i === full + 1 && partial > 0 && (
            <div className="absolute inset-0 overflow-hidden" style={{ width: `${partial}%` }}>
              <Star size={16} className="text-amber-400 fill-amber-400" />
            </div>
          )}
        </div>
      ))}
      <span className="ml-1 text-sm font-semibold text-neutral-700">{n.toFixed(1)}</span>
    </div>
  );
}

function RatingBar({ label, pct }: { label: string; pct: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-neutral-500 w-6 text-right shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
        <div className="h-1.5 bg-amber-400 rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <span className="text-xs text-neutral-400 w-8">{pct}%</span>
    </div>
  );
}

export default function SellerProductDetailPage() {
  const { asin } = useParams<{ asin: string }>();
  const [product, setProduct] = useState<ProductDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    getProductDetail(asin)
      .then((p) => { setProduct(p); setActiveImg(0); })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [asin]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] text-neutral-400">
        <Loader2 size={20} className="animate-spin mr-2" /> Loading…
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-neutral-400 gap-3">
        <Package size={32} className="opacity-30" />
        <p className="text-sm">{error ?? "Product not found"}</p>
        <Link href="/dashboard/seller/inventory" className="text-xs underline text-black">← Back to Inventory</Link>
      </div>
    );
  }

  const images = Array.isArray(product.allImages) ? product.allImages.filter(Boolean) : [];
  const ratingBars = [
    { label: "5★", pct: parseInt(product.ratingDistribution5star) || 0 },
    { label: "4★", pct: parseInt(product.ratingDistribution4star) || 0 },
    { label: "3★", pct: parseInt(product.ratingDistribution3star) || 0 },
    { label: "2★", pct: parseInt(product.ratingDistribution2star) || 0 },
    { label: "1★", pct: parseInt(product.ratingDistribution1star) || 0 },
  ];

  return (
    <div className="px-10 pb-20 pt-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/dashboard/seller/inventory"
          className="flex items-center gap-2 text-[11px] uppercase tracking-widest font-semibold text-neutral-500 hover:text-black transition-colors"
        >
          <ArrowLeft size={13} /> Inventory
        </Link>
        <span className="text-neutral-300">/</span>
        <span className="text-[11px] uppercase tracking-widest font-semibold text-black truncate max-w-xs">
          {product.title}
        </span>
      </div>

      {/* Header bar */}
      <div className="flex items-start justify-between gap-6 mb-8">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-widest font-semibold text-neutral-400 mb-1">
            {product.brandName || "—"}
          </p>
          <h1 className="text-2xl font-semibold text-black leading-snug max-w-3xl">{product.title}</h1>
          <p className="mt-1 font-mono text-xs text-neutral-400">{asin}</p>
        </div>
        <div className="shrink-0 flex items-center gap-3">
          <Link
            href={`/product/${asin}`}
            target="_blank"
            className="flex items-center gap-2 border border-neutral-200 px-5 py-3 text-[11px] uppercase tracking-widest font-semibold text-neutral-600 hover:border-black hover:text-black transition-colors"
          >
            <ExternalLink size={13} /> View on Store
          </Link>
          <Link
            href={`/dashboard/seller/inventory/${asin}/edit`}
            className="flex items-center gap-2 bg-black text-white px-5 py-3 text-[11px] uppercase tracking-widest font-semibold hover:opacity-80 transition-opacity"
          >
            <Edit3 size={13} /> Edit Product
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Left: Images */}
        <div className="lg:col-span-2 space-y-4">
          <div className="aspect-square bg-neutral-100 border border-neutral-200 overflow-hidden">
            {images[activeImg] ? (
              <img
                src={images[activeImg]}
                alt={product.title}
                className="w-full h-full object-contain p-4"
                onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.png"; }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-300">
                <Package size={48} />
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {images.slice(0, 10).map((url, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`aspect-square bg-neutral-100 overflow-hidden border-2 transition-colors ${
                    activeImg === i ? "border-black" : "border-transparent hover:border-neutral-300"
                  }`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div className="lg:col-span-3 space-y-6">
          {/* Price + status */}
          <div className="bg-white border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[40px] font-semibold tracking-tight text-black leading-none">
                {product.priceValue ? `$${product.priceValue}` : "—"}
              </span>
              <span className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border ${
                product.availability?.toLowerCase().includes("stock")
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-neutral-200 bg-neutral-50 text-neutral-500"
              }`}>
                {product.availability || "—"}
              </span>
            </div>

            {product.ratingStars && (
              <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
                <StarRow value={product.ratingStars} />
                <span className="text-xs text-neutral-400">
                  {product.ratingCount ? `${product.ratingCount} reviews` : ""}
                </span>
              </div>
            )}
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Layers,      label: "Category",  value: product.breadcrumbs?.split(">").pop()?.trim() || "—" },
              { icon: Tag,         label: "Brand",     value: product.brandName || "—"                              },
              { icon: Truck,       label: "Delivery",  value: product.deliveryDate || "—"                           },
              { icon: ShieldCheck, label: "Seller",    value: product.sellerName || "—"                              },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-white border border-neutral-200 p-4 flex items-start gap-3">
                <div className="h-8 w-8 bg-neutral-50 flex items-center justify-center shrink-0">
                  <Icon size={14} className="text-neutral-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-widest font-semibold text-neutral-400 mb-0.5">{label}</p>
                  <p className="text-sm font-medium text-black truncate">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Rating distribution */}
          {product.ratingStars && (
            <div className="bg-white border border-neutral-200 p-5">
              <p className="text-[11px] uppercase tracking-widest font-semibold text-neutral-400 mb-4">Rating Distribution</p>
              <div className="space-y-2.5">
                {ratingBars.map((b) => <RatingBar key={b.label} {...b} />)}
              </div>
            </div>
          )}

          {/* About */}
          {product.aboutItem && (
            <div className="bg-white border border-neutral-200 p-5">
              <p className="text-[11px] uppercase tracking-widest font-semibold text-neutral-400 mb-3">About this item</p>
              <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">{product.aboutItem}</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
