import ProductGrid from "@/components/sections/ProductGrid";
import { getProducts } from "@/lib/api";

export default async function ShopPage() {
  const products = await getProducts();
  return <ProductGrid title="Shop" products={products} />;
}