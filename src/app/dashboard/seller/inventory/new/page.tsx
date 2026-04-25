"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createProduct, uploadImage, type ProductCreateDto } from "@/lib/adminApi";
import {
  ArrowLeft, CheckCircle2, ImagePlus, Loader2, Package, X,
} from "lucide-react";
import Link from "next/link";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-widest font-semibold text-neutral-500 mb-2">{label}</label>
      {children}
    </div>
  );
}

const INPUT = "w-full border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-black outline-none focus:border-black focus:bg-white transition-colors placeholder:text-neutral-400";
const TEXTAREA = INPUT + " resize-none";

export default function NewProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "",
    brandName: "",
    priceValue: "",
    aboutItem: "",
    category: "",
    availability: "",
    stock: "",
    deliveryDate: "",
    fastestDeliveryDate: "",
    imageList: [] as string[],
  });

  const set = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const urls = await Promise.all(files.map((f) => uploadImage(f)));
      setForm((prev) => ({ ...prev, imageList: [...prev.imageList, ...urls] }));
    } catch {
      setError("Failed to upload one or more images.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (i: number) =>
    setForm((prev) => ({ ...prev, imageList: prev.imageList.filter((_, idx) => idx !== i) }));

  const handleCreate = async () => {
    if (!form.title.trim() || !form.priceValue.trim()) {
      setError("Title and price are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload: ProductCreateDto = {
        title: form.title.trim(),
        brandName: form.brandName.trim() || undefined,
        priceValue: form.priceValue.trim(),
        aboutItem: form.aboutItem.trim() || undefined,
        category: form.category.trim() || undefined,
        availability: form.availability.trim() || undefined,
        stock: form.stock ? parseInt(form.stock) : undefined,
        deliveryDate: form.deliveryDate.trim() || undefined,
        fastestDeliveryDate: form.fastestDeliveryDate.trim() || undefined,
        imageUrls: form.imageList.length > 0 ? form.imageList : undefined,
      };
      await createProduct(payload);
      router.push("/dashboard/seller/inventory");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-10 pb-20 pt-10 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-10">
        <Link
          href="/dashboard/seller/inventory"
          className="flex items-center gap-2 text-[11px] uppercase tracking-widest font-semibold text-neutral-500 hover:text-black transition-colors"
        >
          <ArrowLeft size={14} /> Inventory
        </Link>
        <span className="text-neutral-200">/</span>
        <span className="text-[11px] uppercase tracking-widest font-semibold text-black">New Product</span>
      </div>

      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-black">Add New Product</h1>
          <p className="text-sm text-neutral-500 mt-1">Fill in the details to list a new product.</p>
        </div>
        <button
          onClick={handleCreate}
          disabled={saving}
          className="flex items-center gap-2 bg-black text-white px-7 py-3.5 text-[12px] uppercase tracking-widest font-semibold hover:opacity-80 disabled:opacity-50 transition-opacity"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
          Create Product
        </button>
      </div>

      {error && (
        <div className="mb-6 border border-red-200 bg-red-50 px-5 py-3.5 text-sm text-red-600 flex items-center gap-2">
          <X size={14} /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main fields */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-neutral-200 p-7 space-y-5">
            <h2 className="text-[11px] uppercase tracking-widest font-semibold text-neutral-400 pb-3 border-b border-neutral-100">
              Basic Information
            </h2>
            <Field label="Title *">
              <input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                className={INPUT}
                placeholder="Product title"
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Brand">
                <input
                  value={form.brandName}
                  onChange={(e) => set("brandName", e.target.value)}
                  className={INPUT}
                  placeholder="Brand name"
                />
              </Field>
              <Field label="Category">
                <input
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  className={INPUT}
                  placeholder="e.g. Clothing"
                />
              </Field>
            </div>
            <Field label="About / Description">
              <textarea
                value={form.aboutItem}
                onChange={(e) => set("aboutItem", e.target.value)}
                rows={5}
                className={TEXTAREA}
                placeholder="Product description…"
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Delivery Date">
                <input
                  value={form.deliveryDate}
                  onChange={(e) => set("deliveryDate", e.target.value)}
                  className={INPUT}
                  placeholder="e.g. Dec 5 – Dec 8"
                />
              </Field>
              <Field label="Fastest Delivery">
                <input
                  value={form.fastestDeliveryDate}
                  onChange={(e) => set("fastestDeliveryDate", e.target.value)}
                  className={INPUT}
                  placeholder="e.g. Dec 4"
                />
              </Field>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white border border-neutral-200 p-7 space-y-4">
            <h2 className="text-[11px] uppercase tracking-widest font-semibold text-neutral-400 pb-3 border-b border-neutral-100">
              Images
            </h2>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            {form.imageList.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {form.imageList.map((url, i) => (
                  <div key={i} className="relative group aspect-square bg-neutral-100 overflow-hidden border border-neutral-200">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute top-1.5 right-1.5 h-6 w-6 bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <X size={10} />
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-1.5 left-1.5 bg-black text-white text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-widest">
                        Main
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-28 border border-dashed border-neutral-200 flex flex-col items-center justify-center text-neutral-400 gap-2">
                <Package size={22} className="opacity-40" />
                <span className="text-xs">No images added yet</span>
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-5 py-2.5 border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 transition-colors"
            >
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
              {uploading ? "Uploading…" : "Add Photos"}
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white border border-neutral-200 p-6 space-y-5">
            <h2 className="text-[11px] uppercase tracking-widest font-semibold text-neutral-400 pb-3 border-b border-neutral-100">
              Pricing & Stock
            </h2>
            <Field label="Price *">
              <input
                value={form.priceValue}
                onChange={(e) => set("priceValue", e.target.value)}
                className={INPUT}
                placeholder="e.g. 29.99"
              />
            </Field>
            <Field label="Stock">
              <input
                type="number"
                value={form.stock}
                onChange={(e) => set("stock", e.target.value)}
                className={INPUT}
                placeholder="Quantity"
                min={0}
              />
            </Field>
            <Field label="Availability">
              <input
                value={form.availability}
                onChange={(e) => set("availability", e.target.value)}
                className={INPUT}
                placeholder="e.g. In Stock"
              />
            </Field>
          </div>

          <button
            onClick={handleCreate}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-black text-white py-4 text-[12px] uppercase tracking-widest font-semibold hover:opacity-80 disabled:opacity-50 transition-opacity"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            Create Product
          </button>
        </div>
      </div>
    </div>
  );
}
