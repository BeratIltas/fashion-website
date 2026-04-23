"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "SELLER" && user.role !== "ADMIN") {
      router.replace("/");
    }
  }, [user, initialized, router]);

  if (!initialized || !user) return null;
  if (user.role !== "SELLER" && user.role !== "ADMIN") return null;

  return <>{children}</>;
}
