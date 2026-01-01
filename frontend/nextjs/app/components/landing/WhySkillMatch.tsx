"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { CheckCircle2, ChevronDown } from "lucide-react";
import { cn } from "@/app/lib/utils";

type TabKey = "companies" | "challengers" | "candidates";

export function WhySkillMatch() {
  const t = useTranslations("Landing.WhySkillMatch");
  const [activeTab, setActiveTab] = useState<TabKey>("companies");

  const sections: TabKey[] = ["companies", "challengers", "candidates"];

  return (
    <section className="py-24 bg-[#f8f9f9]">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-serif text-center mb-16 text-[var(--color-black)]">
          {t("title")}
        </h2>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
          
          {/* Left: Visual (Dashboard UI Mockup) */}
          <div className="w-full lg:w-1/2 bg-[#f0eee9] rounded-[40px] p-8 min-h-[400px] flex items-center justify-center relative overflow-hidden">
             {/* Mock UI Element */}
             <div className="bg-white p-6 rounded-2xl shadow-xl w-3/4 transform rotate-[-2deg] border border-gray-200">
                <div className="h-4 w-1/3 bg-gray-100 rounded mb-4"></div>
                <div className="space-y-3">
                   <div className="h-2 w-full bg-gray-50 rounded"></div>
                   <div className="h-2 w-5/6 bg-gray-50 rounded"></div>
                   <div className="h-2 w-4/6 bg-gray-50 rounded"></div>
                </div>
                <div className="mt-6 flex justify-center">
                   <div className="px-4 py-2 bg-[var(--color-black)] rounded-full text-white text-xs">
                      AI Analysis
                   </div>
                </div>
             </div>
             {/* Abstract Background Elements */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-grad-start)] opacity-20 rounded-full blur-3xl"></div>
          </div>

          {/* Right: Accordion */}
          <div className="w-full lg:w-1/2 space-y-6">
            {sections.map((section) => (
              <div key={section} className="border-b border-gray-300 pb-6">
                <button
                  onClick={() => setActiveTab(section)}
                  className="w-full flex items-center justify-between text-left group"
                >
                  <h3 className={cn(
                    "text-2xl font-serif transition-colors duration-300",
                    activeTab === section ? "text-[var(--color-black)]" : "text-gray-400 group-hover:text-gray-600"
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
                      className="overflow-hidden"
                    >
                      <ul className="pt-6 space-y-4">
                        {/* 
                           Note: In a real app, you might want to map these from an array if possible.
                           Since translation keys return a string (not array) by default in some setups, 
                           we'll assume you configure next-intl to return objects, or we manually map a set count.
                           For safety here, I will hardcode the mapping logic assuming the structure exists.
                        */}
                        {[0, 1, 2, 3, 4].map((i) => {
                           try {
                              const text = t(`${section}.points.${i}` as any);
                              // Simple check to avoid empty strings if translation is missing
                              if (text.includes("points")) return null; 
                              
                              return (
                                <li key={i} className="flex items-center gap-3 text-[var(--color-dark-gray)]">
                                  <CheckCircle2 size={20} className="text-[var(--color-black)] shrink-0" />
                                  <span className="text-lg">{text}</span>
                                </li>
                              );
                           } catch { return null; }
                        })}
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