"use client";

import Link from "next/link";
import { useRef, useState, useEffect, useCallback } from "react";
import AddToCartButton from "@/components/cart/AddToCartButton";
import type { Product } from "@/lib/api";

function StarBadge({ stars }: { stars: number }) {
  return (
    <div className="flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 shadow-sm backdrop-blur-sm">
      <svg className="h-3 w-3 fill-amber-400 text-amber-400" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      <span className="text-[10px] font-bold text-neutral-700">{stars.toFixed(1)}</span>
    </div>
  );
}

function ArrowButton({
  dir,
  onClick,
  disabled,
}: {
  dir: "left" | "right";
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "left" ? "Scroll left" : "Scroll right"}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 shadow-sm transition hover:border-neutral-400 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-25"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d={dir === "left" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
        />
      </svg>
    </button>
  );
}

function ProductCard({
  product,
  hasDragged,
}: {
  product: Product;
  hasDragged: { current: boolean };
}) {
  const ratingMatch = product.ratingStars?.match(/^([\d.]+)/);
  const stars = ratingMatch ? parseFloat(ratingMatch[1]) : 0;
  const price = parseFloat(product.priceValue || "0").toFixed(2);
  const img = product.allImages?.[0];

  return (
    <Link
      href={`/product/${product.asin}`}
      draggable={false}
      onClick={(e) => {
        if (hasDragged.current) e.preventDefault();
      }}
      className="group relative w-[185px] shrink-0 sm:w-[205px]"
    >
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-100">
        {img ? (
          <img
            src={img}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            draggable={false}
          />
        ) : (
          <div className="h-full w-full bg-neutral-200" />
        )}

        {stars > 0 && (
          <div className="absolute left-2 top-2 z-10">
            <StarBadge stars={stars} />
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 z-10 translate-y-full bg-gradient-to-t from-black/75 via-black/30 to-transparent p-3 transition-transform duration-300 group-hover:translate-y-0">
          <AddToCartButton asin={product.asin} overlay />
        </div>
      </div>

      {/* Info */}
      <div className="mt-2.5 space-y-0.5 px-0.5">
        {product.brandName && (
          <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
            {product.brandName}
          </p>
        )}
        <p className="line-clamp-2 text-sm font-medium leading-snug text-neutral-700 transition-colors group-hover:text-neutral-950">
          {product.title}
        </p>
        <p className="text-sm font-bold text-neutral-950">${price}</p>
      </div>
    </Link>
  );
}

export default function SimilarProducts({
  products,
  title = "You may also like",
}: {
  products: Product[];
  title?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Drag-to-scroll state
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);
  const hasDragged = useRef(false);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);

    const onMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      startX.current = e.clientX;
      scrollStart.current = el.scrollLeft;
      hasDragged.current = false;
      el.style.cursor = "grabbing";
      el.style.userSelect = "none";
      e.preventDefault();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - startX.current;
      if (Math.abs(dx) > 5) hasDragged.current = true;
      el.scrollLeft = scrollStart.current - dx;
    };

    const onMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      el.style.cursor = "grab";
      el.style.userSelect = "";
    };

    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [updateArrows]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: dir === "left" ? -(el.clientWidth * 0.75) : el.clientWidth * 0.75,
      behavior: "smooth",
    });
  };

  if (!products.length) return null;

  return (
    <section className="mx-4 mb-10 rounded-3xl border border-neutral-100 bg-neutral-50 py-10 md:mx-8 lg:mx-12">
      {/* Header */}
      <div className="mb-7 flex items-end justify-between px-6 lg:px-8">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
            Discover more
          </p>
          <h2 className="mt-1.5 text-xl font-bold tracking-tight text-neutral-950">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <ArrowButton dir="left" onClick={() => scroll("left")} disabled={!canScrollLeft} />
          <ArrowButton dir="right" onClick={() => scroll("right")} disabled={!canScrollRight} />
        </div>
      </div>

      {/* Scroll strip */}
      <div
        ref={scrollRef}
        className="no-scrollbar flex gap-3 overflow-x-auto px-6 lg:px-8"
        style={{ cursor: "grab" }}
      >
        {products.map((p) => (
          <ProductCard key={p.asin} product={p} hasDragged={hasDragged} />
        ))}
        <div className="w-2 shrink-0" aria-hidden="true" />
      </div>
    </section>
  );
}
