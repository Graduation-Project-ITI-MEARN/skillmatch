// app/components/CategoryBadge.tsx
import React from "react";
import { cn } from "@/app/lib/utils"; // Assuming you have a utility for class names

// Import icons from Lucide React
import {
   Code,
   Scale,
   PencilLine,
   BarChart2,
   Book,
   Globe,
   Database,
} from "lucide-react";

// Define categories and their properties (icons, colors)
export const CATEGORY_STYLES = {
   Development: {
      label: "Development",
      icon: Code,
      bgColor: "bg-[#FEEBEB]", // Light reddish from image
      textColor: "text-[#D04848]", // Dark reddish from image
      border: "border-[#D04848]",
   },
   Coding: {
      // Map "Coding" to "Development" style
      label: "Coding",
      icon: Code,
      bgColor: "bg-[#FEEBEB]",
      textColor: "text-[#D04848]",
      border: "border-[#D04848]",
   },
   Accounting: {
      label: "Accounting",
      icon: Scale, // Scales icon
      bgColor: "bg-[#ECF7E8]", // Light greenish from image
      textColor: "text-[#6EB247]", // Dark greenish from image
      border: "border-[#6EB247]",
   },
   Design: {
      label: "Design",
      icon: PencilLine, // Pencil icon
      bgColor: "bg-[#F3ECF8]", // Light purplish from image
      textColor: "text-[#A35ED0]", // Dark purplish from image
      border: "border-[#A35ED0]",
   },
   Marketing: {
      label: "Marketing",
      icon: BarChart2,
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-800",
      border: "border-yellow-800",
   },
   Writing: {
      label: "Writing",
      icon: Book,
      bgColor: "bg-blue-100",
      textColor: "text-blue-800",
      border: "border-blue-800",
   },
   Translation: {
      label: "Translation",
      icon: Globe,
      bgColor: "bg-indigo-100",
      textColor: "text-indigo-800",
      border: "border-indigo-800",
   },
   "Data Entry": {
      label: "Data Entry",
      icon: Database,
      bgColor: "bg-pink-100",
      textColor: "text-pink-800",
      border: "border-pink-800",
   },
   // Default style for any unmapped categories
   default: {
      label: "Category",
      icon: null,
      bgColor: "bg-gray-100",
      textColor: "text-gray-800",
      border: "border-gray-800",
   },
};

interface CategoryBadgeProps {
   category: string;
   className?: string;
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({
   category,
   className,
}) => {
   const categoryInfo =
      CATEGORY_STYLES[category as keyof typeof CATEGORY_STYLES] ||
      CATEGORY_STYLES["default"];
   const IconComponent = categoryInfo.icon;

   return (
      <span
         className={cn(
            "inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium border",
            categoryInfo.bgColor,
            categoryInfo.textColor,
            categoryInfo.border,
            className
         )}>
         {IconComponent && <IconComponent size={16} />}
         {categoryInfo.label}
      </span>
   );
};

export default CategoryBadge;
