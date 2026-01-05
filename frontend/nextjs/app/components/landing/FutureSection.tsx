"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/app/components/ui/Button";

export function FutureSection() {
   const t = useTranslations("Landing.Future");

   return (
      <section className="relative py-24 overflow-hidden my-16">
         {/* Noisy Gradient Background */}
         <div className="absolute inset-0 bg-[url('/images/background-1.svg')] z-0">
            <div className="absolute inset-0 opacity-20 mix-blend-overlay"></div>
         </div>

         <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-16">
            {/* Text Content */}
            <div className="flex-1 text-white">
               <h2 className="text-5xl md:text-6xl font-serif mb-6 leading-tight">
                  {t("title")}
               </h2>
               <p className="text-xl opacity-90 mb-10 max-w-md font-light">
                  {t("desc")}
               </p>
               <div className="flex items-center gap-6">
                  <Button className="bg-white text-black hover:bg-gray-100 rounded-full px-8 py-6 text-lg font-bold">
                     {t("ctaPrimary")}
                  </Button>
                  <button className="text-white underline underline-offset-4 hover:opacity-80 font-medium">
                     {t("ctaSecondary")}
                  </button>
               </div>
            </div>

            {/* Dashboard Image Placeholder */}
            <div className="flex-1 w-full">
               <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-white/20 transform md:rotate-2 hover:rotate-0 transition-transform duration-500">
                  {/* Header of Mock Window */}
                  <div className="bg-gray-50 border-b px-4 py-3 flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full bg-red-400"></div>
                     <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                     <div className="w-3 h-3 rounded-full bg-green-400"></div>
                     <span className="ml-4 text-xs text-gray-400 font-mono">
                        TechCorp Inc. Dashboard
                     </span>
                  </div>
                  {/* Body of Mock Window */}
                  <div className="p-6 h-[300px] bg-gray-50/50 flex flex-col gap-4">
                     <div className="flex gap-4">
                        <div className="h-24 flex-1 bg-white rounded-lg shadow-sm"></div>
                        <div className="h-24 flex-1 bg-white rounded-lg shadow-sm"></div>
                        <div className="h-24 flex-1 bg-white rounded-lg shadow-sm"></div>
                     </div>
                     <div className="h-full bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                        <div className="w-1/3 h-4 bg-gray-100 rounded mb-4"></div>
                        <div className="w-full h-2 bg-gray-50 rounded mb-2"></div>
                        <div className="w-full h-2 bg-gray-50 rounded mb-2"></div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
   );
}
