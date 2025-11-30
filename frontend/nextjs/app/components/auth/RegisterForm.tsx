"use client";
import { RegisterFormData, registerSchema } from "@/app/lib/validation";
import SplitButton from "./Button";
import InputField from "./InputField";
import { SubmitHandler, useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

interface RegisterFormProps {
    onSwitchToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => { // تم تغيير الاسم
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: { email: "", password: "", confirmPassword: "" }
    });

    const [showPassword, setShowPassword] = useState<boolean>(false);
    
    const onSubmit: SubmitHandler<RegisterFormData> = async (data) => {
        console.log("Register Submission Data:", data);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        console.log("Registration Successful!");
    };
    
    const togglePasswordVisibility = () => setShowPassword(prev => !prev);


    return (
        <div className="flex w-full flex-col">
            <form onSubmit={handleSubmit(onSubmit)}>
                
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

                {/* <div className="relative w-full mt-[-1]">
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
                </div> */}
                
    
                <SplitButton
                    buttonText="Sign up"
                    isSubmitting={isSubmitting}
                    onClick={handleSubmit(onSubmit)}
                />
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
                Already have an account?{" "}
                <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="text-gray-900 hover:underline underline-offset-2 font-bold"
                >
                    Log in
                </button>
            </p>
        </div>
    );
};

export default RegisterForm;