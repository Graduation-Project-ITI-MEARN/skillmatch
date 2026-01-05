"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { CheckCircle2, ChevronDown } from "lucide-react";
import { cn } from "@/app/lib/utils";

type TabKey = "companies" | "challengers" | "candidates";

const images: Record<TabKey, string> = {
   companies: "/images/for-companies.png",
   challengers: "/images/for-challengers.png",
   candidates: "/images/for-candidates.png",
};

export function WhySkillMatch() {
   const t = useTranslations("Landing.WhySkillMatch");
   const [activeTab, setActiveTab] = useState<TabKey>("companies");

   const sections: TabKey[] = ["companies", "challengers", "candidates"];

   // Helper to get number of points based on common knowledge of en.json
   // or we could use useMessages(). But to keep it simple and consistent with useTranslations:
   const getPointsCount = (section: TabKey) => {
      if (section === "companies") return 5;
      if (section === "challengers") return 4;
      return 4; // candidates
   };

   return (
      <section className="py-32">
         <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-serif text-center mb-16 text-black">
               {t("title")}
            </h2>

            <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-stretch">
               {/* Left: Dynamic Image with Transition */}
               <div className="w-full lg:w-1/2 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                     <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        transition={{ duration: 0.4, ease: "circOut" }}
                        className="w-full flex items-center justify-center">
                        <div className="relative w-full max-w-[550px] aspect-square">
                           <Image
                              src={images[activeTab]}
                              alt={t(`${activeTab}.title`)}
                              fill
                              className="object-contain"
                              priority
                           />
                        </div>
                     </motion.div>
                  </AnimatePresence>
               </div>

               {/* Right: Accordion */}
               <div className="w-full lg:w-1/2 space-y-6 self-center">
                  {sections.map((section) => (
                     <div key={section} className="relative pb-6">
                        {" "}
                        {/* Remove border-b and border-gray-200. Add 'relative'. pb-6 remains for content spacing. */}
                        {/* This is your gradient bottom border */}
                        {/* It will be positioned at the very bottom of the parent div */}
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-gradient"></div>
                        <button
                           onClick={() => setActiveTab(section)}
                           className="w-full flex items-center justify-between text-left group">
                           <h3
                              className={cn(
                                 "text-2xl font-serif transition-colors duration-300",
                                 activeTab === section
                                    ? "text-black"
                                    : "text-gray-400 group-hover:text-gray-600"
                              )}>
                              {t(`${section}.title`)}
                           </h3>
                           {activeTab !== section && (
                              <ChevronDown className="text-gray-300" />
                           )}
                        </button>
                        <AnimatePresence>
                           {activeTab === section && (
                              <motion.div
                                 initial={{ height: 0, opacity: 0 }}
                                 animate={{ height: "auto", opacity: 1 }}
                                 exit={{ height: 0, opacity: 0 }}
                                 transition={{ duration: 0.3 }}
                                 className="overflow-hidden">
                                 <ul className="pt-6 space-y-4">
                                    {Array.from({
                                       length: getPointsCount(section),
                                    }).map((_, i) => (
                                       <li
                                          key={i}
                                          className="flex items-start gap-3 text-dark-gray">
                                          <CheckCircle2
                                             size={24}
                                             className="text-dark-gray shrink-0 mt-0.5"
                                          />
                                          <span className="text-lg leading-relaxed">
                                             {t(`${section}.points.${i}`)}
                                          </span>
                                       </li>
                                    ))}
                                 </ul>
                              </motion.div>
                           )}
                        </AnimatePresence>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </section>
   );
}
