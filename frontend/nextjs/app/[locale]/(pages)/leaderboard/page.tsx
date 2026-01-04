// app/[locale]/(pages)/leaderboard/page.tsx
// This is a Server Component, do NOT add "use client" here.

import { notFound } from "next/navigation";
import { getMessages } from "next-intl/server";

import { LeaderboardClientContent } from "@/app/components/leaderboard/LeaderboardPageContent"; // Import the client content component
import { createTranslator } from "next-intl";

/* ================= Interfaces (define here or import from shared types file) ================= */
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

export default async function LeaderboardPage({
   params,
}: {
   params: Promise<{ locale: string }>;
}) {
   const apiUrl = process.env.NEXT_PUBLIC_API_URL;

   if (!apiUrl) {
      console.error(
         "NEXT_PUBLIC_API_URL is not defined. Cannot fetch leaderboard data."
      );
      notFound(); // Or render a custom error page
   }

   const { locale } = await params;

   // Fetch messages for translation in the Server Component context
   const messages = await getMessages({ locale });
   // Create a translator instance for server-side strings (e.g., the 'All Categories' label)
   const t = createTranslator({
      locale,
      messages,
      namespace: "leaderboard",
   });

   /* ================= Server-side Data Fetching ================= */

   const fetchCategories = async (): Promise<Category[]> => {
      try {
         const response = await fetch(`${apiUrl}/metadata/categories`, {
            // 'no-store' ensures fresh data on every request to the server.
            cache: "no-store",
         });
         if (!response.ok) {
            throw new Error(
               `Failed to fetch categories: ${response.statusText}`
            );
         }
         const result = await response.json();
         if (result.success && Array.isArray(result.data)) {
            const categoryTranslations: Record<string, string> = {
               Coding: "البرمجة",
               Accounting: "المحاسبة",
               Design: "التصميم",
               Development: "التطوير",
               Translation: "الترجمة",
               Marketing: "التسويق",
               Writing: "الكتابة",
               "Data Entry": "إدخال البيانات",
            };

            const formatted = result.data.map((name: string) => ({
               id: name,
               name,
               nameAr: categoryTranslations[name] || name,
            }));
            // Add 'all' category using the server-side translator
            return [
               { id: "all", name: t("categories.all"), nameAr: "الكل" },
               ...formatted,
            ];
         }
         return [];
      } catch (error) {
         console.error("Server-side categories fetch error:", error);
         return [];
      }
   };

   const fetchInitialLeaderboard = async (): Promise<LeaderboardUser[]> => {
      try {
         // Fetch initial data for the default 'all' category
         const response = await fetch(`${apiUrl}/leaderboard?limit=100`, {
            cache: "no-store", // Always fetch fresh
         });
         if (!response.ok) {
            throw new Error(
               `Failed to fetch leaderboard: ${response.statusText}`
            );
         }
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
            return formatted;
         }
         return [];
      } catch (error) {
         console.error("Server-side leaderboard fetch error:", error);
         return [];
      }
   };

   // Execute server-side fetches concurrently
   const [initialCategories, initialUsers] = await Promise.all([
      fetchCategories(),
      fetchInitialLeaderboard(),
   ]);

   return (
      <LeaderboardClientContent
         initialCategories={initialCategories}
         initialUsers={initialUsers}
         locale={locale}
         apiUrl={apiUrl}
      />
   );
}
