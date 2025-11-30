"use client";
import { TEXT_COLOR } from "@/app/lib/constants";
import SplitButton from "./Button";

import { SubmitHandler, useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {  LoginFormData, loginSchema } from "@/app/lib/validation";
import InputField from "./InputField";

interface LoginFormProps {
    onSwitchToRegister: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => { // تم تغيير الاسم
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" }
    });
    
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
        console.log("Login Submission Data:", data);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        console.log("Login Successful!");
    };

    return (
        <div className="flex w-full flex-col">
            <form onSubmit={handleSubmit(onSubmit)}>
                
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
                    showPasswordToggle={true}
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword(prev => !prev)}
                />
                
                <div className="mt-4 text-right">
                    <a 
                        href="#" 
                        className="text-sm font-semibold transition duration-150 hover:underline" 
                        style={{ color: TEXT_COLOR }}
                    >
                        Forgot Password?
                    </a>
                </div>
                
                <SplitButton
                    buttonText="Log in"
                    isSubmitting={isSubmitting}
                    onClick={handleSubmit(onSubmit)}
                />
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
                New user?{" "}
                <button
                    type="button"
                    onClick={onSwitchToRegister}
                    className="text-gray-900 hover:underline underline-offset-2 font-bold"
                >
                    Sign up
                </button>
            </p>
        </div>
    );
}

export default LoginForm;