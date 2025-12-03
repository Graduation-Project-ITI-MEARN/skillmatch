import AuthLayout from "@/app/components/auth/AuthLayout";
import LoginForm from "@/app/components/auth/LoginForm";

export default function LoginPage() {
   return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
         <div className="w-full max-w-lg md:max-w-xl">
            <AuthLayout title="Log in" subtitle="">
               <LoginForm />
            </AuthLayout>
         </div>
      </div>
   );
}
