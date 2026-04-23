"use client";

import { useEffect, useState } from "react";
import { getContactMessages } from "@/lib/adminApi";
import { Bell } from "lucide-react";
import Link from "next/link";

export default function AdminBell() {
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    getContactMessages()
      .then((msgs) => setHasUnread(msgs.some((m) => !m.read)))
      .catch(() => {});
  }, []);

  return (
    <Link
      href="/dashboard/admin/contact"
      className="relative rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 transition-colors"
    >
      <Bell size={16} />
      {hasUnread && (
        <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-orange-500" />
      )}
    </Link>
  );
}
