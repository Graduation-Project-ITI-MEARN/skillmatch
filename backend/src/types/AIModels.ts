// src/types/aiModels.ts - FIXED GEMINI MODELS

export enum AIModel {
   // OpenAI Models
   GPT4O_MINI = "gpt-4o-mini",
   GPT4O = "gpt-4o",

   // Google Gemini (FREE!) - CORRECTED NAMES based on curl output
   GEMINI_2_5_FLASH = "gemini-2.5-flash", // ✅ Based on curl output
   GEMINI_2_5_PRO = "gemini-2.5-pro", // ✅ Based on curl output
   GEMINI_2_0_FLASH = "gemini-2.0-flash",
   GEMINI_2_0_FLASH_001 = "gemini-2.0-flash-001",
   GEMINI_2_0_FLASH_LITE = "gemini-2.0-flash-lite",
   GEMINI_2_0_FLASH_LITE_001 = "gemini-2.0-flash-lite-001",
   GEMINI_2_5_FLASH_LITE = "gemini-2.5-flash-lite",

   // Groq (VERY FAST & FREE!)
   LLAMA_70B = "llama-3.3-70b-versatile",
   LLAMA_8B = "llama-3.1-8b-instant",
   MIXTRAL_8X7B = "mixtral-8x7b-32768",
}

export interface ModelConfig {
   id: AIModel;
   name: string;
   provider: "openai" | "google" | "groq";
   costPer1kTokens: number;
   accuracyRating: number;
   speed: "fast" | "medium" | "slow";
   bestFor: string[];
   description: string;
   isFree: boolean;
   freeTierLimit?: string;
}

export const AI_MODELS: Record<AIModel, ModelConfig> = {
   // OpenAI - Affordable (unchanged)
   [AIModel.GPT4O_MINI]: {
      id: AIModel.GPT4O_MINI,
      name: "GPT-4o Mini",
      provider: "openai",
      costPer1kTokens: 0.00015,
      accuracyRating: 7,
      speed: "fast",
      bestFor: ["basic-tasks", "budget-friendly"],
      description: "Most affordable option. Good for simple challenges.",
      isFree: false,
   },
   [AIModel.GPT4O]: {
      id: AIModel.GPT4O,
      name: "GPT-4o",
      provider: "openai",
      costPer1kTokens: 0.0025,
      accuracyRating: 9,
      speed: "fast",
      bestFor: ["code", "multimodal", "general"],
      description: "Excellent performance with vision capabilities.",
      isFree: false,
   },

   // Google Gemini - FREE TIER! (UPDATED based on curl output)
   [AIModel.GEMINI_2_5_FLASH]: {
      id: AIModel.GEMINI_2_5_FLASH,
      name: "Gemini 2.5 Flash",
      provider: "google",
      costPer1kTokens: 0, // FREE up to 15 requests/min (assuming similar free tier)
      accuracyRating: 7,
      speed: "fast",
      bestFor: ["high-volume", "real-time", "FREE"],
      description:
         "⭐ FREE! Fast and efficient. Supports up to 1 million tokens, released in June of 2025.",
      isFree: true,
      freeTierLimit: "15 requests/min, 1500 requests/day",
   },
   [AIModel.GEMINI_2_5_PRO]: {
      id: AIModel.GEMINI_2_5_PRO,
      name: "Gemini 2.5 Pro",
      provider: "google",
      costPer1kTokens: 0, // FREE up to 2 requests/min (assuming similar free tier)
      accuracyRating: 9,
      speed: "medium",
      bestFor: ["complex-analysis", "large-context", "FREE"],
      description:
         "⭐ FREE! High accuracy with massive context window. Stable release (June 17th, 2025).",
      isFree: true,
      freeTierLimit: "2 requests/min, 50 requests/day",
   },
   [AIModel.GEMINI_2_0_FLASH]: {
      id: AIModel.GEMINI_2_0_FLASH,
      name: "Gemini 2.0 Flash",
      provider: "google",
      costPer1kTokens: 0,
      accuracyRating: 6, // Slightly lower rating as an older version
      speed: "fast",
      bestFor: ["general-tasks", "versatile", "FREE"],
      description: "⭐ FREE! Gemini 2.0 Flash model.",
      isFree: true,
      freeTierLimit: "Free tier available",
   },
   [AIModel.GEMINI_2_0_FLASH_001]: {
      id: AIModel.GEMINI_2_0_FLASH_001,
      name: "Gemini 2.0 Flash 001",
      provider: "google",
      costPer1kTokens: 0,
      accuracyRating: 6,
      speed: "fast",
      bestFor: ["general-tasks", "stable-version", "FREE"],
      description:
         "⭐ FREE! Stable version of Gemini 2.0 Flash, released in January of 2025.",
      isFree: true,
      freeTierLimit: "Free tier available",
   },
   [AIModel.GEMINI_2_0_FLASH_LITE]: {
      id: AIModel.GEMINI_2_0_FLASH_LITE,
      name: "Gemini 2.0 Flash-Lite",
      provider: "google",
      costPer1kTokens: 0,
      accuracyRating: 5, // Lighter version, potentially less accurate
      speed: "fast",
      bestFor: ["quick-response", "lightweight", "FREE"],
      description: "⭐ FREE! Gemini 2.0 Flash-Lite model.",
      isFree: true,
      freeTierLimit: "Free tier available",
   },
   [AIModel.GEMINI_2_0_FLASH_LITE_001]: {
      id: AIModel.GEMINI_2_0_FLASH_LITE_001,
      name: "Gemini 2.0 Flash-Lite 001",
      provider: "google",
      costPer1kTokens: 0,
      accuracyRating: 5,
      speed: "fast",
      bestFor: ["quick-response", "lightweight", "FREE"],
      description: "⭐ FREE! Stable version of Gemini 2.0 Flash-Lite.",
      isFree: true,
      freeTierLimit: "Free tier available",
   },
   [AIModel.GEMINI_2_5_FLASH_LITE]: {
      id: AIModel.GEMINI_2_5_FLASH_LITE,
      name: "Gemini 2.5 Flash-Lite",
      provider: "google",
      costPer1kTokens: 0,
      accuracyRating: 6,
      speed: "fast",
      bestFor: ["quick-response", "high-volume", "FREE"],
      description:
         "⭐ FREE! Stable version of Gemini 2.5 Flash-Lite, released in July of 2025.",
      isFree: true,
      freeTierLimit: "Free tier available",
   },

   // Groq - ULTRA FAST & FREE! (unchanged)
   [AIModel.LLAMA_70B]: {
      id: AIModel.LLAMA_70B,
      name: "Llama 3.3 70B Versatile",
      provider: "groq",
      costPer1kTokens: 0,
      accuracyRating: 8,
      speed: "fast",
      bestFor: ["code", "reasoning", "FREE", "FAST"],
      description: "⭐ FREE & BLAZING FAST! Great for code evaluation.",
      isFree: true,
      freeTierLimit: "30 requests/min",
   },
   [AIModel.LLAMA_8B]: {
      id: AIModel.LLAMA_8B,
      name: "Llama 3.1 8B Instant",
      provider: "groq",
      costPer1kTokens: 0,
      accuracyRating: 6,
      speed: "fast",
      bestFor: ["quick-scoring", "high-volume", "FREE"],
      description: "⭐ FREE & SUPER FAST! Good for initial screening.",
      isFree: true,
      freeTierLimit: "30 requests/min",
   },
   [AIModel.MIXTRAL_8X7B]: {
      id: AIModel.MIXTRAL_8X7B,
      name: "Mixtral 8x7B",
      provider: "groq",
      costPer1kTokens: 0,
      accuracyRating: 7,
      speed: "fast",
      bestFor: ["multilingual", "general", "FREE"],
      description: "⭐ FREE! Great for diverse challenge types.",
      isFree: true,
      freeTierLimit: "30 requests/min",
   },
};

