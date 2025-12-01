"use client";
import { RegisterFormData, registerSchema } from "@/app/lib/validation";
import SplitButton from "./Button";
import InputField from "./InputField";
import UserTypeTabs, { UserType } from "./UserTypeTabs";
import { SubmitHandler, useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";

interface RegisterFormProps {
    onSwitchToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
    const [userType, setUserType] = useState<UserType>('candidate');
    
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
        console.log("User Type:", userType);
        
        try {
            // API Call
            const response = await fetch('YOUR_API_ENDPOINT/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: data.email,
                    password: data.password,
                    type: userType  
                }),
            });

            // Check if response is JSON
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Server returned non-JSON response. Check API endpoint.");
            }

            const result = await response.json();

            if (response.ok) {
                // Set cookies using js-cookie with path: '/'
                Cookies.set('auth_token', result.token, { path: '/' });
                Cookies.set('user_role', result.user.role, { path: '/' });
                Cookies.set('user_type', result.user.type, { path: '/' });

                // Redirect Logic (Priority Order)
                let redirectUrl = 'http://localhost:4200/dashboard/';
                
                // Check Admin Role first
                if (result.user.role === 'admin') {
                    redirectUrl += 'admin';
                } 
                // Check User Type
                else if (result.user.type === 'company') {
                    redirectUrl += 'company';
                } else if (result.user.type === 'candidate') {
                    redirectUrl += 'candidate';
                } else if (result.user.type === 'challenger') {
                    redirectUrl += 'challenger';
                }

                window.location.replace(redirectUrl);
            } else {
                console.error('Registration failed:', result.message);
                alert(result.message || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert(error instanceof Error ? error.message : 'An error occurred. Please check your API endpoint.');
        }
    };
    
    const togglePasswordVisibility = () => setShowPassword(prev => !prev);

    return (
        <div className="flex w-full flex-col">
            {/* User Type Tabs */}
            <UserTypeTabs selected={userType} onChange={setUserType} />
            
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