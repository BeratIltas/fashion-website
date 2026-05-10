"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Container from "@/components/ui/Container";
import AddToCartButton from "@/components/cart/AddToCartButton";
import FavoriteButton from "@/components/ui/FavoriteButton";
import type { Product, ProductFilters } from "@/lib/api";
import { filterProducts, searchProducts } from "@/lib/api";

const PAGE_SIZE = 50;

const POPULAR_BRANDS = [
  "adidas", "Nike", "ASICS", "New Balance", "Reebok", "PUMA", "Under Armour",
  "Skechers", "THE NORTH FACE", "Columbia", "Lacoste", "Tommy Hilfiger",
  "Calvin Klein", "GUESS", "Nautica", "Levi's", "Lee", "Wrangler",
  "POLO RALPH LAUREN", "U.S. Polo Assn.", "Champion", "Carhartt", "Dockers",
  "Haggar", "Fruit of the Loom", "Hanes", "Gildan", "Jerzees",
  "Russell Athletic", "Dickies", "True Religion", "Lucky Brand",
  "Rock & Republic", "Gloria Vanderbilt", "London Fog", "French Toast",
  "Nine West", "Clarks", "Cole Haan", "Rockport", "Merrell", "Hey Dude",
  "Gerber", "Burt's Bees Baby", "Hudson Baby", "HonestBaby",
  "Simple Joys by Carter's", "The Children's Place", "Liberty Imports",
  "Bruno Marc", "CAMEL CROWN", "KuaiLu", "Feethit", "Obtaom",
  "LARNMERN", "Hike Footwear", "VILOCY",
];

const POPULAR_COLORS = [
  "Black", "White", "Grey", "Dark Grey", "Light Grey",
  "Navy Blue", "Blue", "Light Blue", "Royal Blue",
  "Green", "Dark Green", "Olive", "Khaki", "Beige",
  "Brown", "Coffee", "Red", "Wine Red", "Orange", "Yellow",
];

const COLOR_MAP: Record<string, string> = {
  "Black": "#111111", "White": "#f5f5f5", "Grey": "#6b7280",
  "Dark Grey": "#3f3f46", "Light Grey": "#d4d4d8", "Navy Blue": "#1e3a5f",
  "Blue": "#2563eb", "Light Blue": "#7dd3fc", "Royal Blue": "#1d4ed8",
  "Green": "#2d6a4f", "Dark Green": "#166534", "Olive": "#65730a",
  "Khaki": "#a3824e", "Beige": "#d4b896", "Brown": "#78450f",
  "Coffee": "#6f4e37", "Red": "#c0392b", "Wine Red": "#7f1d1d",
  "Orange": "#ea580c", "Yellow": "#eab308",
};

const LIGHT_COLORS = new Set(["White", "Light Grey", "Light Blue", "Beige", "Yellow"]);

const QUICK_SUBCATEGORIES = [
  "T-Shirts", "Shirts", "Hoodies & Sweatshirts", "Jackets & Coats",
  "Tops & Blouses", "Pants", "Jeans", "Shorts", "Dresses",
  "Jumpsuits & Rompers", "Sneakers", "Running Shoes", "Sandals",
  "Flats", "Loafers & Slip-ons", "Oxfords", "Pumps", "Jackets",
  "Coats", "Outerwear", "Underwear", "Socks", "Sleepwear",
  "Loungewear", "Activewear", "Athletic Wear", "Yoga", "Running",
  "Golf", "Skiing", "Bags", "Belts", "Accessories",
];

// ── Icons ──────────────────────────────────────────────────────────────────────

