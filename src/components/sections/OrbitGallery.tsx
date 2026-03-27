"use client";

import React, { useCallback, useEffect, useMemo, useRef } from "react";

type Item = { id: string; src: string; alt?: string };

export default function OrbitGallery({
  title = "See our community\nin modern silhouettes",
  subtitle = "Connect with us and revisit styles for a daily dose of fresh outfits, featuring real looks from our community.",
  items,
}: {
  title?: string;
  subtitle?: string;
  items: Item[];
}) {
  const n = items.length;

  //  Sonsuz akış için 3 kopya
  const loopItems = useMemo(() => {
    if (n === 0) return [];
    return [...items, ...items, ...items];
  }, [items, n]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const cardsContainerRef = useRef<HTMLDivElement | null>(null);

  const cfg = useMemo(
    () => ({
      cardWidth: 240,
      cardHeight: 320,
      spacing: 280,
      depth: 280,
      maxRotation: 12,

      hardHideRange: 4.5, // görünürlük
      tDiv: 3.5,
    }),
    []
  );

  const state = useRef({
    offset: 0,
    isDragging: false,
    startX: 0,
    startOffset: 0,
    velocity: 0,
    lastX: 0,
    lastTime: 0,
  });

  //  Görünür aralık optimizasyonu için: önceki görünür index aralığı
  const vis = useRef({
    prevStart: 0,
    prevEnd: -1,
  });

  // ✅ Drag sırasında 1 frame’de 1 render (mousemove spam’ini keser)
  const raf = useRef<number>(0);
  const scheduleRender = useCallback(() => {
    if (raf.current) return;
    raf.current = requestAnimationFrame(() => {
      raf.current = 0;
      renderCards();
    });
  }, []); // renderCards aşağıda useCallback ile tanımlanıyor ama TS açısından sorun olmasın diye aşağıda override ediyoruz

  // ✅ offset'i orta kopya çevresinde tut
  const normalizeOffset = useCallback(() => {
    if (n === 0) return;
    const s = state.current;

    const min = n * 0.5;
    const max = n * 2.5;

    if (s.offset < min) {
      s.offset += n;
      s.startOffset += n;
    } else if (s.offset > max) {
      s.offset -= n;
      s.startOffset -= n;
    }
  }, [n]);

  const renderCards = useCallback(() => {
    const container = cardsContainerRef.current;
    if (!container || n === 0) return;

    const { offset } = state.current;
    const { spacing, depth, maxRotation, hardHideRange, tDiv } = cfg;

    const children = container.children;
    const len = children.length;

    // ✅ sadece görünür aralık: [offset - range - 2, offset + range + 2]
    const start = Math.max(0, Math.floor(offset - hardHideRange - 2));
    const end = Math.min(len - 1, Math.ceil(offset + hardHideRange + 2));

    // ✅ önceki görünür aralıktan düşenleri gizle
    const { prevStart, prevEnd } = vis.current;
    if (prevEnd >= prevStart) {
      for (let i = prevStart; i <= prevEnd; i++) {
        if (i < start || i > end) {
          const el = children[i] as HTMLElement;
          if (el && el.style.display !== "none") el.style.display = "none";
        }
      }
    }

    // ✅ yeni aralığı güncelle
    vis.current.prevStart = start;
    vis.current.prevEnd = end;

    // ✅ sadece bu aralıkta style hesapla
    for (let i = start; i <= end; i++) {
      const el = children[i] as HTMLElement;

      const relPos = i - offset;
      const absRelPos = Math.abs(relPos);

      if (absRelPos > hardHideRange) {
        if (el.style.display !== "none") el.style.display = "none";
        continue;
      }

      if (el.style.display === "none") el.style.display = "block";

      const t = relPos / tDiv;
      const abst = Math.abs(t);
      const clampedAbst = abst > 1 ? 1 : abst;

      const x = relPos * spacing;
      const z = -depth * (1 - clampedAbst);
      const rotateY = t * maxRotation;
      const scale = 0.8 + clampedAbst * 0.2;

      let opacity: number;
      if (absRelPos < 2.5) {
        opacity = 0.6 + ((2.5 - absRelPos) / 2.5) * 0.4;
      } else {
        opacity = ((hardHideRange - absRelPos) / 2) * 0.6;
        if (opacity < 0) opacity = 0;
      }

      el.style.transform = `translate3d(${x}px, 0, ${z}px) rotateY(${rotateY}deg) scale(${scale})`;
      el.style.opacity = String(opacity);
      el.style.zIndex = String(Math.round((1 - clampedAbst) * 1000));
    }
  }, [cfg, n]);

  // scheduleRender'in renderCards referansı güncel olsun
  const scheduleRenderRef = useRef<() => void>(() => { });
  useEffect(() => {
    scheduleRenderRef.current = () => {
      if (raf.current) return;
      raf.current = requestAnimationFrame(() => {
        raf.current = 0;
        renderCards();
      });
    };
  }, [renderCards]);

  const handleStart = useCallback((clientX: number) => {
    const s = state.current;
    s.isDragging = true;
    s.startX = clientX;
    s.startOffset = s.offset;
    s.velocity = 0;
    s.lastX = clientX;
    s.lastTime = performance.now();

    if (containerRef.current) containerRef.current.style.cursor = "grabbing";
  }, []);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!state.current.isDragging || n === 0) return;

      const s = state.current;
      const deltaX = s.startX - clientX;

      const now = performance.now();
      const deltaTime = now - s.lastTime;

      s.offset = s.startOffset + deltaX / cfg.spacing;

      if (deltaTime > 0) {
        const deltaPos = s.lastX - clientX;
        s.velocity = (deltaPos / deltaTime) / cfg.spacing;
      }

      s.lastX = clientX;
      s.lastTime = now;

      normalizeOffset();
      // ✅ direct render yerine RAF ile 1 frame = 1 render
      scheduleRenderRef.current();
    },
    [cfg.spacing, n, normalizeOffset]
  );

  const handleEnd = useCallback(() => {
    state.current.isDragging = false;
    if (containerRef.current) containerRef.current.style.cursor = "grab";
  }, []);

  // ✅ Inertia (zaten RAF içinde; burada direkt renderCards çalıştırmak OK)
  useEffect(() => {
    if (n === 0) return;

    let rafId = 0;
    let lastRenderTime = 0;

    const animate = (currentTime: number) => {
      const s = state.current;

      if (!s.isDragging) {
        s.velocity *= 0.93;

        if (Math.abs(s.velocity) > 0.0005 && currentTime - lastRenderTime > 16) {
          s.offset += s.velocity;
          normalizeOffset();
          renderCards();
          lastRenderTime = currentTime;
        }
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [n, normalizeOffset, renderCards]);

  // Events
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      handleStart(e.clientX);
    };
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const onMouseUp = () => handleEnd();

    const onTouchStart = (e: TouchEvent) => handleStart(e.touches[0].clientX);
    const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);
    const onTouchEnd = () => handleEnd();

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    container.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);

      container.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);

      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = 0;
    };
  }, [handleStart, handleMove, handleEnd]);

  // ✅ İlk render: offset'i orta kopyaya al + tümünü gizle (ilk frame daha temiz)
  useEffect(() => {
    if (n === 0) return;

    state.current.offset = n;
    state.current.startOffset = state.current.offset;

    // tüm elemanları önce gizle (ilk çizim temiz)
    const container = cardsContainerRef.current;
    if (container) {
      const children = container.children;
      for (let i = 0; i < children.length; i++) {
        (children[i] as HTMLElement).style.display = "none";
      }
      vis.current.prevStart = 0;
      vis.current.prevEnd = -1;
    }

    requestAnimationFrame(() => renderCards());
  }, [n, renderCards]);

  // items değişince tekrar çiz
  useEffect(() => {
    requestAnimationFrame(() => renderCards());
  }, [loopItems, renderCards]);

  const titleLines = useMemo(() => title.split("\n"), [title]);

  return (
    <section className="relative mt-16 overflow-hidden">
      <div className="w-full">
        <div className="relative bg-white py-12">
          {/* Center content */}
          <div className="relative z-20 mx-auto max-w-xl text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-black" />
              Stay connected
            </div>

            <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
              {titleLines.map((l, i) => (
                <span key={i} className="block">
                  {l}
                </span>
              ))}
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm text-neutral-600 sm:text-base">
              {subtitle}
            </p>

            <div className="mt-7 flex justify-center gap-3">
              <button className="rounded-full bg-black px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800">
                Our collections
              </button>
              <button className="rounded-full border border-neutral-200 bg-white px-5 py-3 text-sm font-medium hover:bg-neutral-50">
                Contact us
              </button>
            </div>
          </div>

          {/* Gallery */}
          <div
            ref={containerRef}
            className="relative mt-6 h-[450px] select-none overflow-hidden"
            style={{
              perspective: "1400px",
              cursor: "grab",
              touchAction: "pan-y",
            }}
          >
            <div
              ref={cardsContainerRef}
              className="absolute left-1/2"
              style={{
                top: "1%",
                transform: "translate(-50%, -50%)",
                transformStyle: "preserve-3d",
              }}
            >
              {loopItems.map((item, i) => (
                <div
                  key={`${item.id}-${i}`}
                  className="absolute left-0 top-0"
                  style={{
                    transformStyle: "preserve-3d",
                    willChange: "transform, opacity",
                    transition: "none",
                    backfaceVisibility: "hidden",
                    transformOrigin: "center center",
                  }}
                >
                  <div
                    className="overflow-hidden rounded-3xl bg-neutral-100"
                    style={{
                      width: cfg.cardWidth,
                      height: cfg.cardHeight,
                    }}
                  >
                    <img
                      src={item.src}
                      alt={item.alt ?? "gallery"}
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}