import { z } from "zod";

export const markAsReadDTO = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Notification ID"),
  }),
});

export const markAllAsReadDTO = z.object({});
