"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import { useEffect, useState } from "react";

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?auto=format&fit=crop&w=1600&q=80",
];

export default function Hero() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000);

    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative overflow-hidden pt-24">
      <div className="absolute inset-0 -z-10 h-[520px]">
        {HERO_IMAGES.map((src, index) => {
          const isActive = index === activeIndex;
          return (
            <div
              key={`${src}-${index}`}
              className={`absolute inset-0 h-full w-full bg-cover bg-center transition-opacity duration-1000 ease-out will-change-opacity ${
                isActive ? "opacity-100" : "opacity-0"
              }`}
              style={{ backgroundImage: `url(${src})` }}
            />
          );
        })}
        <div className="absolute inset-0 h-full bg-gradient-to-b from-black/55 via-black/40 to-black/60" />
      </div>

      <Container>
        <div className="animate-fade-in-up py-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs text-white ring-1 ring-white/20 backdrop-blur">
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
              <Button className="bg-white text-black transition-transform duration-200 hover:scale-[1.02] hover:bg-white/90">
                Shop New Arrivals
              </Button>
            </Link>

            <Link href="/shop">
              <Button
                variant="secondary"
                className="border-white/30 bg-white/10 text-white transition-transform duration-200 hover:scale-[1.02] hover:border-white/60 hover:bg-white/15"
              >
                Explore Collection
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}