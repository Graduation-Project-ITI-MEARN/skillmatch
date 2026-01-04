"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
   Mail,
   Linkedin,
   ArrowLeft,
   Github,
   Link as LinkIcon,
   Award, // For expert level (optional, example)
   Zap, // For advanced level (optional, example)
   Star, // For intermediate level (optional, example)
   Lightbulb, // For beginner level (optional, example)
} from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion, Variants } from "framer-motion";
import ClippedCard from "@/app/components/ui/ClippedCard";

// --- Frontend: interfaces.ts (or in your component file) ---

interface Achievement {
   _id: string; // Submission ID (for React key)
   challengeId: string; // The ID of the actual challenge
   title: string;
   category: string;
   creatorName: string;
   creatorCity?: string; // Optional, as it might not always be present
   aiScore: number;
   submissionDate: string; // Date string from the backend
}

interface OtherLink {
   name: string;
   url: string;
   _id: string;
}

interface UserData {
   _id: string;
   name: string;
   email: string;
   bio?: string;
   linkedin?: string;
   github?: string;
   otherLinks?: OtherLink[];
}

// --- NEW SKILL ANALYSIS INTERFACES ---
interface RecentScore {
   score: number;
   challengeTitle: string;
}

type SkillLevel = "beginner" | "intermediate" | "advanced" | "expert";
type SkillTrend = "stable" | "improving" | "declining";

interface AnalyzedSkill {
   skill: string;
   averageScore: number;
   level: SkillLevel;
   submissionsCount: number;
   recentScores: RecentScore[];
   trend: SkillTrend;
}

// This interface is for the overall data object from the /skills-analysis endpoint
interface SkillAnalysisResponseData {
   skills: AnalyzedSkill[];
   totalSubmissions: number;
   averageScore: number;
   strongestSkills: AnalyzedSkill[];
   skillsToImprove: AnalyzedSkill[];
}
// --- END NEW SKILL ANALYSIS INTERFACES ---

const fadeInVariant: Variants = {
   hidden: { opacity: 0, y: 20 },
   visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
   },
};

const staggerContainer: Variants = {
   visible: {
      transition: {
         staggerChildren: 0.1,
      },
   },
};

