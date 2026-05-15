import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/api";

function getImageSrc(product: Product): string {
  const imgs = product.allImages;
  if (!imgs || imgs.length === 0) return "/placeholder.png";
  const first = typeof imgs === "string" ? imgs : imgs[0];
  if (typeof first === "string" && first.startsWith("[")) {
    try {
      const parsed = JSON.parse(first.replace(/'/g, '"')) as string[];
      return parsed[0] ?? "/placeholder.png";
    } catch { /* */ }
  }
  return typeof first === "string" ? first : "/placeholder.png";
}

export default function ChatProductCard({ product }: { product: Product }) {
  const imageSrc = getImageSrc(product);
  const rawPrice = String(product.priceValue).replace(/[^0-9.]/g, "");
  const price = parseFloat(rawPrice);

  return (
    <Link
      href={`/product/${product.asin}`}
      className="flex-none w-36 rounded-2xl border border-neutral-200 bg-white overflow-hidden hover:border-neutral-900 hover:shadow-md transition-all group"
    >
      <div className="relative h-44 bg-neutral-100 overflow-hidden">
        <Image
          src={imageSrc}
          alt={product.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="144px"
          unoptimized={imageSrc.includes("amazon.com")}
          onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.png"; }}
        />
      </div>
      <div className="px-3 py-2.5">
        {product.brandName && (
          <p className="text-[9px] uppercase tracking-widest text-neutral-400 font-semibold truncate">
            {product.brandName}
          </p>
        )}
        <p className="text-[11px] font-medium text-neutral-900 line-clamp-2 leading-snug mt-0.5">
          {product.title}
        </p>
        {!isNaN(price) && (
          <p className="text-xs font-semibold text-neutral-900 mt-1.5">${price.toFixed(2)}</p>
        )}
      </div>
    </Link>
  );
}
