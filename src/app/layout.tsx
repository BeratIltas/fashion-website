import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ShellWrapper from "@/components/layout/ShellWrapper";

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
            <ShellWrapper>{children}</ShellWrapper>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
