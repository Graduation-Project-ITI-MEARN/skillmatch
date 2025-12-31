"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Flame } from "lucide-react";
import { Challenge } from "@/app/types/challenge";

export default function ChallengeDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/challenges/${id}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        // تأكد لو البيانات جاية في حقل data
        setChallenge(data.data || data);
      } catch {
        setChallenge(null);
      } finally {
        setLoading(false);
      }
    };
    fetchChallenge();
  }, [id]);

  const handleStart = () => {
    const isLoggedIn = !!localStorage.getItem("token");
    if (!isLoggedIn) {
      router.push("/login");
    } else {
      router.push(`/dashboard/challenges/${id}`);
    }
  };

  if (loading) return <div className="text-center py-20 font-bold text-2xl">Loading...</div>;
  
  if (!challenge) return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold mb-4">Challenge not found.</h2>
      <Link href="/challenges" className="text-blue-500 font-bold underline">Go back to all challenges</Link>
    </div>
  );

  const difficultyLevel = challenge.difficulty === "easy" ? 1 : challenge.difficulty === "medium" ? 3 : 5;

  return (
    <div className="bg-white min-h-screen text-black font-sans">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <Link href="/challenges" className="flex items-center gap-2 text-gray-400 font-bold mb-12 hover:text-black transition-colors">
          <ArrowLeft size={20} /> Back to Challenges
        </Link>

        <div className="flex flex-col lg:flex-row gap-20">
          <div className="flex-1">
            <h1 className="text-6xl font-serif mb-6 leading-tight capitalize">{challenge.title}</h1>
            <p className="text-gray-400 text-lg mb-10 tracking-wide">
              Posted by {challenge.company || "Company"} · {new Date(challenge.deadline).toLocaleDateString()}
            </p>

            <button onClick={handleStart} className="bg-black text-white px-12 py-4 rounded-full font-bold text-lg mb-16 shadow-xl hover:scale-105 transition-transform">
              Start Challenge
            </button>

            <div className="bg-gray-100 rounded-[40px] p-12 mb-16">
              <h2 className="text-3xl font-serif mb-6">Overview</h2>
              <p className="text-gray-600 leading-relaxed text-lg">{challenge.description}</p>
            </div>
          </div>

          <aside className="w-full lg:w-[400px]">
            <div className="bg-gray-100 rounded-[50px] p-12 sticky top-10 border border-gray-200">
              <div className="bg-red-50 text-red-600 px-6 py-2 rounded-xl font-bold w-fit mb-10 border border-red-100 uppercase text-xs tracking-widest">
                {challenge.category}
              </div>

              <div className="space-y-8 mb-12">
                <SidebarInfo label="Type" value={challenge.type} />
                <SidebarInfo 
                  label="Reward" 
                  value={challenge.type === 'job' ? `$${challenge.salary}/mo` : `$${challenge.prizeAmount}`} 
                />
                
                <div>
                  <span className="block text-xs font-bold uppercase tracking-widest mb-4 text-gray-400">Difficulty Level</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Flame key={i} size={22} fill={i <= difficultyLevel ? "#e89d62" : "none"} 
                        className={i <= difficultyLevel ? "text-orange-500" : "text-gray-300"} />
                    ))}
                  </div>
                </div>
              </div>

              <button onClick={handleStart} className="w-full bg-black text-white py-5 rounded-[24px] font-bold text-xl hover:bg-zinc-800 transition-all">
                Start Challenge
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

// تعديل الـ Props لقبول string أو number
function SidebarInfo({ label, value }: { label: string; value: string | number | undefined }) {
  return (
    <div>
      <span className="block text-[11px] font-bold uppercase tracking-[0.2em] mb-1 text-gray-400">{label}</span>
      <span className="text-gray-700 font-medium text-lg capitalize">{value || "N/A"}</span>
    </div>
  );
}