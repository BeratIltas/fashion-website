"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  getProduct,
  getProductReviews,
  getProductAiSummary,
  type ProductDetail,
  type ProductReview,
} from "@/lib/api";
import Container from "@/components/ui/Container";
import Link from "next/link";
import { ArrowLeft, Sparkles, Star, BadgeCheck, Loader2, ChevronDown } from "lucide-react";

function StarDisplay({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= rating ? "text-amber-400 fill-amber-400" : "text-neutral-200 fill-neutral-200"}
        />
      ))}
    </div>
  );
}

function RatingBar({
  label,
  pct,
  count,
  active,
  onClick,
}: {
  label: string;
  pct: number;
  count?: number;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 w-full rounded-xl px-2 py-1 transition-colors ${
        active ? "bg-amber-50" : "hover:bg-neutral-50"
      }`}
    >
      <span className={`w-3 text-right text-xs font-semibold shrink-0 ${active ? "text-amber-600" : "text-neutral-500"}`}>
        {label}
      </span>
      <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${active ? "bg-amber-500" : "bg-amber-400"}`}
          style={{ width: `${Math.max(pct, pct > 0 ? 4 : 0)}%` }}
        />
      </div>
      {count !== undefined && (
        <span className={`w-6 text-xs tabular-nums ${active ? "text-amber-600 font-semibold" : "text-neutral-400"}`}>
          {count}%
        </span>
      )}
    </button>
  );
}

function ReviewerAvatar({ name }: { name?: string }) {
  const initials = name
    ? name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";
  return (
    <div className="h-9 w-9 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-semibold text-neutral-600 shrink-0">
      {initials}
    </div>
  );
}

type SortKey = "default" | "highest" | "lowest";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "highest", label: "Highest rated" },
  { value: "lowest", label: "Lowest rated" },
];

