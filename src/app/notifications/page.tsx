"use client";

import { Bell, LoaderCircle, Megaphone, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import Container from "@/components/ui/Container";
import { getPublicAnnouncements, type PublicAnnouncement } from "@/lib/api";

function formatAnnouncementDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default function NotificationsPage() {
  const [announcements, setAnnouncements] = useState<PublicAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadAnnouncements() {
      setLoading(true);
      setError(null);

      try {
        const data = await getPublicAnnouncements();
        if (!active) return;
        setAnnouncements(
          data
            .filter((announcement) => announcement.active)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        );
      } catch (loadError) {
        console.error(loadError);
        if (active) setError("Notifications could not be loaded right now.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadAnnouncements();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-50">
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          backgroundImage:
            "linear-gradient(rgba(24,24,27,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(24,24,27,0.055) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-white via-white/70 to-transparent" />
      <div className="pointer-events-none absolute left-[12%] top-36 h-64 w-64 rounded-full bg-neutral-300/50 blur-3xl" />
      <div className="pointer-events-none absolute right-[10%] top-44 h-80 w-80 rounded-full bg-stone-200/70 blur-3xl" />

      <Container>
        <div className="relative z-10 pt-24 pb-16">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500 shadow-sm backdrop-blur">
                <Sparkles size={13} />
                Updates
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-neutral-950 md:text-5xl">
                Notifications
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-600">
                Follow store updates, announcements, and important account notes in one place.
              </p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-neutral-950 text-white shadow-[0_20px_50px_-30px_rgba(0,0,0,0.7)]">
              <Bell size={22} />
            </div>
          </div>

          <section className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-[0_28px_90px_-58px_rgba(0,0,0,0.42)]">
            <div className="border-b border-neutral-200 bg-neutral-950 px-5 py-6 text-white md:px-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.22em] text-white/45">Latest news</div>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">Store announcements</h2>
                </div>
                <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/70">
                  {announcements.length} active
                </div>
              </div>
            </div>

            <div className="p-5 md:p-8">
              {loading ? (
                <div className="flex min-h-56 items-center justify-center">
                  <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-5 py-3 text-sm text-neutral-600 shadow-sm">
                    <LoaderCircle size={16} className="animate-spin" />
                    Loading notifications...
                  </div>
                </div>
              ) : error ? (
                <div className="rounded-3xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600">
                  {error}
                </div>
              ) : announcements.length === 0 ? (
                <div className="rounded-3xl border border-neutral-200 bg-neutral-50 px-6 py-14 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-neutral-500 shadow-sm">
                    <Bell size={22} />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-neutral-950">No notifications yet</h3>
                  <p className="mt-2 text-sm text-neutral-500">New updates will appear here when they are published.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {announcements.map((announcement, index) => (
                    <article
                      key={announcement.id}
                      className="group relative overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-50 p-5 transition hover:-translate-y-0.5 hover:border-neutral-300 hover:bg-white hover:shadow-[0_18px_50px_-38px_rgba(0,0,0,0.5)]"
                    >
                      <div className="absolute inset-y-0 left-0 w-1 bg-neutral-950 opacity-0 transition group-hover:opacity-100" />
                      <div className="flex gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-neutral-950 text-white">
                          <Megaphone size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                              Announcement {index + 1}
                            </span>
                            <span className="h-1 w-1 rounded-full bg-neutral-300" />
                            <span className="text-xs text-neutral-500">
                              {formatAnnouncementDate(announcement.createdAt)}
                            </span>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-neutral-800">{announcement.message}</p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </Container>
    </main>
  );
}
