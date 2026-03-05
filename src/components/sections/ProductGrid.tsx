import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/Container";
import type { Product } from "@/lib/api";
import AddToCartButton from "@/components/cart/AddToCartButton";

function starCount(ratingStars: string): number {
  const match = ratingStars.match(/^([\d.]+)/);
  return match ? parseFloat(match[1]) : 0;
}

export default function ProductGrid({
  title,
  products,
}: {
  title: string;
  products: Product[];
}) {
  return (
    <section className="mt-14">
      <Container>
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          <Link href="/shop" className="text-sm text-neutral-600 hover:text-black">
            View all
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <div
              key={p.asin}
              className="group rounded-3xl border border-neutral-200/70 bg-white p-3 transition hover:border-neutral-300"
            >
              <Link href={`/product/${p.asin}`}>
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-neutral-100">
                  {p.allImages?.length > 0 && (
                    <Image
                      src={p.allImages[0]}
                      alt={p.title}
                      fill
                      className="object-cover transition group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  )}
                  <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs text-neutral-700 backdrop-blur">
                    ★ {starCount(p.ratingStars).toFixed(1)}
                  </div>
                </div>
              </Link>

              <div className="mt-3">
                <div className="line-clamp-1 text-xs text-neutral-500">{p.brandName}</div>
                <div className="line-clamp-1 text-sm font-medium mt-0.5">{p.title}</div>

                <div className="mt-1 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold">
                      ${parseFloat(p.priceValue).toFixed(2)}
                    </div>
                    <div className="text-xs text-neutral-400">{p.ratingCount}</div>
                  </div>
                  <AddToCartButton asin={p.asin} label="Add" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}