import React from "react";

interface AuthLayoutProps {
   title: string;
   subtitle?: string;
   children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
   title,
   subtitle,
   children,
}) => {
   return (
      <div
         className="
        bg-white 
        rounded-2xl 
        shadow-[0_0_60px_-15px_rgba(0,0,0,0.15)]
        border border-black/10
        px-8 py-10
        w-full
      ">
         {/* Header */}
         <div className="mb-14 mx-10 text-center">
            <h1 className="text-4xl  text-gray-900 tracking-tight mb-4">
               {title}
            </h1>
            <p className="text-sm text-gray-600 mt-5">{subtitle}</p>
         </div>

         {children}
      </div>
   );
};

export default AuthLayout;
