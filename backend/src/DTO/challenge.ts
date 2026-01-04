import { z } from "zod";

const createChallengeDTO = z.object({
   title: z.string().min(1, "Title is required"),
   description: z.string().min(1, "Description is required"),
   difficulty: z.enum(["easy", "medium", "hard"]),
   category: z.string().min(1, "Category is required"),
   status: z.enum(["draft", "published", "closed"]).default("draft"),
   type: z.enum(["job", "prize"]),

   // 👇 FIX: Added missing fields so the Backend accepts them
   deadline: z.string().or(z.date()),
   prizeAmount: z.number().optional(),
   currency: z.string().optional(),
   skills: z.array(z.string()).optional(),
   tags: z.array(z.string()).optional(),
   salary: z.number().optional(),
   additionalInfo: z.string().optional(),

   requirements: z.string().min(1, "Requirements are required"),
   evaluationCriteria: z.string().min(1, "Evaluation criteria is required"),
   deliverables: z.string().min(1, "Deliverables are required"),
   idealSolution: z
      .object({
         type: z.enum(["link", "file", "text"]),
         value: z.string().min(1, "Value is required"),
      })
      .optional(),
   // NEW: AI Evaluation Configuration
   aiConfig: z.object({
      pricingTier: z.enum(["free", "budget", "balanced", "premium"]),
      selectedModel: z.string().optional(), // If custom tier
      autoEvaluate: z.boolean().default(false), // Auto-evaluate on submission
      requireVideoTranscript: z.boolean().default(false),
   }),
});

type CreateChallengeDTO = z.infer<typeof createChallengeDTO>;

const updateChallengeDTO = createChallengeDTO.partial();

type UpdateChallengeDTO = z.infer<typeof updateChallengeDTO>;

export {
   createChallengeDTO,
   CreateChallengeDTO,
   updateChallengeDTO,
   UpdateChallengeDTO,
};
