"use client";
import { HOVER_COLOR, PRIMARY_COLOR } from "@/app/lib/constants";
import { ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { AngledCard, AngledContainer } from "../AngledSplitCard";

interface SplitButtonProps {
   buttonText: string;
   isSubmitting: boolean;
}

const SplitButton: React.FC<SplitButtonProps> = ({
   buttonText,
   isSubmitting,
}) => {
   const [isHovered, setIsHovered] = useState<boolean>(false);
   const bgColor = isHovered ? HOVER_COLOR : PRIMARY_COLOR;

   return (
      <div className="flex justify-center pt-4 w-full my-4">
         <button
            type="submit"
            disabled={isSubmitting}
            className="group relative focus:outline-none"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}>
            {isSubmitting ? (
               <div
                  className="rounded-md flex items-center justify-center text-white py-2 px-10 h-12 transition-colors duration-200"
                  style={{ backgroundColor: bgColor }}>
                  <Loader2 className="w-5 h-5 animate-spin" />
               </div>
            ) : (
               <AngledContainer
                  mode="compact"
                  className=" drop-shadow-md"
                  gap="-space-x-2">
                  {/* LEFT SIDE: Text */}
                  <AngledCard
                     variant="right-narrow-top"
                     mode="compact"
                     steepness={15}>
                     <div
                        className="flex items-center justify-center pl-6 pr-8 py-2 h-[45px] transition-colors duration-200"
                        style={{ backgroundColor: bgColor }}>
                        <span className="text-[17px] font-medium text-white whitespace-nowrap">
                           {buttonText}
                        </span>
                     </div>
                  </AngledCard>

                  {/* RIGHT SIDE: Arrow */}
                  <AngledCard
                     variant="left-wide-top"
                     mode="compact"
                     steepness={28}>
                     <div
                        className="flex items-center justify-center pl-6 pr-5 py-2 h-[45px] transition-transform duration-200 group-hover:translate-x-1"
                        style={{ backgroundColor: bgColor }}>
                        <ArrowRight
                           size={20}
                           className="text-white"
                           strokeWidth={2.5}
                        />
                     </div>
                  </AngledCard>
               </AngledContainer>
            )}
         </button>
      </div>
   );
};

export default SplitButton;
