import { z } from "zod";

export const registerDTO = z.object({
   email: z.email(),
   password: z.string().min(8),
   name: z.string(),
   type: z.enum(["candidate", "company", "challenger"]),
   role: z.enum(["user", "admin"]).default("user"),
});

export type RegisterDTO = z.infer<typeof registerDTO>;

export const loginDTO = z.object({
   email: z.email(),
   password: z.string(),
});

export type LoginDTO = z.infer<typeof loginDTO>;
