"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type RefObject } from "react";
import { Bell, LogIn, LogOut, Megaphone, Search, ShoppingBag, User, UserPlus } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Container from "@/components/ui/Container";
import { playfair } from "@/app/fonts";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { getPublicAnnouncements, type PublicAnnouncement } from "@/lib/api";

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

function safePriceNumber(priceValue: unknown): number {
  if (typeof priceValue === "number" && Number.isFinite(priceValue)) return priceValue;
  if (typeof priceValue === "string") {
    const cleaned = priceValue.replace(/[^0-9.,-]/g, "").replace(",", ".");
    const parsed = Number.parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function formatAnnouncementDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function useOnClickOutsideMany(
  refs: RefObject<HTMLElement | null>[],
  handler: () => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;

      for (const ref of refs) {
        const element = ref.current;
        if (element && element.contains(target)) return;
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

const megaMenus = {
  men: {
    label: "Men",
    mainCategory: "men",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
    imageTitle: "Modern menswear",
    columns: [
      {
        title: "Featured",
        links: [
          { label: "All Men", href: "/shop?mainCategory=men" },
          { label: "Top Rated", href: "/shop?mainCategory=men&minRating=4.5" },
          { label: "Black Edit", href: "/shop?mainCategory=men&color=Black" },
        ],
      },
      {
        title: "Clothing",
        links: [
          { label: "T-Shirts", href: "/shop?mainCategory=men&subCategory=T-Shirts" },
          { label: "Shirts", href: "/shop?mainCategory=men&subCategory=Shirts" },
          { label: "Hoodies", href: "/shop?mainCategory=men&subCategory=Hoodies%20%26%20Sweatshirts" },
          { label: "Jackets", href: "/shop?mainCategory=men&subCategory=Jackets" },
          { label: "Jeans", href: "/shop?mainCategory=men&subCategory=Jeans" },
        ],
      },
      {
        title: "Shoes & More",
        links: [
          { label: "Sneakers", href: "/shop?mainCategory=men&subCategory=Sneakers" },
          { label: "Running Shoes", href: "/shop?mainCategory=men&subCategory=Running%20Shoes" },
          { label: "Bags", href: "/shop?mainCategory=men&subCategory=Bags" },
          { label: "Belts", href: "/shop?mainCategory=men&subCategory=Belts" },
          { label: "Accessories", href: "/shop?mainCategory=men&subCategory=Accessories" },
        ],
      },
    ],
  },
  women: {
    label: "Women",
    mainCategory: "women",
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
    imageTitle: "Modern womenswear",
    columns: [
      {
        title: "Featured",
        links: [
          { label: "Sale", href: "/shop?mainCategory=women" },
          { label: "All Women", href: "/shop?mainCategory=women" },
          { label: "Top Rated", href: "/shop?mainCategory=women&minRating=4.5" },
        ],
      },
      {
        title: "Clothing",
        links: [
          { label: "T-Shirts", href: "/shop?mainCategory=women&subCategory=T-Shirts" },
          { label: "Dresses", href: "/shop?mainCategory=women&subCategory=Dresses" },
          { label: "Jackets", href: "/shop?mainCategory=women&subCategory=Jackets" },
          { label: "Jeans", href: "/shop?mainCategory=women&subCategory=Jeans" },
          { label: "Tops", href: "/shop?mainCategory=women&subCategory=Tops%20%26%20Blouses" },
        ],
      },
      {
        title: "Shoes & More",
        links: [
          { label: "Sneakers", href: "/shop?mainCategory=women&subCategory=Sneakers" },
          { label: "Flats", href: "/shop?mainCategory=women&subCategory=Flats" },
          { label: "Bags", href: "/shop?mainCategory=women&subCategory=Bags" },
          { label: "Belts", href: "/shop?mainCategory=women&subCategory=Belts" },
          { label: "Accessories", href: "/shop?mainCategory=women&subCategory=Accessories" },
        ],
      },
    ],
  },
} as const;

export default function Navbar({ transparentOnTop = false }: { transparentOnTop?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenu, setOpenMenu] = useState<"cart" | "notifications" | "profile" | "men" | "women" | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [announcements, setAnnouncements] = useState<PublicAnnouncement[]>([]);

  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isHome = pathname === "/";
  const onHero = transparentOnTop && isHome && !scrolled;
  const currentSearchQuery = searchParams.get("q") ?? "";

  const profileRef = useRef<HTMLDivElement | null>(null);
  const cartRef = useRef<HTMLDivElement | null>(null);
  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const menRef = useRef<HTMLDivElement | null>(null);
  const womenRef = useRef<HTMLDivElement | null>(null);
  const megaMenuPanelRef = useRef<HTMLDivElement | null>(null);
  const megaMenuCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useOnClickOutsideMany([profileRef, cartRef, notificationsRef, searchRef, menRef, womenRef], () => {
    setOpenMenu(null);
    setSearchOpen(false);
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setHydrated(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    let active = true;

    async function loadAnnouncements() {
      try {
        const data = await getPublicAnnouncements();
        if (!active) return;
        setAnnouncements(
          data
            .filter((announcement) => announcement.active)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        );
      } catch (error) {
        console.error("Failed to load announcements:", error);
      }
    }

    void loadAnnouncements();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (megaMenuCloseTimerRef.current) {
        clearTimeout(megaMenuCloseTimerRef.current);
      }
    };
  }, []);

  const { cart } = useCart();
  const cartCount = cart?.totalItems ?? 0;
  const cartTotal = cart?.totalPrice ?? 0;
  const { user, logout } = useAuth();

  const cartOpen = openMenu === "cart";
  const notificationsOpen = openMenu === "notifications";
  const profileOpen = openMenu === "profile";
  const megaMenuOpen = openMenu === "men" || openMenu === "women";
  const useSolidHeader = megaMenuOpen || !onHero;
  const activeMenu = openMenu === "men" ? megaMenus.men : openMenu === "women" ? megaMenus.women : null;
  const latestAnnouncements = announcements.slice(0, 3);

  const headerClass = megaMenuOpen
    ? "bg-white"
    : useSolidHeader
      ? "border-b border-neutral-200 bg-white/95 shadow-sm backdrop-blur-md"
      : "bg-transparent";

  const textClass = useSolidHeader ? "text-neutral-900" : "text-white";
  const subtleTextClass = useSolidHeader ? "text-neutral-700" : "text-white/80";
  const solidIconBtnClass = useSolidHeader
    ? "bg-white text-neutral-900 ring-1 ring-neutral-200 hover:bg-neutral-50"
    : "bg-white/15 text-white ring-1 ring-white/20 hover:bg-white/20";
  const navLinkClass = useSolidHeader
    ? "transition text-neutral-700 hover:text-neutral-900"
    : "transition text-white/80 hover:text-white";

  const closeMegaMenu = () => {
    if (megaMenuCloseTimerRef.current) {
      clearTimeout(megaMenuCloseTimerRef.current);
      megaMenuCloseTimerRef.current = null;
    }
    setOpenMenu((current) => (current === "men" || current === "women" ? null : current));
  };

  const cancelMegaMenuClose = () => {
    if (megaMenuCloseTimerRef.current) {
      clearTimeout(megaMenuCloseTimerRef.current);
      megaMenuCloseTimerRef.current = null;
    }
  };

  const scheduleMegaMenuClose = () => {
    cancelMegaMenuClose();
    megaMenuCloseTimerRef.current = setTimeout(() => {
      setOpenMenu((current) => (current === "men" || current === "women" ? null : current));
      megaMenuCloseTimerRef.current = null;
    }, 120);
  };

  const handleMegaTriggerLeave = (event: ReactMouseEvent<HTMLDivElement>) => {
    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Node && megaMenuPanelRef.current?.contains(nextTarget)) return;
    scheduleMegaMenuClose();
  };

  const handleLogout = async () => {
    await logout();
    setOpenMenu(null);
    router.push("/login");
  };

  return (
    <>
      {megaMenuOpen && (
        <div className="pointer-events-none fixed inset-0 top-9 z-40 bg-neutral-950/18 backdrop-blur-[2px]" />
      )}

      <header className={`fixed left-0 top-9 z-50 w-full transition-all duration-300 ${headerClass}`}>
        <Container>
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className={`text-2xl font-bold tracking-tight ${textClass} ${playfair.className}`}>
              Miragé
            </Link>
            <nav className={`hidden items-center gap-10 text-sm font-medium md:flex ${subtleTextClass}`}>
              <Link className={navLinkClass} href="/" onMouseEnter={closeMegaMenu}>
                Home
              </Link>
              <div
                ref={menRef}
                onMouseEnter={() => {
                  cancelMegaMenuClose();
                  setOpenMenu("men");
                }}
                onMouseLeave={handleMegaTriggerLeave}
              >
                <Link className={navLinkClass} href="/shop?mainCategory=men">
                  Men
                </Link>
              </div>
              <div
                ref={womenRef}
                onMouseEnter={() => {
                  cancelMegaMenuClose();
                  setOpenMenu("women");
                }}
                onMouseLeave={handleMegaTriggerLeave}
              >
                <Link className={navLinkClass} href="/shop?mainCategory=women">
                  Women
                </Link>
              </div>
              <Link className={navLinkClass} href="/blog" onMouseEnter={closeMegaMenu}>
                Blog
              </Link>
              <Link className={navLinkClass} href="/contact" onMouseEnter={closeMegaMenu}>
                Contact
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <div
                ref={searchRef}
                className={`overflow-hidden rounded-full border transition-all duration-300 ${useSolidHeader
                  ? "border-neutral-200 bg-white shadow-sm"
                  : "border-white/20 bg-white/12 backdrop-blur-md"
                  } ${searchOpen ? "w-72" : "w-10"}`}
                onMouseEnter={() => {
                  setSearchQuery(currentSearchQuery);
                  setSearchOpen(true);
                }}
                onMouseLeave={() => setSearchOpen(false)}
              >
                <form
                  className="flex h-10 items-center"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const nextQuery = searchQuery.trim();
                    const href = nextQuery ? `/shop?q=${encodeURIComponent(nextQuery)}` : "/shop";
                    setSearchOpen(false);
                    router.push(href);
                  }}
                >
                  <button
                    type="button"
                    aria-label="Search"
                    className={`flex h-10 w-10 shrink-0 items-center justify-center transition ${useSolidHeader ? "text-neutral-900" : "text-white"
                      }`}
                    onClick={() => {
                      setSearchQuery(currentSearchQuery);
                      setSearchOpen(true);
                    }}
                  >
                    <Search size={18} />
                  </button>

                  <input
                    value={searchQuery}
                    onFocus={() => {
                      setSearchQuery(currentSearchQuery);
                      setSearchOpen(true);
                    }}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search products"
                    className={`min-w-0 flex-1 bg-transparent pr-2 text-sm outline-none transition ${useSolidHeader ? "text-neutral-900 placeholder:text-neutral-400" : "text-white placeholder:text-white/60"
                      } ${searchOpen ? "opacity-100" : "opacity-0"}`}
                  />

                  <button
                    type="submit"
                    className={`mr-1 rounded-full px-3 py-1.5 text-xs font-medium transition ${searchOpen ? "opacity-100" : "pointer-events-none opacity-0"
                      } ${useSolidHeader ? "bg-black text-white hover:bg-neutral-800" : "bg-white text-black hover:bg-white/90"}`}
                  >
                    Search
                  </button>
                </form>
              </div>

              <div ref={cartRef} className="relative">
                <button
                  type="button"
                  aria-label="Cart"
                  className={`relative flex h-10 w-10 items-center justify-center rounded-full transition ${useSolidHeader ? "bg-black text-white hover:bg-neutral-800" : "bg-black/45 text-white hover:bg-black/55"
                    }`}
                  onClick={() => router.push("/cart")}
                  onMouseEnter={() => setOpenMenu("cart")}
                >
                  <ShoppingBag size={18} />
                  {hydrated && cartCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
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
                      <div className="py-6 text-center text-sm text-neutral-500">Your cart is empty.</div>
                    ) : (
                      <>
                        <div className="mb-3 flex items-center justify-between">
                          <div className="text-sm font-semibold text-neutral-900">Your cart</div>
                          <Link href="/cart" className="text-xs text-neutral-600 hover:text-black">
                            View cart
                          </Link>
                        </div>

                        <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
                          {cart.items.map((item) => {
                            const imgSrc = getFirstImageSrc(item.product?.allImages);
                            const unitPrice = safePriceNumber(item.product?.priceValue);
                            const lineTotal = unitPrice * (item.quantity ?? 0);

                            return (
                              <div key={item.id} className="flex gap-3">
                                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-2xl bg-neutral-100">
                                  <Image
                                    src={imgSrc}
                                    alt={item.product.title}
                                    fill
                                    className="object-cover"
                                    sizes="48px"
                                    unoptimized={imgSrc.includes("amazon.com")}
                                    onError={(event) => {
                                      const target = event.target as HTMLImageElement;
                                      target.src = "/placeholder.png";
                                    }}
                                  />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="truncate text-sm font-medium text-neutral-900">
                                    {item.product.title}
                                  </div>
                                  <div className="text-xs text-neutral-600">
                                    {item.quantity} x ${unitPrice.toFixed(2)}
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

              <div ref={notificationsRef} className="relative">
                <button
                  type="button"
                  aria-label="Notifications"
                  className={`relative flex h-10 w-10 items-center justify-center rounded-full transition ${solidIconBtnClass}`}
                  onClick={() => {
                    setOpenMenu(null);
                    router.push("/notifications");
                  }}
                  onMouseEnter={() => setOpenMenu("notifications")}
                >
                  <Bell size={18} />
                  {hydrated && user && announcements.length > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] text-white">
                      {announcements.length > 9 ? "9+" : announcements.length}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div
                    className="absolute right-0 mt-3 w-[340px] rounded-3xl border border-neutral-200 bg-white p-4 shadow-lg"
                    onMouseLeave={() => setOpenMenu(null)}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-neutral-900">Notifications</div>
                        <div className="mt-0.5 text-xs text-neutral-500">Latest store updates</div>
                      </div>
                      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-neutral-950 text-white">
                        <Bell size={16} />
                      </div>
                    </div>

                    {latestAnnouncements.length === 0 ? (
                      <div className="rounded-2xl bg-neutral-50 px-4 py-6 text-center text-sm text-neutral-500">
                        No notifications yet.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {latestAnnouncements.map((announcement) => (
                          <div
                            key={announcement.id}
                            className="flex gap-3 rounded-2xl border border-neutral-100 bg-neutral-50 px-3 py-3"
                          >
                            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-neutral-700 shadow-sm">
                              <Megaphone size={14} />
                            </div>
                            <div className="min-w-0">
                              <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-400">
                                {formatAnnouncementDate(announcement.createdAt)}
                              </div>
                              <p className="mt-1 line-clamp-2 text-sm leading-5 text-neutral-800">
                                {announcement.message}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <Link
                      href="/notifications"
                      className="mt-3 flex w-full items-center justify-center rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
                      onClick={() => setOpenMenu(null)}
                    >
                      View more
                    </Link>
                  </div>
                )}
              </div>

              <div ref={profileRef} className="relative">
                <button
                  type="button"
                  aria-label="Account"
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition ${solidIconBtnClass}`}
                  onClick={() => {
                    if (user) {
                      setOpenMenu(null);
                      router.push("/profile");
                      return;
                    }

                    setOpenMenu((menu) => (menu === "profile" ? null : "profile"));
                  }}
                  onMouseEnter={() => setOpenMenu("profile")}
                >
                  <User size={18} />
                </button>

                {profileOpen && (
                  <div
                    className="absolute right-0 mt-3 w-56 rounded-3xl border border-neutral-200 bg-white p-2 shadow-lg"
                    onMouseLeave={() => setOpenMenu(null)}
                  >
                    {user ? (
                      <>
                        <Link
                          href="/profile"
                          className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-sm hover:bg-neutral-50"
                          onClick={() => setOpenMenu(null)}
                        >
                          <User size={16} />
                          Profile
                        </Link>
                        <Link
                          href="/orders"
                          className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-sm hover:bg-neutral-50"
                          onClick={() => setOpenMenu(null)}
                        >
                          <ShoppingBag size={16} />
                          Orders
                        </Link>
                        <Link
                          href="/favorites"
                          className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-sm hover:bg-neutral-50"
                          onClick={() => setOpenMenu(null)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-heart"
                          >
                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                          </svg>
                          Favorites
                        </Link>
                        <button
                          className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-sm text-red-600 hover:bg-neutral-50"
                          onClick={() => {
                            void handleLogout();
                          }}
                        >
                          <LogOut size={16} />
                          Logout
                        </button>
                      </>
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

        {activeMenu && (
          <MegaMenu
            menu={activeMenu}
            onNavigate={(href) => {
              closeMegaMenu();
              window.location.href = href;
            }}
            onClose={scheduleMegaMenuClose}
            onMouseEnter={cancelMegaMenuClose}
            panelRef={megaMenuPanelRef}
          />
        )}
      </header>
    </>
  );
}

function MegaMenu({
  menu,
  onNavigate,
  onClose,
  onMouseEnter,
  panelRef,
}: {
  menu: (typeof megaMenus)["men"] | (typeof megaMenus)["women"];
  onNavigate: (href: string) => void;
  onClose: () => void;
  onMouseEnter: () => void;
  panelRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="absolute left-0 top-[calc(100%-1px)] w-full">
      <Container>
        <div
          ref={panelRef}
          className="overflow-hidden border border-neutral-200 bg-white text-neutral-900 shadow-[0_32px_80px_-56px_rgba(0,0,0,0.38)]"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onClose}
        >
          <div className="grid grid-cols-[1fr_1fr_1fr_minmax(16rem,24rem)] gap-0">
            {menu.columns.map((column) => (
              <div key={column.title} className="border-r border-neutral-200 px-8 py-8 last:border-r-0">
                <div className="text-[11px] uppercase tracking-[0.24em] text-neutral-400">{column.title}</div>
                <div className="mt-4 grid gap-3">
                  {column.links.map((link) => (
                    <button
                      key={link.label}
                      type="button"
                      className="text-left text-sm font-medium text-neutral-900 transition hover:translate-x-1 hover:text-neutral-500"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        onNavigate(link.href);
                      }}
                      onClick={() => onNavigate(link.href)}
                    >
                      {link.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="relative min-h-[23rem] border-l border-neutral-200 bg-neutral-100">
              <Image
                src={menu.image}
                alt={menu.imageTitle}
                fill
                className="object-cover grayscale contrast-125 brightness-[0.82]"
                sizes="384px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/16 to-white/10" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <div className="text-[11px] uppercase tracking-[0.24em] text-white/70">{menu.label}</div>
                <div className="mt-2 text-2xl font-semibold tracking-tight">{menu.imageTitle}</div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}


