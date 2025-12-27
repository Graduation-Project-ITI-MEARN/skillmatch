"use client";
import React from "react";
import { PRIMARY_COLOR } from "@/app/lib/constants"; // Adjust path
import {
   AngledCard,
   AngledContainer,
   ShapeVariant,
} from "../ui/AngledSplitCard";

export type UserType = "candidate" | "company" | "challenger";

interface UserTypeTabsProps {
   selected: UserType;
   onChange: (type: UserType) => void;
}

const UserTypeTabs: React.FC<UserTypeTabsProps> = ({ selected, onChange }) => {
   const tabs: Array<{ value: UserType; label: string }> = [
      { value: "candidate", label: "Candidate" },
      { value: "company", label: "Company" },
      { value: "challenger", label: "Challenger" },
   ];

   return (
      <div className="w-full mb-12 flex flex-col items-center">
         <p className="mb-4 text-center text-gray-800 font-semibold text-base">
            I am a
         </p>

         {/* TABS CONTAINER */}
         <AngledContainer mode="compact" gap="gap-2">
            {tabs.map((tab, index) => {
               const isActive = selected === tab.value;

               // Logic to choose shape based on position
               // First & Middle tabs lean right (| /). Last tab leans right to match (/ |).
               let variant: ShapeVariant = "right-narrow-top";
               if (index === tabs.length - 1) variant = "left-wide-top";

               return (
                  <div
                     key={tab.value}
                     onClick={() => onChange(tab.value)}
                     className="cursor-pointer h-8">
                     <AngledCard
                        variant={variant}
                        mode="compact"
                        steepness={10}
                        className={`
                   h-full transition-transform duration-200 
                   ${isActive ? "z-30 scale-110" : "z-10 hover:scale-105"}
                `}>
                        <div
                           className={`
                    flex items-center justify-center px-4 h-full min-w-[120px]
                    transition-colors duration-300 
                  `}
                           style={{
                              backgroundColor: isActive
                                 ? PRIMARY_COLOR
                                 : "#fff",
                              color: isActive ? "white" : "#6b7280",
                              fontWeight: isActive ? 600 : 500,
                           }}>
                           {tab.label}
                        </div>
                     </AngledCard>
                  </div>
               );
            })}
         </AngledContainer>
      </div>
   );
};

export default UserTypeTabs;
