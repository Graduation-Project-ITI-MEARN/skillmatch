// components/ui/ClippedCard.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Code, Calculator, Palette } from "lucide-react";

export interface ClippedCardProps {
  challenge: {
    id?: string;
    _id?: string;
    title: string;
    category: string;
    company: string;
    location: string;
    deadline: string;
    status?: string;
  };
}

const categoryStyles: Record<string, string> = {
  Coding: "bg-red-50 text-red-600 border-red-200",
  Accounting: "bg-green-50 text-green-600 border-green-200",
  Design: "bg-purple-50 text-purple-600 border-purple-200",
  Development: "bg-blue-50 text-blue-600 border-blue-200",
  Translation: "bg-yellow-50 text-yellow-600 border-yellow-200",
  Marketing: "bg-pink-50 text-pink-600 border-pink-200",
  Writing: "bg-indigo-50 text-indigo-600 border-indigo-200",
};

const categoryIcons: Record<string, React.ReactNode> = {
  Coding: <Code size={14} />,
  Accounting: <Calculator size={14} />,
  Design: <Palette size={14} />,
  Development: <Code size={14} />,
  Translation: <Palette size={14} />,
  Marketing: <Calculator size={14} />,
  Writing: <Palette size={14} />,
};

export default function ClippedCard({ challenge }: ClippedCardProps) {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";

  const style =
    categoryStyles[challenge.category] ||
    "bg-gray-100 text-gray-600 border-gray-200";
  const icon = categoryIcons[challenge.category];
  const challengeId = challenge.id || challenge._id;

  return (
    <div className="relative group h-full">
      {/* Main Card Body */}
      <div
        className="bg-gray-50 p-8 h-full min-h-[350px] flex flex-col transition-all duration-300 group-hover:shadow-xl border border-transparent group-hover:border-gray-200"
        style={{
          clipPath: "polygon(0 0, 100% 0, 100% 85%, 75% 85%, 70% 100%, 0 100%)",
        }}
      >
        <h3 className="text-3xl font-serif mb-4 leading-tight text-black">
          {challenge.title}
        </h3>

        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-6">
          {challenge.company} - {challenge.location}
          <br />
          {challenge.deadline}
        </p>

        {/* Category Badge */}
        <div
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full border w-fit text-sm font-bold ${style}`}
        >
          {icon}
          <span>{challenge.category}</span>
        </div>

        {/* View Details Link */}
        <div className="mt-auto pt-4">
          <Link
            href={`/${locale}/challenges/${challengeId}`}
            className="font-bold text-xl text-black hover:underline inline-block pb-4"
          >
            {locale === "ar" ? "عرض التفاصيل" : "View Details"}
          </Link>
        </div>
      </div>

      {/* Arrow Area */}
      <div className="absolute bottom-0 right-0 w-[30%] h-[15%] flex items-center justify-end pr-4 pointer-events-none">
        <span className="text-3xl text-black font-light group-hover:translate-x-2 transition-transform">
          — <ArrowRight className="inline-block" size={28} />
        </span>
      </div>
    </div>
  );
}
