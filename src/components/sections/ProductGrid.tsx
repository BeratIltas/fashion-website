import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/Container";
import type { Product } from "@/lib/api";
import AddToCartButton from "@/components/cart/AddToCartButton";
import FavoriteButton from "@/components/ui/FavoriteButton";

function getStarCount(ratingStars: string): number {
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
    <section className="mt-14 pt-12 pb-12">
      <Container>
        {/* Section header */}
        <div className="mb-10 flex items-center gap-6">
          <h2 className="shrink-0 text-2xl font-bold tracking-tight text-neutral-950">{title}</h2>
          <div className="h-px flex-1 bg-neutral-200" />
          <Link
            href="/shop"
            className="shrink-0 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-widest text-neutral-500 transition-colors hover:text-neutral-950"
          >
            View all
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => {
            const rating = getStarCount(p.ratingStars);
            return (
              <div key={p.asin} className="group">
                {/* Image */}
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-100">
                  <Link href={`/product/${p.asin}`} className="absolute inset-0 z-0">
                    {p.allImages?.length > 0 && (
                      <Image
                        src={p.allImages[0]}
                        alt={p.title}
                        fill
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    )}
                  </Link>

                  {/* Star badge — only when rating exists */}
                  {rating > 0 && (
                    <div className="absolute left-2.5 top-2.5 z-10 flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 backdrop-blur-sm">
                      <svg className="h-3 w-3 shrink-0 fill-amber-400" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-[11px] font-semibold leading-none text-white">
                        {rating.toFixed(1)}
                      </span>
                    </div>
                  )}

                  <FavoriteButton
                    asin={p.asin}
                    initialFavorite={p.favorite}
                    className="absolute right-2.5 top-2.5 z-10 h-8 w-8"
                  />

                  {/* Slide-up overlay on hover */}
                  <div className="absolute inset-x-0 bottom-0 z-20 translate-y-full rounded-b-2xl transition-transform duration-300 ease-out group-hover:translate-y-0">
                    <div className="bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-transparent px-3 pb-4 pt-14">
                      <AddToCartButton asin={p.asin} overlay />
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="mt-3 px-0.5">
                  <Link href={`/product/${p.asin}`} className="block">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">
                      {p.brandName}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-sm font-medium text-neutral-900 transition-colors group-hover:text-neutral-600">
                      {p.title}
                    </p>
                  </Link>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-neutral-950">
                        ${parseFloat(p.priceValue).toFixed(2)}
                      </p>
                      {p.ratingCount && (
                        <p className="text-[10px] text-neutral-400">{p.ratingCount}</p>
                      )}
                    </div>
                    {/* Mobile fallback button */}
                    <div className="lg:hidden">
                      <AddToCartButton asin={p.asin} label="Add" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
