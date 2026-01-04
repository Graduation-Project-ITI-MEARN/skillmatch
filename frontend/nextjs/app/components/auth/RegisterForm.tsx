"use client";
import { RegisterFormData, registerSchema } from "@/app/lib/validation";
import InputField from "./InputField";
import UserTypeTabs, { UserType } from "./UserTypeTabs";
import { SubmitHandler, useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useTranslations } from "next-intl";
import SplitButton from "../ui/SplitButton";

const RegisterForm = () => {
   const [userType, setUserType] = useState<UserType>("candidate");
   const [errorMessage, setErrorMessage] = useState<string>("");

   const t = useTranslations("Common");

   const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
   } = useForm<RegisterFormData>({
      resolver: zodResolver(registerSchema),
      defaultValues: { email: "", password: "", confirmPassword: "" },
   });

   const [showPassword, setShowPassword] = useState<boolean>(false);

   const onSubmit: SubmitHandler<RegisterFormData> = async (data) => {
      console.log("onSubmit called with data:", data);
      console.log("userType:", userType);

      setErrorMessage(""); // Clear previous errors

      try {
         // Call Next.js API route (not backend directly)
         const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify({
               email: data.email,
               password: data.password,
               name: data.email.split("@")[0], // Extract name from email or add name field
               type: userType,
            }),
         });

         const result = await response.json();
         console.log("API response:", result);

         if (response.ok && result.success) {
            // Small delay to ensure cookies are set
            await new Promise((resolve) => setTimeout(resolve, 100));

            // Redirect to Angular dashboard
            const redirectUrl = `http://localhost:4200${result.redirectUrl}`;
            console.log("Redirecting to:", redirectUrl);

            // Use window.location.replace to avoid ESLint warning
            window.location.replace(redirectUrl);
         } else {
            setErrorMessage(
               result.message || "Registration failed. Please try again."
            );
         }
      } catch (error) {
         console.error("Registration error:", error);
         setErrorMessage(
            error instanceof Error
               ? error.message
               : "An error occurred. Please try again."
         );
      }
   };

   const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

   return (
      <div className="flex w-full flex-col">
         {/* User Type Tabs */}
         <UserTypeTabs selected={userType} onChange={setUserType} />

         <form onSubmit={handleSubmit(onSubmit)}>
            {/* Error Message */}
            {errorMessage && (
               <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errorMessage}</p>
               </div>
            )}
            <InputField<RegisterFormData>
               id="email"
               type="email"
               placeholder="yourname@email.com"
               label="EMAIL"
               register={register}
               isTop={true}
               error={errors.email?.message}
            />
            <InputField<RegisterFormData>
               id="password"
               type="password"
               placeholder="••••••••••••"
               label="PASSWORD"
               register={register}
               isTop={false}
               error={errors.password?.message}
               showPasswordToggle={true}
               showPassword={showPassword}
               onTogglePassword={togglePasswordVisibility}
            />
            <InputField<RegisterFormData>
               id="confirmPassword"
               type="password"
               placeholder="••••••••••••"
               label="CONFIRM PASSWORD"
               register={register}
               isTop={false}
               error={errors.confirmPassword?.message}
               showPasswordToggle={true}
               showPassword={showPassword}
               onTogglePassword={togglePasswordVisibility}
            />
            <SplitButton
               buttonText="Sign Up"
               isSubmitting={isSubmitting}
               backgroundColor="#39594d"
               hoverColor="#191f1de8"
               textColor="#fff"
            />{" "}
         </form>

         <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
               href={"/login"}
               type="button"
               className="text-gray-900 hover:underline underline-offset-2 font-bold">
               {t("login")}
            </Link>
         </p>
      </div>
   );
};

export default RegisterForm;
