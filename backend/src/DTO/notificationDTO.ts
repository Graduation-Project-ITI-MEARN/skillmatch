import { z } from "zod";

const markReadParamsSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid notification ID"),
});

type MarkReadDTO = z.infer<typeof markReadParamsSchema>;

const createNotificationSchema = z.object({
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID"),

  title: z.string().min(1, "Title is required"),

  message: z.string().min(1, "Message is required"),

  type: z.enum(["system", "challenge", "submission", "payment"]),

  isRead: z.boolean().optional(),
});

type CreateNotificationDTO = z.infer<typeof createNotificationSchema>;

export {
  markReadParamsSchema,
  MarkReadDTO,
  createNotificationSchema,
  CreateNotificationDTO,
};
