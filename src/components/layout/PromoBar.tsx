"use client";

import React from "react";

type Props = {
  text?: string;
  repeatCount?: number;
  speedSeconds?: number;
  className?: string;
  heightClassName?: string;
};

export default function PromoBar({
  text = "15% off your first order",
  repeatCount = 10,
  speedSeconds = 14,
  className = "",
  heightClassName = "h-9",
}: Props) {
  return (
    <div
      className={[
        "sticky top-0 z-[60] w-full bg-black text-white",
        heightClassName,
        className,
      ].join(" ")}
    >
      <div className="relative h-full overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-black to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-black to-transparent" />

        <div
          className="promo-marquee-track h-full"
          style={{ animationDuration: `${speedSeconds}s` }}
        >
          <div className="flex h-full items-center gap-20 px-6">
            {Array.from({ length: repeatCount }).map((_, index) => (
              <span
                key={`a-${index}`}
                className="whitespace-nowrap text-xs font-medium tracking-wide"
              >
                {text}
              </span>
            ))}
          </div>

          <div className="flex h-full items-center gap-20 px-6" aria-hidden="true">
            {Array.from({ length: repeatCount }).map((_, index) => (
              <span
                key={`b-${index}`}
                className="whitespace-nowrap text-xs font-medium tracking-wide"
              >
                {text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
