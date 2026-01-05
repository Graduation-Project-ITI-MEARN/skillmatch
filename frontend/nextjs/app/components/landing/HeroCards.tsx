import { Link } from "@/i18n/routing";
import Image from "next/image";
import React, { useState, useEffect } from "react";

// Animated Angled Card Component
const AnimatedAngledCard = ({
   children,
   variant = "left",
   delay = 500,
   animationDuration = 700,
   steepness = 18,
}: {
   children: React.ReactNode;
   variant?: "left" | "right";
   delay?: number;
   animationDuration?: number;
   steepness?: number;
}) => {
   const [isAnimated, setIsAnimated] = useState(false);

   useEffect(() => {
      const timer = setTimeout(() => {
         setIsAnimated(true);
      }, delay);
      return () => clearTimeout(timer);
   }, [delay]);

   // Calculate clip paths
   const getClipPath = (animated: boolean) => {
      if (variant === "left") {
         // Text card on left - starts rectangular, becomes angled on right
         return animated
            ? `polygon(0 0, ${100 - steepness}% 0, 100% 100%, 0% 100%)`
            : "polygon(0 0, 100% 0, 100% 100%, 0% 100%)";
      } else {
         // Image card on right - starts rectangular, becomes angled on left
         // Modified for complementary angle: left edge goes from 0% at top to steepness% at bottom
         return animated
            ? `polygon(0% 0, 100% 0, 100% 100%, ${steepness}% 100%)`
            : "polygon(0 0, 100% 0, 100% 100%, 0% 100%)";
      }
   };

   return (
      <div
         className="h-full relative"
         style={{ filter: "url(#rounded-corners)" }}>
         <div
            className="h-full w-full overflow-hidden rounded-xl transition-all ease-in-out"
            style={{
               clipPath: getClipPath(isAnimated),
               transitionDuration: `${animationDuration}ms`,
               transitionDelay: `${delay}ms`,
            }}>
            {children}
         </div>
      </div>
   );
};

// Main Testimonial Component
const HeroCard = () => {
   const [isAnimated, setIsAnimated] = useState(false);

   useEffect(() => {
      const timer = setTimeout(() => {
         setIsAnimated(true);
      }, 500);
      return () => clearTimeout(timer);
   }, []);

   return (
      <div className="w-full h-screen p-4 md:p-8 flex items-center justify-center">
         <svg
            className="absolute w-0 h-0 pointer-events-none"
            aria-hidden="true">
            <defs>
               <filter id="rounded-corners">
                  <feGaussianBlur
                     in="SourceGraphic"
                     stdDeviation="2"
                     result="blur"
                  />
                  <feColorMatrix
                     in="blur"
                     mode="matrix"
                     values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 19 -9"
                     result="goo"
                  />
                  <feComposite in="SourceGraphic" in2="goo" operator="atop" />
               </filter>
            </defs>
         </svg>

         <div className="w-full max-w-7xl">
            <div className="flex flex-col lg:flex-row gap-0 h-[600px] lg:h-[500px]">
               {/* Left Card - Text Content */}
               <div
                  className="w-full lg:w-[55%] relative transition-all duration-700 ease-in-out"
                  style={{
                     transitionDelay: "500ms",
                  }}>
                  {/* Border card */}
                  <AnimatedAngledCard variant="left" delay={500} steepness={18}>
                     <div className="h-full w-full bg-gray-900 p-0.5">
                        <div className="h-full w-full bg-white rounded-xl"></div>
                     </div>
                  </AnimatedAngledCard>

                  {/* Content card */}
                  <div className="absolute top-px left-px h-[calc(100%-2px)] w-[calc(100%-2px)]">
                     <AnimatedAngledCard
                        variant="left"
                        delay={500}
                        steepness={18}>
                        <div className="h-full w-full bg-white p-8 lg:p-12 flex flex-col justify-between">
                           <div className="w-full lg:w-10/12">
                              {/* Logo */}
                              <div
                                 className={`mb-6 transition-all duration-700 ease-in-out ${
                                    isAnimated
                                       ? "opacity-100 translate-y-0"
                                       : "opacity-0 translate-y-8"
                                 }`}
                                 style={{ transitionDelay: "500ms" }}></div>

                              {/* Quote */}
                              <div
                                 className={`mb-6 lg:mb-10 transition-all duration-700 ease-in-out ${
                                    isAnimated
                                       ? "opacity-100 translate-y-0"
                                       : "opacity-0 translate-y-8"
                                 }`}
                                 style={{ transitionDelay: "700ms" }}>
                                 <h3 className="text-xl lg:text-3xl font-bold leading-relaxed text-gray-900">
                                    Real Skills, Real Evaluation, Real Talent
                                 </h3>
                              </div>

                              {/* Attribution */}
                              <div
                                 className={`transition-all duration-700 ease-in-out ${
                                    isAnimated
                                       ? "opacity-100 translate-y-0"
                                       : "opacity-0 translate-y-8"
                                 }`}
                                 style={{ transitionDelay: "800ms" }}>
                                 <p className="text-base lg:text-lg text-gray-600">
                                    Replace CVs and interviews with real
                                    challenges and AI video analysis. Verify
                                    skills authentically, hire confidently.
                                 </p>
                              </div>
                           </div>

                           {/* Read More Link */}
                           <div
                              className={`transition-all duration-700 ease-in-out ${
                                 isAnimated
                                    ? "opacity-100 translate-y-0"
                                    : "opacity-0 translate-y-8"
                              }`}
                              style={{ transitionDelay: "800ms" }}>
                              <Link
                                 href="/about"
                                 className="inline-flex items-center gap-2 text-gray-900 hover:gap-3 transition-all group">
                                 <span className="text-lg lg:text-xl">
                                    Learn more
                                 </span>
                                 <Image
                                    src="/images/arrow-right.svg"
                                    alt=""
                                    width={20}
                                    height={20}
                                 />
                              </Link>
                           </div>
                        </div>
                     </AnimatedAngledCard>
                  </div>
               </div>

               {/* Right Card - Image */}
               <div
                  className="w-full lg:w-[55%] relative transition-all duration-700 ease-in-out pointer-events-none"
                  style={{
                     transitionDelay: "500ms",
                  }}>
                  {/* Border card */}
                  <AnimatedAngledCard
                     variant="right"
                     delay={500}
                     steepness={18}>
                     <div className="h-full w-full bg-gray-900 p-0.5">
                        <div className="h-full w-full rounded-xl bg-white"></div>
                     </div>
                  </AnimatedAngledCard>

                  {/* Content card */}
                  <div className="absolute top-px left-px h-[calc(100%-2px)] w-[calc(100%-2px)]">
                     <AnimatedAngledCard
                        variant="right"
                        delay={500}
                        steepness={18}>
                        <div className="h-full w-full overflow-hidden flex justify-center items-center">
                           <Image
                              src="/images/geometric-circles.svg"
                              alt="Geometric Circles"
                              width={300}
                              height={300}
                           />
                        </div>
                     </AnimatedAngledCard>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default HeroCard;
