"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, LayoutGrid, Flame } from "lucide-react";
import { Challenge } from "@/app/types/challenge";

export default function ChallengeDetailPage() {
  const { id } = useParams();
  
  // Mock Data
  const challenge: Challenge = {
    id: String(id),
    title: "Real-Time Chat System",
    company: "TECHCORP INC",
    location: "Cairo",
    deadline: "2025-12-11",
    category: "Coding",
    type: "Jobs",
    prize: 500,
    salary: 1200,
    difficulty: "Medium"
  };

  const difficultyLevel = challenge.difficulty === "Easy" ? 1 : challenge.difficulty === "Medium" ? 3 : 5;

  return (
    <div className="bg-white min-h-screen text-black font-sans">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <Link href="/challenges" className="flex items-center gap-2 text-gray-400 font-bold mb-12 hover:text-black transition-colors">
          <ArrowLeft size={20} /> Back to Challenges
        </Link>

        <div className="flex flex-col lg:flex-row gap-20">
          <div className="flex-1">
            <h1 className="text-6xl font-serif mb-6 leading-tight">{challenge.title}</h1>
            <p className="text-gray-400 text-lg mb-10 tracking-wide">
              Posted by {challenge.company} - {challenge.location} · {challenge.deadline}
            </p>

            <button className="bg-black text-white px-12 py-4 rounded-full font-bold text-lg mb-16 shadow-xl hover:scale-105 transition-transform">
              Start Challenge
            </button>

            <div className="flex gap-12 border-b border-gray-100 mb-12 text-lg font-bold text-gray-300">
              <span className="text-black border-b-4 border-black pb-6">Overview</span>
              <span className="hover:text-black cursor-pointer transition-colors">Requirements</span>
              <span className="hover:text-black cursor-pointer transition-colors">Evaluation</span>
            </div>

            <div className="bg-gray rounded-[40px] p-12 mb-16 border border-gray-100/50">
              <h2 className="text-3xl font-serif mb-6">Overview</h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                Build a scalable, real-time chat application that can handle thousands of users simultaneously...
              </p>
            </div>
            
            <div className="space-y-12">
               <DetailItem icon={<LayoutGrid />} title="Objective" content="Develop a real-time chat system with 100+ concurrent users." />
               <DetailItem icon={<Check />} title="Skills Needed" content="Node.js, WebSocket, MongoDB, scalability." />
            </div>
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-[400px]">
            <div className="bg-gray rounded-[50px] p-12 sticky top-10 border border-gray-100/50">
              <div className="bg-light-red/20 text-red px-6 py-2 rounded-xl font-bold w-fit mb-10 border border-red/10">
                {challenge.category}
              </div>

              <div className="space-y-8 mb-12">
                <SidebarInfo label="Company" value={challenge.company} />
                <SidebarInfo label="Location" value={challenge.location} />
                <SidebarInfo label="Salary" value={`$${challenge.salary}/mo`} />
                
                <div>
                  <span className="block text-xs font-bold uppercase tracking-widest mb-4">Difficulty Level</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Flame key={i} size={22} fill={i <= difficultyLevel ? "#e89d62" : "none"} 
                        className={i <= difficultyLevel ? "text-orange" : "text-gray-300"} />
                    ))}
                  </div>
                </div>
              </div>

              <button className="w-full bg-black text-white py-5 rounded-[24px] font-bold text-xl shadow-2xl hover:bg-dark-gray transition-all">
                Start Challenge
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function SidebarInfo({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="block text-[11px] font-bold uppercase tracking-[0.2em] mb-1">{label}</span>
      <span className="text-gray-600 font-medium text-lg">{value}</span>
    </div>
  );
}

function DetailItem({ icon, title, content }: any) {
  return (
    <div className="flex gap-6">
      <div className="w-14 h-14 bg-light-orange rounded-2xl flex items-center justify-center text-black shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="text-2xl font-serif mb-2">{title}</h4>
        <p className="text-gray-600 text-lg leading-relaxed">{content}</p>
      </div>
    </div>
  );
}