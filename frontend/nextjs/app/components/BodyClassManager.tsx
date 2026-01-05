// app/components/BodyClassManager.tsx
"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Define the routes (without locale prefix) that should have the background image.
// For dynamic routes like /leaderboard/[id], list the base path '/leaderboard'.
// The logic below will then check if the normalized path starts with this base.
const routesWithBackground = [
   "/",
   "/leaderboard", // Includes /leaderboard and /leaderboard/[id]
   "/about",
];

export function BodyClassManager() {
   const pathname = usePathname();

   useEffect(() => {
      // Extract the path without the locale prefix (e.g., '/en/about' becomes '/about')
      const pathSegments = pathname.split("/");
      // Assumes locale is always the second segment (e.g., /en/...)
      // const locale = pathSegments[1]; // Not directly used in this logic
      const pathWithoutLocale = "/" + pathSegments.slice(2).join("/"); // Reconstruct path from third segment onwards

      // Normalize the root path to '/'
      const normalizedPath =
         pathWithoutLocale === "/" ? "/" : pathWithoutLocale;

      // Determine if the current normalizedPath should have a background
      const shouldHaveBackground = routesWithBackground.some((routePattern) => {
         if (routePattern === "/") {
            return normalizedPath === "/";
         }
         // For other routes, check if the normalizedPath is an exact match
         // OR if it starts with the routePattern followed by a '/' (for dynamic segments)
         // This handles both '/leaderboard' and '/leaderboard/123'
         return (
            normalizedPath === routePattern ||
            normalizedPath.startsWith(`${routePattern}/`)
         );
      });

      if (shouldHaveBackground) {
         document.body.classList.add("has-full-page-background");
      } else {
         document.body.classList.remove("has-full-page-background");
      }

      // Cleanup function: remove the class when the component unmounts
      // or when the path changes and the background is no longer needed.
      return () => {
         document.body.classList.remove("has-full-page-background");
      };
   }, [pathname]); // Re-run this effect whenever the pathname changes

   return null; // This component does not render any visible UI
}
