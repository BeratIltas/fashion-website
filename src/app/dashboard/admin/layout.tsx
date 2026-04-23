"use client";

import { useState } from "react";
import AdminSidebar from "@/components/dashboard/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-[#F7F8FA] overflow-hidden">
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
