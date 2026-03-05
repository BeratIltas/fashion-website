"use client";

import React from "react";

type Props = {
  text?: string;
  repeatCount?: number;
  speedSeconds?: number;
  className?: string;
  heightClassName?: string; // navbar offset için sabit yükseklik istersen
};

export default function PromoBar({
  text = "İlk üyeliğe özel %15 indirim",
  repeatCount = 10,
  speedSeconds = 14,
  className = "",
  heightClassName = "h-9", // ~36px
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
        {/* edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-black to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-black to-transparent" />

        <div
          className="promo-marquee-track h-full"
          style={{ animationDuration: `${speedSeconds}s` }}
        >
          <div className="flex h-full items-center gap-20 px-6">
            {Array.from({ length: repeatCount }).map((_, i) => (
              <span
                key={`a-${i}`}
                className="whitespace-nowrap text-xs font-medium tracking-wide"
              >
                {text}
              </span>
            ))}
          </div>

          <div className="flex h-full items-center gap-20 px-6" aria-hidden="true">
            {Array.from({ length: repeatCount }).map((_, i) => (
              <span
                key={`b-${i}`}
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