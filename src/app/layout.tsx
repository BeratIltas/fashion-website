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
              text="İlk üyeliğe özel %15 indirim"
              repeatCount={10}
              speedSeconds={45}
            />
            <Navbar transparentOnTop />
            <main className="min-h-[70vh]">{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
