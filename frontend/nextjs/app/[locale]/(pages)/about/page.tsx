"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

export default function AboutPage() {
   const t = useTranslations("About");

  // Team Data mapping
  const teamMembers = [
    { key: "aya", img: "/images/aya.png" },
    { key: "ahmedm", img: "/images/mancy.png" },
    { key: "esraa", img: "/images/esraa.png" },
    { key: "ahmedh", img: "/images/henksh.png" },
    { key: "menna", img: "/images/menna.png" },
  ];

   return (
      <div className="min-h-screen  font-sans text-black pb-20">
         {/* 1. Header Section */}
         <section className="pt-24 pb-20 px-6 text-center max-w-4xl mx-auto">
            <span className="block text-sm font-bold tracking-[0.2em] uppercase mb-6 text-gray-500">
               {t("headerSubtitle")}
            </span>
            <h1 className="text-5xl md:text-7xl font-serif mb-8 text-black leading-tight">
               {t("headerTitle")}
            </h1>
            <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
               {t("headerDesc")}
            </p>
         </section>

         {/* 2. Mission Section */}
         <section className="max-w-7xl mx-auto px-6 mb-32">
            <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
               {/* Left Text */}
               <div className="flex-1">
                  <h2 className="text-sm font-bold tracking-[0.2em] uppercase mb-8 text-gray-900">
                     {t("Mission.title")}
                  </h2>
                  <div className="space-y-6 text-lg md:text-xl text-gray-600 leading-relaxed font-light">
                     <p>{t("Mission.p1")}</p>
                     <p>{t("Mission.p2")}</p>
                  </div>
               </div>

               {/* Right Visual (Abstract Sphere) */}
               <div className="flex-1 w-full flex justify-center lg:justify-end">
                  <motion.div
                     initial={{ opacity: 0, scale: 0.9 }}
                     whileInView={{ opacity: 1, scale: 1 }}
                     viewport={{ once: true }}
                     transition={{ duration: 0.8 }}
                     className="w-80 h-80 md:w-96 md:h-96 rounded-full bg-linear-to-br from-orange-400 via-red-500 to-indigo-900 shadow-2xl relative overflow-hidden">
                     {/* Grain overlay simulation */}
                     <div
                        className="absolute inset-0 bg-white opacity-20"
                        style={{ filter: "url(#noise)" }}></div>
                     <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent"></div>
                  </motion.div>
               </div>
            </div>
         </section>

         {/* 3. Team Section (Starry Card) */}
         <section className="max-w-7xl mx-auto px-6 mb-32">
            <div className="mb-8">
               <span className="block text-sm font-bold tracking-[0.2em] uppercase mb-2 text-gray-500">
                  {t("Team.subtitle")}
               </span>
               <h2 className="text-5xl md:text-6xl font-serif text-black">
                  {t("Team.title")}
               </h2>
            </div>
          </div>
          
          {/* Right Visual (Abstract Sphere) */}
          <div className="flex-1 w-full flex justify-center lg:justify-end">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               transition={{ duration: 0.8 }}
               className="w-80 h-80 md:w-96 md:h-96 relative"
             >
                <motion.div
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="w-full h-full relative"
                >
                  <Image 
                    src="/images/plate.svg" 
                    alt="Mission Visual" 
                    fill 
                    className="object-contain"
                  />
                </motion.div>
             </motion.div>
          </div>
        </div>
      </section>

            {/* Dark Container */}
            <div className="w-full rounded-[40px] overflow-hidden relative min-h-[600px] flex flex-col items-center justify-center py-16 px-6">
               {/* Background: Gradient + Noise */}
               <div className="absolute inset-0 bg-linear-to-br from-[#1e213a] via-[#15172b] to-[#0f111a] z-0"></div>

               <div className="relative z-10 w-full max-w-6xl">
                  <h3 className="text-white/80 text-center text-2xl font-serif mb-12">
                     {t("Team.year")}
                  </h3>

                  {/* Team Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8 justify-items-center">
                     {teamMembers.map((member) => (
                        <motion.div
                           key={member.key}
                           whileHover={{ y: -10 }}
                           className="flex flex-col items-center text-center group">
                           {/* Member Image */}
                           <div className="w-32 h-32 md:w-40 md:h-40 bg-gray-200 rounded-3xl mb-6 overflow-hidden border-4 border-white/10 shadow-lg relative">
                              <div className="absolute inset-0 flex items-center justify-center bg-stone-300 text-stone-500 font-serif text-3xl">
                                 {/* Once you have images, uncomment the line below and remove this div */}
                                 {/* <Image src={member.img} fill alt="" className="object-cover" /> */}
                                 {member.key.charAt(0).toUpperCase()}
                              </div>
                           </div>

            {/* Team Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8 justify-items-center">
              {teamMembers.map((member) => (
                <motion.div 
                  key={member.key}
                  whileHover={{ y: -10 }}
                  className="flex flex-col items-center text-center group"
                >
                  {/* Member Image */}
                  <div className="w-32 h-32 md:w-40 md:h-40 bg-gray-200 rounded-3xl mb-6 overflow-hidden border-4 border-white/10 shadow-lg relative">
                       <Image src={member.img} fill alt="" className="object-cover" />
                  </div>
               </div>
            </div>
         </section>

         {/* 4. Goal Section */}
         <section className="max-w-7xl mx-auto px-6 mb-20">
            <div className="max-w-4xl">
               <span className="block text-sm font-bold tracking-[0.2em] uppercase mb-6 text-gray-500">
                  {t("Goal.title")}
               </span>
               <h2 className="text-5xl md:text-6xl font-serif mb-10 text-black">
                  {t("Goal.heading")}
               </h2>
               <div className="space-y-6 text-lg md:text-xl text-gray-600 leading-relaxed font-light">
                  <p>{t("Goal.p1")}</p>
                  <p>{t("Goal.p2")}</p>
               </div>
            </div>
         </section>
      </div>
   );
}
