// src/services/multiModelAIService.ts
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { AIModel, AI_MODELS } from "../types/AIModels";

// Initialize AI clients
const openai = new OpenAI({
   apiKey: process.env.OPENAI_API_KEY,
});

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const groq = new Groq({
   apiKey: process.env.GROQ_API_KEY,
});

interface EvaluationRequest {
   challengeTitle: string;
   challengeDescription: string;
   difficulty: string;
   category: string;
   tags: string[];
   submissionContent: string;
   videoTranscript?: string; // ✅ Added this field
   selectedModel: AIModel;
}

interface EvaluationResult {
   technicalScore: number;
   clarityScore: number;
   communicationScore: number;
   overallScore: number;
   feedback: string;
   strengths: string[];
   improvements: string[];
   modelUsed: AIModel;
   costIncurred: number;
}

/**
 * Main evaluation function - routes to appropriate provider
 */
export const evaluateWithModel = async (
   request: EvaluationRequest
): Promise<EvaluationResult> => {
   const modelConfig = AI_MODELS[request.selectedModel];

   console.log(
      `Evaluating with ${modelConfig.name} (${
         modelConfig.isFree ? "FREE" : "PAID"
      })...`
   );

   let result: EvaluationResult;

   try {
      switch (modelConfig.provider) {
         case "openai":
            result = await evaluateWithOpenAI(request);
            break;
         case "google":
            result = await evaluateWithGemini(request);
            break;
         case "groq":
            result = await evaluateWithGroq(request);
            break;
         default:
            throw new Error(`Unsupported provider: ${modelConfig.provider}`);
      }
      return result;
   } catch (error) {
      console.error(`${modelConfig.name} failed, trying fallback...`, error);
      // Fallback to free model if paid model fails
      return await evaluateWithGemini({
         ...request,
         selectedModel: AIModel.GEMINI_FLASH,
      });
   }
};

/**
 * OpenAI Evaluation
 */
