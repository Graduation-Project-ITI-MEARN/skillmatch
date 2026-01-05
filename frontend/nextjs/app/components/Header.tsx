// components/Header.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function Header() {
   const [isMenuOpen, setIsMenuOpen] = useState(false);
   const pathname = usePathname();
   const t = useTranslations();

   const navLinks = [
      { href: `/about`, label: t("nav.about") || "About" },
      {
         href: `/challenges`,
         label: t("nav.challenges") || "Challenges",
      },
      {
         href: `/leaderboard`,
         label: t("nav.leaderboard") || "Leaderboard",
      },
   ];

   const isActiveLink = (href: string) => {
      return pathname === href;
   };

   return (
      <header className="bg-white sticky top-0 z-50">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-24">
               {/* Logo */}
               <Link href={`/`} className="flex items-center gap-2">
                  <Image
                     src="/images/logo.svg"
                     alt="SkillMatch"
                     width={40}
                     height={40}
                     className="w-10 h-10"
                     loading="eager"
                  />
                  <span className="text-2xl font-serif font-bold text-gray-900">
                     SkillMatch
                  </span>
               </Link>

               {/* Desktop Navigation */}
               <nav className="hidden md:flex items-center gap-8">
                  {navLinks.map((link) => (
                     <Link
                        key={link.href}
                        href={link.href}
                        className={`text-gray-700 hover:text-gray-900 font-medium transition-colors pb-1 ${
                           isActiveLink(link.href)
                              ? "border-b-2 border-black"
                              : ""
                        }`}>
                        {link.label}
                     </Link>
                  ))}
               </nav>

               {/* Desktop Actions */}
               <div className="hidden md:flex items-center gap-4">
                  <Link
                     href={`/login`}
                     className="text-gray-700 hover:text-gray-900 font-medium px-4 py-2 transition-colors">
                     {t("auth.signIn") || "Sign In"}
                  </Link>
                  <Link
                     href={`/challenges`}
                     className="bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors">
                     {t("challenges.startChallenge") || "Start Challenge"}
                  </Link>
               </div>

               {/* Mobile Menu Button */}
               <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
                  aria-label="Toggle menu">
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
               </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
               <div className="md:hidden py-4">
                  <nav className="flex flex-col space-y-4">
                     {navLinks.map((link) => (
                        <Link
                           key={link.href}
                           href={link.href}
                           className={`text-gray-700 hover:text-gray-900 font-medium px-4 py-2 ${
                              isActiveLink(link.href)
                                 ? "border-l-4 border-black bg-black/5"
                                 : ""
                           }`}
                           onClick={() => setIsMenuOpen(false)}>
                           {link.label}
                        </Link>
                     ))}
                     <div className="flex flex-col space-y-2 px-4 pt-4 border-t border-gray-200">
                        <Link
                           href={`/login`}
                           className="text-center text-gray-700 hover:text-gray-900 font-medium px-4 py-2"
                           onClick={() => setIsMenuOpen(false)}>
                           {t("auth.signIn") || "Sign In"}
                        </Link>
                        <Link
                           href={`/challenges`}
                           className="block mx-auto text-center bg-black text-white px-6 py-1.5 rounded-full font-medium hover:bg-gray-800 w-50"
                           onClick={() => setIsMenuOpen(false)}>
                           {t("challenges.startChallenge") || "Start Challenge"}
                        </Link>
                     </div>
                  </nav>
               </div>
            )}
         </div>
      </header>
   );
}
