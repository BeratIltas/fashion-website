"use client";

import { Sparkles } from "lucide-react";
import { useChat } from "@/contexts/ChatContext";

export default function ChatButton() {
  const { isOpen, openChat, closeChat } = useChat();

  return (
    <button
      onClick={isOpen ? closeChat : openChat}
      aria-label="AI Fashion Assistant"
      className={`
        fixed bottom-6 right-6 z-[51]
        h-14 w-14 rounded-full shadow-2xl
        flex items-center justify-center
        transition-all duration-300
        ${isOpen
          ? "bg-neutral-800 scale-95"
          : "bg-black hover:scale-110 hover:shadow-black/25"
        }
      `}
    >
      <Sparkles
        size={22}
        className={`text-white transition-transform duration-300 ${isOpen ? "rotate-90" : ""}`}
      />
    </button>
  );
}
