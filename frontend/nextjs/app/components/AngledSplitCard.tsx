import React, { ReactNode } from "react";

// --- TYPES ---
export type ShapeVariant =
   | "right-narrow-top" // | /  (Top-right cut)
   | "right-wide-top" // | \  (Bottom-right cut)
   | "left-narrow-top" // \ |  (Top-left cut)
   | "left-wide-top" // / |  (Bottom-left cut)
   | "middle-narrow-top" // / \  (Pyramid)
   | "middle-wide-top"; // \ /  (Inverted Pyramid)

interface CardProps {
   children: ReactNode;
   variant: ShapeVariant;
   className?: string;
   // 'layout' = fixed min-heights (cards). 'compact' = auto size (buttons/tabs).
   mode?: "layout" | "compact";
   // Percentage of width to cut (0-50). Default is 20.
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
   // s = steepness percentage.
   // We clamp it between 0 and 50 to prevent shapes from crossing over themselves.
   const cut = Math.max(0, Math.min(50, s));

   switch (variant) {
      // RIGHT SIDE MODIFICATIONS
      case "right-narrow-top":
         // Top-Right point moves inward
         return `polygon(0 0, ${100 - cut}% 0, 100% 100%, 0% 100%)`;

      case "right-wide-top":
         // Bottom-Right point moves inward
         return `polygon(0 0, 100% 0, ${100 - cut}% 100%, 0% 100%)`;

      // LEFT SIDE MODIFICATIONS
      case "left-narrow-top":
         // Top-Left point moves inward
         return `polygon(${cut}% 0, 100% 0, 100% 100%, 0% 100%)`;

      case "left-wide-top":
         // Bottom-Left point moves inward
         return `polygon(0 0, 100% 0, 100% 100%, ${cut}% 100%)`;

      // MIDDLE MODIFICATIONS
      case "middle-narrow-top":
         // Top-Left AND Top-Right move inward (Pyramid)
         return `polygon(${cut}% 0, ${100 - cut}% 0, 100% 100%, 0% 100%)`;

      case "middle-wide-top":
         // Bottom-Left AND Bottom-Right move inward (Inverted)
         return `polygon(0 0, 100% 0, ${100 - cut}% 100%, ${cut}% 100%)`;

      default:
         return "polygon(0 0, 100% 0, 100% 100%, 0% 100%)";
   }
};

// --- ANGLED CARD ---
export const AngledCard = ({
   children,
   variant,
   className = "",
   mode = "layout",
   steepness = 20, // Default steepness
}: CardProps) => {
   const zIndex = variant.includes("middle") ? "z-20" : "z-10";

   // Size logic based on mode
   const sizeClasses =
      mode === "layout"
         ? "w-full lg:w-1/3 min-h-[300px] lg:min-h-full"
         : "w-auto h-full flex-shrink-0";

   return (
      <div
         className={`relative ${zIndex} transition-all duration-300 ${sizeClasses} ${className}`}
         style={{ filter: "url(#rounded-corners)" }}>
         <div
            className="h-full w-full overflow-hidden"
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
   overlap = false, // Default toggle for standard overlap
   gap, // Optional: If provided, this OVERRIDES overlap defaults
   mode = "layout",
}: ContainerProps) => {
   let spacingClass = "";

   // LOGIC:
   // 1. If 'gap' is explicitly provided, use it (allows 'gap-4' OR custom '-space-x-20')
   // 2. If 'gap' is missing, check 'overlap' boolean for defaults.
   // 3. Else, default to 0.

   if (gap) {
      // If user provided a gap, respect it.
      // If in layout mode, we usually only want this spacing on desktop (lg:).
      spacingClass = mode === "layout" ? `lg:${gap}` : gap;
   } else if (overlap) {
      // Default Overlap values
      const defaultOverlap = mode === "layout" ? "-space-x-12" : "-space-x-4";
      spacingClass =
         mode === "layout" ? `lg:${defaultOverlap}` : defaultOverlap;
   } else {
      // No overlap, no specific gap -> just zero
      spacingClass = mode === "layout" ? "lg:gap-0" : "gap-0";
   }

   // Direction Logic
   const flexDirection =
      mode === "layout" ? "flex-col lg:flex-row" : "flex-row";

   return (
      <div className={`relative w-full ${className}`}>
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
            className={`
        flex ${flexDirection} items-stretch justify-center
        ${spacingClass}
        ${mode === "layout" ? "lg:h-[500px]" : ""}
      `}>
            {children}
         </div>
      </div>
   );
};
