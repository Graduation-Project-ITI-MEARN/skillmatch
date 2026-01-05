"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/app/lib/utils";
import { Button } from "@/app/components/ui/Button";
import { HowItWorks } from "@/app/components/landing/HowItWorks";
import { WhySkillMatch } from "@/app/components/landing/WhySkillMatch";
import { FutureSection } from "@/app/components/landing/FutureSection";
import HeroCard from "../components/landing/HeroCards";

export default function LandingPage() {
   const t = useTranslations("Landing");

   // Toggle: true = Companies, false = Candidates
   const [isHiring, setIsHiring] = useState(true);

   return (
      <main className="min-h-screen flex flex-col overflow-x-hidden">
         {/* ================= HERO SECTION ================= */}
         <section className="pt-24 pb-16 px-6">
            <div className="max-w-7xl mx-auto">
               {/* Top Headline */}
               <div className="text-center mb-16">
                  <h1 className="text-5xl md:text-7xl font-serif text-black leading-tight mb-8">
                     {t("Hero.headline")} <br />
                     {t("Hero.headlineSuffix")}
                  </h1>

                  {/* TOGGLE BUTTONS */}
                  <div className="flex justify-center gap-4 items-center">
                     <button
                        onClick={() => setIsHiring(true)}
                        className={cn(
                           "px-8 py-4 text-lg rounded-full transition-all duration-300 border-2",
                           isHiring
                              ? "bg-black text-white border-black font-bold shadow-lg"
                              : "bg-transparent text-black border-transparent font-medium hover:bg-gray-100"
                        )}>
                        {t("Hero.ctaPrimary")}
                     </button>

                     <button
                        onClick={() => setIsHiring(false)}
                        className={cn(
                           "px-8 py-4 text-lg rounded-full transition-all duration-300 border-2",
                           !isHiring
                              ? "bg-black text-white border-black font-bold shadow-lg"
                              : "bg-transparent text-black border-transparent font-medium hover:bg-gray-100"
                        )}>
                        {t("Hero.ctaSecondary")}
                     </button>
                  </div>
               </div>

               {/* SPLIT CARDS AREA */}
               <HeroCard />
            </div>
         </section>

         {/* ================= SECTIONS ================= */}
         <HowItWorks />
         <FutureSection />
         <WhySkillMatch />

         {/* ================= FOOTER CTA ================= */}
         <section className="relative py-32 overflow-hidden text-center">
            <div className="absolute inset-0 bg-[url('/images/background-2.svg')] bg-cover z-0">
               <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-[url('/images/background-2.svg')] bg-cover"></div>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-6">
               <h2 className="text-4xl md:text-6xl font-serif text-white mb-10">
                  {t("FooterCTA.title")}
               </h2>
               <Button className="bg-white text-black hover:scale-105 transition-transform rounded-full px-10 py-6 text-lg font-bold shadow-xl">
                  {t("FooterCTA.button")}
               </Button>
            </div>
         </section>
      </main>
   );
}
