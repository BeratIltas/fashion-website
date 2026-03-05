import OrbitGallery from "@/components/sections/OrbitGallery";
import Hero from "@/components/sections/Hero";
import ProductGrid from "@/components/sections/ProductGrid";
import { getProducts } from "@/lib/api";

export default async function HomePage() {
  const products = await getProducts();

  const orbitItems = [
    { id: "1", src: "https://static.zara.net/assets/public/fa98/1d09/cb3c477faf92/9fa1d00d07ab/02634200434-p/02634200434-p.jpg?ts=1771952536494&w=563" },
    { id: "2", src: "https://static.zara.net/assets/public/fa98/1d09/cb3c477faf92/9fa1d00d07ab/02634200434-p/02634200434-p.jpg?ts=1771952536494&w=563" },
    { id: "3", src: "https://static.zara.net/assets/public/fa98/1d09/cb3c477faf92/9fa1d00d07ab/02634200434-p/02634200434-p.jpg?ts=1771952536494&w=563" },
    { id: "4", src: "https://static.zara.net/assets/public/fa98/1d09/cb3c477faf92/9fa1d00d07ab/02634200434-p/02634200434-p.jpg?ts=1771952536494&w=563" },
    { id: "5", src: "https://static.zara.net/assets/public/fa98/1d09/cb3c477faf92/9fa1d00d07ab/02634200434-p/02634200434-p.jpg?ts=1771952536494&w=563" },
    { id: "6", src: "https://static.zara.net/assets/public/fa98/1d09/cb3c477faf92/9fa1d00d07ab/02634200434-p/02634200434-p.jpg?ts=1771952536494&w=563" },
    { id: "7", src: "https://static.zara.net/assets/public/fa98/1d09/cb3c477faf92/9fa1d00d07ab/02634200434-p/02634200434-p.jpg?ts=1771952536494&w=563" }
  ];

  return (
    <>
      <Hero />
      <ProductGrid title="New Arrivals" products={products} />
      <OrbitGallery items={orbitItems} />
      <ProductGrid title="Best Sellers" products={products} />
    </>
  );
}