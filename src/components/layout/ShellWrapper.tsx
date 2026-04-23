"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PromoBar from "@/components/layout/PromoBar";

export default function ShellWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");

  return (
    <>
      {!isDashboard && (
        <>
          <PromoBar text="15% off your first order" repeatCount={10} speedSeconds={45} />
          <Suspense fallback={<div className="fixed left-0 top-9 z-50 h-16 w-full" aria-hidden="true" />}>
            <Navbar transparentOnTop />
          </Suspense>
        </>
      )}
      <main className={isDashboard ? undefined : "min-h-[70vh]"}>{children}</main>
      {!isDashboard && <Footer />}
    </>
  );
}
