"use client";

import React from "react";

type Props = {
  texts?: string[];
  repeatCount?: number;
  speedSeconds?: number;
  className?: string;
  heightClassName?: string;
};

const DOT = (
  <span className="mx-5 shrink-0 text-white/30" aria-hidden="true">
    ·
  </span>
);

export default function PromoBar({
  texts = ["15% off your first order"],
  repeatCount = 8,
  speedSeconds = 30,
  className = "",
  heightClassName = "h-9",
}: Props) {
  const items = Array.from({ length: repeatCount }).flatMap((_, i) =>
    texts.map((t, j) => ({ text: t, key: `${i}-${j}` }))
  );

  const track = (ariaHidden?: boolean) => (
    <div
      className="flex h-full items-center px-6"
      aria-hidden={ariaHidden || undefined}
    >
      {items.map(({ text, key }, idx) => (
        <React.Fragment key={key}>
          <span className="shrink-0 whitespace-nowrap text-xs font-medium tracking-wide">
            {text}
          </span>
          {idx < items.length - 1 && DOT}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div
      className={[
        "sticky top-0 z-[60] w-full bg-black text-white",
        heightClassName,
        className,
      ].join(" ")}
    >
      <div className="relative h-full overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-black to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-black to-transparent" />

        <div
          className="promo-marquee-track h-full"
          style={{ animationDuration: `${speedSeconds}s` }}
        >
          {track()}
          {track(true)}
        </div>
      </div>
    </div>
  );
}
