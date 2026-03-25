import ShopCatalog from "@/components/sections/ShopCatalog";
import { filterProducts, type ProductFilters, searchProducts } from "@/lib/api";

const PAGE_SIZE = 50;

function cleanFilter(value?: string) {
  return value?.trim() ? value.trim() : "";
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    mainCategory?: string;
    subCategory?: string;
    brand?: string;
    color?: string;
    minRating?: string;
  }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const filters: ProductFilters = {
    mainCategory: cleanFilter(params.mainCategory),
    subCategory: cleanFilter(params.subCategory),
    brand: cleanFilter(params.brand),
    color: cleanFilter(params.color),
    minRating: cleanFilter(params.minRating),
  };

  const products = query
    ? await searchProducts(query, { page: 0, size: PAGE_SIZE })
    : await filterProducts(filters, { page: 0, size: PAGE_SIZE });

  return (
    <ShopCatalog
      key={JSON.stringify({ query, filters })}
      initialProducts={products}
      initialQuery={query}
      initialFilters={filters}
    />
  );
}
