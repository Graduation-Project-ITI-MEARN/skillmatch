"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/app/lib/utils";

export function HowItWorks() {
  const t = useTranslations("Landing.HowItWorks");

  const steps = [
    { 
      image: "/images/landing/step-1-shape.png", 
      title: t("step1Title"), 
      desc: t("step1Desc"),
      // Pink/Light Red
      colorClass: "text-[#cf746b]" 
    },
    { 
      image: "/images/landing/step-2-shape.png", 
      title: t("step2Title"), 
      desc: t("step2Desc"),
      // Blue
      colorClass: "text-[#4c74b1]"
    },
    { 
      image: "/images/landing/step-3-shape.png", 
      title: t("step3Title"), 
      desc: t("step3Desc"),
      // Olive/Green
      colorClass: "text-[#5c700c]"
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-5xl md:text-6xl font-serif text-center mb-20 text-[var(--color-black)]">
          {t("title")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center text-center relative group">
              
              {/* Image Placeholder */}
              <div className="mb-10 h-32 flex items-center justify-center transition-transform duration-500 hover:scale-105">
                 <img 
                    src={step.image} 
                    alt={step.title}
                    className="h-full w-auto object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      // Fallback wireframe if image missing
                      e.currentTarget.parentElement!.classList.add('border-2', 'border-dashed', 'border-gray-300', 'rounded-full', 'w-32', 'h-32', 'flex', 'items-center', 'justify-center');
                      e.currentTarget.parentElement!.innerHTML = `<span class="text-xs text-gray-400">Shape ${i+1}</span>`;
                    }}
                 />
              </div>
              
              {/* Title with specific color */}
              <h3 className={cn("text-2xl font-serif mb-6 font-medium", step.colorClass)}>
                {step.title}
              </h3>
              
              <p className="text-[var(--color-dark-gray)] text-sm md:text-base max-w-[250px] leading-relaxed mx-auto">
                {step.desc}
              </p>

              {/* Thin Arrow (Hidden on last item and mobile) */}
              {i !== steps.length - 1 && (
                <div className="hidden md:block absolute top-12 -right-[50%] transform translate-x-1/2">
                   {/* Using a font-based arrow to match the thin look in the image */}
                   <span className="text-4xl font-light text-black">→</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}