"use client";
import { useState } from "react";
import ClippedCard from "@/app/components/ClippedCard";
import { Challenge } from "@/app/types/challenge";

const MOCK_CHALLENGES: Challenge[] = [
  { id: "1", title: "Real-Time Chat System", company: "TECHCORP INC", location: "Cairo", deadline: "2025-12-11", category: "Coding", type: "Jobs", prize: 500, salary: 1200, difficulty: "Medium" },
  { id: "2", title: "Accounting Reports", company: "COUNTME", location: "Riyadh", deadline: "2025-09-23", category: "Accounting", type: "Prizes", prize: 1200, difficulty: "Hard" },
  { id: "3", title: "Graphic Design For Ad Campaign", company: "GRAVITY", location: "Morocco", deadline: "2025-10-07", category: "Design", type: "Prizes", prize: 800, difficulty: "Easy" },
  { id: "4", title: "Next.js Dashboard", company: "DEV-SOLUTIONS", location: "Dubai", deadline: "2026-01-15", category: "Coding", type: "Jobs", prize: 1500, salary: 3000, difficulty: "Hard" },
];

export default function ChallengesPage() {
  const [page, setPage] = useState(1);
  const itemsPerPage = 3;
  const [filters, setFilters] = useState({ type: "All", category: "All", difficulty: "All", sortBy: "deadline" });

  const filteredData = MOCK_CHALLENGES.filter(item => 
    (filters.type === "All" || item.type === filters.type) &&
    (filters.category === "All" || item.category === filters.category) &&
    (filters.difficulty === "All" || item.difficulty === filters.difficulty)
  );

  filteredData.sort((a, b) => {
    if (filters.sortBy === "prize") return (b.prize || 0) - (a.prize || 0);
    if (filters.sortBy === "salary") return (b.salary || 0) - (a.salary || 0);
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.slice((page-1)*itemsPerPage, page*itemsPerPage);

  return (
    <div className="bg-white min-h-screen pb-20 font-sans text-black">
      <div className="text-center py-24 px-6">
        <h1 className="text-7xl font-serif mb-6">Challenges</h1>
        <p className="max-w-2xl mx-auto text-gray-500 text-lg">
          Join world-class challenges and showcase your skills to top companies.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row gap-16">
        {/* Sidebar */}
        <aside className="w-full md:w-64 space-y-12">
          <FilterSection label="Type" value={filters.type} options={["All", "Jobs", "Prizes"]} 
            onChange={(v) => {setFilters({...filters, type: v}); setPage(1)}} />
          
          <FilterSection label="Category" value={filters.category} options={["All", "Coding", "Accounting", "Design"]} 
            onChange={(v) => {setFilters({...filters, category: v}); setPage(1)}} />

          <FilterSection label="Difficulty" value={filters.difficulty} options={["All", "Easy", "Medium", "Hard"]} 
            onChange={(v) => {setFilters({...filters, difficulty: v}); setPage(1)}} />

          <div>
             <h4 className="font-bold mb-4 uppercase tracking-widest text-xs">Sort By</h4>
             <select className="w-full p-3 bg-gray rounded-xl outline-none font-bold text-sm" 
               value={filters.sortBy} onChange={(e)=>setFilters({...filters, sortBy: e.target.value})}>
               <option value="deadline">Deadline</option>
               <option value="prize">Prize Amount</option>
               <option value="salary">Monthly Salary</option>
             </select>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {currentItems.map(item => <ClippedCard key={item.id} challenge={item} />)}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-6 mt-20">
            <button onClick={()=>setPage(p=>Math.max(p-1,1))} disabled={page===1} className="text-2xl opacity-30 disabled:hover:opacity-30 hover:opacity-100 transition-opacity">←</button>
            {Array.from({length:totalPages},(_,i)=>i+1).map(n=>
              <button key={n} onClick={()=>setPage(n)} 
                className={`text-xl font-bold transition-all ${page===n?"text-blue-500 border-b-2 border-blue-500":"text-gray-400 hover:text-black"}`}>
                {n}
              </button>
            )}
            <button onClick={()=>setPage(p=>Math.min(p+1,totalPages))} disabled={page===totalPages} className="text-2xl hover:text-black">→</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterSection({ label, value, options, onChange }: any) {
  return (
    <div>
      <h4 className="font-bold mb-4 uppercase tracking-widest text-xs">{label}</h4>
      <select className="w-full p-3 bg-gray rounded-xl outline-none font-bold text-sm" 
        value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}