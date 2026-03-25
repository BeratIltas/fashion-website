import { Suspense } from "react";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PromoBar from "@/components/layout/PromoBar";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata = {
  title: "Shop",
  description: "Modern fashion e-commerce storefront",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>
            <PromoBar
              text="15% off your first order"
              repeatCount={10}
              speedSeconds={45}
            />
            <Suspense fallback={<div className="fixed left-0 top-9 z-50 h-16 w-full" aria-hidden="true" />}>
              <Navbar transparentOnTop />
            </Suspense>
            <main className="min-h-[70vh]">{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
