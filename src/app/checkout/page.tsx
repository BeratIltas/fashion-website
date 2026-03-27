"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import { useCart } from "@/contexts/CartContext";
import { checkoutOrder } from "@/lib/api";

function getFirstImageSrc(allImages: unknown): string {
  const placeholder = "/placeholder.png";

  if (Array.isArray(allImages)) {
    const first = allImages.find((image) => typeof image === "string" && image.trim().length > 0);
    return typeof first === "string" ? first.trim() : placeholder;
  }

  if (typeof allImages === "string") {
    const value = allImages.trim();
    if (!value) return placeholder;

    if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/")) {
      return value;
    }

    if (value.startsWith("[")) {
      try {
        const parsed = JSON.parse(value.replace(/'/g, '"'));
        if (Array.isArray(parsed)) {
          const first = parsed.find((image) => typeof image === "string" && image.trim().length > 0);
          return typeof first === "string" ? first.trim() : placeholder;
        }
      } catch (error) {
        console.error("Error parsing allImages JSON:", error);
      }
    }
  }

  return placeholder;
}

export default function CheckoutPage() {
  const { cart, refresh } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const router = useRouter();

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCheckingOut(true);

    try {
      await checkoutOrder();
      await refresh();
      router.push("/orders");
    } catch (error) {
      console.error(error);
      alert("Failed to checkout. Please try again or log in.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const items = cart?.items ?? [];

  return (
    <Container>
      <div className="grid gap-10 pt-28 pb-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Enter your details to complete the order. Payment integration will be added later.
          </p>

          <form onSubmit={handleCheckout} className="mt-8 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-neutral-600">First name</label>
                <input
                  className="mt-1 w-full rounded-2xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-900"
                  placeholder="Jane"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600">Last name</label>
                <input
                  className="mt-1 w-full rounded-2xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-900"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-600">Email</label>
              <input
                type="email"
                className="mt-1 w-full rounded-2xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-900"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-600">Address</label>
              <input
                className="mt-1 w-full rounded-2xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-900"
                placeholder="Street and number"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-neutral-600">City</label>
                <input
                  className="mt-1 w-full rounded-2xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-900"
                  placeholder="Beykoz"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600">ZIP</label>
                <input
                  className="mt-1 w-full rounded-2xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-900"
                  placeholder="34000"
                />
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" disabled={isCheckingOut || items.length === 0}>
                {isCheckingOut ? "Processing..." : "Place order"}
              </Button>
            </div>
          </form>
        </div>

        <aside className="h-fit space-y-4 rounded-3xl border border-neutral-200 bg-white p-5">
          <div className="text-sm font-semibold text-neutral-900">Order summary</div>
          <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
            {items.length === 0 ? (
              <div className="py-4 text-xs text-neutral-500">Your cart is empty.</div>
            ) : (
              items.map((it) => {
                const imgSrc = getFirstImageSrc(it.product?.allImages);

                return (
                  <div key={it.id} className="flex items-center gap-3 text-sm">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-2xl bg-neutral-100">
                      <Image
                        src={imgSrc}
                        alt={it.product.title}
                        fill
                        className="object-cover"
                        sizes="40px"
                        unoptimized={imgSrc.includes("amazon.com")}
                        onError={(event) => {
                          const target = event.target as HTMLImageElement;
                          target.src = "/placeholder.png";
                        }}
                      />
                    </div>
                    <div className="max-w-[220px] flex-1 truncate text-neutral-800">
                      {it.quantity} x {it.product.title}
                    </div>
                    <div className="font-medium">
                      ${(parseFloat(it.product.priceValue) * it.quantity).toFixed(2)}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex items-center justify-between border-t border-neutral-200 pt-3">
            <div className="text-sm text-neutral-600">Total</div>
            <div className="text-base font-semibold text-neutral-900">
              ${cart?.totalPrice.toFixed(2) ?? "0.00"}
            </div>
          </div>
        </aside>
      </div>
    </Container>
  );
}
