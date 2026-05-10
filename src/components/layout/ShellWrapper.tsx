"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PromoBar from "@/components/layout/PromoBar";
import CouponModal from "@/components/CouponModal";
import { useAuth } from "@/contexts/AuthContext";

export default function ShellWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");
  const { pendingCoupon, clearPendingCoupon } = useAuth();

  return (
    <>
      {!isDashboard && (
        <>
          <PromoBar
            texts={[
              "Your orders will be shipped within 3–7 days.",
              "Free 15-day returns on all orders — no questions asked.",
            ]}
            repeatCount={6}
            speedSeconds={60}
          />
          <Suspense fallback={<div className="fixed left-0 top-9 z-50 h-16 w-full" aria-hidden="true" />}>
            <Navbar transparentOnTop />
          </Suspense>
        </>
      )}
      <main className={isDashboard ? undefined : "min-h-[70vh]"}>{children}</main>
      {!isDashboard && <Footer />}

      {pendingCoupon && !pathname.startsWith("/login") && !pathname.startsWith("/register") && (
        <CouponModal code={pendingCoupon} onClose={clearPendingCoupon} />
      )}
    </>
  );
}
