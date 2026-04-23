"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Mail,
  Megaphone,
  Package,
  ShoppingBag,
  Shield,
  Tag,
  Users,
} from "lucide-react";

const NAV = [
  { href: "/dashboard/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/admin/orders", icon: ShoppingBag, label: "Orders" },
  { href: "/dashboard/admin/products", icon: Package, label: "Products" },
  { href: "/dashboard/admin/users", icon: Users, label: "Users" },
  { href: "/dashboard/admin/discounts", icon: Tag, label: "Discounts" },
  { href: "/dashboard/admin/announcements", icon: Megaphone, label: "Announcements" },
  { href: "/dashboard/admin/contact", icon: Mail, label: "Contact" },
];

export default function AdminSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const isActive = (href: string) =>
    href === "/dashboard/admin" ? pathname === href : pathname.startsWith(href);

  return (
    <aside
      className={`flex flex-col bg-[#111318] text-white transition-all duration-300 shrink-0 ${
        collapsed ? "w-[68px]" : "w-60"
      }`}
    >
      {/* Logo */}
      <button
        onClick={onToggle}
        className="flex items-center gap-3 px-4 py-5 border-b border-white/8 w-full hover:bg-white/5 transition-colors"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-orange-500/20 rounded-lg">
          <Shield size={18} className="text-orange-400" />
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold tracking-tight text-white/80">Admin Panel</span>
        )}
      </button>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors ${
                active
                  ? "bg-orange-500/15 text-orange-300 font-medium"
                  : "text-white/45 hover:bg-white/6 hover:text-white/75"
              }`}
            >
              <Icon size={17} className="shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
              {!collapsed && active && (
                <ChevronRight size={13} className="ml-auto shrink-0 opacity-50 text-orange-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-white/8 px-2.5 py-3">
        <div className={`flex items-center gap-3 rounded-lg px-2 py-2 ${collapsed ? "justify-center" : ""}`}>
          <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-[11px] font-bold text-white">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white/80">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="truncate text-[10px] text-white/35 uppercase tracking-wider">Admin</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="shrink-0 rounded-md p-1 text-white/35 hover:text-white/70 transition-colors"
              title="Sign out"
            >
              <LogOut size={14} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
