"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import {
  getIntentModel,
  createChatSession,
  buildIntentPrompt,
  buildSynthesisPrompt,
  intentToApiParams,
  type IntentResult,
} from "@/lib/ai";
import { searchProducts, filterProducts, type Product } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  products?: Product[];
  isError?: boolean;
};

type ChatContextType = {
  isOpen: boolean;
  messages: ChatMessage[];
  isLoading: boolean;
  openChat: () => void;
  closeChat: () => void;
  sendMessage: (text: string) => Promise<void>;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseProductTokens(text: string): string[] {
  return [...text.matchAll(/\[ID:([A-Z0-9]+)\]/g)].map((m) => m[1]);
}

function cleanText(text: string): string {
  return text.replace(/\[ID:[A-Z0-9]+\]/g, "").replace(/\s{2,}/g, " ").trim();
}

function buildWelcomeMessage(firstName?: string): ChatMessage {
  const greeting = firstName ? `Hi ${firstName}!` : "Hi!";
  return {
    id: "welcome",
    role: "assistant",
    text: `${greeting} I'm Miragé's AI fashion assistant — here to help you find the perfect outfit.\n\nTry something like:\n"I'm going to a wedding, suggest shoes to go with a black dress."`,
  };
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isOpen, setIsOpen]       = useState(false);
  const [messages, setMessages]   = useState<ChatMessage[]>(() => [buildWelcomeMessage(user?.firstName)]);
  const [isLoading, setIsLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chatSessionRef = useRef<any>(null);

  const openChat = useCallback(() => {
    if (!chatSessionRef.current) {
      chatSessionRef.current = createChatSession();
    }
    setIsOpen(true);
  }, []);

  const closeChat = useCallback(() => setIsOpen(false), []);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    if (!chatSessionRef.current) {
      chatSessionRef.current = createChatSession();
    }

    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", text: trimmed },
    ]);
    setIsLoading(true);

    try {
      // ── 1. Extract intent ──────────────────────────────────────────────────
      const intentModel = getIntentModel();
      let intent: IntentResult = {
        mainCategory: null, subCategory: null, color: null,
        brand: null, searchQuery: trimmed, maxPrice: null, minRating: null,
      };
      try {
        const intentResult = await intentModel.generateContent(buildIntentPrompt(trimmed));
        intent = JSON.parse(intentResult.response.text()) as IntentResult;
      } catch {
        intent.searchQuery = trimmed;
      }

      // ── 2. Search products (with progressive fallback) ─────────────────────
      const { filters, searchQuery, maxPrice } = intentToApiParams(intent);
      let products: Product[] = [];
      let fallbackBrand: string | undefined;

      // Attempt 1: all filters (brand + category + color …)
      if (Object.keys(filters).length > 0) {
        products = await filterProducts(filters, { size: 20 }).catch(() => []);
      }

      // Attempt 2: text search
      if (products.length === 0 && searchQuery) {
        products = await searchProducts(searchQuery, { size: 20 }).catch(() => []);
      }

      // Attempt 3: if brand was set but still no results, drop the brand and retry
      if (products.length === 0 && intent.brand) {
        fallbackBrand = intent.brand;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { brand: _dropped, ...filtersNoBrand } = filters;

        // 3a: filters without brand
        if (Object.keys(filtersNoBrand).length > 0) {
          products = await filterProducts(filtersNoBrand, { size: 20 }).catch(() => []);
        }
        // 3b: search by subCategory keyword
        if (products.length === 0 && intent.subCategory) {
          products = await searchProducts(intent.subCategory, { size: 20 }).catch(() => []);
        }
        // 3c: search by cleaned query (brand name stripped out)
        if (products.length === 0) {
          const escapedBrand = intent.brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const cleanedQuery = searchQuery
            .replace(new RegExp(escapedBrand, "gi"), "")
            .trim();
          if (cleanedQuery) {
            products = await searchProducts(cleanedQuery, { size: 20 }).catch(() => []);
          }
        }
      }

      // Attempt 4: last-resort — broad category filter (mainCategory + subCategory)
      if (products.length === 0 && (intent.mainCategory || intent.subCategory)) {
        fallbackBrand = fallbackBrand ?? (intent.brand ?? undefined);
        const broadFilters: Record<string, string> = {};
        if (intent.mainCategory) broadFilters.mainCategory = intent.mainCategory;
        if (intent.subCategory)  broadFilters.subCategory  = intent.subCategory;
        products = await filterProducts(broadFilters, { size: 20 }).catch(() => []);
      }

      // Client-side price filter
      if (maxPrice !== null) {
        products = products.filter((p) => {
          const price = parseFloat(String(p.priceValue).replace(/[^0-9.]/g, ""));
          return !isNaN(price) && price <= maxPrice;
        });
      }

      const top5 = products.slice(0, 5);

      // ── 3. Generate AI response ────────────────────────────────────────────
      const aiResponse = await chatSessionRef.current.sendMessage(
        buildSynthesisPrompt(trimmed, top5, fallbackBrand)
      );
      const rawText: string = aiResponse.response.text();

      // ── 4. Match product tokens → card selection ───────────────────────────
      const mentionedAsins = parseProductTokens(rawText);
      const displayedProducts =
        mentionedAsins.length > 0
          ? top5.filter((p) => mentionedAsins.includes(p.asin))
          : top5;

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: cleanText(rawText),
          products: displayedProducts.length > 0 ? displayedProducts : undefined,
        },
      ]);
    } catch (err) {
      console.error("[AI Chat]", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          text: "Bir hata oluştu, lütfen tekrar deneyin.",
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  return (
    <ChatContext.Provider value={{ isOpen, messages, isLoading, openChat, closeChat, sendMessage }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}
