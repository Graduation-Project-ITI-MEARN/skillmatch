"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { cn } from "@/app/lib/utils";

type TabKey = "candidates" | "companies" | "challengers";

export function FeatureTabs() {
  const t = useTranslations("Landing.Tabs");
  const [activeTab, setActiveTab] = useState<TabKey>("candidates");

  const tabs: { key: TabKey; color: string; imageColor: string }[] = [
    { key: "candidates", color: "var(--color-blue)", imageColor: "bg-blue-100" },
    { key: "companies", color: "var(--color-purple)", imageColor: "bg-purple-100" },
    { key: "challengers", color: "var(--color-orange)", imageColor: "bg-orange-100" },
  ];

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <h2 className="text-4xl md:text-6xl font-serif text-center mb-16 text-[var(--color-dark-blue)]">
        {t("title")}
      </h2>

      {/* Tab Triggers */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-8 py-3 rounded-full text-base font-medium transition-all duration-300 border",
              activeTab === tab.key
                ? "bg-[var(--color-dark-blue)] text-white border-[var(--color-dark-blue)] shadow-lg scale-105"
                : "bg-white text-[var(--color-dark-gray)] border-[var(--color-gray)] hover:border-[var(--color-blue)]"
            )}
          >
            {t(`${tab.key}Title`)}
          </button>
        ))}
      </div>

      {/* Interactive Content Area */}
      <div className="bg-white rounded-[40px] p-8 md:p-16 shadow-2xl border border-[var(--color-gray)] overflow-hidden min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: "circOut" }}
            className="flex flex-col lg:flex-row items-center gap-16"
          >
            {/* Text Content */}
            <div className="flex-1 space-y-8 text-center lg:text-start">
              <h3
                className="text-4xl md:text-5xl font-serif transition-colors duration-300"
                style={{ color: tabs.find((t) => t.key === activeTab)?.color }}
              >
                {t(`${activeTab}Heading`)}
              </h3>
              <p className="text-xl text-[var(--color-dark-gray)] leading-relaxed text-gray-500">
                {t(`${activeTab}Desc`)}
              </p>
              
              <div className="flex justify-center lg:justify-start pt-4">
                <Button variant="primary" size="lg" className="gap-2 px-8 h-12 text-lg">
                  {t("learnMore")} <ArrowRight size={20} />
                </Button>
              </div>
            </div>

            {/* Image Placeholder */}
            <div className={cn(
                "flex-1 w-full h-[300px] md:h-[400px] rounded-3xl shadow-inner flex items-center justify-center relative overflow-hidden",
                tabs.find((t) => t.key === activeTab)?.imageColor
            )}>
               {/* 
                  TODO: Replace with actual images from public/images/
                  <Image src={`/images/for-${activeTab}.png`} fill className="object-cover" />
               */}
               <span className="text-2xl font-bold opacity-20 uppercase tracking-widest">
                 {activeTab} Image
               </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}