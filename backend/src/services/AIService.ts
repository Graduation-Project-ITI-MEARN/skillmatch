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
   videoTranscript?: string;
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
      `🤖 Evaluating with ${modelConfig.name} (${
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

      console.log(`✅ Evaluation complete:`, {
         technical: result.technicalScore,
         clarity: result.clarityScore,
         communication: result.communicationScore,
         overall: result.overallScore,
      });

      return result;
   } catch (error) {
      console.error(`❌ ${modelConfig.name} failed:`, error);
      // Fallback to free model if paid model fails
      if (request.selectedModel !== AIModel.GEMINI_FLASH) {
         console.log("🔄 Trying fallback to Gemini Flash...");
         return await evaluateWithGemini({
            ...request,
            selectedModel: AIModel.GEMINI_FLASH,
         });
      }
      throw error;
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
               "You are an expert technical evaluator for coding challenges. Analyze submissions critically and provide varied, accurate scores based on actual quality. Respond ONLY with valid JSON.",
         },
         { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      max_tokens: 3000,
      temperature: 0.8, // Increased for more variation
   });

   const responseText = completion.choices[0]?.message?.content || "{}";
   console.log("📝 OpenAI Raw Response:", responseText.substring(0, 200));

   const parsed = parseEvaluationResponse(responseText, request.selectedModel);

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
 * Google Gemini Evaluation
 */
const evaluateWithGemini = async (
   request: EvaluationRequest
): Promise<EvaluationResult> => {
   const prompt = buildEvaluationPrompt(request);

   const modelString =
      request.selectedModel === AIModel.GEMINI_PRO
         ? "gemini-1.5-pro"
         : "gemini-1.5-flash";

   const model = gemini.getGenerativeModel({
      model: modelString,
      generationConfig: {
         temperature: 0.8, // Increased for more variation
         maxOutputTokens: 3000,
         responseMimeType: "application/json", // Force JSON response
      },
   });

   const result = await model.generateContent(prompt);
   const responseText = result.response.text();

   console.log("📝 Gemini Raw Response:", responseText.substring(0, 200));

   const parsed = parseEvaluationResponse(responseText, request.selectedModel);

   return {
      ...parsed,
      modelUsed: request.selectedModel,
      costIncurred: 0, // FREE!
   };
};

/**
 * Groq Evaluation
 */
const evaluateWithGroq = async (
   request: EvaluationRequest
): Promise<EvaluationResult> => {
   const prompt = buildEvaluationPrompt(request);

   let modelString = "llama-3.1-70b-versatile";

   switch (request.selectedModel) {
      case AIModel.LLAMA_8B:
         modelString = "llama-3.1-8b-instant";
         break;
      case AIModel.MIXTRAL_8X7B:
         modelString = "mixtral-8x7b-32768";
         break;
      case AIModel.LLAMA_70B:
         modelString = "llama-3.1-70b-versatile";
         break;
   }

   const completion = await groq.chat.completions.create({
      messages: [
         {
            role: "system",
            content:
               "You are an expert technical evaluator. Analyze submissions critically and provide varied, accurate scores. Respond ONLY with valid JSON.",
         },
         {
            role: "user",
            content: prompt,
         },
      ],
      model: modelString,
      temperature: 0.8, // Increased for more variation
      max_tokens: 3000,
      response_format: { type: "json_object" },
   });

   const responseText = completion.choices[0]?.message?.content || "{}";
   console.log("📝 Groq Raw Response:", responseText.substring(0, 200));

   const parsed = parseEvaluationResponse(responseText, request.selectedModel);

   return {
      ...parsed,
      modelUsed: request.selectedModel,
      costIncurred: 0, // FREE!
   };
};

/**
 * Build standardized evaluation prompt (IMPROVED)
 */
const buildEvaluationPrompt = (request: EvaluationRequest): string => {
   return `You are evaluating a technical challenge submission for SkillMatch AI. 

