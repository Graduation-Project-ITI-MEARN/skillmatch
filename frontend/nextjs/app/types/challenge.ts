// app/types/challenge.ts

// Interface for the creator details
export interface Creator {
   _id: string;
   name: string; // e.g., "Esraa Corporation"
   type: string; // e.g., "company"
   city: string; // e.g., "Cairo"
}

// Interface for AI Configuration
export interface AiConfig {
   pricingTier: "balanced" | "free" | "premium" | string;
   autoEvaluate: boolean;
   requireVideoTranscript: boolean;
   selectedModel?: string; // Optional, e.g., "gpt-4o"
}

// Interface for Ideal Solution (optional)
export interface IdealSolution {
   type: string; // e.g., "link"
   value: string; // e.g., "https://github.com/example/perfect-auth-api"
}

// Main Challenge Interface
export type Challenge = {
   _id: string;
   title: string;
   description: string;
   difficulty: "easy" | "medium" | "hard" | string; // Using string to allow for future additions
   category: string;
   creatorId: Creator; // Nested creator object
   status: string; // e.g., "published"
   type: "prize" | "job" | string; // Using string to allow for future additions
   submissionType: string; // e.g., "link"

   // Optional fields that may or may not be present
   aiConfig?: AiConfig;
   idealSolution?: IdealSolution;
   additionalInfo?: string;
   tags?: string[];
   requirements?: string;
   evaluationCriteria?: string;
   deliverables?: string;
   salary?: number; // Present for both 'job' and sometimes 'prize' type challenges in your sample
   prizeAmount?: number; // Retained for compatibility if your frontend uses it separately, though 'salary' seems to cover value in backend.

   deadline: string; // ISO 8601 date string
   createdAt: string; // ISO 8601 date string
   updatedAt: string; // ISO 8601 date string
   __v: number;
};

// Interface for the overall API response structure
export interface ChallengesApiResponse {
   success: boolean;
   count: number;
   data: Challenge[];
}
