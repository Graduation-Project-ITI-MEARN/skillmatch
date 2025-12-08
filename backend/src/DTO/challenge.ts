import { z } from "zod";

const createChallengeDTO = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  category: z.string().min(1, "Category is required"),
  status: z.enum(["draft", "published", "closed"]).default("draft"),
  type: z.enum(["job", "prize"]),
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