**IMPORTANT EVALUATION GUIDELINES:**
- Be critical and realistic in your scoring
- Scores should vary based on actual quality (not default to 80-90)
- A mediocre solution should score 40-60
- A good solution should score 60-80
- An excellent solution should score 80-95
- A poor solution should score 20-40
- Consider the difficulty level when scoring

**Challenge Details:**
- Title: ${request.challengeTitle}
- Description: ${request.challengeDescription}
- Difficulty: ${request.difficulty}
- Category: ${request.category}
- Required Skills: ${request.tags.join(", ")}

**Candidate's Submission:**
${request.submissionContent}

${
   request.videoTranscript
      ? `**Video Explanation Transcript:**
${request.videoTranscript}

(Note: Evaluate communication skills based on the video transcript quality)`
      : "(No video explanation provided - score communication based on written explanation only)"
}

**Evaluation Criteria:**

1. **Technical Quality (0-100):**
   - Correctness and completeness of solution
   - Code quality and best practices
   - Efficiency and optimization
   - Innovation and problem-solving approach
   - Handling of edge cases
   
2. **Clarity Score (0-100):**
   - Code organization and structure
   - Documentation and comments
   - Readability and maintainability
   - Following conventions

3. **Communication Score (0-100):**
   - Quality of explanation (written or video)
   - Ability to articulate technical concepts
   - Completeness of documentation
   - Professional presentation

**Required Response Format:**
Respond with ONLY a JSON object (no markdown, no backticks, no extra text):

{
  "technicalScore": <number 0-100>,
  "clarityScore": <number 0-100>,
  "communicationScore": <number 0-100>,
  "overallScore": <number 0-100>,
  "feedback": "<2-3 sentences of overall assessment>",
  "strengths": ["<specific strength 1>", "<specific strength 2>", "<specific strength 3>"],
  "improvements": ["<specific improvement 1>", "<specific improvement 2>", "<specific improvement 3>"]
}

Provide specific, actionable feedback. Vary your scores based on actual quality.`;
};

/**
 * Parse AI response into structured format (IMPROVED ERROR HANDLING)
 */
const parseEvaluationResponse = (
   response: string,
   modelUsed: AIModel
): Omit<EvaluationResult, "modelUsed" | "costIncurred"> => {
   try {
      // Remove markdown code blocks if present
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

      // Validate required fields exist
      if (
         typeof parsed.technicalScore !== "number" ||
         typeof parsed.clarityScore !== "number" ||
         typeof parsed.communicationScore !== "number"
      ) {
         console.error("⚠️ Invalid score types in response:", parsed);
         throw new Error("Invalid score types in AI response");
      }

      // Clamp scores to 0-100 range
      const technicalScore = Math.min(
         100,
         Math.max(0, Math.round(parsed.technicalScore))
      );
      const clarityScore = Math.min(
         100,
         Math.max(0, Math.round(parsed.clarityScore))
      );
      const communicationScore = Math.min(
         100,
         Math.max(0, Math.round(parsed.communicationScore))
      );

      // Calculate overall score
      const overallScore = parsed.overallScore
         ? Math.min(100, Math.max(0, Math.round(parsed.overallScore)))
         : Math.round((technicalScore + clarityScore + communicationScore) / 3);

      return {
         technicalScore,
         clarityScore,
         communicationScore,
         overallScore,
         feedback: parsed.feedback || "Evaluation completed",
         strengths: Array.isArray(parsed.strengths)
            ? parsed.strengths.slice(0, 5)
            : ["Submission received"],
         improvements: Array.isArray(parsed.improvements)
            ? parsed.improvements.slice(0, 5)
            : ["See feedback for details"],
      };
   } catch (error) {
      console.error("❌ Parse Error:", error);
      console.error("Raw response:", response);

      // Instead of returning default values, throw error to trigger retry
      throw new Error(
         `Failed to parse AI response: ${
            error instanceof Error ? error.message : "Unknown error"
         }`
      );
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
         return AIModel.GEMINI_FLASH;
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

   const avgTokens = 1000; // Increased estimate
   return (avgTokens / 1000) * config.costPer1kTokens;
};
