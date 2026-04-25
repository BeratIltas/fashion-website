"use client";

import { useEffect, useState } from "react";
import { getContactMessages, markContactRead, type ContactMessage } from "@/lib/adminApi";
import AdminBell from "@/components/dashboard/AdminBell";
import AdminUserMenu from "@/components/dashboard/AdminUserMenu";
import {
  CheckCheck,
  LoaderCircle,
  Mail,
  MailOpen,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminContactPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [markingId, setMarkingId] = useState<number | null>(null);
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  const fetchMessages = (unread: boolean) => {
    setLoading(true);
    getContactMessages(unread)
      .then(setMessages)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMessages(unreadOnly);
  }, [unreadOnly]);

  const handleMarkRead = async (id: number) => {
    setMarkingId(id);
    try {
      const updated = await markContactRead(id);
      setMessages((prev) => prev.map((m) => (m.id === id ? updated : m)));
      if (selected?.id === id) setSelected(updated);
    } catch {
      // ignore
    } finally {
      setMarkingId(null);
    }
  };

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <>
      <header className="flex items-center gap-4 border-b border-neutral-200 bg-white px-6 py-3 shrink-0">
        <h1 className="text-sm font-semibold text-neutral-800">Contact Messages</h1>
        <div className="ml-auto flex items-center gap-3">
          <AdminBell />
          <AdminUserMenu />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Inbox */}
        <div className="flex w-[360px] shrink-0 flex-col border-r border-neutral-200 bg-white">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-200">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-neutral-900">Inbox</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-orange-500 text-white px-2 py-0.5 text-[10px] font-semibold">{unreadCount}</span>
              )}
            </div>
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={unreadOnly}
                onChange={(e) => setUnreadOnly(e.target.checked)}
                className="accent-orange-500 border-neutral-300"
              />
              <span className="text-[11px] text-neutral-500">Unread only</span>
            </label>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-neutral-100">
            {loading && (
              <div className="flex items-center justify-center py-10 text-neutral-400">
                <LoaderCircle size={15} className="animate-spin mr-2" /> Loading...
              </div>
            )}
            {error && <p className="px-5 py-3 text-xs text-red-600">{error}</p>}
            {!loading && messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-neutral-300">
                <Mail size={24} className="mb-2" />
                <p className="text-xs">No messages.</p>
              </div>
            )}
            {messages.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelected(m)}
                className={`flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-orange-50/40 ${
                  selected?.id === m.id ? "bg-orange-50/60 border-l-2 border-orange-500" : "border-l-2 border-transparent"
                }`}
              >
                <div className={`mt-0.5 shrink-0 ${m.read ? "text-neutral-300" : "text-orange-500"}`}>
                  {m.read ? <MailOpen size={14} /> : <Mail size={14} />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-xs truncate ${m.read ? "text-neutral-500" : "font-semibold text-neutral-900"}`}>
                      {m.fullName}
                    </span>
                    {!m.read && <span className="ml-2 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />}
                  </div>
                  <p className="truncate text-[11px] font-medium text-neutral-600">{m.subject}</p>
                  <p className="truncate text-[10px] text-neutral-400">{m.message}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Detail */}
        <div className="flex flex-1 flex-col overflow-y-auto bg-neutral-50">
          {!selected && (
            <div className="flex flex-1 flex-col items-center justify-center text-neutral-300">
              <Mail size={32} className="mb-3" />
              <p className="text-sm">Select a message to read</p>
            </div>
          )}
          {selected && (
            <div className="px-8 py-7">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900">{selected.subject}</h2>
                  <div className="mt-1.5 flex items-center gap-2 text-sm text-neutral-500 flex-wrap">
                    <span className="font-medium text-neutral-700">{selected.fullName}</span>
                    <span>·</span>
                    <a href={`mailto:${selected.email}`} className="hover:underline hover:text-orange-600 transition-colors">{selected.email}</a>
                    <span>·</span>
                    <span>{new Date(selected.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                  </div>
                </div>
                {!selected.read && (
                  <button
                    onClick={() => handleMarkRead(selected.id)}
                    disabled={markingId === selected.id}
                    className="flex shrink-0 items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-600 transition-colors disabled:opacity-50"
                  >
                    {markingId === selected.id ? <LoaderCircle size={12} className="animate-spin" /> : <CheckCheck size={13} />}
                    Mark as read
                  </button>
                )}
                {selected.read && (
                  <span className="flex shrink-0 items-center gap-1.5 rounded-lg bg-neutral-100 border border-neutral-200 px-3 py-1.5 text-[11px] font-semibold text-neutral-500">
                    <CheckCheck size={11} /> Read
                  </span>
                )}
              </div>

              <div className="rounded-xl border border-neutral-200 bg-white px-6 py-5">
                <p className="text-sm leading-relaxed text-neutral-700 whitespace-pre-wrap">{selected.message}</p>
              </div>

              <div className="mt-5">
                <a
                  href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-xs font-semibold text-white hover:bg-orange-600 transition-colors"
                >
                  <Mail size={13} />
                  Reply via email
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
