"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Linkedin, Facebook, Globe, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function Footer() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations();
  const [isLangOpen, setIsLangOpen] = useState(false);

  const locale = pathname.split("/")[1] || "en";

  const handleLanguageChange = (newLocale: string) => {
    const pathWithoutLocale = pathname.replace(`/${locale}`, "");
    router.push(`/${newLocale}${pathWithoutLocale || ""}`);
    router.refresh();
    setIsLangOpen(false);
  };

  const languages = [
    { code: "en", name: "English", flag: "EN" },
    { code: "ar", name: "العربية", flag: "AR" },
  ];

  const currentLang = languages.find((l) => l.code === locale) || languages[0];

  const exploreLinks = [
    { href: `/${locale}/about`, label: t("nav.about") || "About" },
    {
      href: `/${locale}/challenges`,
      label: t("nav.challenges") || "Challenges",
    },
    {
      href: `/${locale}/leaderboard`,
      label: t("nav.leaderboard") || "Leaderboard",
    },
  ];

  const legalLinks = [
    {
      href: `/${locale}/privacy`,
      label: t("footer.privacyPolicy") || "Privacy Policy",
    },
    {
      href: `/${locale}/terms`,
      label: t("footer.termsOfUse") || "Terms of Use",
    },
  ];

  return (
    <footer className="bg-black text-white mt-auto border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo Section */}
          <div className="col-span-1">
            <Link href={`/${locale}`} className="flex items-center gap-2 mb-4">
              <Image
                src="/images/logo.svg"
                alt="SkillMatch"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <span className="text-xl font-bold tracking-tight">
                SkillMatch
              </span>
            </Link>
            <p className="text-gray-400 text-sm">
  {t('footer.description')}
</p>
          </div>

          {/* Explore Section */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">
              {t("footer.explore") || "Explore"}
            </h3>
            <ul className="space-y-2">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">
              {t("footer.legal") || "Legal"}
            </h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Language & Social */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">
              {locale === "ar" ? "اللغة والتواصل" : "Language & Social"}
            </h3>

            {/* Custom Language Dropdown */}
            <div className="relative mb-6">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center justify-between w-full bg-gray-900 text-white px-4 py-2.5 rounded-lg border border-gray-800 hover:border-gray-600 transition-all focus:outline-none"
              >
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-white" />
                  <span className="text-sm">{currentLang.name}</span>
                </div>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-300 ${
                    isLangOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isLangOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsLangOpen(false)}
                  />
                  <div className="absolute bottom-full mb-2 w-full bg-gray-900 border border-gray-800 rounded-lg shadow-2xl z-20 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`flex items-center justify-between w-full px-4 py-3 text-sm hover:bg-gray-800 transition-colors ${
                          locale === lang.code
                            ? "text-white bg-gray-800"
                            : "text-gray-300"
                        }`}
                      >
                        {lang.name}
                        {locale === lang.code && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Social Media Icons */}
            <div className="flex gap-3">
              {[
                {
                  icon: <Linkedin size={18} />,
                  href: "https://linkedin.com",
                  label: "LinkedIn",
                },
                {
                  icon: <Facebook size={18} />,
                  href: "https://facebook.com",
                  label: "Facebook",
                },
                {
                  icon: (
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  ),
                  href: "https://x.com",
                  label: "X",
                },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-gray-900 rounded-lg flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300 text-gray-400"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-xs">
          <p>
            SkillMatch © {new Date().getFullYear()}{" "}
            {t("footer.allRightsReserved") || "All rights reserved"}
          </p>
          <div className="flex gap-6">
            <span className="hover:text-gray-300 cursor-pointer transition-colors">
              Privacy
            </span>
            <span className="hover:text-gray-300 cursor-pointer transition-colors">
              Terms
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
