// frontend/nextjs/components/ui/SplitButton.tsx
"use client";

import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
// Make sure to import the updated ShapeVariant from AngledSplitCard
import { AngledCard, AngledContainer, ShapeVariant } from "./AngledSplitCard";
import { cn } from "@/app/lib/utils";
import { useRTL } from "../RTLContext";

interface SplitButtonProps
   extends React.ButtonHTMLAttributes<HTMLButtonElement> {
   buttonText: string;
   isSubmitting: boolean;
   rtlButtonText?: string;
   wrapperClassName?: string;
   backgroundColor?: string;
   hoverColor?: string;
   textColor?: string;
}

const SplitButton: React.FC<SplitButtonProps> = ({
   buttonText,
   isSubmitting,
   rtlButtonText,
   wrapperClassName,
   className,
   backgroundColor,
   hoverColor,
   textColor,
   ...props
}) => {
   const [isHovered, setIsHovered] = useState<boolean>(false);
   const isRTL = useRTL();

   const bgColor = isHovered ? hoverColor : backgroundColor;
   const displayButtonText =
      isRTL && rtlButtonText ? rtlButtonText : buttonText;

   // Define the specific variants for LTR and RTL
   const ltrTextVariant: ShapeVariant = "angle-top-right"; // Text on left: Angled right side, top narrow
   const ltrArrowVariant: ShapeVariant = "angle-bottom-left"; // Arrow on right: Angled left side, bottom wide

   // For RTL, the *visual shape* of the cards is the same, just their order
   // So, the card that *looks like* the text part (on the right) needs the `angle-bottom-left` shape
   // And the card that *looks like* the arrow part (on the left) needs the `angle-top-right` shape
   const rtlArrowVariant: ShapeVariant = "angle-top-right"; // Arrow on left: Angled right side, top narrow
   const rtlTextVariant: ShapeVariant = "angle-bottom-left"; // Text on right: Angled left side, bottom wide

   return (
      <div
         className={cn(
            "flex justify-center pt-4 w-full my-4",
            wrapperClassName
         )}>
         <button
            type="submit"
            disabled={isSubmitting}
            className={cn("group relative focus:outline-none", className)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            {...props}>
            {isSubmitting ? (
               <div
                  className="rounded-md flex items-center justify-center  py-2 px-10 h-12 transition-colors duration-200"
                  style={{ backgroundColor: bgColor, color: textColor }}>
                  <Loader2 className="w-5 h-5 animate-spin" />
               </div>
            ) : (
               <AngledContainer
                  mode="compact"
                  className="drop-shadow-md"
                  gap="-space-x-2"
                  // AngledContainer will use isRTL to reverse order
               >
                  {isRTL ? (
                     <>
                        {/* RTL: Arrow on Left, Text on Right */}
                        <AngledCard
                           variant={rtlArrowVariant} // This will create the shape with top-right angle
                           mode="compact"
                           steepness={28} // Consider if steepness should also flip or remain
                        >
                           <div
                              className="flex items-center justify-center pl-5 pr-6 py-2 h-[45px] transition-transform duration-200 group-hover:-translate-x-1"
                              style={{
                                 backgroundColor: bgColor,
                                 color: textColor,
                              }}>
                              <ArrowLeft size={20} strokeWidth={2.5} />
                           </div>
                        </AngledCard>
                        <AngledCard
                           variant={rtlTextVariant} // This will create the shape with bottom-left angle
                           mode="compact"
                           steepness={15}>
                           <div
                              className="flex items-center justify-center pl-8 pr-6 py-2 h-[45px] transition-colors duration-200"
                              style={{
                                 backgroundColor: bgColor,
                                 color: textColor,
                              }}>
                              <span className="text-[17px] font-medium  whitespace-nowrap">
                                 {displayButtonText}
                              </span>
                           </div>
                        </AngledCard>
                     </>
                  ) : (
                     <>
                        {/* LTR: Text on Left, Arrow on Right */}
                        <AngledCard
                           variant={ltrTextVariant}
                           mode="compact"
                           steepness={15}>
                           <div
                              className="flex items-center justify-center pl-6 pr-8 py-2 h-[45px] transition-colors duration-200"
                              style={{
                                 backgroundColor: bgColor,
                                 color: textColor,
                              }}>
                              <span className="text-[17px] font-medium whitespace-nowrap">
                                 {displayButtonText}
                              </span>
                           </div>
                        </AngledCard>
                        <AngledCard
                           variant={ltrArrowVariant}
                           mode="compact"
                           steepness={28}>
                           <div
                              className="flex items-center justify-center pl-6 pr-5 py-2 h-[45px] transition-transform duration-200 group-hover:translate-x-1"
                              style={{
                                 backgroundColor: bgColor,
                                 color: textColor,
                              }}>
                              <ArrowRight size={20} strokeWidth={2.5} />
                           </div>
                        </AngledCard>
                     </>
                  )}
               </AngledContainer>
            )}
         </button>
      </div>
   );
};

export default SplitButton;
