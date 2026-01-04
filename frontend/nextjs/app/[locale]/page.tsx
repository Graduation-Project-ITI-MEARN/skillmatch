"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/app/lib/utils";

// --- YOUR EXACT IMPORTS ---
import {
   AngledContainer,
   AngledCard,
} from "@/app/components/ui/AngledSplitCard";
import { Button } from "@/app/components/ui/Button";
import { HowItWorks } from "@/app/components/landing/HowItWorks";
import { WhySkillMatch } from "@/app/components/landing/WhySkillMatch";
import { FutureSection } from "@/app/components/landing/FutureSection";
import Image from "next/image";

export default function LandingPage() {
   const t = useTranslations("Landing");

   // Toggle: true = Companies, false = Candidates
   const [isHiring, setIsHiring] = useState(true);

   const scrollToHowItWorks = () => {
      const section = document.getElementById("how-it-works");
      if (section) section.scrollIntoView({ behavior: "smooth" });
   };

   return (
      <main className="min-h-screen flex flex-col bg-white overflow-x-hidden">
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
               <div className="h-[500px]">
                  {/* Using 'gap' to create the visual split */}
                  <AngledContainer
                     mode="layout"
                     gap="gap-4 md:gap-8"
                     overlap={false}>
                     {/* LEFT CARD */}
                     <AngledCard
                        variant="angle-bottom-right"
                        steepness={10}
                        // Overriding width to 50% to ensure even split
                        className="lg:w-1/2 bg-white border border-black rounded-[30px] p-8 md:p-12 flex flex-col justify-center relative z-10">
                        <AnimatePresence mode="wait">
                           <motion.div
                              key={isHiring ? "companies" : "candidates"}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ duration: 0.3 }}
                              className="max-w-md h-full flex flex-col justify-center">
                              <h2 className="text-3xl md:text-4xl font-serif mb-6 leading-tight text-black">
                                 {isHiring
                                    ? t("Hero.companies.title")
                                    : t("Hero.candidates.title")}
                              </h2>
                              <p className="text-gray-600 mb-8 leading-relaxed text-base md:text-lg">
                                 {isHiring
                                    ? t("Hero.companies.desc")
                                    : t("Hero.candidates.desc")}
                              </p>
                              <button
                                 onClick={scrollToHowItWorks}
                                 className="flex items-center gap-2 text-xl font-serif font-bold text-black border-b-2 border-black pb-1 w-fit hover:gap-4 transition-all">
                                 {isHiring
                                    ? t("Hero.companies.link")
                                    : t("Hero.candidates.link")}
                                 <ArrowRight size={24} />
                              </button>
                           </motion.div>
                        </AnimatePresence>
                     </AngledCard>

                     {/* RIGHT CARD */}
                     <AngledCard
                        variant="angle-top-left"
                        steepness={10}
                        className="lg:w-1/2 bg-white border border-black rounded-[30px] flex items-center justify-center relative overflow-hidden">
                        <AnimatePresence mode="wait">
                           <motion.div
                              key={
                                 isHiring ? "companies-img" : "candidates-img"
                              }
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.5 }}
                              className="w-full h-full relative flex items-center justify-center overflow-hidden">
                              {/* Glow Background (Absolute) */}
                              <div className="absolute inset-0 z-0">
                                 <Image
                                    src="/images/landing/hero-glow.png"
                                    alt=""
                                    className="w-full h-full object-cover scale-110 opacity-90"
                                    onError={(e) =>
                                       (e.currentTarget.style.display = "none")
                                    }
                                    fill
                                 />
                              </div>

                              {/* Geometric Shape (Relative) */}
                              <div className="relative z-10 w-3/4 h-3/4 flex items-center justify-center">
                                 <Image
                                    src={
                                       isHiring
                                          ? "/images/landing/hero-globe.png"
                                          : "/images/landing/hero-candidate.png"
                                    }
                                    alt="Visual"
                                    className="w-full h-full object-contain"
                                    onError={(e) =>
                                       (e.currentTarget.style.display = "none")
                                    }
                                    fill
                                 />
                              </div>
                           </motion.div>
                        </AnimatePresence>
                     </AngledCard>
                  </AngledContainer>
               </div>
            </div>
         </section>

         {/* ================= SECTIONS ================= */}
         <HowItWorks />
         <FutureSection />
         <WhySkillMatch />

         {/* ================= FOOTER CTA ================= */}
         <section className="relative py-24 overflow-hidden text-center">
            <div className="absolute inset-0 bg-linear-to-br from-[#a87866] via-[#946b78] to-[#6a6b85] z-0">
               <div
                  className="absolute inset-0 opacity-20 mix-blend-overlay"
                  style={{
                     backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                  }}></div>
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
