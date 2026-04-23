"use client";

import { useEffect, useState } from "react";
import {
  getAnnouncements,
  createAnnouncement,
  toggleAnnouncement,
  type Announcement,
} from "@/lib/adminApi";
import AdminBell from "@/components/dashboard/AdminBell";
import {
  CheckCircle2,
  Clock,
  LoaderCircle,
  Megaphone,
  Plus,
  Radio,
  X,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminAnnouncementsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [toggleError, setToggleError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [newActive, setNewActive] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  useEffect(() => {
    getAnnouncements()
      .then(setItems)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!newMessage.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      const created = await createAnnouncement(newMessage.trim(), newActive);
      setItems((prev) => [created, ...prev]);
      setNewMessage("");
      setShowForm(false);
    } catch (e: unknown) {
      setCreateError(e instanceof Error ? e.message : "Failed to create");
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (id: number) => {
    setTogglingId(id);
    setToggleError(null);
    try {
      const updated = await toggleAnnouncement(id);
      setItems((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } catch (e: unknown) {
      setToggleError(e instanceof Error ? e.message : "Failed to toggle");
    } finally {
      setTogglingId(null);
    }
  };

  const activeItems = items.filter((a) => a.active);
  const inactiveItems = items.filter((a) => !a.active);
  const filtered = filter === "active" ? activeItems : filter === "inactive" ? inactiveItems : items;

  function fmtDate(d: string) {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center gap-4 border-b border-neutral-200 bg-white px-6 py-3 shrink-0">
        <h1 className="text-sm font-semibold text-neutral-800">Announcements</h1>
        <div className="ml-auto flex items-center gap-3">
          <AdminBell />
          <div className="flex items-center gap-2.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-[11px] font-bold text-white">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-neutral-900 leading-none">{user?.firstName}</p>
              <p className="text-[10px] text-neutral-400 leading-none mt-0.5">Administrator</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto bg-neutral-50">
        <div className="bg-white border-b border-neutral-200 px-6 py-6">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-orange-500 mb-1">Admin Console</p>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-[28px] font-semibold tracking-tight text-neutral-900">Announcements</h1>
              <p className="mt-0.5 text-sm text-neutral-500">{activeItems.length} active · {inactiveItems.length} inactive</p>
            </div>
            <button
              onClick={() => setShowForm((v) => !v)}
              className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-xs font-semibold text-white hover:bg-orange-600 transition-colors shadow-sm shadow-orange-200"
            >
              {showForm ? <X size={13} /> : <Plus size={13} />}
              {showForm ? "Cancel" : "New Announcement"}
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total", count: items.length, icon: Megaphone, accent: "bg-neutral-200", iconCls: "text-neutral-500" },
              { label: "Active", count: activeItems.length, icon: Radio, accent: "bg-emerald-400", iconCls: "text-emerald-600" },
              { label: "Inactive", count: inactiveItems.length, icon: Clock, accent: "bg-neutral-300", iconCls: "text-neutral-400" },
            ].map(({ label, count, icon: Icon, accent, iconCls }) => (
              <div key={label} className="relative bg-white rounded-xl border border-neutral-200 p-5 overflow-hidden">
                <div className={`absolute inset-x-0 top-0 h-0.5 ${accent}`} />
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[11px] uppercase tracking-widest font-semibold text-neutral-400">{label}</span>
                  <Icon size={15} className={iconCls} />
                </div>
                <p className="text-[36px] font-semibold leading-none tracking-tight text-neutral-900">{count}</p>
              </div>
            ))}
          </div>

          {/* Create form */}
          {showForm && (
            <div className="bg-white rounded-xl border border-orange-200 p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center">
                  <Megaphone size={15} className="text-orange-500" />
                </div>
                <h2 className="text-sm font-semibold text-neutral-900">New Announcement</h2>
              </div>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                rows={3}
                placeholder="Write your announcement message..."
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none focus:border-orange-400 focus:bg-white placeholder:text-neutral-400 transition-colors resize-none"
              />
              <div className="mt-3 flex items-center justify-between">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <button
                    type="button"
                    onClick={() => setNewActive((v) => !v)}
                    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 ${newActive ? "bg-orange-500" : "bg-neutral-200"}`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200 ${newActive ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>
                  <span className="text-xs text-neutral-600">{newActive ? "Publish immediately" : "Save as inactive"}</span>
                </label>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowForm(false)} className="rounded-lg border border-neutral-200 px-3.5 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={creating || !newMessage.trim()}
                    className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-600 disabled:opacity-50 transition-colors"
                  >
                    {creating ? <LoaderCircle size={12} className="animate-spin" /> : <Plus size={12} />}
                    Create
                  </button>
                </div>
              </div>
              {createError && <p className="mt-2 rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-600">{createError}</p>}
            </div>
          )}

          {toggleError && <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-3 text-sm text-red-600">{toggleError}</div>}

          {/* Filter tabs */}
          <div className="flex items-center gap-1 bg-neutral-100 rounded-lg p-1 w-fit">
            {(["all", "active", "inactive"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-md px-4 py-1.5 text-xs font-semibold transition-colors capitalize ${
                  filter === f ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {loading && (
            <div className="flex items-center justify-center py-16 text-neutral-400">
              <LoaderCircle size={18} className="animate-spin mr-2" /> Loading...
            </div>
          )}
          {error && <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600">{error}</div>}
          {!loading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center bg-white rounded-xl border border-neutral-200 py-16 text-neutral-400">
              <Megaphone size={28} className="mb-3 opacity-20" />
              <p className="text-sm">No announcements</p>
            </div>
          )}

          <div className="space-y-3">
            {filtered.map((a) => (
              <div key={a.id} className={`bg-white rounded-xl border transition-all ${a.active ? "border-emerald-200 shadow-sm shadow-emerald-50" : "border-neutral-200"}`}>
                <div className="flex items-start gap-4 p-5">
                  <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${a.active ? "bg-emerald-50" : "bg-neutral-100"}`}>
                    {a.active ? <Radio size={16} className="text-emerald-500" /> : <Megaphone size={16} className="text-neutral-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${a.active ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-500"}`}>
                        {a.active ? <><CheckCircle2 size={9} /> LIVE</> : <><XCircle size={9} /> INACTIVE</>}
                      </span>
                      <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                        <Clock size={9} /> {fmtDate(a.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-800 leading-relaxed">{a.message}</p>
                  </div>
                  <div className="shrink-0 flex flex-col items-center gap-1.5 mt-0.5">
                    <button
                      onClick={() => handleToggle(a.id)}
                      disabled={togglingId === a.id}
                      title={a.active ? "Deactivate" : "Activate"}
                      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-300 focus:outline-none disabled:opacity-50 ${a.active ? "bg-emerald-500" : "bg-neutral-200"}`}
                    >
                      <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-300 ${a.active ? "translate-x-6" : "translate-x-1"}`}>
                        {togglingId === a.id && <LoaderCircle size={9} className="animate-spin text-neutral-400" />}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
