import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import { firebaseApp } from "@/lib/firebase";
import type { ProductFilters } from "@/lib/api";

// ─── Firebase AI singleton ────────────────────────────────────────────────────

let _ai: ReturnType<typeof getAI> | null = null;

function getFirebaseAI() {
  if (!_ai) {
    _ai = getAI(firebaseApp, { backend: new GoogleAIBackend() });
  }
  return _ai;
}

// ─── System prompt ────────────────────────────────────────────────────────────

const FASHION_SYSTEM_PROMPT = `You are a helpful fashion shopping assistant for Miragé, a modern minimalist e-commerce fashion store.
Your role is to help customers find clothing, shoes, and accessories that match their style and needs.

The store catalog uses these category values:
- mainCategory: "men" or "women"
- subCategory examples: "T-Shirts", "Shirts", "Dresses", "Jeans", "Sneakers", "Boots", "Bags", "Jackets", "Hoodies & Sweatshirts", "Running Shoes", "Sandals", "Accessories", "Shorts", "Skirts", "Sweaters"
- Colors: "Black", "White", "Grey", "Navy Blue", "Blue", "Green", "Beige", "Brown", "Red", "Pink"

Guidelines:
- Understand both Turkish and English. Always respond in the same language the user used.
- Be warm, concise, and style-aware. Keep responses to 2-4 sentences.
- Mention specific product names naturally in your text when available.
- Never invent product details not provided to you.
- If no products found, suggest alternative search terms and encourage browsing the shop.`;

// ─── Intent extraction ────────────────────────────────────────────────────────

export function getIntentModel() {
  return getGenerativeModel(getFirebaseAI(), {
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 300,
    },
  });
}

export function buildIntentPrompt(userMessage: string): string {
  return `You are a fashion search intent extractor. Analyze the shopping request and return ONLY a valid JSON object — no markdown, no explanation, no code blocks.

JSON format (use null for unknown fields):
{"mainCategory":"women or men or null","subCategory":"e.g. Dresses, Sneakers, Bags, Jackets or null","color":"capitalize e.g. Black, White, Navy Blue or null","brand":"brand name or null","searchQuery":"2-4 English keywords e.g. black heels wedding","maxPrice":100 or null,"minRating":"4.5 or null"}

IMPORTANT: If the user mentions a brand name, ALWAYS infer the most common product type for that brand as subCategory (e.g. Levi's/Levis → Jeans, Nike/Adidas → Sneakers, Zara → Dresses, H&M → Tops, Gucci → Bags, UGG → Boots). Also set searchQuery to the product type keywords, NOT the brand name.

Examples:
- "Düğüne siyah ayakkabı öner" → {"mainCategory":"women","subCategory":"Heels","color":"Black","brand":null,"searchQuery":"black heels wedding formal","maxPrice":null,"minRating":null}
- "100 dolar altı spor ayakkabı" → {"mainCategory":null,"subCategory":"Sneakers","color":null,"brand":null,"searchQuery":"sneakers sport","maxPrice":100,"minRating":null}
- "levis" → {"mainCategory":null,"subCategory":"Jeans","color":null,"brand":"Levi's","searchQuery":"jeans denim","maxPrice":null,"minRating":null}
- "nike ayakkabı" → {"mainCategory":null,"subCategory":"Sneakers","color":null,"brand":"Nike","searchQuery":"sneakers running shoes","maxPrice":null,"minRating":null}

User request: "${userMessage}"`;
}

// ─── Chat session ─────────────────────────────────────────────────────────────

export function createChatSession() {
  const model = getGenerativeModel(getFirebaseAI(), {
    model: "gemini-2.5-flash",
    systemInstruction: FASHION_SYSTEM_PROMPT,
    generationConfig: {
      temperature: 0.75,
      maxOutputTokens: 600,
    },
  });
  return model.startChat({ history: [] });
}

export function buildSynthesisPrompt(
  userMessage: string,
  products: Array<{ asin: string; title: string; brandName: string; priceValue: string; ratingStars: string }>,
  fallbackBrand?: string
): string {
  if (products.length === 0) {
    return `The user asked: "${userMessage}"

No products were found matching those exact criteria. Please suggest what the user might try (different search terms, broader category, or visiting the shop directly). Be empathetic and helpful. Respond in the same language as the user.`;
  }

  const productList = products
    .slice(0, 5)
    .map((p) => `- ${p.title} by ${p.brandName}, $${p.priceValue}, rated ${p.ratingStars} stars [ID:${p.asin}]`)
    .join("\n");

  const brandNote = fallbackBrand
    ? `\nNote: The exact brand "${fallbackBrand}" was not found in our catalog. The products below are similar alternatives from other brands — let the user know gently and highlight the alternatives positively.\n`
    : "";

  return `The user asked: "${userMessage}"
${brandNote}
Available products from our catalog:
${productList}

Write a friendly, helpful recommendation in 2-3 sentences. Mention 2-3 specific products by their exact names. After each mentioned product name, include its [ID:asin] token. Write naturally flowing text only — no bullet points or lists. Respond in the same language as the user.`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type IntentResult = {
  mainCategory: string | null;
  subCategory:  string | null;
  color:        string | null;
  brand:        string | null;
  searchQuery:  string | null;
  maxPrice:     number | null;
  minRating:    string | null;
};

export function intentToApiParams(intent: IntentResult): {
  filters: ProductFilters;
  searchQuery: string;
  maxPrice: number | null;
} {
  const filters: ProductFilters = {};
  if (intent.mainCategory) filters.mainCategory = intent.mainCategory;
  if (intent.subCategory)  filters.subCategory  = intent.subCategory;
  if (intent.color)        filters.color        = intent.color;
  if (intent.brand)        filters.brand        = intent.brand;
  if (intent.minRating)    filters.minRating    = intent.minRating;

  return {
    filters,
    searchQuery: intent.searchQuery ?? "",
    maxPrice: intent.maxPrice,
  };
}
