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
      </div>
   );
};

export default UserTypeTabs;
