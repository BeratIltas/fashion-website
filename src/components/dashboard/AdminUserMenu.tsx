"use client";

import { useRef, useState, useEffect } from "react";
import { LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function AdminUserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    router.push("/login");
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 hover:border-neutral-300 transition-colors"
      >
        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-xs font-semibold text-neutral-900 leading-none">{user?.firstName}</p>
          <p className="text-[10px] text-neutral-400 leading-none mt-0.5">Administrator</p>
        </div>
        <ChevronDown size={12} className={`text-neutral-400 transition-transform hidden sm:block ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 w-44 rounded-xl border border-neutral-200 bg-white shadow-lg overflow-hidden">
          <div className="px-3 py-2.5 border-b border-neutral-100">
            <p className="text-xs font-semibold text-neutral-900 truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-[10px] text-neutral-400 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
