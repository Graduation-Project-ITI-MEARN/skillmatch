import type { Metadata } from "next";
import "../globals.css"; // تأكد أن المسار صحيح للوصول لملف الـ css
import { Locale, routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { RTLProvider } from "../components/RTLContext";
import Header from "../components/Header";
import Footer from "../components/Footer";

// انقل الـ Metadata هنا
export const metadata: Metadata = {
   title: "SkillMatch - Challenge Yourself",
   description: "Platform for skill-based challenges and competitions",
};

export default async function RootLayout({
   children,
   params,
}: Readonly<{
   children: React.ReactNode;
   params: Promise<{ locale: string }>;
}>) {
   const { locale } = await params;

   if (!routing.locales.includes(locale as Locale)) {
      notFound();
   }

   const messages = await getMessages();
   const isRTL = locale === "ar";
   const direction = isRTL ? "rtl" : "ltr";

   return (
      <html lang={locale} dir={direction}>
         <body
            className={`${
               direction === "rtl" ? "font-arabic-sans" : "font-sans"
            } min-h-screen flex flex-col`}>
            <NextIntlClientProvider locale={locale} messages={messages}>
               <RTLProvider isRTL={isRTL}>
                  <Header />
                  <main className="flex-grow">{children}</main>
                  <Footer />
               </RTLProvider>
            </NextIntlClientProvider>
         </body>
      </html>
   );
}