function IconSearch() {
  return (
    <svg className="h-3.5 w-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function IconX({ className }: { className?: string }) {
  return (
    <svg className={className ?? "h-3 w-3"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg className={className ?? "h-3.5 w-3.5"} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}

function IconChevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-3 w-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

// ── Search Input ───────────────────────────────────────────────────────────────

function SearchInput({ value, onChange, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <IconSearch />
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-neutral-150 bg-neutral-50 py-2.5 pl-8 pr-8 text-[12px] text-neutral-800 placeholder-neutral-400 outline-none focus:border-neutral-400 focus:bg-white transition-all"
        style={{ borderColor: "#ebebeb" }}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-neutral-400 hover:text-neutral-700 transition"
        >
          <IconX />
        </button>
      )}
    </div>
  );
}

// ── Filter Dropdown ────────────────────────────────────────────────────────────

function FilterDropdown({
  label,
  displayValue,
  isActive,
  colorHex,
  isOpen,
  onToggle,
  onClear,
  children,
  panelWidth = 288,
}: {
  label: string;
  displayValue?: string;
  isActive: boolean;
  colorHex?: string;
  isOpen: boolean;
  onToggle: () => void;
  onClear: () => void;
  children: React.ReactNode;
  panelWidth?: number;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  // useLayoutEffect runs before paint → no flicker on first open
  useLayoutEffect(() => {
    if (isOpen && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const left = Math.min(r.left, window.innerWidth - panelWidth - 12);
      setPos({ top: r.bottom + 6, left: Math.max(8, left) });
    }
  }, [isOpen, panelWidth]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const close = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      onToggle();
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [isOpen, onToggle]);

  return (
    <div className="shrink-0">
      <button
        ref={btnRef}
        type="button"
        onClick={onToggle}
        className={[
          "flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition-all duration-200",
          isActive
            ? "border-neutral-950 bg-neutral-950 text-white"
            : isOpen
            ? "border-neutral-400 bg-white text-neutral-900 shadow-sm"
            : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400 hover:text-neutral-900",
        ].join(" ")}
      >
        {colorHex && isActive && (
          <span
            className="h-3 w-3 shrink-0 rounded-full ring-1 ring-white/30"
            style={{ backgroundColor: colorHex }}
          />
        )}
        <span className="max-w-[110px] truncate">{isActive && displayValue ? displayValue : label}</span>
        {isActive ? (
          <span
            role="button"
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-white/20 transition hover:bg-white/40"
          >
            <IconX className="h-2.5 w-2.5" />
          </span>
        ) : (
          <IconChevron open={isOpen} />
        )}
      </button>

      {/* Portal → renders in document.body, bypasses all stacking/overflow contexts */}
      {isOpen && createPortal(
        <div
          ref={panelRef}
          className="fixed z-[200] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl shadow-black/10"
          style={{ top: pos.top, left: pos.left, width: panelWidth }}
        >
          {children}
        </div>,
        document.body
      )}
    </div>
  );
}

// ── Searchable List ────────────────────────────────────────────────────────────

function SearchableListPanel({ items, selected, placeholder, onSelect }: {
  items: string[];
  selected: string;
  placeholder: string;
  onSelect: (val: string) => void;
}) {
  const [search, setSearch] = useState("");
  const filtered = items.filter((i) => i.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-3 space-y-2">
      <SearchInput value={search} onChange={setSearch} placeholder={placeholder} />
      <div className="max-h-56 overflow-y-auto space-y-0.5 [scrollbar-width:thin] [scrollbar-color:#e5e5e5_transparent]">
        {filtered.length === 0 ? (
          <p className="py-5 text-center text-xs text-neutral-400">No results for &quot;{search}&quot;</p>
        ) : (
          filtered.map((item) => {
            const active = selected === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => onSelect(active ? "" : item)}
                className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-[13px] font-medium transition-all duration-100 ${
                  active
                    ? "bg-neutral-950 text-white"
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                }`}
              >
                <span className="capitalize">{item}</span>
                {active && <IconCheck className="h-3.5 w-3.5 shrink-0" />}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

// ── Color Panel ────────────────────────────────────────────────────────────────

function ColorPanel({ selected, onSelect }: {
  selected: string;
  onSelect: (val: string) => void;
}) {
  const [search, setSearch] = useState("");
  const filtered = POPULAR_COLORS.filter((c) => c.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-3 space-y-2">
      <SearchInput value={search} onChange={setSearch} placeholder="Search color..." />
      <div className="max-h-52 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#e5e5e5_transparent]">
        {filtered.length === 0 ? (
          <p className="py-5 text-center text-xs text-neutral-400">No results for &quot;{search}&quot;</p>
        ) : (
          <div className="grid grid-cols-4 gap-x-1 gap-y-3 px-1 py-1.5">
            {filtered.map((color) => {
              const active = selected === color;
              const hex = COLOR_MAP[color] ?? "#ccc";
              const isLight = LIGHT_COLORS.has(color);
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => onSelect(active ? "" : color)}
                  title={color}
                  className="group flex flex-col items-center gap-1.5"
                >
                  <span
                    className={`relative flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-150 ${
                      active
                        ? "scale-105 shadow-md ring-2 ring-neutral-950 ring-offset-2"
                        : `hover:scale-105 hover:shadow-sm ${isLight ? "ring-1 ring-neutral-200" : ""}`
                    }`}
                    style={{ backgroundColor: hex }}
                  >
                    {active && (
                      <IconCheck className={`h-4 w-4 drop-shadow-sm ${isLight ? "text-neutral-800" : "text-white"}`} />
                    )}
                  </span>
                  <span className={`text-[9px] font-semibold capitalize leading-tight transition-colors ${active ? "sr-only" : "text-neutral-400 group-hover:text-neutral-600"}`}>
                    {color}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Rating Panel ───────────────────────────────────────────────────────────────

function RatingPanel({ value, onChange }: {
  value: number;
  onChange: (v: string) => void;
}) {
  const sliderClassName = "relative w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_1px_6px_rgba(0,0,0,0.2),0_0_0_2px_rgba(234,179,8,0.4)] [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-[0_1px_6px_rgba(0,0,0,0.2)]";

  return (
    <div className="p-4 space-y-4">
      {/* Quick-select */}
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => onChange("")}
          className={`flex-1 rounded-xl py-2 text-[11px] font-semibold transition-all ${
            value === 0
              ? "bg-neutral-950 text-white"
              : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
          }`}
        >
          All
        </button>
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(value === s ? "" : String(s))}
            className={`flex-1 rounded-xl py-2 text-[11px] font-semibold transition-all ${
              value === s
                ? "bg-amber-400 text-white"
                : "bg-neutral-100 text-neutral-500 hover:bg-amber-50 hover:text-amber-600"
            }`}
          >
            {s}★
          </button>
        ))}
      </div>
      {/* Slider */}
      <div>
        <div className="relative flex h-5 items-center">
          <div className="absolute left-0 right-0 h-1.5 rounded-full bg-neutral-100" />
          <div
            className="absolute left-0 h-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-150"
            style={{ width: `${(value / 5) * 100}%` }}
          />
          <input
            type="range" min="0" max="5" step="0.5" value={value}
            onChange={(e) => onChange(Number(e.target.value) === 0 ? "" : e.target.value)}
            className={sliderClassName}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-[10px] font-medium text-neutral-300">
          {[0, 1, 2, 3, 4, 5].map((n) => <span key={n}>{n}</span>)}
        </div>
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function starCount(ratingStars: string): number {
  const match = ratingStars.match(/^([\d.]+)/);
  return match ? parseFloat(match[1]) : 0;
}

function mergeProducts(current: Product[], incoming: Product[]) {
  const seen = new Set(current.map((p) => p.asin));
  const next = [...current];
  for (const p of incoming) {
    if (seen.has(p.asin)) continue;
    seen.add(p.asin);
    next.push(p);
  }
  return next;
}

function normalizeRating(value?: string) {
  const parsed = Number.parseFloat(value ?? "0");
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCategoryTitle(value?: string) {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "men") return "Men";
  if (normalized === "women" || normalized === "woman") return "Women";
  return "Shop";
}

function buildShopTarget(query: string, nextFilters: ProductFilters) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  for (const [key, value] of Object.entries(nextFilters)) {
    if (value?.trim()) params.set(key, value.trim());
  }
  return params.toString() ? `/shop?${params.toString()}` : "/shop";
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function ShopCatalog({
  initialProducts,
  initialQuery,
  initialFilters,
}: {
  initialProducts: Product[];
  initialQuery: string;
  initialFilters: ProductFilters;
}) {
  const router = useRouter();
  const query = initialQuery.trim();
  const hasFilters = Object.values(initialFilters).some(Boolean);

  const [products, setProducts] = useState(initialProducts);
  const [filters, setFilters] = useState<ProductFilters>(initialFilters);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(
    hasFilters ? initialProducts.length > 0 : initialProducts.length === PAGE_SIZE
  );
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);
  const isFirstFilterRender = useRef(true);
  const hasMoreRef = useRef(hasFilters ? initialProducts.length > 0 : initialProducts.length === PAGE_SIZE);
  const productsRef = useRef(initialProducts);

  const ratingValue = normalizeRating(filters.minRating);
  const autoTarget = buildShopTarget(query, filters);
  const categoryTitle = formatCategoryTitle(initialFilters.mainCategory);

  const activeFilterCount = [
    query, filters.subCategory, filters.brand, filters.color, filters.minRating,
  ].filter(Boolean).length;

  function toggleDropdown(name: string) {
    setOpenDropdown((prev) => (prev === name ? null : name));
  }

  function updateFilter(key: keyof ProductFilters, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  useEffect(() => { productsRef.current = products; }, [products]);
  useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);

  useEffect(() => {
    if (isFirstFilterRender.current) { isFirstFilterRender.current = false; return; }
    const id = window.setTimeout(() => router.replace(autoTarget), 250);
    return () => window.clearTimeout(id);
  }, [autoTarget, router]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || loadingRef.current || !hasMoreRef.current) return;
        loadingRef.current = true;
        setIsLoadingMore(true);
        setPage((c) => c + 1);
      },
      { rootMargin: "320px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (page === 0 || !hasMoreRef.current) return;
    const loadPage = async () => {
      try {
        const next = query
          ? await searchProducts(query, { page, size: PAGE_SIZE })
          : await filterProducts(initialFilters, { page, size: PAGE_SIZE });

        if (next.length === 0) { hasMoreRef.current = false; setHasMore(false); setError(null); return; }

        const unique = next.filter((p) => !productsRef.current.some((c) => c.asin === p.asin));
        if (unique.length === 0) { hasMoreRef.current = false; setHasMore(false); setError(null); return; }

        setProducts((current) => {
          const merged = mergeProducts(current, unique);
          productsRef.current = merged;
          return merged;
        });
        const nextHasMore = next.length === PAGE_SIZE;
        hasMoreRef.current = nextHasMore;
        setHasMore(nextHasMore);
        setError(null);
      } catch {
        hasMoreRef.current = false;
        setHasMore(false);
        setError("Products could not be loaded.");
      } finally {
        loadingRef.current = false;
        setIsLoadingMore(false);
      }
    };
    void loadPage();
  }, [initialFilters, page, query]);

  return (
    <div className="min-h-screen bg-white">

      {/* ── Page Header ── */}
      <div className="border-b border-neutral-100 pt-28 pb-7">
        <Container>
          <div className="flex items-end justify-between gap-4">
            <div>
              {(query || initialFilters.mainCategory) && (
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.28em] text-neutral-400">
                  {query ? "Search results" : "Collection"}
                </p>
              )}
              <h1 className="text-5xl font-black tracking-[-0.03em] text-neutral-950">
                {query ? `"${query}"` : categoryTitle}
              </h1>
            </div>
            {products.length > 0 && (
              <p className="shrink-0 pb-1 text-sm text-neutral-400">
                <span className="font-semibold text-neutral-700">{products.length}</span> items
              </p>
            )}
          </div>
        </Container>
      </div>

      {/* ── Sticky Filter Bar ── */}
      <div className="sticky top-[6.25rem] z-30 border-b border-neutral-100 bg-white/95 backdrop-blur-md">
        <Container>
          <div className="flex items-center gap-2 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

            {/* Filter: Category */}
            <FilterDropdown
              label="Category"
              displayValue={filters.subCategory || undefined}
              isActive={!!filters.subCategory}
              isOpen={openDropdown === "category"}
              onToggle={() => toggleDropdown("category")}
              onClear={() => updateFilter("subCategory", "")}
            >
              <SearchableListPanel
                items={QUICK_SUBCATEGORIES}
                selected={filters.subCategory ?? ""}
                placeholder="Search category..."
                onSelect={(val) => {
                  updateFilter("subCategory", val);
                  if (val) setOpenDropdown(null);
                }}
              />
            </FilterDropdown>

            {/* Filter: Brand */}
            <FilterDropdown
              label="Brand"
              displayValue={filters.brand || undefined}
              isActive={!!filters.brand}
              isOpen={openDropdown === "brand"}
              onToggle={() => toggleDropdown("brand")}
              onClear={() => updateFilter("brand", "")}
            >
              <SearchableListPanel
                items={POPULAR_BRANDS}
                selected={filters.brand ?? ""}
                placeholder="Search brand..."
                onSelect={(val) => {
                  updateFilter("brand", val);
                  if (val) setOpenDropdown(null);
                }}
              />
            </FilterDropdown>

            {/* Filter: Color */}
            <FilterDropdown
              label="Color"
              displayValue={filters.color || undefined}
              isActive={!!filters.color}
              colorHex={filters.color ? (COLOR_MAP[filters.color] ?? undefined) : undefined}
              isOpen={openDropdown === "color"}
              onToggle={() => toggleDropdown("color")}
              onClear={() => updateFilter("color", "")}
            >
              <ColorPanel
                selected={filters.color ?? ""}
                onSelect={(val) => {
                  updateFilter("color", val);
                  if (val) setOpenDropdown(null);
                }}
              />
            </FilterDropdown>

            {/* Filter: Rating */}
            <FilterDropdown
              label="Rating"
              displayValue={ratingValue > 0 ? `${ratingValue}★ +` : undefined}
              isActive={ratingValue > 0}
              isOpen={openDropdown === "rating"}
              onToggle={() => toggleDropdown("rating")}
              onClear={() => updateFilter("minRating", "")}
              panelWidth={256}
            >
              <RatingPanel
                value={ratingValue}
                onChange={(v) => updateFilter("minRating", v)}
              />
            </FilterDropdown>

            {/* Separator + Clear all */}
            {activeFilterCount > 0 && (
              <>
                <div className="mx-1 h-4 w-px shrink-0 bg-neutral-200" />
                <button
                  type="button"
                  onClick={() => router.push(query ? `/shop?q=${encodeURIComponent(query)}` : "/shop")}
                  className="shrink-0 rounded-full border border-neutral-200 px-3.5 py-2 text-xs font-semibold text-neutral-500 transition-all hover:border-neutral-400 hover:text-neutral-900"
                >
                  Clear all
                </button>
              </>
            )}
          </div>
        </Container>
      </div>

      {/* ── Products ── */}
      <div className="pb-24">
        <Container>
          <div className="pt-8">
            {products.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/50 px-6 py-24 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100">
                  <svg className="h-5 w-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-neutral-700">No products found</p>
                <p className="mt-1 text-xs text-neutral-400">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid gap-x-4 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {products.map((product) => {
                  const rating = starCount(product.ratingStars);
                  return (
                    <article key={product.asin} className="group">
                      {/* Image */}
                      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-100">
                        <Link href={`/product/${product.asin}`} className="absolute inset-0 z-0">
                          {product.allImages?.length > 0 && (
                            <Image
                              src={product.allImages[0]}
                              alt={product.title}
                              fill
                              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
                            />
                          )}
                        </Link>

                        {/* Star badge */}
                        {rating > 0 && (
                          <div className="absolute left-2.5 top-2.5 z-10 flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 backdrop-blur-sm">
                            <svg className="h-3 w-3 shrink-0 fill-amber-400" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-[11px] font-semibold leading-none text-white">
                              {rating.toFixed(1)}
                            </span>
                          </div>
                        )}

                        <FavoriteButton
                          asin={product.asin}
                          initialFavorite={product.favorite}
                          className="absolute right-2.5 top-2.5 z-10 h-8 w-8"
                        />

                        {/* Hover overlay */}
                        <div className="absolute inset-x-0 bottom-0 z-20 translate-y-full rounded-b-2xl transition-transform duration-300 ease-out group-hover:translate-y-0">
                          <div className="bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-transparent px-3 pb-4 pt-14">
                            <AddToCartButton asin={product.asin} overlay />
                          </div>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="mt-3 px-0.5">
                        <Link href={`/product/${product.asin}`} className="block">
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">
                            {product.brandName}
                          </p>
                          <p className="mt-0.5 line-clamp-1 text-sm font-medium text-neutral-900 transition-colors group-hover:text-neutral-600">
                            {product.title}
                          </p>
                        </Link>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <div>
                            <p className="text-sm font-bold text-neutral-950">
                              ${parseFloat(product.priceValue).toFixed(2)}
                            </p>
                            {product.ratingCount && (
                              <p className="text-[10px] text-neutral-400">{product.ratingCount}</p>
                            )}
                          </div>
                          <div className="lg:hidden">
                            <AddToCartButton asin={product.asin} label="Add" />
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            <div ref={sentinelRef} className="h-10" aria-hidden="true" />

            {isLoadingMore && (
              <div className="flex justify-center pt-8">
                <div className="h-7 w-7 animate-spin rounded-full border-[2.5px] border-neutral-200 border-t-neutral-900" />
              </div>
            )}

            {error && (
              <p className="pt-4 text-center text-sm text-red-500">{error}</p>
            )}
          </div>
        </Container>
      </div>
    </div>
  );
}