const evaluateWithOpenAI = async (
   request: EvaluationRequest
): Promise<EvaluationResult> => {
   const prompt = buildEvaluationPrompt(request);

   const modelString =
      request.selectedModel === AIModel.GPT4O ? "gpt-4o" : "gpt-4o-mini";

   const completion = await openai.chat.completions.create({
      model: modelString,
      messages: [
         {
            role: "system",
            content:
               "You are an expert skill evaluator. Respond ONLY with valid JSON, no markdown.",
         },
         { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000,
      temperature: 0.7,
   });

   const responseText = completion.choices[0]?.message?.content || "{}";
   const parsed = parseEvaluationResponse(responseText);

   const inputTokens = completion.usage?.prompt_tokens || 0;
   const outputTokens = completion.usage?.completion_tokens || 0;
   const modelConfig = AI_MODELS[request.selectedModel];
   const cost =
      ((inputTokens + outputTokens) / 1000) * modelConfig.costPer1kTokens;

   return {
      ...parsed,
      modelUsed: request.selectedModel,
      costIncurred: parseFloat(cost.toFixed(4)),
   };
};

/**
 * Google Gemini Evaluation (FREE!)
 */
const evaluateWithGemini = async (
   request: EvaluationRequest
): Promise<EvaluationResult> => {
   const prompt = buildEvaluationPrompt(request);

   // FIX: Use correct model names without -latest suffix
   const modelString =
      request.selectedModel === AIModel.GEMINI_PRO
         ? "gemini-1.5-pro"
         : "gemini-1.5-flash";

   const model = gemini.getGenerativeModel({
      model: modelString,
      generationConfig: {
         temperature: 0.7,
         maxOutputTokens: 2000,
      },
   });

   const result = await model.generateContent(prompt);
   const responseText = result.response.text();

   const parsed = parseEvaluationResponse(responseText);

   return {
      ...parsed,
      modelUsed: request.selectedModel,
      costIncurred: 0, // FREE!
   };
};

/**
 * Groq Evaluation (FREE & ULTRA FAST!)
 */
const evaluateWithGroq = async (
   request: EvaluationRequest
): Promise<EvaluationResult> => {
   const prompt = buildEvaluationPrompt(request);

   // FIXED: Correct Groq model names
   let modelString = "llama-3.1-70b-versatile"; // Not llama-3.1-70b-chat

   switch (request.selectedModel) {
      case AIModel.LLAMA_8B:
         modelString = "llama-3.1-8b-instant"; // Correct
         break;
      case AIModel.MIXTRAL_8X7B:
         modelString = "mixtral-8x7b-32768"; // Correct
         break;
      case AIModel.LLAMA_70B:
         modelString = "llama-3.1-70b-versatile"; // Correct
         break;
   }

   const completion = await groq.chat.completions.create({
      messages: [
         {
            role: "system",
            content:
               "You are an expert skill evaluator. Respond ONLY with valid JSON.",
         },
         {
            role: "user",
            content: prompt,
         },
      ],
      model: modelString,
      temperature: 0.7,
      max_tokens: 2000,
   });

   const responseText = completion.choices[0]?.message?.content || "{}";
   const parsed = parseEvaluationResponse(responseText);

   return {
      ...parsed,
      modelUsed: request.selectedModel,
      costIncurred: 0, // FREE!
   };
};

/**
 * Build standardized evaluation prompt
 */
const buildEvaluationPrompt = (request: EvaluationRequest): string => {
   return `You are an expert evaluator for SkillMatch AI.

**Challenge:**
Title: ${request.challengeTitle}
Description: ${request.challengeDescription}
Difficulty: ${request.difficulty}
Category: ${request.category}
Skills: ${request.tags.join(", ")}

**Submission:**
${request.submissionContent}

${
   request.videoTranscript
      ? `**Video Explanation:**\n${request.videoTranscript}`
      : ""
}

Evaluate on:
1. Technical Quality (0-100): Correctness, efficiency, creativity
2. Clarity Score (0-100): Structure and organization
3. Communication Score (0-100): Explanation quality

Respond with ONLY this JSON (no markdown, no extra text):
{
  "technicalScore": 85,
  "clarityScore": 90,
  "communicationScore": 80,
  "overallScore": 85,
  "feedback": "Clear solution with good practices. Consider edge cases.",
  "strengths": ["Clean code", "Good explanation"],
  "improvements": ["Add error handling", "Consider performance"]
}`;
};

/**
 * Parse AI response into structured format
 */
const parseEvaluationResponse = (
   response: string
): Omit<EvaluationResult, "modelUsed" | "costIncurred"> => {
   try {
      let cleaned = response
         .replace(/```json\n?/g, "")
         .replace(/```\n?/g, "")
         .trim();

      // Find JSON object
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
         cleaned = jsonMatch[0];
      }

      const parsed = JSON.parse(cleaned);

      return {
         technicalScore: Math.min(100, Math.max(0, parsed.technicalScore || 0)),
         clarityScore: Math.min(100, Math.max(0, parsed.clarityScore || 0)),
         communicationScore: Math.min(
            100,
            Math.max(0, parsed.communicationScore || 0)
         ),
         overallScore:
            parsed.overallScore ||
            Math.round(
               (parsed.technicalScore +
                  parsed.clarityScore +
                  parsed.communicationScore) /
                  3
            ),
         feedback: parsed.feedback || "Evaluation completed",
         strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
         improvements: Array.isArray(parsed.improvements)
            ? parsed.improvements
            : [],
      };
   } catch (error) {
      console.error("Parse Error:", error, "Response:", response);
      return {
         technicalScore: 50,
         clarityScore: 50,
         communicationScore: 50,
         overallScore: 50,
         feedback: "Evaluation completed with limited analysis",
         strengths: ["Submission received"],
         improvements: ["Could not generate detailed feedback"],
      };
   }
};

/**
 * Get model for pricing tier
 */
export const getModelForChallenge = (
   pricingTier: string,
   customModel?: AIModel
): AIModel => {
   if (customModel) {
      return customModel;
   }

   // Default to free models
   switch (pricingTier) {
      case "free":
         return AIModel.GEMINI_FLASH;
      case "balanced":
         return AIModel.LLAMA_70B;
      case "budget":
         return AIModel.GPT4O_MINI;
      case "premium":
         return AIModel.GPT4O;
      default:
         return AIModel.GEMINI_FLASH; // Default to free
   }
};

/**
 * Estimate cost
 */
export const estimateEvaluationCost = (
   pricingTier: string,
   customModel?: AIModel
): number => {
   const model = getModelForChallenge(pricingTier, customModel);
   const config = AI_MODELS[model];

   if (config.isFree) return 0;

   const avgTokens = 700;
   return (avgTokens / 1000) * config.costPer1kTokens;
};
