import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin"; // <--- 1. Import this

const config: Config = {
   content: [
      "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
      "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
      "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
   ],
   theme: {
      extend: {
         // You can extend other theme settings here
      },
   },
   plugins: [
      // 2. Wrap the function with plugin()
      plugin(function ({ addUtilities }) {
         addUtilities({
            ".clip-path-left": {
               "clip-path": "polygon(82% 0, 0 0, 0 100%, 98% 100%)",
            },
            ".clip-path-right": {
               "clip-path": "polygon(100% 0, 2% 0, 18% 100%, 100% 100%)",
            },
         });
      }),
   ],
};

export default config;
