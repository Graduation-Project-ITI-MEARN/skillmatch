"use client";
import AuthLayout from "@/app/components/auth/AuthLayout";
import RegisterForm from "@/app/components/auth/RegisterForm";

export default function RegisterPage() {
   const handleSwitchToLogin = () => {
      window.location.href = "/login";
   };

   return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
         <div className="w-full max-w-lg md:max-w-xl">
            <AuthLayout
               title="Create your account"
               subtitle="Get started with your free account">
               <RegisterForm onSwitchToLogin={handleSwitchToLogin} />
            </AuthLayout>
         </div>
      </div>
   );
}


