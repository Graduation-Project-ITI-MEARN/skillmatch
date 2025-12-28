"use client";
import Link from "next/link";
import { ArrowRight, Code, Calculator, Palette } from "lucide-react";
import { Challenge } from "@/app/types/challenge";

const categoryStyles: Record<string, string> = {
  Coding: "bg-light-red/10 text-red border-red/20",
  Accounting: "bg-light-green/20 text-yellow-green border-green/20",
  Design: "bg-light-purple/20 text-purple border-purple/20",
};

export default function ClippedCard({ challenge }: { challenge: Challenge }) {
  const style = categoryStyles[challenge.category] || "bg-gray-100 text-gray-600";

  return (
    <div className="relative group h-full">
      {/* الجسم الأساسي */}
      <div 
        className="bg-gray p-8 h-full min-h-[350px] flex flex-col transition-all duration-300 group-hover:shadow-xl border border-transparent group-hover:border-gray-200"
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 85%, 75% 85%, 70% 100%, 0 100%)" }}
      >
        <h3 className="text-3xl font-serif mb-4 leading-tight text-black">{challenge.title}</h3>
        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-6">
          {challenge.company} - {challenge.location} <br /> {challenge.deadline}
        </p>
        
        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border w-fit text-sm font-bold ${style}`}>
          {challenge.category === "Coding" && <Code size={14} />}
          {challenge.category === "Accounting" && <Calculator size={14} />}
          {challenge.category === "Design" && <Palette size={14} />}
          <span>{challenge.category}</span>
        </div>

        <div className="mt-auto pt-4">
          <Link href={`/challenges/${challenge.id}`} className="font-bold text-xl text-black hover:underline inline-block pb-4">
            View Details
          </Link>
        </div>
      </div>

      {/* منطقة السهم */}
      <div className="absolute bottom-0 right-0 w-[30%] h-[15%] flex items-center justify-end pr-4 pointer-events-none">
        <span className="text-3xl text-black font-light group-hover:translate-x-2 transition-transform">
          — <ArrowRight className="inline-block" size={28} />
        </span>
      </div>
    </div>
  );
}