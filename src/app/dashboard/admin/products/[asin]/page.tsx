"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getProductDetail,
  getProductReviews,
  updateProduct,
  deleteProduct,
  type ProductDetailDto,
  type ReviewDto,
  type ProductUpdateDto,
} from "@/lib/adminApi";
import AdminBell from "@/components/dashboard/AdminBell";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Edit3,
  LoaderCircle,
  Package,
  Save,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

function RatingBar({ label, value }: { label: string; value: string }) {
  const n = parseInt(value) || 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-4 text-right text-xs text-neutral-400 shrink-0">{label}</span>
      <div className="flex-1 h-1 bg-neutral-100 overflow-hidden">
        <div className="h-1 bg-black transition-all" style={{ width: `${Math.min(n, 100)}%` }} />
      </div>
      <span className="w-8 text-xs text-neutral-500 tabular-nums">{n}%</span>
    </div>
  );
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={12} className={i <= rating ? "text-neutral-700 fill-neutral-700" : "text-neutral-200 fill-neutral-200"} />
      ))}
    </div>
  );
}

export default function AdminProductDetailPage() {
  const { asin } = useParams<{ asin: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [product, setProduct] = useState<ProductDetailDto | null>(null);
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeImage, setActiveImage] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [form, setForm] = useState<ProductUpdateDto>({});

  useEffect(() => {
    Promise.all([getProductDetail(asin), getProductReviews(asin)])
      .then(([p, r]) => {
        setProduct(p);
        setReviews(r);
        setForm({ title: p.title, priceValue: p.priceValue, brandName: p.brandName, availability: p.availability, aboutItem: p.aboutItem });
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [asin]);

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      await updateProduct(asin, form);
      setSaveSuccess(true);
      setEditMode(false);
      setProduct((prev) => prev ? { ...prev, ...form } : prev);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteProduct(asin);
      router.push("/dashboard/admin/products");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to delete");
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const images = product?.allImages ?? [];
  const overallRating = parseFloat(product?.ratingStars ?? "0");

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center gap-4 border-b border-neutral-200 bg-white px-6 py-3 shrink-0">
        <Link
          href="/dashboard/admin/products"
          className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-black transition-colors"
        >
          <ArrowLeft size={13} /> Products
        </Link>
        <div className="ml-auto flex items-center gap-3">
          <AdminBell />
          <div className="flex items-center gap-2.5 border border-neutral-200 px-3 py-1.5">
            <div className="h-6 w-6 bg-black flex items-center justify-center text-[10px] font-bold text-white">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-neutral-900 leading-none">{user?.firstName}</p>
              <p className="text-[10px] text-neutral-400 leading-none mt-0.5 uppercase tracking-wider">Administrator</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto bg-neutral-50">
        {loading && (
          <div className="flex items-center justify-center py-32 text-neutral-400">
            <LoaderCircle size={20} className="animate-spin mr-2" /> Loading product...
          </div>
        )}
        {error && <div className="m-6 border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">{error}</div>}

        {product && (
          <div className="px-6 py-6 space-y-5 max-w-6xl mx-auto">
            {product.breadcrumbs && <p className="text-[11px] text-neutral-400">{product.breadcrumbs}</p>}

            {saveSuccess && (
              <div className="flex items-center gap-2 border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700">
                <CheckCircle2 size={14} /> Product updated successfully
              </div>
            )}

            <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
              {/* Gallery */}
              <div className="space-y-3">
                <div className="relative border border-neutral-200 bg-white aspect-square flex items-center justify-center overflow-hidden">
                  {images.length > 0 ? (
                    <img src={images[activeImage]} alt={product.title} className="w-full h-full object-contain p-4" />
                  ) : (
                    <Package size={40} className="text-neutral-300" />
                  )}
                  {product.availability && (
                    <span className={`absolute top-3 right-3 px-2.5 py-1 text-[10px] font-bold uppercase ${
                      product.availability.toLowerCase().includes("in stock")
                        ? "bg-black text-white"
                        : "bg-neutral-100 text-neutral-600"
                    }`}>
                      {product.availability}
                    </span>
                  )}
                </div>
                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImage(i)}
                        className={`shrink-0 h-14 w-14 overflow-hidden border-2 transition-all ${
                          i === activeImage ? "border-black" : "border-neutral-200 hover:border-neutral-400"
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="border border-neutral-200 bg-white p-6 space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {editMode ? (
                      <input
                        value={form.title ?? ""}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="w-full text-lg font-semibold text-black border border-neutral-200 bg-neutral-50 px-3 py-2 outline-none focus:border-black"
                      />
                    ) : (
                      <h1 className="text-lg font-semibold text-black leading-snug">{product.title}</h1>
                    )}
                    <p className="mt-1 font-mono text-xs text-neutral-400">ASIN: {asin}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!editMode && (
                      <button
                        onClick={() => setEditMode(true)}
                        className="flex items-center gap-1.5 border border-neutral-200 px-3 py-2 text-xs font-semibold text-neutral-700 hover:border-black transition-colors"
                      >
                        <Edit3 size={12} /> Edit
                      </button>
                    )}
                    {editMode && (
                      <>
                        <button
                          onClick={() => setEditMode(false)}
                          className="border border-neutral-200 px-3 py-2 text-xs font-semibold text-neutral-600 hover:border-black transition-colors"
                        >
                          <X size={12} />
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="flex items-center gap-1.5 bg-black px-3 py-2 text-xs font-semibold text-white hover:opacity-80 disabled:opacity-50 transition-opacity"
                        >
                          {saving ? <LoaderCircle size={12} className="animate-spin" /> : <Save size={12} />}
                          Save
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="flex items-center gap-1.5 border border-neutral-200 px-3 py-2 text-xs font-semibold text-neutral-500 hover:border-red-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      label: "Price",
                      edit: <input value={form.priceValue ?? ""} onChange={(e) => setForm({ ...form, priceValue: e.target.value })} className="w-full border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm font-semibold text-black outline-none focus:border-black" />,
                      view: <span className="text-2xl font-semibold text-black">{product.priceValue}</span>,
                    },
                    {
                      label: "Brand",
                      edit: <input value={form.brandName ?? ""} onChange={(e) => setForm({ ...form, brandName: e.target.value })} className="w-full border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-black" />,
                      view: <span className="text-sm text-neutral-700">{product.brandName || "—"}</span>,
                    },
                    {
                      label: "Seller",
                      edit: null,
                      view: <span className="text-sm text-neutral-700">{product.sellerName || "—"}</span>,
                    },
                    {
                      label: "Delivery",
                      edit: null,
                      view: <span className="text-sm text-neutral-700">{product.deliveryDate || product.fastestDeliveryDate || "—"}</span>,
                    },
                  ].map(({ label, edit, view }) => (
                    <div key={label}>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-1.5">{label}</p>
                      {editMode && edit ? edit : view}
                    </div>
                  ))}
                </div>

                {/* Rating distribution */}
                <div className="border border-neutral-200 bg-neutral-50 p-4">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-neutral-400">Rating Distribution</p>
                  <div className="flex items-center gap-5">
                    <div className="text-center shrink-0">
                      <p className="text-[40px] font-semibold leading-none text-black">{overallRating.toFixed(1)}</p>
                      <div className="flex justify-center mt-1">
                        <StarRow rating={Math.round(overallRating)} />
                      </div>
                      <p className="text-[10px] text-neutral-400 mt-1">{product.ratingCount} reviews</p>
                    </div>
                    <div className="flex-1 space-y-2">
                      <RatingBar label="5" value={product.ratingDistribution5star} />
                      <RatingBar label="4" value={product.ratingDistribution4star} />
                      <RatingBar label="3" value={product.ratingDistribution3star} />
                      <RatingBar label="2" value={product.ratingDistribution2star} />
                      <RatingBar label="1" value={product.ratingDistribution1star} />
                    </div>
                  </div>
                  {product.customerReviewSummary && (
                    <p className="mt-3 text-xs text-neutral-500 italic">"{product.customerReviewSummary}"</p>
                  )}
                </div>

                {(product.aboutItem || editMode) && (
                  <div>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-neutral-400">About this item</p>
                    {editMode ? (
                      <textarea
                        value={form.aboutItem ?? ""}
                        onChange={(e) => setForm({ ...form, aboutItem: e.target.value })}
                        rows={4}
                        className="w-full border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700 outline-none focus:border-black resize-none"
                      />
                    ) : (
                      <p className="text-sm text-neutral-600 leading-relaxed">{product.aboutItem}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white border border-neutral-200 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
                <div>
                  <h2 className="text-sm font-semibold text-black">Customer Reviews</h2>
                  <p className="text-[11px] text-neutral-400 mt-0.5">{reviews.length} reviews</p>
                </div>
              </div>
              {reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-neutral-300">
                  <Star size={24} className="mb-2" />
                  <p className="text-sm">No reviews yet</p>
                </div>
              ) : (
                <div className="divide-y divide-neutral-100">
                  {reviews.map((r) => {
                    const stars = parseInt(r.rating) || 0;
                    return (
                      <div key={r.id} className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 shrink-0 bg-neutral-100 flex items-center justify-center text-[11px] font-semibold text-neutral-600">
                            {r.userName?.[0] ?? "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="text-xs font-semibold text-neutral-900">{r.userName ?? "Anonymous"}</span>
                              <StarRow rating={stars} />
                              {r.verifiedPurchase && (
                                <span className="bg-neutral-100 px-2 py-0.5 text-[9px] font-semibold text-neutral-600 uppercase tracking-wider">
                                  Verified
                                </span>
                              )}
                              {r.reviewMetadata && <span className="text-[10px] text-neutral-400">{r.reviewMetadata}</span>}
                            </div>
                            {r.reviewTitle && <p className="text-xs font-semibold text-neutral-800 mb-0.5">{r.reviewTitle}</p>}
                            <p className="text-xs text-neutral-600 leading-relaxed">{r.reviewText}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm bg-white p-6 border border-neutral-200 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle size={18} className="text-neutral-700 shrink-0" />
              <h2 className="text-base font-semibold text-black">Delete Product?</h2>
            </div>
            <p className="text-sm text-neutral-500 mb-5">
              This will permanently remove <span className="font-semibold text-black">{product?.title?.slice(0, 50)}</span> from the platform.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 border border-neutral-200 py-2.5 text-sm font-semibold text-neutral-700 hover:border-black transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex flex-1 items-center justify-center gap-2 bg-black py-2.5 text-sm font-semibold text-white hover:opacity-80 disabled:opacity-50 transition-opacity"
              >
                {deleting ? <LoaderCircle size={13} className="animate-spin" /> : <Trash2 size={13} />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
