import Link from "next/link";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { filterProducts, getProduct } from "@/lib/api";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/cart/AddToCartButton";
import ProductGallery from "@/components/product/ProductGallery";
import FavoriteButton from "@/components/ui/FavoriteButton";

export async function generateStaticParams() {
  const products = await filterProducts({}, {});
  return products.map((p) => ({ slug: p.asin }));
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
  const fullStars = Math.round(stars);

  return (
    <Container>
      <div className="grid gap-10 pt-28 py-10 md:grid-cols-2">
        {/* Image Gallery */}
        <ProductGallery title={product.title} images={product.allImages} />

        {/* Details */}
        <div>
          <div className="text-sm text-neutral-500">{product.brandName}</div>

          <div className="mt-2 flex items-start justify-between gap-4">
            <h1 className="text-2xl font-semibold tracking-tight leading-snug">
              {product.title}
            </h1>
            <FavoriteButton
              asin={product.asin}
              initialFavorite={product.favorite}
              className="h-10 w-10 shrink-0 border border-neutral-200"
            />
          </div>

          {/* Rating */}
          <Link
            href={`/product/${product.asin}/reviews`}
            className="mt-3 inline-flex items-center gap-2 rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50"
          >
            <span className="flex text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i}>{i < fullStars ? "★" : "☆"}</span>
              ))}
            </span>
            <span>
              {product.ratingStars} · {product.ratingCount} reviews
            </span>
          </Link>

          {/* Price */}
          <div className="mt-4 text-3xl font-bold">${price}</div>

          {/* Availability */}
          {product.availability && (
            <div className="mt-2 text-sm text-green-600 font-medium">
              {product.availability}
            </div>
          )}

          {/* Delivery */}
          {product.fastestDeliveryDate && (
            <div className="mt-1 text-sm text-neutral-500">
              Fastest delivery: <span className="text-neutral-700 font-medium">{product.fastestDeliveryDate}</span>
            </div>
          )}
          {product.deliveryDate && (
            <div className="text-sm text-neutral-500">
              Standard delivery: <span className="text-neutral-700 font-medium">{product.deliveryDate}</span>
            </div>
          )}

          {/* About */}
          {product.aboutItem && (
            <div className="mt-5">
              <div className="text-sm font-semibold mb-1">About this item</div>
              <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line">
                {product.aboutItem}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex gap-3">
            <AddToCartButton asin={product.asin} />
            <Button variant="secondary">Buy now</Button>
          </div>

          {/* Seller */}
          {product.sellerName && (
            <div className="mt-4 text-xs text-neutral-400">
              Sold by {product.sellerName}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
