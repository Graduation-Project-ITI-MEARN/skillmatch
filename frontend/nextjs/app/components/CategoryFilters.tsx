// app/components/CategoryFilters.tsx
"use client";

import React from "react";
import { cn } from "@/app/lib/utils";
import { AngledCard, ShapeVariant } from "./ui/AngledSplitCard";
import { useRTL } from "./RTLContext";

interface Category {
   id: string;
   name: string;
   nameAr?: string;
}

interface CategoryFiltersProps {
   categories: Category[]; // Now received as a prop
   selectedCategory: string; // Now received as a prop
   onSelectCategory: (categoryId: string) => void; // Callback for selection
   locale: string; // Pass locale to help with display logic if needed
}

const CategoryFilters: React.FC<CategoryFiltersProps> = ({
   categories,
   selectedCategory,
   onSelectCategory,
   locale,
}) => {
   const isRTL = useRTL();

   return (
      <div className="mb-10 flex flex-wrap gap-x-2 gap-y-4 justify-center md:justify-start relative">
         {/* SVG FILTER DEFINITION: Keep it here as it's local to how AngledCard is used within CategoryFilters. */}
         {/* It's `absolute w-0 h-0` so it doesn't take up space. */}
         <svg
            className="absolute w-0 h-0 pointer-events-none"
            aria-hidden="true">
            <defs>
               <filter id="rounded-corners">
                  <feGaussianBlur
                     in="SourceGraphic"
                     stdDeviation="2"
                     result="blur"
                  />
                  <feColorMatrix
                     in="blur"
                     mode="matrix"
                     values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 19 -9"
                     result="goo"
                  />
                  <feComposite in="SourceGraphic" in2="goo" operator="atop" />
               </filter>
            </defs>
         </svg>

         {categories.map((category, index) => {
            let currentVariant: ShapeVariant;

            // Determine variant based on RTL context and index for alternation
            if (isRTL) {
               if (index % 2 === 0) {
                  currentVariant = "angle-top-left";
               } else {
                  currentVariant = "angle-bottom-right";
               }
            } else {
               if (index % 2 === 0) {
                  currentVariant = "angle-top-right";
               } else {
                  currentVariant = "angle-bottom-left";
               }
            }

            const isActive = selectedCategory === category.id;

            return (
               <button
                  key={category.id}
                  onClick={() => onSelectCategory(category.id)} // Use onSelectCategory prop
                  className="transition-transform hover:scale-105 focus:outline-none">
                  <AngledCard
                     variant={currentVariant}
                     mode="compact"
                     className={cn(
                        "rounded-lg",
                        isActive ? "bg-dark-red" : "bg-[#f5f4f2]"
                     )}
                     steepness={10}>
                     <div
                        className={cn(
                           "flex items-center justify-center px-4 md:px-6 py-2 md:py-2.5 h-full",
                           isActive ? "text-white" : "text-dark-red"
                        )}>
                        <span className="text-sm md:text-base whitespace-nowrap font-normal">
                           {locale === "ar" && category.nameAr
                              ? category.nameAr
                              : category.name}
                        </span>
                     </div>
                  </AngledCard>
               </button>
            );
         })}
      </div>
   );
};

export default CategoryFilters;
