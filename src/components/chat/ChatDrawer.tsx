"use client";

import { Sparkles, X } from "lucide-react";
import { useChat } from "@/contexts/ChatContext";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatInput from "@/components/chat/ChatInput";

export default function ChatDrawer() {
  const { isOpen, messages, isLoading, closeChat, sendMessage } = useChat();

  return (
    <div
      className={`
        fixed bottom-[88px] right-6 z-50
        w-[380px] max-[440px]:left-4 max-[440px]:right-4 max-[440px]:w-auto
        bg-white rounded-3xl shadow-2xl border border-neutral-100
        flex flex-col overflow-hidden
        transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
        origin-bottom-right
        ${isOpen
          ? "opacity-100 scale-100 pointer-events-auto"
          : "opacity-0 scale-90 pointer-events-none translate-y-3"
        }
      `}
      style={{ height: "min(540px, calc(100dvh - 130px))" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-100 shrink-0 bg-white">
        <div className="h-8 w-8 rounded-xl bg-black flex items-center justify-center shrink-0">
          <Sparkles size={14} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-neutral-900">AI Fashion Assistant</h2>
          <p className="text-[11px] text-neutral-400">Miragé · Powered by Gemini</p>
        </div>
        <button
          onClick={closeChat}
          className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-neutral-100 transition-colors text-neutral-400 hover:text-neutral-700 shrink-0"
        >
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <ChatMessages messages={messages} isLoading={isLoading} />

      {/* Input */}
      <ChatInput onSend={sendMessage} isLoading={isLoading} />
    </div>
  );
}