export default function ProductReviewsPage() {
  const params = useParams<{ slug: string }>();
  const asin = params.slug;

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("default");
  const [sortOpen, setSortOpen] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  useEffect(() => {
    Promise.all([getProduct(asin), getProductReviews(asin)])
      .then(([p, r]) => { setProduct(p); setReviews(r); })
      .finally(() => setLoading(false));

    getProductAiSummary(asin)
      .then(setAiSummary)
      .finally(() => setAiLoading(false));
  }, [asin]);

  const overallRating = product ? parseFloat(product.ratingStars) || 0 : 0;
  const dist = product
    ? [
        { label: "5", pct: parseInt(product.ratingDistribution5star) || 0 },
        { label: "4", pct: parseInt(product.ratingDistribution4star) || 0 },
        { label: "3", pct: parseInt(product.ratingDistribution3star) || 0 },
        { label: "2", pct: parseInt(product.ratingDistribution2star) || 0 },
        { label: "1", pct: parseInt(product.ratingDistribution1star) || 0 },
      ]
    : [];

  const processed = useMemo(() => {
    let list = [...reviews];

    if (verifiedOnly) {
      list = list.filter((r) => r.verifiedPurchase === "true" || r.verifiedPurchase === "1");
    }

    if (filterRating !== null) {
      list = list.filter((r) => parseInt(r.rating) === filterRating);
    }

    if (sortKey === "highest") list.sort((a, b) => parseInt(b.rating) - parseInt(a.rating));
    else if (sortKey === "lowest") list.sort((a, b) => parseInt(a.rating) - parseInt(b.rating));

    return list;
  }, [reviews, filterRating, sortKey, verifiedOnly]);

  const activeSort = SORT_OPTIONS.find((o) => o.value === sortKey)!;

  if (loading) {
    return (
      <Container>
        <div className="flex items-center justify-center pt-40 pb-20">
          <Loader2 size={24} className="animate-spin text-neutral-400" />
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="pt-22 pb-20 max-w-3xl mx-auto">
        {/* Back link */}
        <Link
          href={`/product/${asin}`}
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-4"
        >
          <ArrowLeft size={14} />
          Back to product
        </Link>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Customer Reviews</h1>
          {product && (
            <p className="mt-1.5 text-sm text-neutral-500 line-clamp-1">{product.title}</p>
          )}
        </div>

        {/* Rating overview */}
        {product && overallRating > 0 && (
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 mb-6 flex flex-col sm:flex-row gap-6">
            <div className="flex flex-col items-center justify-center sm:border-r border-neutral-100 sm:pr-8 sm:min-w-[120px]">
              <span className="text-5xl font-semibold tracking-tight text-neutral-900 leading-none">
                {overallRating.toFixed(1)}
              </span>
              <StarDisplay rating={Math.round(overallRating)} size={16} />
              <span className="mt-1 text-xs text-neutral-400">{product.ratingCount} reviews</span>
            </div>
            <div className="flex-1 space-y-1 justify-center flex flex-col">
              {dist.map((d) => (
                <RatingBar
                  key={d.label}
                  label={d.label}
                  pct={d.pct}
                  count={d.pct}
                  active={filterRating === parseInt(d.label)}
                  onClick={() =>
                    setFilterRating((prev) =>
                      prev === parseInt(d.label) ? null : parseInt(d.label)
                    )
                  }
                />
              ))}
            </div>
          </div>
        )}

        {/* AI Summary */}
        <div className="rounded-3xl overflow-hidden mb-8 border border-amber-100">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 flex items-center gap-2.5 border-b border-amber-100">
            <div className="h-7 w-7 rounded-full bg-amber-400/20 flex items-center justify-center shrink-0">
              <Sparkles size={14} className="text-amber-600" />
            </div>
            <span className="text-sm font-semibold text-amber-900">AI Review Summary</span>
            <span className="ml-auto text-[10px] font-semibold uppercase tracking-widest text-amber-500 bg-amber-100 px-2 py-0.5 rounded-full">
              Beta
            </span>
          </div>
          <div className="bg-gradient-to-b from-amber-50/40 to-white px-6 py-5">
            {aiLoading ? (
              <div className="flex items-center gap-2.5 text-neutral-400">
                <Loader2 size={14} className="animate-spin" />
                <span className="text-sm">Analysing reviews…</span>
              </div>
            ) : aiSummary ? (
              <p className="text-sm text-neutral-700 leading-relaxed">{aiSummary}</p>
            ) : (
              <p className="text-sm text-neutral-400 italic">No AI summary available for this product yet.</p>
            )}
          </div>
        </div>

        {/* Filter / Sort bar */}
        {reviews.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-5">
            {/* Star filter chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[5, 4, 3, 2, 1].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFilterRating((prev) => (prev === s ? null : s))}
                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                    filterRating === s
                      ? "border-amber-400 bg-amber-50 text-amber-700"
                      : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
                  }`}
                >
                  <Star
                    size={10}
                    className={filterRating === s ? "fill-amber-400 text-amber-400" : "fill-neutral-300 text-neutral-300"}
                  />
                  {s}
                </button>
              ))}
            </div>

            {/* Verified only toggle */}
            <button
              type="button"
              onClick={() => setVerifiedOnly((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                verifiedOnly
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                  : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
              }`}
            >
              <BadgeCheck size={11} />
              Verified only
            </button>

            {/* Sort dropdown */}
            <div className="relative ml-auto">
              <button
                type="button"
                onClick={() => setSortOpen((o) => !o)}
                className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold text-neutral-600 hover:border-neutral-300 transition-colors"
              >
                {activeSort.label}
                <ChevronDown size={11} className={`transition-transform ${sortOpen ? "rotate-180" : ""}`} />
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-full mt-1.5 z-20 min-w-[150px] rounded-2xl border border-neutral-200 bg-white shadow-lg overflow-hidden">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => { setSortKey(opt.value); setSortOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors ${
                        sortKey === opt.value
                          ? "bg-neutral-50 text-neutral-900 font-semibold"
                          : "text-neutral-600 hover:bg-neutral-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Active filter summary */}
            {(filterRating !== null || verifiedOnly || sortKey !== "default") && (
              <button
                type="button"
                onClick={() => { setFilterRating(null); setVerifiedOnly(false); setSortKey("default"); }}
                className="text-[11px] text-neutral-400 hover:text-neutral-700 underline transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
        )}

        {/* Result count */}
        {reviews.length > 0 && (
          <p className="text-xs text-neutral-400 mb-4">
            {processed.length} of {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            {filterRating !== null && ` · ${filterRating}-star`}
            {verifiedOnly && " · verified"}
          </p>
        )}

        {/* Reviews list */}
        {reviews.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-neutral-200 bg-neutral-50 px-6 py-16 text-center">
            <p className="text-sm font-medium text-neutral-500">No reviews yet</p>
            <p className="mt-1 text-xs text-neutral-400">Be the first to leave a review from your orders.</p>
          </div>
        ) : processed.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-neutral-200 bg-neutral-50 px-6 py-16 text-center">
            <p className="text-sm font-medium text-neutral-500">No reviews match your filters</p>
            <button
              type="button"
              onClick={() => { setFilterRating(null); setVerifiedOnly(false); }}
              className="mt-3 text-xs text-neutral-500 underline hover:text-neutral-900 transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {processed.map((r) => {
              const rating = parseInt(r.rating) || 0;
              const isVerified = r.verifiedPurchase === "true" || r.verifiedPurchase === "1";
              return (
                <article key={r.id} className="rounded-3xl border border-neutral-200 bg-white p-5 hover:border-neutral-300 transition-colors">
                  <div className="flex items-start gap-3.5 mb-3">
                    <ReviewerAvatar name={r.userName} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-neutral-900">
                          {r.userName || "Anonymous"}
                        </span>
                        {isVerified && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5">
                            <BadgeCheck size={9} /> Verified purchase
                          </span>
                        )}
                        {r.createdByCurrentUser && (
                          <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-2 py-0.5">
                            Your review
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <StarDisplay rating={rating} size={12} />
                        {r.reviewMetadata && (
                          <span className="text-[11px] text-neutral-400">{r.reviewMetadata}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {r.reviewTitle && (
                    <h2 className="text-sm font-semibold text-neutral-900 mb-1.5">{r.reviewTitle}</h2>
                  )}
                  <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line">{r.reviewText}</p>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </Container>
  );
}
