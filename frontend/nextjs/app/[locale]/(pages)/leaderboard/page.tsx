"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/app/lib/utils";
import { AngledCard } from "@/app/components/ui/AngledSplitCard";
import SplitButton from "@/app/components/ui/SplitButton";

/* ================= Interfaces ================= */

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

export default function LeaderboardPage() {
  const t = useTranslations("leaderboard");
  const pathname = usePathname();
  const router = useRouter();
  const locale = pathname.split("/")[1] || "en";
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 10;

  /* ================= Fetch Categories ================= */
  useEffect(() => {
    if (!apiUrl) return;
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${apiUrl}/metadata/categories`);
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
          setCategories([
            { id: "all", name: t("categories.all"), nameAr: "الكل" },
            ...formatted,
          ]);
        }
      } catch (error) {
        console.error("Categories fetch error:", error);
      }
    };
    fetchCategories();
  }, [apiUrl, t]);

  /* ================= Fetch Leaderboard ================= */
  useEffect(() => {
    if (!apiUrl) return;
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const categoryQuery =
          selectedCategory !== "all" ? `&category=${selectedCategory}` : "";
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
  }, [apiUrl, selectedCategory]);

  /* ================= Pagination Logic ================= */
  const totalPages = Math.max(1, Math.ceil(users.length / pageSize));

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return users.slice(start, start + pageSize);
  }, [users, currentPage]);

  const isEmpty = !loading && users.length === 0;

  return (
    <div className="min-h-screen bg-white font-serif py-8 md:py-12 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        <h1
          className={cn(
            "text-4xl md:text-6xl font-normal text-gray-900 mb-8 md:mb-10 text-center",
            locale === "ar" ? "md:text-right" : "md:text-left"
          )}
        >
          {t("title")}
        </h1>

        {/* Categories Section */}
        <div className="mb-10 flex flex-wrap gap-x-2 gap-y-4 justify-center md:justify-start">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setSelectedCategory(category.id);
                setCurrentPage(1);
              }}
              className="transition-transform hover:scale-105"
            >
              <AngledCard
                variant="angle-top-right"
                mode="compact"
                className={cn(
                  "!filter-none",
                  selectedCategory === category.id
                    ? "bg-[#d86464]"
                    : "bg-[#f5f4f2]"
                )}
              >
                <div
                  className={cn(
                    "px-4 md:px-6 py-2 md:py-2.5",
                    selectedCategory === category.id
                      ? "text-white"
                      : "text-[#d86464]"
                  )}
                >
                  <span className="text-sm md:text-base whitespace-nowrap">
                    {locale === "ar" ? category.nameAr : category.name}
                  </span>
                </div>
              </AngledCard>
            </button>
          ))}
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
                className="flex flex-col md:grid md:grid-cols-[1fr_auto_1fr] items-center py-4 md:py-6 border-b border-gray-100 gap-4"
              >
                <span className="text-xl md:text-3xl text-gray-900 truncate w-full text-center md:text-start">
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
                  <SplitButton
                    buttonText={t("viewPortfolio")}
                    onClick={() => {
                      // التأكد من وجود id صالح قبل الانتقال
                      if (user.id && !user.id.startsWith("temp-id")) {
                        // التوجه للمسار الصحيح (تأكدي أن اسم المجلد هو leaderboard وليس portfolio إذا كنتِ وضعتِ الملف هناك)
                        router.push(`/${locale}/leaderboard/${user.id}`);
                      } else {
                        console.error("User ID is missing");
                      }
                    }}
                    backgroundColor="#FFFFFF"
                    textColor="#000000"
                    hoverColor="#F5F5F5"
                    isSubmitting={false}
                    className="w-full md:w-auto text-sm md:text-base"
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {!loading && users.length > pageSize && (
          <div className="mt-8 md:mt-12 flex justify-center items-center gap-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 disabled:opacity-20 hover:bg-gray-100 rounded transition-colors"
            >
              <ChevronLeft
                size={24}
                className={cn(locale === "ar" && "rotate-180")}
              />
            </button>

            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={cn(
                    "text-lg px-3 py-1 rounded transition-colors",
                    currentPage === p
                      ? "bg-gray-100 text-gray-900 font-bold"
                      : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  {locale === "ar" ? p.toLocaleString("ar-EG") : p}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 disabled:opacity-20 hover:bg-gray-100 rounded transition-colors"
            >
              <ChevronRight
                size={24}
                className={cn(locale === "ar" && "rotate-180")}
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
