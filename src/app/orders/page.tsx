"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Container from "@/components/ui/Container";
import {
  getMyOrders,
  getMyReturns,
  submitReturn,
  submitProductReview,
  type Order,
  type OrderItem,
  type ReturnItem,
} from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import Button from "@/components/ui/Button";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Package,
  Pencil,
  RotateCcw,
  Star,
  X,
} from "lucide-react";

// ─── Write Review Modal ───────────────────────────────────────────────────────

function StarSelector({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(i)}
          className="p-0.5 transition-transform hover:scale-110"
        >
          <Star
            size={28}
            className={
              i <= (hovered || value)
                ? "text-amber-400 fill-amber-400"
                : "text-neutral-200 fill-neutral-200"
            }
          />
        </button>
      ))}
    </div>
  );
}

const RATING_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

function WriteReviewModal({
  item,
  onClose,
  onSuccess,
}: {
  item: OrderItem;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setError("Please select a star rating."); return; }
    if (text.trim().length < 10) { setError("Review must be at least 10 characters."); return; }
    setSubmitting(true);
    setError(null);
    try {
      await submitProductReview(item.product.asin, { reviewTitle: title.trim(), reviewText: text.trim(), rating });
      setDone(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1800);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h2 className="text-base font-semibold text-neutral-900">Write a Review</h2>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-neutral-100 transition-colors text-neutral-400 hover:text-neutral-700">
            <X size={16} />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 gap-3">
            <div className="h-14 w-14 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 size={28} className="text-emerald-500" />
            </div>
            <p className="text-base font-semibold text-neutral-900">Review submitted!</p>
            <p className="text-sm text-neutral-500">Thank you for your feedback.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
            {/* Product name */}
            <p className="text-sm text-neutral-500 line-clamp-2">{item.product.title}</p>

            {/* Star rating */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-2">
                Rating
              </label>
              <div className="flex items-center gap-3">
                <StarSelector value={rating} onChange={setRating} />
                {rating > 0 && (
                  <span className="text-sm font-medium text-neutral-600">{RATING_LABELS[rating]}</span>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-2">
                Review Title <span className="text-neutral-300 normal-case tracking-normal font-normal">(optional)</span>
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Summarise your experience…"
                className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-neutral-400 focus:bg-white placeholder:text-neutral-400 transition-colors"
              />
            </div>

            {/* Text */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-2">
                Your Review
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                placeholder="What did you think about this product?"
                className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-neutral-400 focus:bg-white placeholder:text-neutral-400 transition-colors resize-none"
              />
              <p className="mt-1 text-[11px] text-neutral-400 text-right">{text.length} chars</p>
            </div>

            {error && (
              <p className="rounded-2xl bg-red-50 border border-red-100 px-4 py-2.5 text-xs text-red-600">{error}</p>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-2xl border border-neutral-200 py-2.5 text-sm font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-2xl bg-black py-2.5 text-sm font-semibold text-white hover:opacity-80 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                Submit Review
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Return Order Modal ───────────────────────────────────────────────────────

function ReturnOrderModal({
  order,
  onClose,
  onSuccess,
}: {
  order: Order;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 10) {
      setError("Please describe your reason (at least 10 characters).");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await submitReturn(order.id, reason.trim());
      setDone(true);
      setTimeout(() => { onSuccess(); onClose(); }, 2000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to submit return request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-50 to-red-50 border-b border-rose-100 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <RotateCcw size={18} className="text-rose-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-neutral-900">Request Return</h2>
                <p className="text-xs text-neutral-500 mt-0.5">Order #{order.id}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 hover:bg-rose-100 transition-colors text-neutral-400 hover:text-neutral-600 mt-0.5"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {done ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 gap-3">
            <div className="h-14 w-14 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 size={28} className="text-emerald-500" />
            </div>
            <p className="text-base font-semibold text-neutral-900">Return request submitted!</p>
            <p className="text-sm text-neutral-500 text-center">
              We&apos;ll review your request and get back to you shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
            {/* Order items preview */}
            <div className="rounded-2xl bg-neutral-50 border border-neutral-100 p-4 space-y-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-3">
                Items in this order
              </p>
              {order.items.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-lg bg-neutral-200 flex items-center justify-center shrink-0">
                    <Package size={13} className="text-neutral-500" />
                  </div>
                  <p className="text-xs text-neutral-700 line-clamp-1 flex-1 font-medium">
                    {item.product.title}
                  </p>
                  <span className="text-[11px] text-neutral-400 shrink-0">×{item.quantity}</span>
                </div>
              ))}
              {order.items.length > 3 && (
                <p className="text-xs text-neutral-400 pl-10">
                  +{order.items.length - 3} more item{order.items.length - 3 !== 1 ? "s" : ""}
                </p>
              )}
            </div>

            {/* Reason textarea */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-2">
                Return Reason
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                placeholder="Please describe why you'd like to return this order…"
                className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-neutral-400 focus:bg-white placeholder:text-neutral-400 transition-colors resize-none"
              />
              <p className="mt-1 text-[11px] text-neutral-400 text-right">{reason.length} chars</p>
            </div>

            {/* Info note */}
            <div className="flex items-start gap-2.5 rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3">
              <AlertCircle size={14} className="text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700 leading-relaxed">
                Return requests are reviewed within 3–5 business days. You&apos;ll be notified once your request is processed.
              </p>
            </div>

            {error && (() => {
              const clean = error.replace(/^\[\d+\]\s*(Error:\s*)?/i, "").trim();
              const isExpired = clean.toLowerCase().includes("14 days") || clean.toLowerCase().includes("passed");
              return (
                <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3.5 flex items-start gap-3">
                  <div className="shrink-0 h-7 w-7 rounded-xl bg-red-100 flex items-center justify-center mt-0.5">
                    {isExpired
                      ? <AlertCircle size={13} className="text-red-600" />
                      : <AlertCircle size={13} className="text-red-600" />}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-red-700 mb-0.5">
                      {isExpired ? "Return window closed" : "Unable to process return"}
                    </p>
                    <p className="text-xs text-red-600 leading-relaxed">{clean}</p>
                  </div>
                </div>
              );
            })()}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-2xl border border-neutral-200 py-2.5 text-sm font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-2xl bg-rose-600 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                Submit Return
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function safePriceNumber(priceValue: unknown): number {
  if (typeof priceValue === "number" && Number.isFinite(priceValue)) return priceValue;
  if (typeof priceValue === "string") {
    const cleaned = priceValue.replace(/[^0-9.,-]/g, "").replace(",", ".");
    const n = Number.parseFloat(cleaned);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

const STATUS_CONFIG: Record<string, { bg: string; text: string }> = {
  DELIVERED:  { bg: "bg-emerald-50",  text: "text-emerald-700"  },
  SHIPPED:    { bg: "bg-sky-50",      text: "text-sky-700"      },
  PROCESSING: { bg: "bg-amber-50",    text: "text-amber-700"    },
  PENDING:    { bg: "bg-neutral-100", text: "text-neutral-600"  },
  CANCELLED:  { bg: "bg-red-50",      text: "text-red-600"      },
};

const RETURN_STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  PENDING:   { bg: "bg-rose-50",    text: "text-rose-600",    label: "Return Pending"  },
  APPROVED:  { bg: "bg-emerald-50", text: "text-emerald-700", label: "Return Approved" },
  REJECTED:  { bg: "bg-red-50",     text: "text-red-600",     label: "Return Rejected" },
};

function statusCfg(s: string) {
  return STATUS_CONFIG[s?.toUpperCase()] ?? STATUS_CONFIG.PENDING;
}

function returnStatusCfg(s: string) {
  return RETURN_STATUS_CONFIG[s?.toUpperCase()] ?? RETURN_STATUS_CONFIG.PENDING;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [returnsMap, setReturnsMap] = useState<Map<number, ReturnItem>>(new Map());
  const [loading, setLoading] = useState(true);
  const [reviewTarget, setReviewTarget] = useState<OrderItem | null>(null);
  const [returnTarget, setReturnTarget] = useState<Order | null>(null);

  const loadData = () => {
    if (!user) { setLoading(false); return; }
    Promise.all([getMyOrders(), getMyReturns().catch(() => [] as ReturnItem[])])
      .then(([ordersData, returnsData]) => {
        setOrders(ordersData.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()));
        const map = new Map<number, ReturnItem>();
        for (const r of returnsData) map.set(r.orderId, r);
        setReturnsMap(map);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (loading) {
    return (
      <Container>
        <div className="flex items-center justify-center pt-40 pb-20">
          <Loader2 size={24} className="animate-spin text-neutral-400" />
        </div>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container>
        <div className="py-28 text-center">
          <h1 className="text-2xl font-bold mb-2">Please log in</h1>
          <p className="text-neutral-500 mb-6">You need to be logged in to view your orders.</p>
          <Link href="/login"><Button>Log in</Button></Link>
        </div>
      </Container>
    );
  }

  return (
    <>
      {reviewTarget && (
        <WriteReviewModal
          item={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onSuccess={() => setReviewTarget(null)}
        />
      )}
      {returnTarget && (
        <ReturnOrderModal
          order={returnTarget}
          onClose={() => setReturnTarget(null)}
          onSuccess={() => {
            setReturnTarget(null);
            loadData();
          }}
        />
      )}

      <Container>
        <div className="py-20">
          <div className="mb-10">
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">My Orders</h1>
            <p className="mt-1 text-sm text-neutral-500">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
          </div>

          {orders.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-neutral-200 bg-neutral-50 px-6 py-20 text-center">
              <p className="text-lg font-medium text-neutral-900">No orders yet</p>
              <p className="mt-2 text-neutral-500 mb-6">You haven&apos;t placed any orders.</p>
              <Link href="/shop"><Button>Start Shopping</Button></Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const cfg = statusCfg(order.status);
                const existingReturn = returnsMap.get(order.id);
                const canReturn = order.status?.toUpperCase() === "DELIVERED" && !existingReturn;

                return (
                  <div key={order.id} className="rounded-3xl border border-neutral-200 bg-white overflow-hidden">
                    {/* Order header */}
                    <div className="bg-neutral-50 border-b border-neutral-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-x-8 gap-y-1 text-sm">
                        <div>
                          <span className="text-neutral-400 text-xs">Order</span>
                          <p className="font-semibold text-neutral-900">#{order.id}</p>
                        </div>
                        <div>
                          <span className="text-neutral-400 text-xs">Date</span>
                          <p className="font-medium text-neutral-900">
                            {new Date(order.orderDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                          </p>
                        </div>
                        <div>
                          <span className="text-neutral-400 text-xs">Total</span>
                          <p className="font-semibold text-neutral-900">${order.totalAmount.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                        {/* Return status badge */}
                        {existingReturn && (() => {
                          const rcfg = returnStatusCfg(existingReturn.status);
                          return (
                            <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${rcfg.bg} ${rcfg.text}`}>
                              <RotateCcw size={10} />
                              {rcfg.label}
                            </span>
                          );
                        })()}

                        {/* Order status badge */}
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
                          {order.status}
                        </span>

                        {/* Return button */}
                        {canReturn && (
                          <button
                            onClick={() => setReturnTarget(order)}
                            className="flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-100 hover:border-rose-300 transition-colors whitespace-nowrap"
                          >
                            <RotateCcw size={10} />
                            Return
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Items */}
                    <div className="divide-y divide-neutral-100 px-6">
                      {order.items.map((item) => {
                        const price = item.priceAtPurchase || safePriceNumber(item.product.priceValue);
                        let imageSrc = "/placeholder.png";
                        if (item.product.allImages) {
                          const imgs = typeof item.product.allImages === "string"
                            ? [item.product.allImages]
                            : item.product.allImages;
                          if (imgs.length > 0) imageSrc = imgs[0];
                        }
                        if (imageSrc.startsWith("[")) {
                          try {
                            const parsed = JSON.parse(imageSrc.replace(/'/g, '"'));
                            if (Array.isArray(parsed) && parsed.length > 0) imageSrc = parsed[0];
                          } catch { /* */ }
                        }

                        return (
                          <div key={item.id} className="py-4 first:pt-5 last:pb-5 flex gap-4 items-center">
                            <Link href={`/product/${item.product.asin}`} className="relative h-20 w-16 shrink-0 overflow-hidden rounded-2xl bg-neutral-100 block hover:opacity-90 transition-opacity">
                              <Image
                                src={imageSrc}
                                alt={item.product.title}
                                fill
                                className="object-cover"
                                sizes="64px"
                                unoptimized={imageSrc.includes("amazon.com")}
                                onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.png"; }}
                              />
                            </Link>
                            <Link href={`/product/${item.product.asin}`} className="flex-1 min-w-0 group">
                              <p className="font-medium text-neutral-900 text-sm leading-snug line-clamp-2 group-hover:underline">{item.product.title}</p>
                              {item.product.brandName && (
                                <p className="text-xs text-neutral-400 mt-0.5">{item.product.brandName}</p>
                              )}
                              <p className="text-sm font-semibold text-neutral-900 mt-1">
                                {item.quantity} × ${price.toFixed(2)}
                              </p>
                            </Link>
                            <div className="shrink-0 flex flex-col gap-2 items-end">
                              <button
                                onClick={() => setReviewTarget(item)}
                                className="flex items-center gap-1.5 rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 transition-colors whitespace-nowrap"
                              >
                                <Pencil size={11} />
                                Review
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Container>
    </>
  );
}
