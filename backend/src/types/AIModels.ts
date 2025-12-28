// src/types/aiModels.ts

export enum AIModel {
   // OpenAI Models
   GPT4O_MINI = "gpt-4o-mini",
   GPT4O = "gpt-4o",

   // Google Gemini (FREE!)
   GEMINI_FLASH = "gemini-2.0-flash", // Updated to confirmed model name
   GEMINI_PRO = "gemini-1.5-pro", // Keep as is, but verify if it should be "gemini-2.0-pro"

   // Groq (VERY FAST & FREE!)
   LLAMA_70B = "llama-3.1-70b", // Reverted to match your /api/ai/models output
   LLAMA_8B = "llama-3.1-8b", // Reverted to match your /api/ai/models output
   MIXTRAL_8X7B = "mixtral-8x7b",
}

export interface ModelConfig {
   id: AIModel;
   name: string;
   provider: "openai" | "google" | "groq";
   costPer1kTokens: number; // in USD
   accuracyRating: number; // 1-10 scale
   speed: "fast" | "medium" | "slow";
   bestFor: string[];
   description: string;
   isFree: boolean;
   freeTierLimit?: string;
}

export const AI_MODELS: Record<AIModel, ModelConfig> = {
   // OpenAI - Affordable
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

   // Google Gemini - FREE TIER!
   [AIModel.GEMINI_FLASH]: {
      id: AIModel.GEMINI_FLASH,
      name: "Gemini 2.0 Flash", // Name updated to reflect ID
      provider: "google",
      costPer1kTokens: 0, // FREE up to 15 requests/min
      accuracyRating: 7,
      speed: "fast",
      bestFor: ["high-volume", "real-time", "FREE"],
      description: "⭐ FREE! Fast and efficient. Perfect for startups.",
      isFree: true,
      freeTierLimit: "15 requests/min, 1500 requests/day",
   },
   [AIModel.GEMINI_PRO]: {
      id: AIModel.GEMINI_PRO,
      name: "Gemini 1.5 Pro", // Keep as is, but verify if "2.0" applies here too
      provider: "google",
      costPer1kTokens: 0, // FREE up to 2 requests/min
      accuracyRating: 9,
      speed: "medium",
      bestFor: ["complex-analysis", "large-context", "FREE"],
      description: "⭐ FREE! High accuracy with massive context window.",
      isFree: true,
      freeTierLimit: "2 requests/min, 50 requests/day",
   },

   // Groq - ULTRA FAST & FREE!
   [AIModel.LLAMA_70B]: {
      id: AIModel.LLAMA_70B,
      name: "Llama 3.1 70B", // Reverted name to match ID
      provider: "groq",
      costPer1kTokens: 0, // FREE!
      accuracyRating: 8,
      speed: "fast",
      bestFor: ["code", "reasoning", "FREE", "FAST"],
      description: "⭐ FREE & BLAZING FAST! Great for code evaluation.",
      isFree: true,
      freeTierLimit: "30 requests/min",
   },
   [AIModel.LLAMA_8B]: {
      id: AIModel.LLAMA_8B,
      name: "Llama 3.1 8B", // Reverted name to match ID
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

// Updated pricing tiers with FREE options
export enum PricingTier {
   FREE = "free",
   BUDGET = "budget",
   BALANCED = "balanced",
   PREMIUM = "premium",
}

export interface TierConfig {
   tier: PricingTier;
   defaultModel: AIModel;
   fallbackModel: AIModel;
   estimatedCostPerEval: number;
   description: string;
}

export const PRICING_TIERS: Record<PricingTier, TierConfig> = {
   [PricingTier.FREE]: {
      tier: PricingTier.FREE,
      defaultModel: AIModel.GEMINI_FLASH,
      fallbackModel: AIModel.LLAMA_8B,
      estimatedCostPerEval: 0,
      description: "⭐ Completely FREE! Gemini Flash + Groq Llama backup.",
   },
   [PricingTier.BUDGET]: {
      tier: PricingTier.BUDGET,
      defaultModel: AIModel.GPT4O_MINI,
      fallbackModel: AIModel.GEMINI_FLASH,
      estimatedCostPerEval: 0.01,
      description: "Very affordable with good accuracy.",
   },
   [PricingTier.BALANCED]: {
      tier: PricingTier.BALANCED,
      defaultModel: AIModel.LLAMA_70B,
      fallbackModel: AIModel.GEMINI_PRO,
      estimatedCostPerEval: 0,
      description: "⭐ FREE with excellent performance!",
   },
   [PricingTier.PREMIUM]: {
      tier: PricingTier.PREMIUM,
      defaultModel: AIModel.GPT4O,
      fallbackModel: AIModel.GEMINI_PRO,
      estimatedCostPerEval: 0.05,
      description: "Highest accuracy for critical evaluations.",
   },
};
