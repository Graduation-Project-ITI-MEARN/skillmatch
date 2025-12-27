"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
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

/* ================= Component ================= */

export default function LeaderboardPage() {
  const t = useTranslations("leaderboard");
  const pathname = usePathname();
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
          const formatted = result.data.map((name: string) => ({
            id: name,
            name,
            nameAr: name,
          }));

          setCategories([
            { id: "all", name: t("categories.all"), nameAr: "الكل" },
            ...formatted,
          ]);
        }
      } catch (error) {
        console.error(error);
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
          const formatted = result.data.map(
            (user: BackendUser, index: number) => ({
              id: user._id || index.toString(),
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
        console.error(error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [apiUrl, selectedCategory]);

  /* ================= Pagination ================= */

  const totalPages = Math.max(1, Math.ceil(users.length / pageSize));

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return users.slice(start, start + pageSize);
  }, [users, currentPage]);

  const isEmpty = !loading && users.length === 0;

  /* ================= UI ================= */

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

        {/* ================= Categories (Wrapped - No Scroll) ================= */}
        <div className="mb-10 md:mb-14 flex flex-wrap gap-x-2 gap-y-4 justify-center md:justify-start">
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
                steepness={12}
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

        {/* ================= Users / Empty State ================= */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-xl md:text-2xl text-gray-300 animate-pulse text-center">
              {t("loading")}
            </div>
          ) : isEmpty ? (
            <div className="flex flex-col items-center justify-center py-16 md:py-24 text-center">
              <h3 className="text-xl md:text-2xl font-medium text-gray-900 mb-2 px-4">
                {t("noParticipants")}
              </h3>
              <p className="text-gray-500 text-sm md:text-base max-w-md px-4">
                {t("noParticipantsDesc")}
              </p>
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

                <div
                  className={cn(
                    "bg-black text-white px-6 md:px-8 py-1 rounded-full flex items-center justify-center gap-3 w-fit",

                    locale === "ar" ? "flex-row" : "flex-row"
                  )}
                >
                  <span className="text-[10px] md:text-[12px] uppercase font-bold opacity-90 mt-0.5">
                    {t("score")}
                  </span>
                  <span className="text-lg md:text-2xl font-bold tabular-nums">
                    {user.score}
                  </span>
                </div>

                {/* Action */}
                <div className="flex justify-center md:justify-end w-full">
                  <SplitButton
                    buttonText={t("viewPortfolio")}
                    onClick={() =>
                      (window.location.href = `/${locale}/portfolio/${user.id}`)
                    }
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

        {/* ================= Pagination ================= */}
        {!loading && users.length > pageSize && (
          <div className="mt-8 md:mt-12 flex flex-col md:flex-row justify-center items-center gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 disabled:opacity-20 hover:bg-gray-100 rounded"
              >
                <ChevronLeft
                  size={24}
                  className={cn(locale === "ar" && "rotate-180")}
                />
              </button>

              <div className="flex gap-1 md:gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={cn(
                        "text-base md:text-lg px-2 md:px-3 py-1 rounded",
                        currentPage === p
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-400 hover:text-gray-600"
                      )}
                    >
                      {/* التعديل هنا لتحويل الأرقام بناءً على اللغة */}
                      {locale === "ar" ? p.toLocaleString("ar-EG") : p}
                    </button>
                  )
                )}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-1 disabled:opacity-20 hover:bg-gray-100 rounded"
              >
                <ChevronRight
                  size={24}
                  className={cn(locale === "ar" && "rotate-180")}
                />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
