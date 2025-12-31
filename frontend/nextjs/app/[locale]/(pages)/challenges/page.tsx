"use client";
import { useState, useEffect } from "react";
import ClippedCard from "@/app/components/ClippedCard";
import CustomDropdown from "@/app/components/CustomDropdown";
import { Challenge } from "@/app/types/challenge";

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]); // مبدئياً مصفوفة فارغة
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;
  const [filters, setFilters] = useState({ type: "All", category: "All", difficulty: "All", sortBy: "deadline" });

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/challenges`);
        const data = await res.json();
        
        
        if (Array.isArray(data)) {
          setChallenges(data);
        } else if (data && Array.isArray(data.challenges)) {
          setChallenges(data.challenges);
        } else if (data && Array.isArray(data.data)) {
          setChallenges(data.data);
        } else {
          setChallenges([]); 
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setChallenges([]);
      } finally {
        setLoading(false);
      }
    };
    fetchChallenges();
  }, []);

  // إضافة حماية إضافية Array.isArray(challenges)
  const filteredData = Array.isArray(challenges) ? challenges.filter(item => 
    (filters.type === "All" || item.type === filters.type.toLowerCase()) &&
    (filters.category === "All" || item.category === filters.category) &&
    (filters.difficulty === "All" || item.difficulty === filters.difficulty.toLowerCase())
  ) : [];

  // ترتيب البيانات
  filteredData.sort((a, b) => {
    if (filters.sortBy === "prize") return (b.prizeAmount || 0) - (a.prizeAmount || 0);
    if (filters.sortBy === "salary") return (b.salary || 0) - (a.salary || 0);
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.slice((page-1)*itemsPerPage, page*itemsPerPage);

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-2xl">Loading...</div>;

  return (
    <div className="bg-white min-h-screen pb-20 font-sans text-black">
      <div className="text-center py-24 px-6">
        <h1 className="text-7xl font-serif mb-6">Challenges</h1>
        <p className="max-w-2xl mx-auto text-gray-500 text-lg">Join world-class challenges and showcase your skills.</p>
      </div>

      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row gap-16">
        <aside className="w-full md:w-64 space-y-12">
          <CustomDropdown label="Type" value={filters.type} options={["All", "Job", "Prize"]} 
            onChange={(v) => {setFilters({...filters, type: v}); setPage(1)}} />
          
          <CustomDropdown label="Category" value={filters.category} options={["All", "Coding", "Accounting", "Design"]} 
            onChange={(v) => {setFilters({...filters, category: v}); setPage(1)}} />

          <CustomDropdown label="Difficulty" value={filters.difficulty} options={["All", "Easy", "Medium", "Hard"]} 
            onChange={(v) => {setFilters({...filters, difficulty: v}); setPage(1)}} />

          <CustomDropdown label="Sort By" value={filters.sortBy} options={["deadline", "prize", "salary"]} 
            onChange={(v) => setFilters({...filters, sortBy: v})} />
        </aside>

        <div className="flex-1">
          {filteredData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {currentItems.map(item => <ClippedCard key={item._id} challenge={item} />)}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400 text-xl">No challenges found matching your filters.</div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-6 mt-20">
              <button onClick={()=>setPage(p=>Math.max(p-1,1))} disabled={page===1} className="text-2xl disabled:opacity-20 cursor-pointer">←</button>
              {Array.from({length:totalPages},(_,i)=>i+1).map(n=>
                <button key={n} onClick={()=>setPage(n)} className={`text-xl font-bold ${page===n?"text-blue-500 border-b-2 border-blue-500":"text-gray-400"}`}>{n}</button>
              )}
              <button onClick={()=>setPage(p=>Math.min(p+1,totalPages))} disabled={page===totalPages} className="text-2xl disabled:opacity-20 cursor-pointer">→</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}