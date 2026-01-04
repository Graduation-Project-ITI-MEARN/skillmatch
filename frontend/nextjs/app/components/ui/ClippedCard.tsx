// frontend/nextjs/components/ui/ClippedCard.tsx
"use client";

import * as React from "react";
import { cn } from "@/app/lib/utils";
import Image from "next/image";
import { Link } from "@/i18n/routing";

export interface ClippedCardProps
   extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
   href: string;
   // Default colors
   cardBgColorVar?: string;
   textColorVar?: string;
   // Hover colors
   hoverBgColorVar?: string;
   hoverTextColorVar?: string;

   className?: string;
   children: React.ReactNode;
   contentClassName?: string;

   readMoreText?: string | null;
   customBottomSectionContent?: React.ReactNode;
   bottomSectionClassName?: string;
}

const ClippedCard: React.FC<ClippedCardProps> = ({
   href,
   cardBgColorVar = "var(--color-gray)",
   textColorVar = "var(--color-dark-gray)",
   hoverBgColorVar = "var(--color-blue)",
   hoverTextColorVar = "var(--color-white)",
   className,
   children,
   contentClassName,
   readMoreText = "View Details", // Changed default to match image
   customBottomSectionContent,
   bottomSectionClassName,
   ...props
}) => {
   const [isHovered, setIsHovered] = React.useState(false);
   const [isRTL, setIsRTL] = React.useState(false);

   React.useEffect(() => {
      if (typeof document !== "undefined") {
         setIsRTL(document.documentElement.dir === "rtl");
      }
   }, []);

   const currentTextColor = isHovered ? hoverTextColorVar : textColorVar;

   // --- Use the SINGLE LTR SVG Path directly ---
   const ltrClipPathData =
      "M670 0H0V91C0 102.046 8.9543 111 20 111H518.641C526.216 111 533.14 106.721 536.529 99.9469L570.988 31.0531C574.377 24.2789 581.301 20 588.875 20H650C661.046 20 670 11.0457 670 0Z";

   return (
      <Link
         href={href}
         className={cn(
            "group/clippedCard relative flex h-full w-full max-w-[617px] flex-col overflow-hidden rounded-lg lg:rounded-2xl",
            className
         )}
         onMouseEnter={() => setIsHovered(true)}
         onMouseLeave={() => setIsHovered(false)}
         {...props}>
         {/* 1. Full Card Background (shows on hover) */}
         <div
            className="absolute inset-0 rounded-lg lg:rounded-xl transition-opacity duration-300 ease-in-out"
            style={{
               backgroundColor: hoverBgColorVar,
               opacity: isHovered ? 1 : 0,
            }}></div>

         {/* 2. Main Content Area */}
         <div
            className={cn(
               "relative z-10 flex w-full flex-1 flex-col justify-between rounded-t-lg lg:rounded-t-xl transition-colors duration-300 ease-in-out pt-4 px-10",
               contentClassName
            )}
            style={{
               backgroundColor: cardBgColorVar,
               color: currentTextColor,
            }}>
            {children}
         </div>

         {/* 3. SVG for the clipped bottom part (fades out on hover) */}
         <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 670 111"
            preserveAspectRatio="none"
            className={cn(
               "relative z-10 -mt-px block transition-opacity duration-300 ease-in-out",
               isRTL ? "origin-center -scale-x-[1] translate-x-0" : ""
            )}
            style={{
               opacity: isHovered ? 0 : 1,
            }}>
            <path
               className="w-full transition-all duration-300 ease-in-out"
               fill={cardBgColorVar}
               d={ltrClipPathData}
            />
         </svg>

         {/* 4. Bottom Section Content */}
         <div
            className={cn(
               "absolute bottom-3 flex w-full items-center px-4 ps-10 md:bottom-4 z-20",
               bottomSectionClassName
            )}
            style={{ color: currentTextColor }}>
            {customBottomSectionContent
               ? customBottomSectionContent
               : readMoreText !== null && (
                    <div
                       className={cn(
                          "flex w-full items-center text-base font-medium",
                          isRTL ? "justify-start" : "justify-between"
                       )}>
                       <p className={cn(isRTL ? "ml-auto" : "mr-auto")}>
                          {readMoreText}
                       </p>
                       {isRTL ? (
                          <Image
                             src="/images/arrow-left.svg"
                             alt="arrow left"
                             width={24}
                             height={24}
                          />
                       ) : (
                          <Image
                             src="/images/arrow-right.svg"
                             alt="arrow right"
                             width={24}
                             height={24}
                          />
                       )}
                    </div>
                 )}
         </div>
      </Link>
   );
};

export default ClippedCard;
