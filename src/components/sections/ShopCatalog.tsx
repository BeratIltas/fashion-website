"use client";

import { useEffect, useRef, useState } from "react";
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
  "adidas",
  "Nike",
  "ASICS",
  "New Balance",
  "Reebok",
  "PUMA",
  "Under Armour",
  "Skechers",
  "THE NORTH FACE",
  "Columbia",
  "Lacoste",
  "Tommy Hilfiger",
  "Calvin Klein",
  "GUESS",
  "Nautica",
  "Levi's",
  "Lee",
  "Wrangler",
  "POLO RALPH LAUREN",
  "U.S. Polo Assn.",
  "Champion",
  "Carhartt",
  "Dockers",
  "Haggar",
  "Fruit of the Loom",
  "Hanes",
  "Gildan",
  "Jerzees",
  "Russell Athletic",
  "Dickies",
  "True Religion",
  "Lucky Brand",
  "Rock & Republic",
  "Gloria Vanderbilt",
  "London Fog",
  "French Toast",
  "Nine West",
  "Clarks",
  "Cole Haan",
  "Rockport",
  "Merrell",
  "Hey Dude",
  "Gerber",
  "Burt's Bees Baby",
  "Hudson Baby",
  "HonestBaby",
  "Simple Joys by Carter's",
  "The Children's Place",
  "Liberty Imports",
  "Bruno Marc",
  "CAMEL CROWN",
  "KuaiLu",
  "Feethit",
  "Obtaom",
  "LARNMERN",
  "Hike Footwear",
  "VILOCY",
];

const POPULAR_COLORS = [
  "Black",
  "White",
  "Grey",
  "Dark Grey",
  "Light Grey",
  "Navy Blue",
  "Blue",
  "Light Blue",
  "Royal Blue",
  "Green",
  "Dark Green",
  "Olive",
  "Khaki",
  "Beige",
  "Brown",
  "Coffee",
  "Red",
  "Wine Red",
  "Orange",
  "Yellow",
];

const COLOR_MAP: Record<string, string> = {
  "Black": "#111111",
  "White": "#f5f5f5",
  "Grey": "#6b7280",
  "Dark Grey": "#3f3f46",
  "Light Grey": "#d4d4d8",
  "Navy Blue": "#1e3a5f",
  "Blue": "#2563eb",
  "Light Blue": "#7dd3fc",
  "Royal Blue": "#1d4ed8",
  "Green": "#2d6a4f",
  "Dark Green": "#166534",
  "Olive": "#65730a",
  "Khaki": "#a3824e",
  "Beige": "#d4b896",
  "Brown": "#78450f",
  "Coffee": "#6f4e37",
  "Red": "#c0392b",
  "Wine Red": "#7f1d1d",
  "Orange": "#ea580c",
  "Yellow": "#eab308",
};

const LIGHT_COLORS = new Set(["White", "Light Grey", "Light Blue", "Beige", "Yellow"]);

const QUICK_SUBCATEGORIES = [
  "T-Shirts",
  "Shirts",
  "Hoodies & Sweatshirts",
  "Jackets & Coats",
  "Tops & Blouses",
  "Pants",
  "Jeans",
  "Shorts",
  "Dresses",
  "Jumpsuits & Rompers",
  "Sneakers",
  "Running Shoes",
  "Sandals",
  "Flats",
  "Loafers & Slip-ons",
  "Oxfords",
  "Pumps",
  "Jackets",
  "Coats",
  "Outerwear",
  "Underwear",
  "Socks",
  "Sleepwear",
  "Loungewear",
  "Activewear",
  "Athletic Wear",
  "Yoga",
  "Running",
  "Golf",
  "Skiing",
  "Bags",
  "Belts",
  "Accessories",
];

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconSearch() {
  return (
    <svg className="h-3.5 w-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function IconX() {
  return (
    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
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
      className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180 text-neutral-700" : "text-neutral-400"}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

// ─── Search Input ─────────────────────────────────────────────────────────────

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
        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pl-8 pr-8 text-[12px] text-neutral-800 placeholder-neutral-400 outline-none focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-100 transition-all"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition"
        >
          <IconX />
        </button>
      )}
    </div>
  );
}

// ─── Accordion ────────────────────────────────────────────────────────────────

