"use client";

import Image from "next/image";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { useCart } from "@/contexts/CartContext";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

/** allImages'ı array'e çevir */
function parseAllImages(allImages: unknown): string[] {
  const placeholder = ["/placeholder.png"];

  if (Array.isArray(allImages)) {
    const filtered = allImages.filter((x) => typeof x === "string" && x.trim().length > 0);
    return filtered.length > 0 ? filtered : placeholder;
  }

  if (typeof allImages === "string") {
    const s = allImages.trim();
    if (!s) return placeholder;

    // Direkt URL
    if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("/")) {
      return [s];
    }

    // JSON array string
    if (s.startsWith("[")) {
      try {
        const normalized = s.replace(/'/g, '"');
        const parsed = JSON.parse(normalized);

        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((x) => typeof x === "string" && x.trim().length > 0);
          return filtered.length > 0 ? filtered : placeholder;
        }
      } catch (error) {
        console.error("Error parsing allImages JSON:", error);
        return placeholder;
      }
    }

    return [s];
  }

  return placeholder;
}

function safePriceNumber(priceValue: unknown): number {
  if (typeof priceValue === "number" && Number.isFinite(priceValue)) return priceValue;

  if (typeof priceValue === "string") {
    const cleaned = priceValue.replace(/[^0-9.,-]/g, "").replace(",", ".");
    const n = Number.parseFloat(cleaned);
    return Number.isFinite(n) ? n : 0;
  }

  return 0;
}

function ProductImageGallery({ images, title }: { images: string[]; title: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-neutral-100 group">
      <Image
        src={images[currentIndex]}
        alt={`${title} - Image ${currentIndex + 1}`}
        fill
        className="object-cover transition-opacity duration-300"
        sizes="96px"
        unoptimized={images[currentIndex].includes('amazon.com')}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = "/placeholder.png";
        }}
      />

      {images.length > 1 && (
        <>
          {/* Navigation Buttons */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goToPrev();
            }}
            className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Previous image"
          >
            <ChevronLeft size={14} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Next image"
          >
            <ChevronRight size={14} />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`h-1 rounded-full transition-all ${idx === currentIndex
                    ? "w-3 bg-white"
                    : "w-1 bg-white/50 hover:bg-white/75"
                  }`}
                aria-label={`Go to image ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function CartPage() {
  const router = useRouter();
  const { cart, updateItem, removeItem, loading } = useCart();

  const handleQtyChange = (asin: string, qty: number) => {
    if (qty <= 0) removeItem(asin);
    else updateItem(asin, qty);
  };

  const items = cart?.items ?? [];

  return (
    <Container>
      <div className="grid gap-10 pt-28 pb-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
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
                const images = parseAllImages((it as any)?.product?.allImages);
                const unitPrice = safePriceNumber((it as any)?.product?.priceValue);
                const qty = it.quantity ?? 0;

                return (
                  <div
                    key={it.id}
                    className="flex gap-4 rounded-3xl border border-neutral-200 bg-white p-4"
                  >
                    <ProductImageGallery images={images} title={it.product.title} />

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-neutral-900">
                        {it.product.title}
                      </div>
                      <div className="mt-1 text-xs text-neutral-500">{it.product.brandName}</div>

                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <div className="flex items-center rounded-full border border-neutral-200 px-2 py-1 text-xs">
                          <button
                            type="button"
                            className="px-2 text-neutral-600 disabled:text-neutral-300"
                            disabled={loading}
                            onClick={() => handleQtyChange(it.product.asin, qty - 1)}
                          >
                            -
                          </button>
                          <span className="min-w-[2rem] text-center text-sm">{qty}</span>
                          <button
                            type="button"
                            className="px-2 text-neutral-600 disabled:text-neutral-300"
                            disabled={loading}
                            onClick={() => handleQtyChange(it.product.asin, qty + 1)}
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          className="text-xs text-red-500 hover:text-red-600"
                          disabled={loading}
                          onClick={() => removeItem(it.product.asin)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between text-sm">
                      <div className="font-semibold">${unitPrice.toFixed(2)}</div>

                      <div className="text-xs text-neutral-500">
                        Total:{" "}
                        <span className="font-medium text-neutral-900">
                          ${(unitPrice * qty).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <aside className="space-y-4 rounded-3xl border border-neutral-200 bg-white p-5 h-fit">
          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-600">Items</div>
            <div className="text-sm font-medium text-neutral-900">{cart?.totalItems ?? 0}</div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-600">Subtotal</div>
            <div className="text-base font-semibold text-neutral-900">
              ${(cart?.totalPrice ?? 0).toFixed(2)}
            </div>
          </div>

          <p className="text-xs text-neutral-500">Taxes and shipping are calculated at checkout.</p>

          <Button
            className="w-full mt-2"
            disabled={!cart || items.length === 0 || loading}
            onClick={() => router.push("/checkout")}
          >
            Checkout
          </Button>
        </aside>
      </div>
    </Container>
  );
}