"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Search, ShoppingBag, User, LogIn, UserPlus, LogOut } from "lucide-react";
import Container from "@/components/ui/Container";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname, useRouter } from "next/navigation";

/** Birçok backend allImages'i bazen string(JSON) / bazen array / bazen tek string döndürebiliyor.
 *  next/image'e HER ZAMAN geçerli bir src (absolute URL veya / ile başlayan local path) vermek zorundayız.
 */
function getFirstImageSrc(allImages: unknown): string {
  const placeholder = "/placeholder.png";

  // 1) Array ise ilk dolu string
  if (Array.isArray(allImages)) {
    const first = allImages.find((x) => typeof x === "string" && x.trim().length > 0);
    return typeof first === "string" ? first.trim() : placeholder;
  }

  // 2) String ise
  if (typeof allImages === "string") {
    const s = allImages.trim();
    if (!s) return placeholder;

    // Direct URL / local path
    if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("/")) return s;

    // JSON string: '["https://...","..."]' veya "['https://...','...']"
    if (s.startsWith("[")) {
      try {
        // Tek tırnakları çift tırnaklara çevir
        const normalized = s.replace(/'/g, '"');
        const parsed = JSON.parse(normalized);
        if (Array.isArray(parsed)) {
          const first = parsed.find((x) => typeof x === "string" && x.trim().length > 0);
          return typeof first === "string" ? first.trim() : placeholder;
        }
      } catch (error) {
        console.error("Error parsing allImages JSON:", error);
        return placeholder;
      }
    }

    return placeholder;
  }

  return placeholder;
}