export default function PublicPortfolio() {
   const { id } = useParams();
   const router = useRouter();
   const t = useTranslations("portfolio"); // Make sure your translation namespace matches
   const [user, setUser] = useState<UserData | null>(null);
   // State for the new detailed skill analysis data
   const [skillAnalysis, setSkillAnalysis] =
      useState<SkillAnalysisResponseData | null>(null);
   const [achievements, setAchievements] = useState<Achievement[]>([]);
   const [loading, setLoading] = useState(true);

   const apiUrl = process.env.NEXT_PUBLIC_API_URL;

   useEffect(() => {
      if (!id) return;
      const fetchPortfolioData = async () => {
         try {
            setLoading(true);
            const [userRes, skillAnalysisRes, achievementsRes] =
               await Promise.all([
                  fetch(`${apiUrl}/users/${id}`),
                  // Correctly using the public endpoint with userId as a path parameter
                  fetch(`${apiUrl}/ai/public-skills-analysis/${id}`),
                  fetch(`${apiUrl}/challenges/user-accepted/${id}`),
               ]);

            const userData = await userRes.json();
            const skillAnalysisData = await skillAnalysisRes.json(); // Renamed to avoid conflict
            const achievementsData = await achievementsRes.json();

            if (userData.success) setUser(userData.data);
            // Set the entire skill analysis data object
            if (skillAnalysisData.success)
               setSkillAnalysis(skillAnalysisData.data);
            if (achievementsData.success)
               setAchievements(achievementsData.data);
         } catch (error) {
            console.error("Error loading portfolio:", error);
            // Handle error states for specific sections if needed
            setSkillAnalysis(null); // Clear skill analysis on error
            setAchievements([]); // Clear achievements on error
         } finally {
            setLoading(false);
         }
      };
      fetchPortfolioData();
   }, [id, apiUrl]);

   // Helper to get Lucide icon for skill level
   const getLevelIcon = (level: SkillLevel) => {
      switch (level) {
         case "expert":
            return <Award size={18} />;
         case "advanced":
            return <Zap size={18} />;
         case "intermediate":
            return <Star size={18} />;
         case "beginner":
            return <Lightbulb size={18} />;
         default:
            return null;
      }
   };

   if (loading)
      return (
         <div className="min-h-screen flex items-center justify-center bg-white font-serif italic text-xl text-gray-400">
            {t("loading")}
         </div>
      );

   if (!user)
      return (
         <div className="p-20 text-center font-serif text-xl">
            {t("userNotFound")}
         </div>
      );

   return (
      <motion.main
         initial="hidden"
         animate="visible"
         className="min-h-screen text-black px-6 md:px-20 py-10 mb-20 font-sans selection:bg-gray-100">
         {/* Back Button */}
         <motion.button
            variants={fadeInVariant}
            onClick={() => router.back()}
            className="flex items-center gap-2 text-black hover:gap-3 transition-all mb-8 font-medium group">
            <ArrowLeft size={20} />
            <span className="text-xl font-serif">{t("backButton")}</span>
         </motion.button>

         {/* Hero Section */}
         <div className="flex flex-col lg:flex-row justify-between items-start gap-10">
            <motion.div variants={fadeInVariant} className="flex-1 max-w-2xl">
               <h1 className="text-6xl md:text-[80px] font-serif font-medium mb-6 tracking-tight leading-none">
                  {user.name}
               </h1>

               <p className="text-lg text-gray-800 leading-relaxed mb-6 font-normal max-w-[550px]">
                  {user.bio || t("defaultBio")}
               </p>

               <div className="flex flex-col gap-2 mb-8">
                  {/* Email Link */}
                  <a
                     href={`mailto:${user.email}`}
                     className="flex items-center gap-3 text-black hover:opacity-70 transition-opacity">
                     <Mail size={20} strokeWidth={1.5} />
                     <span className="text-lg underline underline-offset-4 font-light">
                        {user.email}
                     </span>
                  </a>

                  {/* LinkedIn Link */}
                  {user.linkedin && (
                     <a
                        href={user.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-black hover:opacity-70 transition-opacity">
                        <div className="bg-black text-white p-0.5 rounded-sm">
                           <Linkedin size={16} fill="white" />
                        </div>
                        <span className="text-lg font-light">
                           {t("linkedinLabel")}
                        </span>
                     </a>
                  )}

                  {/* GitHub Link */}
                  {user.github && (
                     <a
                        href={user.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-black hover:opacity-70 transition-opacity">
                        <Github size={20} strokeWidth={1.5} />
                        <span className="text-lg font-light">
                           {t("githubLabel")}
                        </span>
                     </a>
                  )}

                  {/* Other Links */}
                  {user.otherLinks && user.otherLinks.length > 0 && (
                     <>
                        {user.otherLinks.map((link) => (
                           <a
                              key={link._id}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 text-black hover:opacity-70 transition-opacity">
                              <LinkIcon size={20} strokeWidth={1.5} />
                              <span className="text-lg font-light underline underline-offset-4">
                                 {link.name}
                              </span>
                           </a>
                        ))}
                     </>
                  )}
               </div>

               {/* Skills Section - Now using detailed skill analysis data */}
               <section className="mb-10">
                  <h2 className="text-3xl font-serif font-medium mb-4">
                     {t("skillsTitle")}
                  </h2>
                  {skillAnalysis && skillAnalysis.skills.length > 0 ? (
                     <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="flex flex-wrap gap-4">
                        {" "}
                        {/* Increased gap for better spacing */}
                        {skillAnalysis.skills.map((s) => (
                           <motion.div
                              key={s.skill}
                              variants={fadeInVariant}
                              className={`flex items-center gap-2 px-5 py-2 border-2 text-blue rounded-full font-bold text-base md:text-lg`}>
                              {getLevelIcon(s.level)}
                              <span className="text-sm">{s.skill}</span>
                              <span className="text-sm font-normal">
                                 ({s.averageScore}%)
                              </span>
                              {/* {getTrendIcon(s.trend)} */}
                           </motion.div>
                        ))}
                     </motion.div>
                  ) : (
                     <p className="text-gray-400 font-serif italic text-base ">
                        {t("noSkills")}
                     </p>
                  )}

                  {/* Optional: Display Strongest Skills / Skills to Improve */}
                  {skillAnalysis &&
                     skillAnalysis.strongestSkills.length > 0 && (
                        <div className="mt-8">
                           <h3 className="text-xl font-serif font-medium mb-2">
                              {t("strongestSkillsTitle")}
                           </h3>
                           <div className="flex flex-wrap gap-2">
                              {skillAnalysis.strongestSkills.map((s) => (
                                 <span
                                    key={s.skill}
                                    className="bg-purple/10 text-purple text-sm font-medium px-4 py-2 rounded-full">
                                    {s.skill} ({s.averageScore}%)
                                 </span>
                              ))}
                           </div>
                        </div>
                     )}
               </section>
            </motion.div>

            {/* Image Section */}
            <motion.div
               variants={fadeInVariant}
               className="hidden lg:block shrink-0 lg:pr-10">
               <Image
                  src="/images/arch.svg"
                  alt="User Graphic"
                  width={350}
                  height={350}
                  className="object-contain"
                  priority
               />
            </motion.div>
         </div>

         {/* Projects Section */}
         <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInVariant}
            className="mt-4">
            <h2 className="text-3xl font-serif font-medium mb-10">
               {t("projectsTitle")}
            </h2>
            {achievements.length > 0 ? (
               <motion.div
                  variants={staggerContainer}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {achievements.map((achievement) => (
                     <ClippedCard
                        key={achievement._id} // Use submission ID as a unique key
                        href={`/challenges/${achievement.challengeId}`} // Link to the challenge details page using challengeId
                        cardBgColorVar="rgb(249, 247, 244)" // #F9F7F4
                        textColorVar="rgb(0, 0, 0)" // Black text
                        hoverBgColorVar="rgb(249, 247, 244)"
                        hoverTextColorVar="rgb(0, 0, 0)">
                        <div>
                           <h3 className="text-2xl font-bold mb-10 h-12">
                              {achievement.title}{" "}
                              {/* Displays Challenge Name */}
                           </h3>
                           <p className="text-lg text-gray-700 mb-2">
                              {achievement.creatorName}{" "}
                              {/* Displays Creator Name */}
                              {achievement.creatorCity
                                 ? `- ${achievement.creatorCity}`
                                 : ""}
                              {/* Displays Creator City if available */}
                           </p>
                           <p className="text-md text-gray-500 mb-2">
                              Submitted:{" "}
                              {new Date(
                                 achievement.submissionDate
                              ).toLocaleDateString("en-US", {
                                 year: "numeric",
                                 month: "short",
                                 day: "numeric",
                              })}
                              {/* Displays Submission Date */}
                           </p>
                           <h4
                              className={`mt-8 text-xl font-semibold mb-6 rounded-3xl border px-6 py-1.5 pt-1 w-fit ${
                                 achievement.aiScore >= 90
                                    ? "bg-green/10 text-green"
                                    : "bg-blue/10 text-blue"
                              }`}>
                              Score: {achievement.aiScore}
                              {/* Displays AI Score */}
                           </h4>
                           {/* challengeId is implicitly used in the href, but you could display it explicitly if needed */}
                           {/* <p className="text-sm text-gray-400">Challenge ID: {achievement.challengeId}</p> */}
                        </div>
                     </ClippedCard>
                  ))}
               </motion.div>
            ) : (
               <p className="text-gray-400 font-serif italic text-base">
                  {t("noProjects")}
               </p>
            )}
         </motion.section>
      </motion.main>
   );
}
