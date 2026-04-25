"use client";

import { Fragment, useEffect, useState } from "react";
import { getAdminUsers, type AdminUser } from "@/lib/adminApi";
import AdminBell from "@/components/dashboard/AdminBell";
import AdminUserMenu from "@/components/dashboard/AdminUserMenu";
import {
  ChevronDown,
  LoaderCircle,
  MapPin,
  Phone,
  Search,
  Shield,
  ShoppingBag,
  User,
  Users,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const ROLE_STYLES: Record<string, string> = {
  ADMIN:  "bg-orange-50 text-orange-700 border border-orange-100",
  SELLER: "bg-amber-50 text-amber-700 border border-amber-100",
  USER:   "bg-neutral-100 text-neutral-600 border border-neutral-200",
};

const ROLE_ICONS: Record<string, React.ReactNode> = {
  ADMIN:  <Shield size={10} />,
  SELLER: <ShoppingBag size={10} />,
  USER:   <User size={10} />,
};

const ROLE_CARDS = [
  { role: "USER",   label: "Customers", icon: User,        accent: "bg-neutral-100",  text: "text-neutral-600" },
  { role: "SELLER", label: "Sellers",   icon: ShoppingBag, accent: "bg-amber-50",     text: "text-amber-600"   },
  { role: "ADMIN",  label: "Admins",    icon: Shield,      accent: "bg-orange-50",    text: "text-orange-600"  },
];

function UserAvatar({ user, size = "md" }: { user: AdminUser; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "lg" ? "h-14 w-14 text-base" : size === "sm" ? "h-7 w-7 text-[10px]" : "h-8 w-8 text-[11px]";
  if (user.photoURL) {
    return (
      <img
        src={user.photoURL}
        alt=""
        className={`${sizeClass} shrink-0 rounded-full object-cover`}
      />
    );
  }
  return (
    <div className={`${sizeClass} shrink-0 rounded-full bg-orange-50 flex items-center justify-center font-semibold text-orange-600`}>
      {user.firstName?.[0]}{user.lastName?.[0]}
    </div>
  );
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    getAdminUsers()
      .then(setUsers)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) => {
    const name = `${u.firstName} ${u.lastName}`.toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || u.role?.toUpperCase() === roleFilter;
    return matchSearch && matchRole;
  });

  const roleCounts = users.reduce<Record<string, number>>((acc, u) => {
    const r = u.role?.toUpperCase() ?? "UNKNOWN";
    acc[r] = (acc[r] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center gap-4 border-b border-neutral-200 bg-white px-6 py-3 shrink-0">
        <div className="flex items-center gap-2 flex-1 max-w-sm rounded-lg border border-neutral-200 bg-neutral-50 px-3.5 py-2">
          <Search size={13} className="text-neutral-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="bg-transparent outline-none text-neutral-800 placeholder:text-neutral-400 text-xs w-full"
          />
        </div>
        <div className="ml-auto flex items-center gap-3">
          <AdminBell />
          <AdminUserMenu />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto bg-neutral-50">
        <div className="bg-white border-b border-neutral-200 px-6 py-6">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-orange-500 mb-1">Admin Console</p>
          <h1 className="text-[28px] font-semibold tracking-tight text-neutral-900">Users</h1>
          <p className="mt-0.5 text-sm text-neutral-500">{filtered.length} of {users.length} users</p>
        </div>

        <div className="px-6 py-5 space-y-5">
          {!loading && (
            <div className="grid grid-cols-3 gap-4">
              {ROLE_CARDS.map(({ role, label, icon: Icon, accent, text }) => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(roleFilter === role ? "" : role)}
                  className={`relative bg-white rounded-xl border p-5 text-left transition-all hover:border-orange-300 ${
                    roleFilter === role ? "border-orange-400 ring-2 ring-orange-100" : "border-neutral-200"
                  }`}
                >
                  {roleFilter === role && <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-xl bg-orange-500" />}
                  <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg ${accent} ${text}`}>
                    <Icon size={16} />
                  </div>
                  <p className="text-[34px] font-semibold leading-none tracking-tight text-neutral-900">{roleCounts[role] ?? 0}</p>
                  <p className="text-xs text-neutral-500 mt-1">{label}</p>
                </button>
              ))}
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-20 text-neutral-400">
              <LoaderCircle size={18} className="animate-spin mr-2" /> Loading users...
            </div>
          )}
          {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

          {!loading && !error && (
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-100 text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
                    <th className="px-6 py-3.5 text-left">User</th>
                    <th className="px-6 py-3.5 text-left">Email</th>
                    <th className="px-6 py-3.5 text-left">Role</th>
                    <th className="px-6 py-3.5 text-left">Auth Provider</th>
                    <th className="px-6 py-3.5 w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <Users size={24} className="mx-auto mb-2 text-neutral-300" />
                        <p className="text-sm text-neutral-400">No users found.</p>
                      </td>
                    </tr>
                  )}
                  {filtered.map((u) => {
                    const roleKey = u.role?.toUpperCase() ?? "USER";
                    const isOpen = expanded === u.id;
                    return (
                      <Fragment key={u.id}>
                        <tr
                          onClick={() => setExpanded(isOpen ? null : u.id)}
                          className="hover:bg-orange-50/20 transition-colors cursor-pointer group"
                        >
                          <td className="px-6 py-3.5">
                            <div className="flex items-center gap-3">
                              <UserAvatar user={u} size="md" />
                              <div>
                                <p className="text-xs font-medium text-neutral-900">{u.firstName} {u.lastName}</p>
                                <p className="text-[10px] text-neutral-400">ID: {u.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-3.5 text-xs text-neutral-600">{u.email}</td>
                          <td className="px-6 py-3.5">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${ROLE_STYLES[roleKey] ?? "bg-neutral-100 text-neutral-600"}`}>
                              {ROLE_ICONS[roleKey]}
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-3.5">
                            <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-medium text-neutral-600 border border-neutral-200">
                              {u.authProvider || "—"}
                            </span>
                          </td>
                          <td className="px-6 py-3.5">
                            <ChevronDown
                              size={14}
                              className={`text-neutral-300 group-hover:text-neutral-500 transition-all duration-200 ${isOpen ? "rotate-180" : ""}`}
                            />
                          </td>
                        </tr>
                        {isOpen && (
                          <tr key={`${u.id}-detail`}>
                            <td colSpan={5} className="bg-orange-50/30 border-b border-neutral-100 px-6 py-5">
                              <div className="flex items-start gap-5">
                                <UserAvatar user={u} size="lg" />
                                <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4">
                                  <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-1">Full Name</p>
                                    <p className="text-sm font-medium text-neutral-900">{u.firstName} {u.lastName}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-1 flex items-center gap-1">
                                      <Phone size={9} /> Phone
                                    </p>
                                    <p className="text-sm text-neutral-700">{u.phone || <span className="text-neutral-300">—</span>}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-1 flex items-center gap-1">
                                      <MapPin size={9} /> City
                                    </p>
                                    <p className="text-sm text-neutral-700">{u.city || <span className="text-neutral-300">—</span>}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-1 flex items-center gap-1">
                                      <MapPin size={9} /> Country
                                    </p>
                                    <p className="text-sm text-neutral-700">{u.country || <span className="text-neutral-300">—</span>}</p>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
