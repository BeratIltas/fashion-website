import OrbitGallery from "@/components/sections/OrbitGallery";
import Hero from "@/components/sections/Hero";
import ProductGrid from "@/components/sections/ProductGrid";
import { filterProducts } from "@/lib/api";

export default async function HomePage() {
  const [products, products2, orbitProducts] = await Promise.all([
    filterProducts({}, { page: 0, size: 8 }),
    filterProducts({}, { page: 4, size: 8 }),
    filterProducts({}, { page: 8, size: 7 }),
  ]);

  const orbitItems = orbitProducts
    .filter((p) => p.allImages?.length > 0)
    .map((p) => ({
      id: p.asin,
      src: p.allImages[0],
      alt: p.title,
      href: `/product/${p.asin}`,
    }));

  return (
    <>
      <Hero />
      <ProductGrid title="New Arrivals" products={products} />
      <OrbitGallery items={orbitItems} />
      <ProductGrid title="Best Sellers" products={products2} />
    </>
  );
}