function safePriceNumber(priceValue: unknown): number {
  if (typeof priceValue === "number" && Number.isFinite(priceValue)) return priceValue;
  if (typeof priceValue === "string") {
    // "$12.34" gibi gelebilir diye temizleyelim
    const cleaned = priceValue.replace(/[^0-9.,-]/g, "").replace(",", ".");
    const n = Number.parseFloat(cleaned);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function useOnClickOutsideMany(
  refs: React.RefObject<HTMLElement | null>[],
  handler: () => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;

      // herhangi bir ref'in içindeyse kapatma
      for (const r of refs) {
        const el = r.current;
        if (el && el.contains(target)) return;
      }
      handler();
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [refs, handler]);
}

export default function Navbar({ transparentOnTop = false }: { transparentOnTop?: boolean }) {
  const [scrolled, setScrolled] = useState(false);

  // ✅ TEK STATE: hangi menü açık?
  const [openMenu, setOpenMenu] = useState<"cart" | "profile" | null>(null);
  const cartOpen = openMenu === "cart";
  const profileOpen = openMenu === "profile";

  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";
  const onHero = isHome && !scrolled;

  const profileRef = useRef<HTMLDivElement | null>(null);
  const cartRef = useRef<HTMLDivElement | null>(null);

  // ✅ dışarı tıklayınca ikisi de kapansın
  useOnClickOutsideMany([profileRef, cartRef], () => setOpenMenu(null));

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { cart } = useCart();
  const cartCount = cart?.totalItems ?? 0;
  const cartTotal = cart?.totalPrice ?? 0;

  const { user, logout } = useAuth();

  const headerClass =
    onHero
      ? "bg-transparent"
      : "bg-white/95 backdrop-blur-md shadow-sm border-b border-neutral-200";

  const textClass = onHero ? "text-white" : "text-neutral-900";
  const subtleTextClass = onHero ? "text-white/80" : "text-neutral-700";

  const solidIconBtnClass = onHero
    ? "bg-white/15 text-white ring-1 ring-white/20 hover:bg-white/20"
    : "bg-white text-neutral-900 ring-1 ring-neutral-200 hover:bg-neutral-50";

  return (
    <header className={`fixed top-9 left-0 w-full z-50 transition-all duration-300 ${headerClass}`}>
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className={`text-lg font-semibold tracking-tight ${textClass}`}>
          Miragé
          </Link>

          {/* Menu (md+) */}
          <nav className={`hidden md:flex gap-8 text-sm font-medium ${subtleTextClass}`}>
            <Link className={`hover:${textClass} transition`} href="/">
              Home
            </Link>
            <Link className={`hover:${textClass} transition`} href="/about">
              About
            </Link>
            <Link className={`hover:${textClass} transition`} href="/shop">
              Shop
            </Link>
            <Link className={`hover:${textClass} transition`} href="/blog">
              Blog
            </Link>
            <Link className={`hover:${textClass} transition`} href="/contact">
              Contact
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <button
              type="button"
              aria-label="Search"
              className={`flex h-10 w-10 items-center justify-center rounded-full transition ${solidIconBtnClass}`}
              onClick={() => alert("Search modal later")}
            >
              <Search size={18} />
            </button>

            {/* Cart */}
            <div ref={cartRef} className="relative">
              <button
                type="button"
                aria-label="Cart"
                className={`relative flex h-10 w-10 items-center justify-center rounded-full transition ${
                  onHero ? "bg-black/45 text-white hover:bg-black/55" : "bg-black text-white hover:bg-neutral-800"
                }`}
                onClick={() => router.push("/cart")}
                onMouseEnter={() => setOpenMenu("cart")} // ✅ profile kapanır
              >
                <ShoppingBag size={18} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                    {cartCount}
                  </span>
                )}
              </button>

              {cartOpen && (
                <div
                  className="absolute right-0 mt-3 w-[320px] rounded-3xl border border-neutral-200 bg-white p-4 shadow-lg"
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  {!cart || cart.items.length === 0 ? (
                    <div className="py-6 text-sm text-neutral-500 text-center">Your cart is empty.</div>
                  ) : (
                    <>
                      <div className="mb-3 flex items-center justify-between">
                        <div className="text-sm font-semibold text-neutral-900">Your cart</div>
                        <Link href="/cart" className="text-xs text-neutral-600 hover:text-black">
                          View cart
                        </Link>
                      </div>

                      <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
                        {cart.items.map((it) => {
                          const imgSrc = getFirstImageSrc((it as any)?.product?.allImages);
                          const unitPrice = safePriceNumber((it as any)?.product?.priceValue);
                          const lineTotal = unitPrice * (it.quantity ?? 0);

                          return (
                            <div key={it.id} className="flex gap-3">
                              <div className="relative h-12 w-12 rounded-2xl bg-neutral-100 overflow-hidden flex-shrink-0">
                                <Image
                                  src={imgSrc}
                                  alt={it.product.title}
                                  fill
                                  className="object-cover"
                                  sizes="48px"
                                  unoptimized={imgSrc.includes('amazon.com')}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = "/placeholder.png";
                                  }}
                                />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-medium text-neutral-900">
                                  {it.product.title}
                                </div>
                                <div className="text-xs text-neutral-600">
                                  {it.quantity} × ${unitPrice.toFixed(2)}
                                </div>
                              </div>

                              <div className="text-sm font-semibold text-neutral-900">
                                ${lineTotal.toFixed(2)}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-neutral-200 pt-3">
                        <div className="text-sm text-neutral-600">Subtotal</div>
                        <div className="text-sm font-semibold text-neutral-900">
                          ${Number.isFinite(cartTotal) ? cartTotal.toFixed(2) : "0.00"}
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <Link
                          href="/checkout"
                          className="rounded-2xl bg-black px-4 py-3 text-center text-sm font-medium text-white hover:bg-neutral-800"
                        >
                          Checkout
                        </Link>
                        <Link
                          href="/cart"
                          className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-center text-sm font-medium hover:bg-neutral-50"
                          onClick={() => setOpenMenu(null)}
                        >
                          View cart
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Profile */}
            <div ref={profileRef} className="relative">
              <button
                type="button"
                aria-label="Account"
                className={`flex h-10 w-10 items-center justify-center rounded-full transition ${solidIconBtnClass}`}
                onClick={() => setOpenMenu((m) => (m === "profile" ? null : "profile"))}
                onMouseEnter={() => setOpenMenu("profile")} // ✅ cart kapanır
              >
                <User size={18} />
              </button>

              {profileOpen && (
                <div
                  className="absolute right-0 mt-3 w-56 rounded-3xl border border-neutral-200 bg-white p-2 shadow-lg"
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  {user ? (
                    <button
                      className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-sm hover:bg-neutral-50"
                      onClick={() => {
                        logout();
                        setOpenMenu(null);
                      }}
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="flex items-center gap-2 rounded-2xl px-3 py-2 text-sm hover:bg-neutral-50"
                      >
                        <LogIn size={16} />
                        Login
                      </Link>
                      <Link
                        href="/register"
                        className="flex items-center gap-2 rounded-2xl px-3 py-2 text-sm hover:bg-neutral-50"
                      >
                        <UserPlus size={16} />
                        Register
                      </Link>
                      <div className="my-2 h-px bg-neutral-200" />
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </header>
  );
}