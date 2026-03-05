import Container from "@/components/ui/Container";
import { getProduct, getProductReviews } from "@/lib/api";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductReviewsPage({ params }: PageProps) {
  const { slug } = await params;

  let product;
  try {
    product = await getProduct(slug);
  } catch {
    notFound();
  }

  const reviews = await getProductReviews(slug);

  return (
    <Container>
      <div className="py-24 space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reviews</h1>
          <p className="mt-2 text-sm text-neutral-600 max-w-xl">
            {product.title}
          </p>
        </div>

        {reviews.length === 0 ? (
          <p className="text-sm text-neutral-500">There are no reviews for this product yet.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <article
                key={r.id}
                className="rounded-3xl border border-neutral-200 bg-white p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold text-neutral-900">
                    {r.reviewTitle || "Untitled review"}
                  </h2>
                  <div className="text-xs text-amber-500">
                    {"★".repeat(Number(r.rating) || 0)}
                  </div>
                </div>
                <p className="mt-2 text-sm text-neutral-700 whitespace-pre-line">
                  {r.reviewText}
                </p>
                {r.verifiedPurchase === "true" && (
                  <p className="mt-2 text-[11px] font-medium text-green-600">
                    Verified purchase
                  </p>
                )}
                {r.reviewMetadata && (
                  <p className="mt-2 text-[11px] text-neutral-400">
                    {r.reviewMetadata}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}

