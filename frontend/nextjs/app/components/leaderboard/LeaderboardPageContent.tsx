// app/components/leaderboard/LeaderboardClientContent.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";

import { cn } from "@/app/lib/utils";
import SplitButton from "@/app/components/ui/SplitButton";
import { Link } from "@/i18n/routing";
import CategoryFilters from "@/app/components/CategoryFilters"; // Import the updated CategoryFilters
import { PaginationControls } from "@/app/components/ui/Pagination"; // Import the reusable PaginationControls

/* ================= Interfaces ================= */
// Define these here or import from a shared types file (e.g., app/types/shared.ts)
interface Category {
   id: string;
   name: string;
   nameAr?: string;
}

interface BackendUser {
   _id?: string;
   id?: string;
   name: string;
   score?: number;
   totalScore?: number;
}

interface LeaderboardUser {
   id: string;
   name: string;
   score: number;
   rank: number;
}

/* ================= Component Props ================= */
interface LeaderboardClientContentProps {
   initialCategories: Category[];
   initialUsers: LeaderboardUser[];
   locale: string;
   apiUrl: string;
}

export function LeaderboardClientContent({
   initialCategories,
   initialUsers,
   locale,
   apiUrl,
}: LeaderboardClientContentProps) {
   const t = useTranslations("leaderboard");

   const [categories, setCategories] = useState<Category[]>(initialCategories);
   const [selectedCategory, setSelectedCategory] = useState("all");
   const [users, setUsers] = useState<LeaderboardUser[]>(initialUsers);
   const [loading, setLoading] = useState(false); // Only for subsequent client-side fetches

   const [currentPage, setCurrentPage] = useState(1);
   const pageSize = 10;

   /* ================= Fetch Leaderboard on Category Change ================= */
   useEffect(() => {
      // Only fetch if selectedCategory changes from the initial 'all'
      // The initial data for 'all' is already provided by the Server Component.
      if (selectedCategory !== "all") {
         const fetchLeaderboard = async () => {
            setLoading(true);
            setCurrentPage(1); // Reset page when category changes
            try {
               const categoryQuery = `&category=${selectedCategory}`;
               const response = await fetch(
                  `${apiUrl}/leaderboard?limit=100${categoryQuery}`
               );
               const result = await response.json();

               if (result.success && Array.isArray(result.data)) {
                  const formatted: LeaderboardUser[] = result.data.map(
                     (user: BackendUser, index: number) => ({
                        id: user._id || user.id || `temp-${index}`,
                        name: user.name,
                        score: user.score || user.totalScore || 0,
                        rank: index + 1,
                     })
                  );
                  setUsers(formatted);
               } else {
                  setUsers([]);
               }
            } catch (error) {
               console.error("Leaderboard fetch error:", error);
               setUsers([]);
            } finally {
               setLoading(false);
            }
         };
         fetchLeaderboard();
      }
   }, [apiUrl, selectedCategory]); // Depend on selectedCategory

   /* ================= Pagination Logic ================= */
   const totalPages = useMemo(
      () => Math.max(1, Math.ceil(users.length / pageSize)),
      [users.length, pageSize]
   );

   const paginatedUsers = useMemo(() => {
      const start = (currentPage - 1) * pageSize;
      return users.slice(start, start + pageSize);
   }, [users, currentPage, pageSize]);

   const handlePageChange = useCallback((page: number) => {
      setCurrentPage(page);
   }, []);

   const isEmpty = !loading && users.length === 0;

   return (
      <div className="min-h-screen font-serif py-8 md:py-12 px-4 md:px-10">
         <div className="max-w-6xl mx-auto">
            <h1
               className={cn(
                  "text-4xl md:text-6xl font-normal text-gray-900 mb-8 md:mb-10 text-center",
                  locale === "ar" ? "md:text-right" : "md:text-left"
               )}>
               {t("title")}
            </h1>

            {/* Categories Section - Now uses the updated CategoryFilters */}
            <div className="mb-10 flex flex-wrap gap-x-2 gap-y-4 justify-center md:justify-start">
               <CategoryFilters
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={(categoryId) => {
                     setSelectedCategory(categoryId);
                  }}
                  locale={locale}
               />
            </div>

            {/* Users List Section */}
            <div className="space-y-4">
               {loading ? (
                  <div className="text-xl md:text-2xl text-gray-300 animate-pulse text-center py-20">
                     {t("loading")}
                  </div>
               ) : isEmpty ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                     <h3 className="text-xl md:text-2xl font-medium text-gray-900 mb-2">
                        {t("noParticipants")}
                     </h3>
                     <p className="text-gray-500">{t("noParticipantsDesc")}</p>
                  </div>
               ) : (
                  paginatedUsers.map((user) => (
                     <div
                        key={user.id}
                        className="flex flex-col md:grid md:grid-cols-[1fr_auto_1fr] items-center py-4 md:py-6 border-b border-gray-100 gap-4">
                        <span className="text-xl md:text-3xl  text-gray-900 truncate w-full text-center md:text-start">
                           <span className="font-bold">#{user.rank} </span>
                           <span className="font-bold">- </span>
                           {user.name}
                        </span>

                        <div className="bg-black text-white px-6 md:px-8 py-1 rounded-full flex items-center justify-center gap-3 w-fit">
                           <span className="text-[10px] md:text-[12px] uppercase font-bold opacity-90">
                              {t("score")}
                           </span>
                           <span className="text-lg md:text-2xl font-bold tabular-nums">
                              {user.score}
                           </span>
                        </div>

                        <div className="flex justify-center md:justify-end w-full">
                           <Link href={`/leaderboard/${user.id}`}>
                              <SplitButton
                                 buttonText={t("viewPortfolio")}
                                 backgroundColor="#f0eee9"
                                 textColor="#000000"
                                 hoverColor="#F5F5F5"
                                 isSubmitting={false}
                                 className="w-full md:w-auto text-sm md:text-base"
                              />
                           </Link>
                        </div>
                     </div>
                  ))
               )}
            </div>

            {/* Pagination Controls - Now uses the reusable component */}
            <PaginationControls
               currentPage={currentPage}
               totalPages={totalPages}
               onPageChange={handlePageChange}
               locale={locale}
               previousLabel={t("pagination.previousPage")}
               nextLabel={t("pagination.nextPage")}
            />
         </div>
      </div>
   );
}
