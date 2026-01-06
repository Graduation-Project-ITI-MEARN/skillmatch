"use client";
import { TEXT_COLOR } from "@/app/lib/constants";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginFormData, loginSchema } from "@/app/lib/validation";
import InputField from "./InputField";
import { useState } from "react";
import { useLocale } from "next-intl";
import SplitButton from "../ui/SplitButton";
import { Link } from "@/i18n/routing";

const LoginForm = () => {
   const [errorMessage, setErrorMessage] = useState<string>("");
   const locale = useLocale(); // Gets 'en' or 'ar'

   const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
   } = useForm<LoginFormData>({
      resolver: zodResolver(loginSchema),
      defaultValues: { email: "", password: "" },
   });

   const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
      console.log("onSubmit called with data:", data);

      setErrorMessage(""); // Clear previous errors

      try {
         // Call Next.js API route (not backend directly)
         const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify({
               email: data.email,
               password: data.password,
               lang: locale,
            }),
         });

         const result = await response.json();
         console.log("API response:", result);

         if (response.ok && result.success) {
            // Small delay to ensure cookies are set
            await new Promise((resolve) => setTimeout(resolve, 100));

            // Redirect to Angular dashboard
            const redirectUrl = `${process.env.NEXT_PUBLIC_ANGULAR_DASHBOARD_URL}${result.redirectUrl}`;
            console.log("Redirecting to:", redirectUrl);

            // Use window.location.replace to avoid ESLint warning
            window.location.replace(redirectUrl);
         } else {
            setErrorMessage(
               result.message || "Login failed. Please try again."
            );
         }
      } catch (error) {
         console.error("Login error:", error);
         setErrorMessage(
            error instanceof Error
               ? error.message
               : "An error occurred. Please try again."
         );
      }
   };

   return (
      <div className="flex w-full flex-col">
         <form onSubmit={handleSubmit(onSubmit)}>
            {/* Error Message */}
            {errorMessage && (
               <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errorMessage}</p>
               </div>
            )}

            <InputField<LoginFormData>
               id="email"
               type="email"
               placeholder="yourname@email.com"
               label="EMAIL"
               register={register}
               isTop={true}
               error={errors.email?.message}
            />

            <InputField<LoginFormData>
               id="password"
               type="password"
               placeholder="••••••••••••"
               label="PASSWORD"
               register={register}
               isTop={false}
               error={errors.password?.message}
            />

            <div className="mt-4 text-right">
               <a
                  href="#"
                  className="text-sm font-semibold transition duration-150 hover:underline"
                  style={{ color: TEXT_COLOR }}>
                  Forgot Password?
               </a>
            </div>

            <SplitButton
               buttonText="Log in"
               isSubmitting={isSubmitting}
               backgroundColor="#39594d"
               hoverColor="#191f1de8"
               textColor="#fff"
            />
         </form>

         <p className="mt-6 text-center text-sm text-gray-600">
            New user?{" "}
            <Link
               href="/register"
               type="button"
               className="text-gray-900 hover:underline underline-offset-2 font-bold">
               Sign up
            </Link>
         </p>
      </div>
   );
};

export default LoginForm;
