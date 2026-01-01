import { z } from "zod";

const createReportSchema = z.object({
   targetType: z.enum(["Challenge", "Submission", "User"] as const),
   targetId: z.string().min(1, "Target ID is required"),
   reason: z
      .string()
      .min(5, "Reason must be at least 5 characters")
      .max(500, "Reason must not exceed 500 characters"),
});

type CreateReportDTO = z.infer<typeof createReportSchema>;

const resolveReportSchema = z.object({
   status: z.enum(["resolved", "dismissed"] as const),
   adminNotes: z
      .string()
      .max(1000, "Admin notes must not exceed 1000 characters")
      .optional(),
   action: z.enum(["hide", "ban", "delete"] as const).optional(),
});

type ResolveReportDTO = z.infer<typeof resolveReportSchema>;

export {
   createReportSchema,
   CreateReportDTO,
   resolveReportSchema,
   ResolveReportDTO,
};
