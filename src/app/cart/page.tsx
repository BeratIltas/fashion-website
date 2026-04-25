"use client";

import Image from "next/image";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { useCart } from "@/contexts/CartContext";
import { ChevronLeft, ChevronRight, Tag, Loader2, Check, X, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { applyCoupon, getCart } from "@/lib/api";

function parseAllImages(allImages: unknown): string[] {
  const placeholder = ["/placeholder.png"];
  if (Array.isArray(allImages)) {
    const f = allImages.filter((x) => typeof x === "string" && x.trim());
    return f.length > 0 ? f : placeholder;
  }
  if (typeof allImages === "string") {
    const s = allImages.trim();
    if (!s) return placeholder;
    if (s.startsWith("http") || s.startsWith("/")) return [s];
    if (s.startsWith("[")) {
      try {
        const parsed = JSON.parse(s.replace(/'/g, '"'));
        if (Array.isArray(parsed)) {
          const f = parsed.filter((x) => typeof x === "string" && x.trim());
          return f.length > 0 ? f : placeholder;
        }
      } catch { return placeholder; }
    }
    return [s];
  }
  return placeholder;
}

function safePriceNumber(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number.parseFloat(v.replace(/[^0-9.,-]/g, "").replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function ProductImageGallery({ images, title }: { images: string[]; title: string }) {
  const [idx, setIdx] = useState(0);
  return (
    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-neutral-100 group">
      <Image
        src={images[idx]}
        alt={`${title} - Image ${idx + 1}`}
        fill
        className="object-cover transition-opacity duration-300"
        sizes="96px"
        unoptimized={images[idx].includes("amazon.com")}
        onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.png"; }}
      />
      {images.length > 1 && (
        <>
          <button type="button" onClick={(e) => { e.stopPropagation(); setIdx((p) => (p - 1 + images.length) % images.length); }}
            className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronLeft size={14} />
          </button>
          <button type="button" onClick={(e) => { e.stopPropagation(); setIdx((p) => (p + 1) % images.length); }}
            className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight size={14} />
          </button>
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <button key={i} type="button" onClick={(e) => { e.stopPropagation(); setIdx(i); }}
                className={`h-1 rounded-full transition-all ${i === idx ? "w-3 bg-white" : "w-1 bg-white/50 hover:bg-white/75"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Coupon Section ───────────────────────────────────────────────────────────

interface CouponSectionProps {
  appliedCode: string | undefined;
  onApplied: () => void;
}

function CouponSection({ appliedCode, onApplied }: CouponSectionProps) {
  const [open, setOpen] = useState(!!appliedCode);
  const [code, setCode] = useState(appliedCode ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(!!appliedCode);

  const handleApply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await applyCoupon(code.trim());
      setSuccess(true);
      onApplied();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Invalid coupon code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Tag size={14} className={appliedCode ? "text-emerald-500" : "text-neutral-400"} />
          {appliedCode ? (
            <span className="flex items-center gap-1.5">
              Coupon applied
              <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5">
                {appliedCode}
              </span>
            </span>
          ) : "Have a coupon code?"}
        </span>
        <ChevronDown size={14} className={`text-neutral-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-neutral-100 pt-3">
          {success ? (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2.5 text-sm text-emerald-700">
              <Check size={14} className="shrink-0" />
              <span>Coupon <span className="font-mono font-bold">{code}</span> applied successfully!</span>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleApply()}
                placeholder="Enter coupon code"
                className="flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm font-mono uppercase tracking-widest outline-none focus:border-neutral-400 focus:bg-white placeholder:text-neutral-400 placeholder:normal-case placeholder:tracking-normal transition-colors"
              />
              <button
                type="button"
                onClick={handleApply}
                disabled={loading || !code.trim()}
                className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-80 disabled:opacity-40 transition-opacity flex items-center gap-1.5"
              >
                {loading && <Loader2 size={13} className="animate-spin" />}
                Apply
              </button>
            </div>
          )}
          {error && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-red-600">
              <X size={11} /> {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CartPage() {
  const router = useRouter();
  const { cart, updateItem, removeItem, loading, refresh } = useCart();

  const handleQtyChange = (asin: string, qty: number) => {
    if (qty <= 0) removeItem(asin);
    else updateItem(asin, qty);
  };

  const handleCouponApplied = async () => {
    // Re-fetch cart to get discounted prices
    await refresh();
  };

  const items = cart?.items ?? [];
  const hasDiscount = !!cart?.appliedCouponCode && cart.originalTotalPrice != null && cart.originalTotalPrice > cart.totalPrice;

  return (
    <Container>
      <div className="grid gap-10 pt-28 pb-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        {/* Items list */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Shopping cart</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Review the items in your bag and adjust quantities before checkout.
          </p>

          {items.length === 0 ? (
            <div className="mt-10 rounded-3xl border border-dashed border-neutral-200 bg-neutral-50 px-6 py-10 text-center">
              <div className="text-sm font-medium text-neutral-800">Your cart is empty</div>
              <p className="mt-1 text-sm text-neutral-500">Browse the shop to add pieces to your look.</p>
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              {items.map((it) => {
                const images = parseAllImages((it as { product?: { allImages?: unknown } })?.product?.allImages);
                const unitPrice = safePriceNumber((it as { product?: { priceValue?: unknown } })?.product?.priceValue);
                const qty = it.quantity ?? 0;
                const discounted = it.discountedPrice != null && it.discountedPrice < unitPrice;

                return (
                  <div
                    key={it.id}
                    className="flex gap-4 rounded-3xl border border-neutral-200 bg-white p-4 transition-shadow hover:shadow-sm"
                  >
                    <ProductImageGallery images={images} title={it.product.title} />

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-neutral-900">
                        {it.product.title}
                      </div>
                      <div className="mt-0.5 text-xs text-neutral-500">{it.product.brandName}</div>

                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <div className="flex items-center rounded-full border border-neutral-200 px-2 py-1 text-xs">
                          <button type="button" className="px-2 text-neutral-600 disabled:text-neutral-300"
                            disabled={loading} onClick={() => handleQtyChange(it.product.asin, qty - 1)}>
                            −
                          </button>
                          <span className="min-w-[2rem] text-center text-sm">{qty}</span>
                          <button type="button" className="px-2 text-neutral-600 disabled:text-neutral-300"
                            disabled={loading} onClick={() => handleQtyChange(it.product.asin, qty + 1)}>
                            +
                          </button>
                        </div>
                        <button type="button" className="text-xs text-red-500 hover:text-red-600"
                          disabled={loading} onClick={() => removeItem(it.product.asin)}>
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between text-sm shrink-0">
                      <div className="text-right">
                        {discounted ? (
                          <>
                            <div className="text-xs text-neutral-400 line-through leading-none">
                              ${unitPrice.toFixed(2)}
                            </div>
                            <div className="font-bold text-emerald-600 leading-tight mt-0.5">
                              ${(it.discountedPrice!).toFixed(2)}
                            </div>
                          </>
                        ) : (
                          <div className="font-semibold">${unitPrice.toFixed(2)}</div>
                        )}
                      </div>

                      <div className="text-xs text-neutral-500 text-right">
                        Total:{" "}
                        {discounted ? (
                          <span className="font-semibold text-emerald-600">
                            ${(it.discountedPrice! * qty).toFixed(2)}
                          </span>
                        ) : (
                          <span className="font-medium text-neutral-900">
                            ${(unitPrice * qty).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Order summary */}
        <aside className="space-y-3 h-fit">
          <div className="rounded-3xl border border-neutral-200 bg-white p-5 space-y-3">
            <h2 className="text-sm font-semibold text-neutral-900 mb-1">Order summary</h2>

            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600">Items</span>
              <span className="font-medium text-neutral-900">{cart?.totalItems ?? 0}</span>
            </div>

            {hasDiscount ? (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Subtotal</span>
                  <span className="text-neutral-400 line-through">
                    ${(cart!.originalTotalPrice!).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <Tag size={12} />
                    Discount
                  </span>
                  <span className="font-semibold text-emerald-600">
                    −${(cart!.originalTotalPrice! - cart!.totalPrice).toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-neutral-100 pt-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-neutral-900">Total</span>
                  <span className="text-lg font-bold text-emerald-600">
                    ${cart!.totalPrice.toFixed(2)}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">Subtotal</span>
                <span className="text-base font-semibold text-neutral-900">
                  ${(cart?.totalPrice ?? 0).toFixed(2)}
                </span>
              </div>
            )}

            <p className="text-xs text-neutral-500">Taxes and shipping calculated at checkout.</p>

            <Button
              className="w-full mt-1"
              disabled={!cart || items.length === 0 || loading}
              onClick={() => router.push("/checkout")}
            >
              Checkout
            </Button>
          </div>

          {/* Coupon */}
          <CouponSection
            appliedCode={cart?.appliedCouponCode}
            onApplied={handleCouponApplied}
          />
        </aside>
      </div>
    </Container>
  );
}
