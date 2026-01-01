"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Mail, Linkedin, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion, Variants } from "framer-motion"; // استيراد Variants للتعريف الصحيح
import ClippedCard from "../../../../components/ClippedCard";

// --- Interfaces ---
interface Challenge {
  _id: string;
  title: string;
  category: string;
  creatorId: { name: string };
  createdAt: string;
}

interface SkillObject {
  skill: string;
}

interface UserData {
  _id: string;
  name: string;
  email: string;
  bio?: string;
  linkedin?: string;
}

// تصحيح تعريف الـ Variants ليتوافق مع TypeScript
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
  const t = useTranslations("portfolio");
  const [user, setUser] = useState<UserData | null>(null);
  const [skills, setSkills] = useState<SkillObject[]>([]);
  const [achievements, setAchievements] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!id) return;
    const fetchPortfolioData = async () => {
      try {
        setLoading(true);
        const [userRes, skillsRes, achievementsRes] = await Promise.all([
          fetch(`${apiUrl}/users/${id}`),
          fetch(`${apiUrl}/users/profile/ai-skills?userId=${id}`),
          fetch(`${apiUrl}/challenges/user-accepted/${id}`),
        ]);

        const userData = await userRes.json();
        const skillsData = await skillsRes.json();
        const achievementsData = await achievementsRes.json();

        if (userData.success) setUser(userData.data);
        if (skillsData.success) setSkills(skillsData.data);
        if (achievementsData.success) setAchievements(achievementsData.data);
      } catch (error) {
        console.error("Error loading portfolio:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolioData();
  }, [id, apiUrl]);

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
      className="min-h-screen bg-white text-black px-6 md:px-20 py-10 font-sans selection:bg-gray-100"
    >
      {/* Back Button */}
      <motion.button
        variants={fadeInVariant}
        onClick={() => router.back()}
        className="flex items-center gap-2 text-black hover:gap-3 transition-all mb-8 font-medium group"
      >
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
            <div className="flex items-center gap-3 text-black">
              <Mail size={20} strokeWidth={1.5} />
              <span className="text-lg underline underline-offset-4 font-light">
                {user.email}
              </span>
            </div>

            {user.linkedin && (
              <a
                href={user.linkedin}
                target="_blank"
                className="flex items-center gap-3 text-black hover:opacity-70 transition-opacity"
              >
                <div className="bg-black text-white p-0.5 rounded-sm">
                  <Linkedin size={16} fill="white" />
                </div>
                <span className="text-lg font-light">{t("linkedinLabel")}</span>
              </a>
            )}
          </div>

          {/* Skills Section */}
          <section className="mb-10">
            <h2 className="text-3xl font-serif font-medium mb-4">
              {t("skillsTitle")}
            </h2>
            {skills.length > 0 ? (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="flex flex-wrap gap-3"
              >
                {skills.map((s, i) => (
                  <motion.div
                    key={i}
                    variants={fadeInVariant}
                    className="px-7 py-2 border-2 border-black rounded-2xl font-bold text-lg"
                  >
                    {s.skill}
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <p className="text-gray-400 font-serif italic text-base ">
                {t("noSkills")}
              </p>
            )}
          </section>
        </motion.div>

        {/* Image Section */}
        <motion.div
          variants={fadeInVariant}
          // أضفنا hidden لإخفائها تماماً، و lg:block لتظهر فقط من مقاس الشاشات الكبيرة (1024px) فما فوق
          className="hidden lg:block shrink-0 lg:pr-10"
        >
          <Image
            src="/images/plate.svg"
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
        className="mt-4"
      >
        <h2 className="text-3xl font-serif font-medium mb-4">
          {t("projectsTitle")}
        </h2>
        {achievements.length > 0 ? (
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
          >
            {achievements.map((project) => (
              <motion.div key={project._id} variants={fadeInVariant}>
                <ClippedCard
                  challenge={{
                    _id: project._id,
                    title: project.title,
                    category: project.category,
                    company: project.creatorId.name,
                    location: "CAIRO",
                    deadline: new Date(project.createdAt).toLocaleDateString(
                      undefined,
                      { month: "short", day: "2-digit", year: "numeric" }
                    ),
                  }}
                />
              </motion.div>
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
