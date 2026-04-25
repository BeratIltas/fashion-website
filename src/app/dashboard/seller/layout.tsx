"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  HelpCircle,
  LogOut,
  Bell,
  ExternalLink,
} from "lucide-react";
import { playfair } from "@/app/fonts";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/seller" },
  { icon: Package, label: "Inventory", href: "/dashboard/seller/inventory" },
  { icon: ShoppingBag, label: "Orders", href: "/dashboard/seller/orders" },
];

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9]" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Sidebar */}
      <nav className="fixed left-0 top-0 bottom-0 flex flex-col h-screen w-64 border-r border-neutral-200 bg-white z-50">
        <div className="px-8 py-8">
          <span className={`text-2xl font-bold tracking-tight text-black ${playfair.className}`}>
            Miragé
          </span>
          <p className="text-[10px] tracking-widest text-neutral-500 uppercase mt-1">Seller Portal</p>
        </div>

        <div className="flex flex-col flex-grow mt-4">
          {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
            const isActive =
              href === "/dashboard/seller"
                ? pathname === href
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-8 py-3 transition-colors duration-200 ${
                  isActive
                    ? "text-black font-semibold border-r-2 border-black bg-neutral-50"
                    : "text-neutral-500 hover:bg-neutral-100 hover:text-black"
                }`}
              >
                <Icon size={20} />
                <span className="text-[12px] tracking-widest font-semibold uppercase">{label}</span>
              </Link>
            );
          })}
        </div>

        <div className="p-8 border-t border-neutral-100">
          <Link
            href="/"
            className="w-full flex items-center justify-between py-2 mb-6 border-b border-black group"
          >
            <span className="text-[12px] tracking-widest font-semibold uppercase">View Store</span>
            <ExternalLink size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <div className="flex flex-col gap-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 text-neutral-400 hover:text-black transition-colors"
            >
              <LogOut size={18} />
              <span className="text-xs">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Top Header */}
      <header className="fixed left-64 right-0 top-0 h-16 px-10 bg-white/80 backdrop-blur-md z-40 flex justify-between items-center border-b border-neutral-100">
        <div />
        <div className="flex items-center gap-4">
          <button className="relative text-neutral-500 hover:text-black transition-colors">
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-black rounded-full" />
          </button>
          <div className="h-8 w-8 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-semibold text-neutral-600 select-none">
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="ml-64 pt-16">{children}</main>
    </div>
  );
}
