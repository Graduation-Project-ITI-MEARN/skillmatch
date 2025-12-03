import z from "zod";

// 2.1 Login Schema
const loginSchema = z.object({
   email: z.string().email({ message: "Invalid email address" }),
   password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/\d/, { message: "Must contain at least one number" }),
});
type LoginFormData = z.infer<typeof loginSchema>;

// 2.2 Register Schema (جديد)
const registerSchema = z
   .object({
      email: z.string().email({ message: "Invalid email address" }),
      password: z
         .string()
         .min(8, { message: "Password must be at least 8 characters" })
         .regex(/[A-Z]/, {
            message: "Must contain at least one uppercase letter",
         })
         .regex(/[a-z]/, {
            message: "Must contain at least one lowercase letter",
         })
         .regex(/\d/, { message: "Must contain at least one number" }), // أضيفت هنا للتأكد من تطابق متطلبات الزود
      confirmPassword: z.string().optional(),
   })
   .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"], // مكان ظهور رسالة الخطأ
   });
type RegisterFormData = z.infer<typeof registerSchema>;

export { loginSchema, registerSchema };
export type { LoginFormData, RegisterFormData };
