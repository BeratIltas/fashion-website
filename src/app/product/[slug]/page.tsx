import Link from "next/link";
import Container from "@/components/ui/Container";
import { filterProducts, getProduct, searchProducts } from "@/lib/api";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/cart/AddToCartButton";
import ProductGallery from "@/components/product/ProductGallery";
import FavoriteButton from "@/components/ui/FavoriteButton";
import SimilarProducts from "@/components/sections/SimilarProducts";

export async function generateStaticParams() {
  const products = await filterProducts({}, {});
  return products.map((p) => ({ slug: p.asin }));
}

function StarRow({ stars }: { stars: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < Math.floor(stars);
        const half = !filled && i + 0.5 <= stars;
        return (
          <svg
            key={i}
            className={`h-4 w-4 ${filled ? "fill-amber-400 text-amber-400" : half ? "fill-amber-200 text-amber-200" : "fill-neutral-200 text-neutral-200"}`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      })}
    </div>
  );
}

// Extract a clothing-type keyword from the product title for search
function extractSearchKeyword(title: string): string {
  const clothingTypes = [
    "t-shirt", "tshirt", "shirt", "blouse", "top",
    "dress", "skirt", "gown",
    "jeans", "pants", "trousers", "chinos", "leggings", "shorts",
    "jacket", "coat", "blazer", "cardigan", "vest", "hoodie",
    "sweater", "sweatshirt", "pullover", "knitwear",
    "suit", "jumpsuit", "romper",
    "underwear", "bra", "briefs", "boxers", "lingerie",
    "sock", "tights", "stockings",
    "sneaker", "shoe", "boot", "sandal", "loafer", "heel",
    "hat", "cap", "beanie", "scarf", "glove", "belt", "bag",
  ];

  const lower = title.toLowerCase();
  const found = clothingTypes.find((term) => lower.includes(term));
  if (found) return found;

  // Fallback: first two meaningful words from the title
  const stop = new Set(["the", "a", "an", "and", "or", "for", "with", "in", "on", "at", "by", "from", "mens", "womens"]);
  const words = title
    .split(/\W+/)
    .filter((w) => w.length > 2 && !stop.has(w.toLowerCase()));
  return words.slice(0, 2).join(" ");
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let product;
  try {
    product = await getProduct(slug);
  } catch {
    notFound();
  }

  const price = parseFloat(product.priceValue).toFixed(2);
  const ratingMatch = product.ratingStars.match(/^([\d.]+)/);
  const stars = ratingMatch ? parseFloat(ratingMatch[1]) : 0;

  // Fetch similar products by searching for clothing type keyword from title
  const searchKeyword = extractSearchKeyword(product.title);
  const similarProducts = await searchProducts(searchKeyword, { size: 20 })
    .then((all) => all.filter((p) => p.asin !== slug).slice(0, 14))
    .catch(() =>
      filterProducts({}, { size: 15 }).then((all) =>
        all.filter((p) => p.asin !== slug).slice(0, 14)
      )
    );

  return (
    <div className="min-h-screen bg-white">
      {/* Main product section */}
      <div className="pb-16 pt-24">
        <Container>
          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center gap-2 text-xs text-neutral-400">
            <Link href="/" className="transition-colors hover:text-neutral-700">
              Home
            </Link>
            <span>/</span>
            <Link href="/shop" className="transition-colors hover:text-neutral-700">
              Shop
            </Link>
            <span>/</span>
            <span className="max-w-[220px] truncate text-neutral-600">{product.title}</span>
          </nav>

          <div className="grid gap-12 md:grid-cols-2 lg:gap-20">
            {/* ── Left: Gallery ── */}
            <div className="md:sticky md:top-24 md:self-start">
              <ProductGallery title={product.title} images={product.allImages} />
            </div>

            {/* ── Right: Product info ── */}
            <div className="flex flex-col">
              {/* Brand */}
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-neutral-400">
                {product.brandName}
              </p>

              {/* Title + Favorite */}
              <div className="mt-2 flex items-start gap-3">
                <h1 className="flex-1 text-3xl font-bold leading-snug tracking-tight text-neutral-950">
                  {product.title}
                </h1>
                <FavoriteButton
                  asin={product.asin}
                  initialFavorite={product.favorite}
                  className="mt-1 h-10 w-10 shrink-0 border border-neutral-200"
                />
              </div>

              {/* Rating */}
              {stars > 0 && (
                <Link
                  href={`/product/${product.asin}/reviews`}
                  className="mt-4 inline-flex w-fit items-center gap-3 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 transition-all hover:border-neutral-400 hover:bg-white"
                >
                  <StarRow stars={stars} />
                  <span className="text-xs font-semibold text-neutral-700">
                    {stars.toFixed(1)}
                  </span>
                  <span className="text-xs text-neutral-400">
                    · {product.ratingCount}
                  </span>
                </Link>
              )}

              {/* Price */}
              <div className="mt-6">
                <span className="text-4xl font-black tracking-tight text-neutral-950">
                  ${price}
                </span>
              </div>

              {/* Availability + Delivery */}
              <div className="mt-4 space-y-2.5">
                {product.availability && (
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-sm font-medium text-emerald-700">
                      {product.availability}
                    </span>
                  </div>
                )}
                {product.fastestDeliveryDate && (
                  <div className="flex items-center gap-2 text-sm text-neutral-500">
                    <svg
                      className="h-4 w-4 shrink-0 text-neutral-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                    </svg>
                    <span>
                      Fastest delivery:{" "}
                      <span className="font-medium text-neutral-700">
                        {product.fastestDeliveryDate}
                      </span>
                    </span>
                  </div>
                )}
                {product.deliveryDate && (
                  <div className="flex items-center gap-2 text-sm text-neutral-500">
                    <svg
                      className="h-4 w-4 shrink-0 text-neutral-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>
                      Standard delivery:{" "}
                      <span className="font-medium text-neutral-700">
                        {product.deliveryDate}
                      </span>
                    </span>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="my-7 h-px bg-neutral-100" />

              {/* About this item */}
              {product.aboutItem && (
                <div>
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-400">
                    About this item
                  </p>
                  <p className="line-clamp-6 whitespace-pre-line text-sm leading-relaxed text-neutral-600">
                    {product.aboutItem}
                  </p>
                </div>
              )}

              {/* CTA Buttons */}
              <div className="mt-8 flex flex-col gap-3">
                <AddToCartButton asin={product.asin} fullWidth label="Add to Cart" />
                <button
                  type="button"
                  className="w-full rounded-2xl border border-neutral-200 bg-white py-3 text-sm font-semibold text-neutral-900 transition-all hover:border-neutral-400 hover:bg-neutral-50 active:scale-[0.98]"
                >
                  Buy Now
                </button>
              </div>

              {/* Seller */}
              {product.sellerName && (
                <p className="mt-6 text-xs text-neutral-400">
                  Sold by{" "}
                  <span className="font-medium text-neutral-600">
                    {product.sellerName}
                  </span>
                </p>
              )}
            </div>
          </div>
        </Container>
      </div>

      {/* Similar products strip */}
      <SimilarProducts products={similarProducts} />
    </div>
  );
}