function FilterAccordion({
  label,
  badge,
  badgeColor,
  isOpen,
  onToggle,
  children,
}: {
  label: string;
  badge?: string;
  badgeColor?: string; // hex color for badge background
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  // Decide text color on the badge based on luminance of the background
  const isLightBadge = badgeColor
    ? ["#f5f5f5", "#fef3c7", "#faf7f2", "#eab308", "#6ee7b7", "#a78bfa"].includes(badgeColor)
    : false;
  const openWithColor = isOpen && !!badgeColor;

  return (
    <div className="rounded-2xl overflow-hidden border border-neutral-100 bg-white transition-all duration-200">
      <button
        type="button"
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors ${openWithColor
            ? ""
            : isOpen
              ? "bg-neutral-950 text-white"
              : "bg-white hover:bg-neutral-50"
          }`}
        style={
          openWithColor
            ? {
              backgroundColor: badgeColor,
              color: isLightBadge ? "#171717" : "#ffffff",
            }
            : undefined
        }
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className={`text-[11px] font-bold uppercase tracking-[0.2em] shrink-0 ${openWithColor ? "" : isOpen ? "text-white" : "text-neutral-700"
              }`}
            style={openWithColor ? { color: isLightBadge ? "#171717" : "#ffffff" } : undefined}
          >
            {label}
          </span>
          {badge && !isOpen && (
            <span
              className="truncate max-w-[80px] rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide"
              style={
                badgeColor
                  ? {
                    backgroundColor: badgeColor,
                    color: isLightBadge ? "#1a1a1a" : "#ffffff",
                    boxShadow: `0 0 0 1.5px ${badgeColor}66`,
                  }
                  : {
                    backgroundColor: "#0a0a0a",
                    color: "#ffffff",
                  }
              }
            >
              {badge}
            </span>
          )}
          {badge && isOpen && (
            <span
              className="truncate max-w-[80px] rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide"
              style={
                openWithColor
                  ? {
                    backgroundColor: isLightBadge ? "rgba(23,23,23,0.08)" : "rgba(255,255,255,0.18)",
                    color: isLightBadge ? "#171717" : "#ffffff",
                  }
                  : undefined
              }
            >
              {badge}
            </span>
          )}
        </div>
        <IconChevron open={isOpen} />
      </button>

      {isOpen && (
        <div className="border-t border-neutral-100 bg-white">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Searchable List ──────────────────────────────────────────────────────────

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
      <div className="max-h-52 overflow-y-auto space-y-0.5 [scrollbar-width:thin] [scrollbar-color:#e5e5e5_transparent]">
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
                className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-[13px] font-medium transition-all duration-100 ${active
                    ? "bg-neutral-950 text-white shadow-sm"
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

// ─── Color Panel ──────────────────────────────────────────────────────────────

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
          <div className="grid grid-cols-4 gap-x-1 gap-y-3 py-1.5 px-1">
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
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <span
                    className={`relative h-10 w-10 rounded-2xl flex items-center justify-center transition-all duration-150 ${active
                        ? "ring-2 ring-offset-2 ring-neutral-950 scale-105 shadow-md"
                        : `hover:scale-105 hover:shadow-sm ${isLight ? "ring-1 ring-neutral-200" : ""}`
                      }`}
                    style={{ backgroundColor: hex }}
                  >
                    {active && (
                      <IconCheck className={`h-4 w-4 drop-shadow-sm ${isLight ? "text-neutral-800" : "text-white"}`} />
                    )}
                  </span>
                  <span
                    className={`text-[9px] font-semibold capitalize leading-tight transition-colors ${active ? "sr-only" : "text-neutral-400 group-hover:text-neutral-600"
                      }`}
                  >
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

// ─── Rating Panel (always open) ───────────────────────────────────────────────

function RatingPanel({ value, onChange }: {
  value: number;
  onChange: (v: string) => void;
}) {
  const stars = [1, 2, 3, 4, 5];
  const sliderClassName = "relative w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_1px_6px_rgba(0,0,0,0.2),0_0_0_2px_rgba(234,179,8,0.4)] [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-[0_1px_6px_rgba(0,0,0,0.2)]";
  return (
    <div className="rounded-2xl border border-neutral-100 bg-white overflow-hidden">
      {/* Label row */}
      <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-neutral-50 to-white border-b border-neutral-100">
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-700">Min. Rating</span>
        <div className="flex items-center gap-1.5">
          {value > 0 ? (
            <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
              {value.toFixed(1)} ★ +
            </span>
          ) : (
            <span className="text-xs text-neutral-400">Any</span>
          )}
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Star quick-select */}
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => onChange("")}
            className={`flex-1 rounded-xl py-2 text-[11px] font-semibold transition-all ${value === 0
                ? "bg-neutral-950 text-white shadow-sm"
                : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
              }`}
          >
            All
          </button>
          {stars.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onChange(value === s ? "" : String(s))}
              className={`flex-1 rounded-xl py-2 text-[11px] font-semibold transition-all ${value === s
                  ? "bg-amber-400 text-white shadow-sm"
                  : "bg-neutral-100 text-neutral-500 hover:bg-amber-50 hover:text-amber-600"
                }`}
            >
              {s}★
            </button>
          ))}
        </div>

        {/* Slider */}
        <div>
          <div className="relative h-5 flex items-center">
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
            <span>0</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
  if (normalized === "men" || normalized === "men") return "Men";
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

// ─── Main ─────────────────────────────────────────────────────────────────────

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
  const [openPanel, setOpenPanel] = useState<string | null>(null);

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

  function togglePanel(panel: string) {
    setOpenPanel((prev) => (prev === panel ? null : panel));
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
    <section className="pb-16 pt-28">
      <Container>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-neutral-400 mb-2">Collection</p>
              <h1 className="text-5xl font-bold tracking-[-0.05em] text-neutral-950">{categoryTitle}</h1>
            </div>
          </div>
          <div className="mt-4 h-px bg-gradient-to-r from-neutral-200 via-neutral-300 to-transparent" />
        </div>

        <div className="grid gap-8 lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start">

          {/* ── Sidebar — auto height, sticky ── */}
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              {/* Outer card */}
              <div className="rounded-3xl border border-neutral-200/80 bg-neutral-50 p-3 shadow-[0_4px_24px_-6px_rgba(0,0,0,0.08)] space-y-2">

                {/* Header row */}
                <div className="flex items-center justify-between px-2 py-1.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex gap-1">
                      <div className="h-2.5 w-2.5 rounded-full bg-neutral-900" />
                      <div className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
                      <div className="h-2.5 w-2.5 rounded-full bg-neutral-150" style={{ backgroundColor: "#e8e8e8" }} />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-neutral-500">Filters</span>
                    {activeFilterCount > 0 && (
                      <span className="inline-flex h-4.5 min-w-[1.125rem] items-center justify-center rounded-full bg-neutral-900 px-1.5 text-[9px] font-bold text-white">
                        {activeFilterCount}
                      </span>
                    )}
                  </div>
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={() => router.push(query ? `/shop?q=${encodeURIComponent(query)}` : "/shop")}
                      className="text-[10px] font-semibold text-neutral-400 hover:text-neutral-700 transition uppercase tracking-wider"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Category accordion */}
                <FilterAccordion
                  label="Category"
                  badge={filters.subCategory || undefined}
                  isOpen={openPanel === "category"}
                  onToggle={() => togglePanel("category")}
                >
                  <SearchableListPanel
                    items={QUICK_SUBCATEGORIES}
                    selected={filters.subCategory ?? ""}
                    placeholder="Search category..."
                    onSelect={(val) => updateFilter("subCategory", val)}
                  />
                </FilterAccordion>

                {/* Brand accordion */}
                <FilterAccordion
                  label="Brand"
                  badge={filters.brand || undefined}
                  isOpen={openPanel === "brand"}
                  onToggle={() => togglePanel("brand")}
                >
                  <SearchableListPanel
                    items={POPULAR_BRANDS}
                    selected={filters.brand ?? ""}
                    placeholder="Search brand..."
                    onSelect={(val) => updateFilter("brand", val)}
                  />
                </FilterAccordion>

                {/* Color accordion */}
                <FilterAccordion
                  label="Color"
                  badge={filters.color || undefined}
                  badgeColor={filters.color ? (COLOR_MAP[filters.color] ?? undefined) : undefined}
                  isOpen={openPanel === "color"}
                  onToggle={() => togglePanel("color")}
                >
                  <ColorPanel
                    selected={filters.color ?? ""}
                    onSelect={(val) => updateFilter("color", val)}
                  />
                </FilterAccordion>

                {/* Rating — always open, separate card style */}
                <RatingPanel
                  value={ratingValue}
                  onChange={(v) => updateFilter("minRating", v)}
                />
              </div>
            </div>
          </aside>

          {/* ── Product Grid ── */}
          <div>
            {products.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-neutral-200 bg-neutral-50 px-6 py-20 text-center">
                <p className="text-2xl mb-2">🔍</p>
                <p className="text-sm font-medium text-neutral-500">No products match the current filters.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {products.map((product) => (
                  <article
                    key={product.asin}
                    className="group rounded-3xl border border-neutral-200/70 bg-white p-3 transition-all duration-200 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-xl"
                  >
                    <Link href={`/product/${product.asin}`}>
                      <div className="relative aspect-square overflow-hidden rounded-2xl bg-neutral-100">
                        {product.allImages?.length > 0 && (
                          <Image
                            src={product.allImages[0]}
                            alt={product.title}
                            fill
                            className="object-cover transition duration-300 group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                          />
                        )}
                        <div className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-neutral-800 backdrop-blur">
                          <span className="text-amber-400">★</span>
                          {starCount(product.ratingStars).toFixed(1)}
                        </div>
                        <FavoriteButton
                          asin={product.asin}
                          initialFavorite={product.favorite}
                          className="absolute right-3 top-3 z-10 h-8 w-8"
                        />
                      </div>
                    </Link>
                    <div className="mt-3 px-1">
                      <div className="line-clamp-1 text-[11px] font-medium uppercase tracking-[0.12em] text-neutral-400">
                        {product.brandName}
                      </div>
                      <div className="mt-1 line-clamp-1 text-sm font-semibold text-neutral-900">
                        {product.title}
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <div>
                          <div className="text-base font-bold tracking-tight text-neutral-950">
                            ${parseFloat(product.priceValue).toFixed(2)}
                          </div>
                          <div className="text-[11px] text-neutral-400">{product.ratingCount}</div>
                        </div>
                        <AddToCartButton asin={product.asin} label="Add" />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <div ref={sentinelRef} className="h-10" aria-hidden="true" />

            {isLoadingMore && (
              <div className="flex justify-center pt-6">
                <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-neutral-200 border-t-neutral-900" />
              </div>
            )}

            {error && <p className="pt-4 text-center text-sm text-red-500">{error}</p>}
          </div>
        </div>
      </Container>
    </section>
  );
}
