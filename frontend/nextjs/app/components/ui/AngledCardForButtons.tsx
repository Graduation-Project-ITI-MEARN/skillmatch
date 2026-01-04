"use client";

import { cn } from "@/app/lib/utils";
import { ReactNode } from "react";
import { useRTL } from "../RTLContext";

interface CardProps {
   children: ReactNode;
   variant: ShapeVariant;
   className?: string;
   mode?: "layout" | "compact";
   steepness?: number;
}

interface ContainerProps {
   children: ReactNode;
   className?: string;
   overlap?: boolean;
   gap?: string;
   mode?: "layout" | "compact";
}

// --- DYNAMIC CLIP PATH GENERATOR ---
const getClipPath = (variant: ShapeVariant, s: number): string => {
   const cut = Math.max(0, Math.min(50, s)); // Ensure cut is within valid range (0-50)

   switch (variant) {
      // LTR TEXT (RIGHT-NARROW-TOP) or RTL ARROW (LEFT-NARROW-TOP)
      // Top-right angle, vertical left side, angled right side
      case "angle-top-right": // LTR Text or RTL Arrow
         return `polygon(0 0, ${100 - cut}% 0, 100% 100%, 0% 100%)`;

      // LTR ARROW (LEFT-WIDE-TOP) or RTL TEXT (RIGHT-WIDE-TOP)
      // Bottom-left angle, vertical right side, angled left side
      case "angle-bottom-left": // LTR Arrow or RTL Text
         return `polygon(0 0, 100% 0, 100% 100%, ${cut}% 100%)`;

      // LTR TEXT (LEFT-NARROW-TOP) or RTL ARROW (RIGHT-NARROW-TOP)
      // Top-left angle, vertical right side, angled left side
      case "angle-top-left":
         return `polygon(${cut}% 0, 100% 0, 100% 100%, 0% 100%)`;

      // LTR ARROW (RIGHT-WIDE-TOP) or RTL TEXT (LEFT-WIDE-TOP)
      // Bottom-right angle, vertical left side, angled right side
      case "angle-bottom-right":
         return `polygon(0 0, 100% 0, ${100 - cut}% 100%, 0% 100%)`;

      // Middle parts (if used, might need adjustment if they also need to flip)
      case "middle-narrow-top":
         return `polygon(${cut}% 0, ${100 - cut}% 0, 100% 100%, 0% 100%)`;
      case "middle-wide-top":
         return `polygon(0 0, 100% 0, ${100 - cut}% 100%, ${cut}% 100%)`;

      default:
         return "polygon(0 0, 100% 0, 100% 100%, 0% 100%)"; // Default rectangle
   }
};

// Update ShapeVariant type
export type ShapeVariant =
   | "angle-top-right"
   | "angle-bottom-left"
   | "angle-top-left"
   | "angle-bottom-right"
   | "middle-narrow-top"
   | "middle-wide-top";

// AngledCard remains the same, but it will now pass isRTL to getClipPath directly
export const AngledCard = ({
   children,
   variant, // This will be one of the new generic shape variants
   className = "",
   mode = "layout",
   steepness = 20,
}: CardProps) => {
   const zIndex = variant.includes("middle") ? "z-20" : "z-10"; // Keep if middle variants are used

   const sizeClasses =
      mode === "layout"
         ? "w-full lg:w-1/3 min-h-[300px] lg:min-h-full"
         : "w-auto h-full flex-shrink-0";

   return (
      <div
         className={cn(
            `relative ${zIndex} transition-all duration-300 ${sizeClasses}`,
            className
         )}
         style={{ filter: "url(#rounded-corners)" }}>
         <div
            className="h-full w-full overflow-hidden"
            // No longer pass isRTL here, the variant defines the shape
            style={{ clipPath: getClipPath(variant, steepness) }}>
            {children}
         </div>
      </div>
   );
};
// --- ANGLED CONTAINER ---
export const AngledContainer = ({
   children,
   className = "",
   overlap = false,
   gap,
   mode = "layout",
}: // REMOVED: isRTL from destructuring
ContainerProps) => {
   const isRTL = useRTL(); // CONSUMED: isRTL from context
   let spacingClass = "";

   if (gap) {
      spacingClass = mode === "layout" ? `lg:${gap}` : gap;
   } else if (overlap) {
      const defaultOverlap = mode === "layout" ? "-space-x-12" : "-space-x-4";
      spacingClass =
         mode === "layout" ? `lg:${defaultOverlap}` : defaultOverlap;
   } else {
      spacingClass = mode === "layout" ? "lg:gap-0" : "gap-0";
   }

   const flexDirection =
      mode === "layout" ? "flex-col lg:flex-row" : "flex-row";

   return (
      <div className={cn("relative w-full", className)}>
         {/* SVG FILTER */}
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

         <div
            className={cn(
               `
              flex ${flexDirection} items-stretch justify-center
              ${spacingClass}
              ${mode === "layout" ? "lg:h-[500px]" : ""}
            `,
               isRTL ? "lg:flex-row-reverse" : ""
            )}>
            {children}
         </div>
      </div>
   );
};
