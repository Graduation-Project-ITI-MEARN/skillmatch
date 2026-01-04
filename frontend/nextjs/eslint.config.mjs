import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",

    // Ignore node_modules for performance.
    "node_modules/**",

    // Ignore dist for performance.
    "dist/**",

    // Ignore .next/server for performance.
    ".next/server/**",

    // Ignore .next/static for performance.
    ".next/static/**",

  ]),
]);

export default eslintConfig;
