"use client";

import { useRef, useState } from "react";
import { ArrowUp, Loader2 } from "lucide-react";

export default function ChatInput({
  onSend,
  isLoading,
}: {
  onSend: (text: string) => void;
  isLoading: boolean;
}) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    // Auto-resize
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  return (
    <div className="px-4 py-3 border-t border-neutral-100 bg-white">
      <div className="flex items-end gap-2 bg-neutral-50 border border-neutral-200 rounded-2xl px-3 py-2 focus-within:border-neutral-400 transition-colors">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="What are you looking for?"
          rows={1}
          disabled={isLoading}
          className="flex-1 bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 outline-none resize-none leading-relaxed max-h-[120px] disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={!value.trim() || isLoading}
          className="shrink-0 h-8 w-8 rounded-xl bg-black flex items-center justify-center transition-opacity disabled:opacity-30 hover:opacity-80 mb-0.5"
        >
          {isLoading
            ? <Loader2 size={14} className="text-white animate-spin" />
            : <ArrowUp size={14} className="text-white" />
          }
        </button>
      </div>
      <p className="text-[10px] text-neutral-400 text-center mt-2">
        Shift+Enter for a new line
      </p>
    </div>
  );
}
