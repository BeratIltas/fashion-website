"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Copy, Check, Gift, X, Sparkles } from "lucide-react";

// ─── Confetti ────────────────────────────────────────────────────────────────

interface Particle {
  id: number;
  x: number;
  color: string;
  delay: number;
  duration: number;
  size: number;
  shape: "circle" | "rect" | "triangle";
  rotate: number;
}

function Confetti({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) return;
    const colors = [
      "#f59e0b", "#fbbf24", "#ef4444", "#f97316",
      "#3b82f6", "#8b5cf6", "#10b981", "#ec4899",
      "#06b6d4", "#84cc16",
    ];
    const shapes: Particle["shape"][] = ["circle", "rect", "triangle"];
    setParticles(
      Array.from({ length: 80 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 1.2,
        duration: 2 + Math.random() * 2,
        size: 5 + Math.random() * 9,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        rotate: Math.random() * 360,
      }))
    );
  }, [active]);

  if (!active || particles.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute top-0"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.shape === "rect" ? p.size * 0.5 : p.size,
            backgroundColor: p.shape === "triangle" ? "transparent" : p.color,
            borderLeft: p.shape === "triangle" ? `${p.size / 2}px solid transparent` : undefined,
            borderRight: p.shape === "triangle" ? `${p.size / 2}px solid transparent` : undefined,
            borderBottom: p.shape === "triangle" ? `${p.size}px solid ${p.color}` : undefined,
            borderRadius: p.shape === "circle" ? "50%" : p.shape === "rect" ? "1px" : undefined,
            transform: `rotate(${p.rotate}deg)`,
            animation: `confettiFall ${p.duration}s ${p.delay}s ease-in forwards`,
            opacity: 0,
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-10px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(420px) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ─── Scratch Canvas ───────────────────────────────────────────────────────────

const CANVAS_W = 380;
const CANVAS_H = 96;

function ScratchCard({ onRevealed }: { onRevealed: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const revealedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Gradient scratch layer
    const grad = ctx.createLinearGradient(0, 0, CANVAS_W, CANVAS_H);
    grad.addColorStop(0, "#d1d5db");
    grad.addColorStop(0.5, "#e5e7eb");
    grad.addColorStop(1, "#d1d5db");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Shimmer dots pattern
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * CANVAS_W;
      const y = Math.random() * CANVAS_H;
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Label text
    ctx.fillStyle = "#6b7280";
    ctx.font = "bold 13px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("✦  Scratch to reveal your coupon  ✦", CANVAS_W / 2, CANVAS_H / 2);
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const checkCoverage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || revealedRef.current) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const data = ctx.getImageData(0, 0, CANVAS_W, CANVAS_H).data;
    let transparent = 0;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 128) transparent++;
    }
    if (transparent / (data.length / 4) > 0.55) {
      revealedRef.current = true;
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
      onRevealed();
    }
  }, [onRevealed]);

  const scratch = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing.current) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const { x, y } = getPos(e);
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, 22, 0, Math.PI * 2);
      ctx.fill();
      checkCoverage();
    },
    [checkCoverage]
  );

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_W}
      height={CANVAS_H}
      className="absolute inset-0 w-full h-full cursor-pointer touch-none rounded-2xl"
      onMouseDown={() => { isDrawing.current = true; }}
      onMouseUp={() => { isDrawing.current = false; }}
      onMouseLeave={() => { isDrawing.current = false; }}
      onMouseMove={scratch}
      onTouchStart={(e) => { e.preventDefault(); isDrawing.current = true; }}
      onTouchEnd={() => { isDrawing.current = false; }}
      onTouchMove={(e) => { e.preventDefault(); scratch(e); }}
    />
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface CouponModalProps {
  code: string;
  onClose: () => void;
}

export default function CouponModal({ code, onClose }: CouponModalProps) {
  const [revealed, setRevealed] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleRevealed = useCallback(() => {
    setRevealed(true);
    setConfetti(true);
    setTimeout(() => setConfetti(false), 3500);
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => onClose(), 1500);
    });
  }, [code, onClose]);

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      onClick={handleBackdrop}
    >
      <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden">
        <Confetti active={confetti} />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/25 p-2 text-white hover:bg-white/40 transition-colors"
        >
          <X size={15} />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 px-6 pt-8 pb-10 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm mb-3 mx-auto">
            <Gift size={26} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-white leading-tight">
            You&apos;ve earned a coupon!
          </h2>
          <p className="mt-1 text-sm text-white/80">
            Scratch the card below to reveal your exclusive discount code.
          </p>
        </div>

        {/* Scratch card area */}
        <div className="px-7 -mt-5 mb-1">
          <div
            className="relative rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-dashed border-amber-200 overflow-hidden"
            style={{ height: CANVAS_H }}
          >
            {/* Code behind scratch layer — shown always, revealed by scratching */}
            <div className="absolute inset-0 flex items-center justify-center px-5 gap-4">
              <Sparkles size={15} className="text-amber-400 shrink-0" />
              <span className="font-mono text-xl font-bold tracking-widest text-neutral-900 whitespace-nowrap">
                {code}
              </span>
              <Sparkles size={15} className="text-amber-400 shrink-0" />
            </div>

            {/* Scratch overlay */}
            {!revealed && <ScratchCard onRevealed={handleRevealed} />}
          </div>
        </div>

        {/* Revealed: copy button */}
        <div
          className={`px-7 pt-3 pb-6 space-y-3 transition-all duration-500 ${
            revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
          }`}
        >
          <p className="text-xs text-center text-neutral-400">
            Tap the code or use the copy button to save it.
          </p>

          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-between gap-4 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 px-5 py-3.5 group hover:border-amber-400 hover:bg-amber-100 transition-colors"
          >
            <span className="font-mono text-base font-bold tracking-widest text-neutral-900 whitespace-nowrap">
              {code}
            </span>
            <span className={`flex items-center gap-1.5 text-xs font-semibold shrink-0 transition-colors ${
              copied ? "text-emerald-600" : "text-amber-600 group-hover:text-amber-700"
            }`}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied!" : "Copy"}
            </span>
          </button>

        </div>

        {/* Before revealed: info footer */}
        {!revealed && (
          <div className="px-7 pb-6 text-center">
            <p className="text-xs text-neutral-400">
              Apply at checkout — valid once per account.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