export enum PricingTier {
   FREE = "free",
   BUDGET = "budget",
   BALANCED = "balanced",
   PREMIUM = "premium",
}

export interface TierConfig {
   tier: PricingTier;
   defaultModel: AIModel;
   fallbackModels: AIModel[];
   estimatedCostPerEval: number;
   description: string;
}

export const PRICING_TIERS: Record<PricingTier, TierConfig> = {
   [PricingTier.FREE]: {
      tier: PricingTier.FREE,
      defaultModel: AIModel.LLAMA_70B, // Start with best free model
      fallbackModels: [
         AIModel.GEMINI_2_5_FLASH, // Updated from GEMINI_FLASH
         AIModel.LLAMA_8B,
         AIModel.MIXTRAL_8X7B,
      ],
      estimatedCostPerEval: 0,
      description: "⭐ Completely FREE! Llama 3.3 70B with Gemini fallback.",
   },
   [PricingTier.BUDGET]: {
      tier: PricingTier.BUDGET,
      defaultModel: AIModel.GPT4O_MINI,
      fallbackModels: [AIModel.LLAMA_70B, AIModel.GEMINI_2_5_FLASH], // Updated from GEMINI_FLASH
      estimatedCostPerEval: 0.01,
      description: "Very affordable with good accuracy.",
   },
   [PricingTier.BALANCED]: {
      tier: PricingTier.BALANCED,
      defaultModel: AIModel.LLAMA_70B,
      fallbackModels: [AIModel.GEMINI_2_5_PRO, AIModel.GEMINI_2_5_FLASH], // Updated from GEMINI_PRO, GEMINI_FLASH
      estimatedCostPerEval: 0,
      description: "⭐ FREE with excellent performance!",
   },
   [PricingTier.PREMIUM]: {
      tier: PricingTier.PREMIUM,
      defaultModel: AIModel.GPT4O,
      fallbackModels: [
         AIModel.GPT4O_MINI,
         AIModel.GEMINI_2_5_PRO, // Updated from GEMINI_PRO
         AIModel.LLAMA_70B,
      ],
      estimatedCostPerEval: 0.05,
      description: "Highest accuracy for critical evaluations.",
   },
};

/**
 * Check if error should trigger fallback
 */
export function shouldRetryWithFallback(error: any): boolean {
   const errorMessage = error?.message?.toLowerCase() || "";
   const errorCode = error?.status?.toString() || "";

   const retryableErrors = [
      "rate_limit",
      "quota",
      "decommissioned",
      "overloaded",
      "timeout",
      "server_error",
      "service_unavailable",
      "429",
      "500",
      "503",
      "504",
      "not found", // ✅ ADDED - Treat 404 as retryable for model issues
   ];

   return retryableErrors.some(
      (keyword) =>
         errorMessage.includes(keyword) || errorCode.includes(keyword),
   );
}
