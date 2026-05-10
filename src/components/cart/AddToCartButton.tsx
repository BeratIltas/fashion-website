"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

type Props = {
  asin: string;
  quantity?: number;
  fullWidth?: boolean;
  label?: string;
  overlay?: boolean;
};

function BagIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}

function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-current/20 border-t-current ${className}`}
    />
  );
}

export default function AddToCartButton({
  asin,
  quantity = 1,
  fullWidth,
  label = "Add to cart",
  overlay,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const { addItem, loading } = useCart();
  const [localLoading, startTransition] = useTransition();
  const [added, setAdded] = useState(false);
  const [pinged, setPinged] = useState(false);

  const isLoading = loading || localLoading;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!asin) return;
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname || "/")}`);
      return;
    }
    setAdded(false);
    setPinged(false);
    startTransition(async () => {
      await addItem(asin, quantity);
      setAdded(true);
      setPinged(true);
      setTimeout(() => { setAdded(false); setPinged(false); }, 1800);
    });
  };

  // ── Overlay variant — full-width button used in card hover overlay ──
  if (overlay) {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className={[
          "w-full rounded-xl py-2.5 text-sm font-semibold transition-all duration-300",
          added
            ? "bg-emerald-500 text-white"
            : "bg-white text-neutral-950 hover:bg-neutral-100",
          "disabled:opacity-60",
        ].join(" ")}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <Spinner className="h-4 w-4 text-neutral-600" />
          </span>
        ) : added ? (
          <span className="flex items-center justify-center gap-1.5 animate-cart-check">
            <CheckIcon className="h-4 w-4" />
            Added
          </span>
        ) : (
          <span className="flex items-center justify-center gap-1.5">
            <BagIcon className="h-4 w-4" />
            Add to Cart
          </span>
        )}
      </button>
    );
  }

  // ── Compact variant — circular icon button for cards ──
  if (label === "Add") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className={[
          "relative h-9 w-9 shrink-0 overflow-hidden rounded-full transition-all duration-300",
          added
            ? "bg-emerald-500 scale-110"
            : "bg-neutral-950 hover:bg-neutral-700 active:scale-95",
          "disabled:opacity-50",
        ].join(" ")}
      >
        {/* Ping ring animation on add */}
        {pinged && (
          <span className="pointer-events-none absolute inset-0 rounded-full bg-emerald-400 animate-cart-ping" />
        )}
        {isLoading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <Spinner className="h-3.5 w-3.5 text-white" />
          </span>
        )}
        {!isLoading && added && (
          <span className="absolute inset-0 flex items-center justify-center animate-cart-check">
            <CheckIcon className="h-4 w-4 text-white" />
          </span>
        )}
        {!isLoading && !added && (
          <span className="absolute inset-0 flex items-center justify-center">
            <PlusIcon className="h-4 w-4 text-white" />
          </span>
        )}
      </button>
    );
  }

  // ── Full variant — standard button for product detail pages ──
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className={[
        "relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl px-5 py-3 text-sm font-semibold transition-all duration-300 active:scale-[0.98]",
        fullWidth ? "w-full" : "",
        added
          ? "bg-emerald-500 text-white scale-[1.02]"
          : "bg-neutral-950 text-white hover:bg-neutral-800",
        "disabled:opacity-50",
      ].join(" ")}
    >
      {/* Ping ring */}
      {pinged && (
        <span className="pointer-events-none absolute inset-0 rounded-2xl bg-emerald-400 animate-cart-ping" />
      )}
      {isLoading ? (
        <>
          <Spinner className="h-4 w-4 text-white" />
          Adding...
        </>
      ) : added ? (
        <span className="flex items-center gap-2 animate-cart-check">
          <CheckIcon className="h-4 w-4" />
          Added!
        </span>
      ) : (
        <>
          <BagIcon className="h-4 w-4" />
          {label}
        </>
      )}
    </button>
  );
}
