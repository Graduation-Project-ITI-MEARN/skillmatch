// app/components/PaginationControls.tsx
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/app/lib/utils";

interface PaginationControlsProps {
   currentPage: number;
   totalPages: number;
   onPageChange: (page: number) => void;
   locale: string; // Pass locale to handle RTL and number formatting
   previousLabel?: string; // Optional: Label for the previous button
   nextLabel?: string; // Optional: Label for the next button
}

export function PaginationControls({
   currentPage,
   totalPages,
   onPageChange,
   locale,
   previousLabel = "Previous Page", // Default label if not provided
   nextLabel = "Next Page", // Default label if not provided
}: PaginationControlsProps) {
   if (totalPages <= 1) {
      return null; // Don't show pagination if there's only one page or less
   }

   return (
      <div className="mt-8 md:mt-12 flex justify-center items-center gap-4">
         <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 disabled:opacity-20 hover:bg-gray-100 rounded transition-colors"
            aria-label={previousLabel}>
            <ChevronLeft
               size={24}
               className={cn(locale === "ar" && "rotate-180")}
            />
         </button>

         <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
               <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className={cn(
                     "text-lg px-3 py-1 rounded transition-colors",
                     currentPage === p
                        ? "bg-gray-100 text-gray-900 font-bold"
                        : "text-gray-400 hover:text-gray-600"
                  )}
                  aria-current={currentPage === p ? "page" : undefined}>
                  {locale === "ar" ? p.toLocaleString("ar-EG") : p}
               </button>
            ))}
         </div>

         <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 disabled:opacity-20 hover:bg-gray-100 rounded transition-colors"
            aria-label={nextLabel}>
            <ChevronRight
               size={24}
               className={cn(locale === "ar" && "rotate-180")}
            />
         </button>
      </div>
   );
}
