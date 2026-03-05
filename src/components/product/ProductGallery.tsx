"use client";

import { useState } from "react";
import Image from "next/image";

type Props = {
  title: string;
  images: string[];
};

export default function ProductGallery({ title, images }: Props) {
  const safeImages = images && images.length > 0 ? images : [];
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  if (safeImages.length === 0) {
    return (
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-neutral-100" />
    );
  }

  const activeSrc = safeImages[Math.min(activeIndex, safeImages.length - 1)];

  return (
    <>
      <div className="flex flex-col gap-3">
        <button
          type="button"
          className="group relative aspect-square overflow-hidden rounded-3xl bg-neutral-100"
          onClick={() => setZoomed(true)}
        >
          <Image
            src={activeSrc}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        {safeImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {safeImages.slice(0, 8).map((img, i) => {
              const isActive = i === activeIndex;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  className={`
                    relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border
                    transition
                    ${isActive ? "border-black ring-2 ring-black/10" : "border-neutral-200 hover:border-neutral-400"}
                  `}
                >
                  <Image
                    src={img}
                    alt={`${title} view ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {zoomed && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setZoomed(false)}
        >
          <div
            className="relative w-full max-w-3xl px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-neutral-900 shadow-2xl">
              <Image
                src={activeSrc}
                alt={title}
                fill
                className="object-contain transition-transform duration-500"
                sizes="(max-width: 1024px) 100vw, 75vw"
              />
            </div>
            <button
              type="button"
              className="absolute -top-10 right-6 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-neutral-900 shadow-sm hover:bg-white"
              onClick={() => setZoomed(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

