"use client";

import { useEffect, useRef } from "react";
import { AlertCircle } from "lucide-react";
import type { ChatMessage } from "@/contexts/ChatContext";
import ChatProductCard from "@/components/chat/ChatProductCard";
import TypingIndicator from "@/components/chat/TypingIndicator";
import type { Product } from "@/lib/api";

// ─── Draggable product row ────────────────────────────────────────────────────

function ProductCardsRow({ products }: { products: Product[] }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const moved = useRef(false);

  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    moved.current = false;
    startX.current = e.pageX - (rowRef.current?.offsetLeft ?? 0);
    scrollLeft.current = rowRef.current?.scrollLeft ?? 0;
    if (rowRef.current) rowRef.current.style.cursor = "grabbing";
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current || !rowRef.current) return;
    e.preventDefault();
    const x = e.pageX - rowRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.4;
    if (Math.abs(walk) > 4) moved.current = true;
    rowRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const onMouseUp = () => {
    dragging.current = false;
    if (rowRef.current) rowRef.current.style.cursor = "grab";
  };

  // prevent click-through after drag
  const onClickCapture = (e: React.MouseEvent) => {
    if (moved.current) e.stopPropagation();
  };

  return (
    <div
      ref={rowRef}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onClickCapture={onClickCapture}
      className="-mx-4 px-4 flex gap-2.5 overflow-x-auto pb-2 no-scrollbar select-none"
      style={{ cursor: "grab" }}
    >
      {products.map((product) => (
        <ChatProductCard key={product.asin} product={product} />
      ))}
      <div className="shrink-0 w-2" />
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: ChatMessage }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[78%] rounded-3xl rounded-br-sm bg-black px-4 py-2.5">
          <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">{msg.text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-start">
        <div
          className={`max-w-[88%] rounded-3xl rounded-bl-sm px-4 py-2.5 ${msg.isError
              ? "bg-red-50 border border-red-100"
              : "bg-neutral-100 border border-neutral-200"
            }`}
        >
          {msg.isError && (
            <div className="flex items-center gap-1.5 mb-1">
              <AlertCircle size={12} className="text-red-500" />
              <span className="text-[10px] text-red-500 font-semibold uppercase tracking-wider">Error</span>
            </div>
          )}
          <p className={`text-sm leading-relaxed whitespace-pre-wrap ${msg.isError ? "text-red-700" : "text-neutral-800"}`}>
            {msg.text}
          </p>
        </div>
      </div>

      {msg.products && msg.products.length > 0 && (
        <ProductCardsRow products={msg.products} />
      )}
    </div>
  );
}

// ─── Messages list ────────────────────────────────────────────────────────────

export default function ChatMessages({
  messages,
  isLoading,
}: {
  messages: ChatMessage[];
  isLoading: boolean;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 no-scrollbar">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} msg={msg} />
      ))}
      {isLoading && (
        <div className="flex justify-start">
          <div className="rounded-3xl rounded-bl-sm bg-neutral-100 border border-neutral-200">
            <TypingIndicator />
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
