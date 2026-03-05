import Link from "next/link";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";

export default function Hero() {
  return (
    <section className="relative pt-24">
      {/* background */}
      <div className="absolute inset-0 -z-10">
        <div className="h-[520px] w-full bg-[url('https://images.unsplash.com/photo-1520975958225-7b07d325b229?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center" />
        <div className="absolute inset-0 h-[520px] bg-black/45" />
      </div>

      <Container>
        <div className="py-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs text-white ring-1 ring-white/20">
            <span className="font-medium">Black Friday</span>
            <span className="text-white/80">Sale up to 50% off</span>
          </div>

          <h1 className="mt-5 max-w-2xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
            Warm Winter Layers
          </h1>

          <p className="mt-4 max-w-xl text-base text-white/80 md:text-lg">
            Minimal silhouettes, premium feel. Discover curated pieces for the season.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/shop">
              <Button className="bg-white text-black hover:bg-white/90">Shop New Arrivals</Button>
            </Link>
            <Link href="/shop">
              <Button variant="secondary" className="border-white/30 bg-white/10 text-white hover:bg-white/15">
                Explore Collection
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}