import { getRequestConfig } from "next-intl/server";
import { routing, type Locale } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
   let locale = await requestLocale;

   // Fix: specific type casting instead of 'any' to satisfy ESLint
   if (!locale || !routing.locales.includes(locale as Locale)) {
      locale = routing.defaultLocale;
   }

   return {
      locale,
      messages: (await import(`../messages/${locale}.json`)).default,
   };
});
