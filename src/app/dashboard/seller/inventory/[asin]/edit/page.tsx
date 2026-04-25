"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getProductDetail,
  updateProduct,
  uploadImage,
  type ProductDetailDto,
  type ProductUpdateDto,
} from "@/lib/adminApi";
import {
  ArrowLeft, CheckCircle2, Image as ImageIcon, Loader2, Package,
  Plus, Save, Trash2, Upload, X,
} from "lucide-react";
import Link from "next/link";

const INPUT_CLS = "w-full border border-neutral-200 bg-white px-4 py-3 text-sm text-black outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all placeholder:text-neutral-400 rounded-lg";
const TEXTAREA_CLS = INPUT_CLS + " resize-none";

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
        <p className="text-[11px] uppercase tracking-widest font-bold text-neutral-500">{title}</p>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <label className="text-xs font-semibold text-neutral-700">{label}</label>
        {hint && <span className="text-[10px] text-neutral-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

export default function EditProductPage() {
  const { asin } = useParams<{ asin: string }>();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [product, setProduct] = useState<ProductDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    brandName: "",
    priceValue: "",
    aboutItem: "",
    category: "",
    availability: "",
    stock: "",
    imageList: [] as string[],
  });
  const [newImageUrl, setNewImageUrl] = useState("");

  useEffect(() => {
    getProductDetail(asin)
      .then((p) => {
        setProduct(p);
        setForm({
          title: p.title ?? "",
          brandName: p.brandName ?? "",
          priceValue: p.priceValue ?? "",
          aboutItem: p.aboutItem ?? "",
          category: p.breadcrumbs?.split(">").pop()?.trim() ?? "",
          availability: p.availability ?? "",
          stock: "",
          imageList: Array.isArray(p.allImages) ? p.allImages.filter(Boolean) : [],
        });
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [asin]);

  const set = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const addImageUrl = () => {
    const url = newImageUrl.trim();
    if (!url) return;
    setForm((prev) => ({ ...prev, imageList: [...prev.imageList, url] }));
    setNewImageUrl("");
  };

  const removeImage = (i: number) =>
    setForm((prev) => ({ ...prev, imageList: prev.imageList.filter((_, idx) => idx !== i) }));

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      if (url) setForm((prev) => ({ ...prev, imageList: [...prev.imageList, url] }));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload: ProductUpdateDto = {
        title:        form.title        || undefined,
        brandName:    form.brandName    || undefined,
        priceValue:   form.priceValue   || undefined,
        aboutItem:    form.aboutItem    || undefined,
        category:     form.category     || undefined,
        availability: form.availability || undefined,
        stock:        form.stock ? parseInt(form.stock) : undefined,
        imageUrls:    form.imageList.length > 0 ? form.imageList : undefined,
      };
      await updateProduct(asin, payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-neutral-400">
        <Loader2 size={20} className="animate-spin mr-2" /> Loading…
      </div>
    );
  }

  return (
    <div className="px-8 pb-20 pt-8 w-full max-w-[1400px] mx-auto">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Breadcrumb */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={`/dashboard/seller/inventory/${asin}`}
          className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest font-semibold text-neutral-500 hover:text-black transition-colors"
        >
          <ArrowLeft size={13} /> Product
        </Link>
        <span className="text-neutral-300">/</span>
        <span className="text-[11px] uppercase tracking-widest font-semibold text-neutral-800 truncate max-w-sm">
          {product?.title ?? asin}
        </span>
      </div>

      {/* Page header */}
      <div className="flex items-center justify-between gap-4 mb-8 pb-6 border-b border-neutral-200">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black">Edit Product</h1>
          <p className="mt-1 text-sm text-neutral-500 font-mono">{asin}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2.5 px-8 py-3.5 text-[12px] uppercase tracking-widest font-bold transition-all ${
            saved
              ? "bg-emerald-500 text-white"
              : "bg-black text-white hover:bg-neutral-800"
          } disabled:opacity-60 rounded-xl shadow-lg shadow-black/10`}
        >
          {saving ? (
            <Loader2 size={15} className="animate-spin" />
          ) : saved ? (
            <CheckCircle2 size={15} />
          ) : (
            <Save size={15} />
          )}
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-3.5 text-sm text-red-600">
          <X size={14} className="shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto opacity-60 hover:opacity-100">
            <X size={13} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ── Left column (2/3) ─────────────────────────── */}
        <div className="xl:col-span-2 space-y-6">

          {/* Basic info */}
          <SectionCard title="Basic Information">
            <div className="space-y-5">
              <Field label="Title">
                <textarea
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  rows={2}
                  className={TEXTAREA_CLS}
                  placeholder="Product title"
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Brand">
                  <input
                    value={form.brandName}
                    onChange={(e) => set("brandName", e.target.value)}
                    className={INPUT_CLS}
                    placeholder="e.g. Nike"
                  />
                </Field>
                <Field label="Category">
                  <input
                    value={form.category}
                    onChange={(e) => set("category", e.target.value)}
                    className={INPUT_CLS}
                    placeholder="e.g. Clothing"
                  />
                </Field>
              </div>
              <Field label="Description" hint="Shown on product page">
                <textarea
                  value={form.aboutItem}
                  onChange={(e) => set("aboutItem", e.target.value)}
                  rows={6}
                  className={TEXTAREA_CLS}
                  placeholder="Describe the product…"
                />
              </Field>
            </div>
          </SectionCard>

          {/* Images */}
          <SectionCard title="Product Images">
            {/* Thumbnails grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mb-5">
              {form.imageList.map((url, i) => (
                <div
                  key={i}
                  className="group relative aspect-square rounded-xl overflow-hidden bg-neutral-100 border-2 border-transparent hover:border-black transition-colors"
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                    <button
                      onClick={() => removeImage(i)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-1 hover:bg-red-500 hover:text-white"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                  {i === 0 && (
                    <span className="absolute top-1.5 left-1.5 bg-black/70 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
                      Main
                    </span>
                  )}
                </div>
              ))}
              {form.imageList.length === 0 && (
                <div className="col-span-3 aspect-video rounded-xl bg-neutral-50 border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center text-neutral-400 gap-2">
                  <ImageIcon size={24} className="opacity-40" />
                  <span className="text-xs">No images yet</span>
                </div>
              )}
            </div>

            {/* Upload + URL row */}
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-neutral-300 rounded-lg text-xs font-semibold text-neutral-600 hover:border-black hover:text-black hover:bg-neutral-50 transition-all disabled:opacity-50 shrink-0"
              >
                {uploading
                  ? <Loader2 size={14} className="animate-spin" />
                  : <Upload size={14} />}
                {uploading ? "Uploading…" : "Upload File"}
              </button>
              <div className="flex flex-1 rounded-lg border border-neutral-200 overflow-hidden focus-within:border-black transition-colors">
                <input
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addImageUrl()}
                  className="flex-1 px-4 py-2.5 text-sm outline-none placeholder:text-neutral-400 bg-white"
                  placeholder="Or paste image URL…"
                />
                <button
                  onClick={addImageUrl}
                  className="flex items-center gap-1.5 px-4 bg-neutral-50 border-l border-neutral-200 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 hover:text-black transition-colors"
                >
                  <Plus size={13} /> Add
                </button>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* ── Right column (1/3) ─────────────────────────── */}
        <div className="space-y-6">

          {/* Pricing & Stock */}
          <SectionCard title="Pricing & Stock">
            <div className="space-y-4">
              <Field label="Price" hint="USD">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm font-medium">$</span>
                  <input
                    value={form.priceValue}
                    onChange={(e) => set("priceValue", e.target.value)}
                    className={INPUT_CLS + " pl-8"}
                    placeholder="0.00"
                  />
                </div>
              </Field>
              <Field label="Stock Quantity">
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => set("stock", e.target.value)}
                  className={INPUT_CLS}
                  placeholder="Enter quantity"
                  min={0}
                />
              </Field>
              <Field label="Availability">
                <input
                  value={form.availability}
                  onChange={(e) => set("availability", e.target.value)}
                  className={INPUT_CLS}
                  placeholder="e.g. In Stock"
                />
              </Field>
            </div>
          </SectionCard>

          {/* Product info card */}
          <div className="rounded-2xl border border-neutral-200 overflow-hidden">
            <div className="px-6 py-4 bg-neutral-900 text-white">
              <p className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Product Info</p>
            </div>
            <div className="bg-white divide-y divide-neutral-100">
              <div className="flex justify-between items-center px-5 py-3">
                <span className="text-xs text-neutral-500">ASIN</span>
                <span className="font-mono text-xs font-bold text-black">{asin}</span>
              </div>
              {product?.ratingStars && (
                <div className="flex justify-between items-center px-5 py-3">
                  <span className="text-xs text-neutral-500">Rating</span>
                  <span className="text-xs font-semibold text-amber-600">{product.ratingStars} ★</span>
                </div>
              )}
              {product?.ratingCount && (
                <div className="flex justify-between items-center px-5 py-3">
                  <span className="text-xs text-neutral-500">Reviews</span>
                  <span className="text-xs font-medium text-black">{product.ratingCount}</span>
                </div>
              )}
              {product?.sellerName && (
                <div className="flex justify-between items-center px-5 py-3">
                  <span className="text-xs text-neutral-500">Seller</span>
                  <span className="text-xs font-medium text-black truncate ml-4 max-w-[140px]">{product.sellerName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick nav */}
          <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden">
            <Link
              href={`/dashboard/seller/inventory/${asin}`}
              className="flex items-center justify-between px-5 py-3.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 hover:text-black transition-colors border-b border-neutral-100"
            >
              ← View Product Detail
            </Link>
            <Link
              href="/dashboard/seller/inventory"
              className="flex items-center justify-between px-5 py-3.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 hover:text-black transition-colors"
            >
              ← Back to Inventory
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
