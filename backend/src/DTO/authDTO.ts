import { z } from "zod";

const registerDTO = z.object({
  email: z.email(),
  password: z.string().min(8),
  name: z.string(),
  type: z.enum(["candidate", "company", "challenger"]),
  role: z.enum(["user", "admin"]).default("user"),
});

type RegisterDTO = z.infer<typeof registerDTO>;

const loginDTO = z.object({
  email: z.email(),
  password: z.string(),
});

type LoginDTO = z.infer<typeof loginDTO>;

export { registerDTO, RegisterDTO, loginDTO, LoginDTO };
