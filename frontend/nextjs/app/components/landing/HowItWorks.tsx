"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/app/lib/utils";
import Image from "next/image";

export function HowItWorks() {
   const t = useTranslations("Landing.HowItWorks");

   const steps = [
      {
         image: "/images/geometric-1.svg",
         title: t("step1Title"),
         desc: t("step1Desc"),
         // Pink/Light Red
         colorClass: "text-[#cf746b]",
      },
      {
         image: "/images/geometric-2.svg",
         title: t("step2Title"),
         desc: t("step2Desc"),
         // Blue
         colorClass: "text-[#4c74b1]",
      },
      {
         image: "/images/geometric-3.svg",
         title: t("step3Title"),
         desc: t("step3Desc"),
         // Olive/Green
         colorClass: "text-[#5c700c]",
      },
   ];

   return (
      <section id="how-it-works" className="py-24 scroll-mt-20">
         <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-5xl md:text-6xl font-serif text-center mb-20 text-black">
               {t("title")}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
               {steps.map((step, i) => (
                  <div
                     key={i}
                     className="flex flex-col items-center text-center relative group">
                     {/* Image Placeholder */}
                     <div className="mb-10 h-16 flex items-center justify-center transition-transform duration-500 hover:scale-105">
                        <Image
                           src={step.image}
                           alt={step.title}
                           width={100}
                           height={100}
                        />
                     </div>

                     {/* Title with specific color */}
                     <h3
                        className={cn(
                           "text-2xl font-serif mb-6 font-medium",
                           step.colorClass
                        )}>
                        {step.title}
                     </h3>

                     <p className="text-dark-gray text-sm md:text-base max-w-[250px] leading-relaxed mx-auto">
                        {step.desc}
                     </p>

                     {/* Thin Arrow (Hidden on last item and mobile) */}
                     {i !== steps.length - 1 && (
                        <div className="">
                           {/* Using a font-based arrow to match the thin look in the image */}
                           <Image
                              src="/images/arrow-right.svg"
                              alt="Right Arrow"
                              width={40}
                              height={40}
                           />
                        </div>
                     )}
                  </div>
               ))}
            </div>
         </div>
      </section>
   );
}
