import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // React Compiler rules enabled by Next 16 flag several long-standing,
      // intentional patterns in this codebase (SSR mount flags, matchMedia
      // initialization, effect-driven fetches). Keep them visible as warnings
      // so CI gates on real errors while the debt is paid down incrementally.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/immutability": "warn",
      // Leaflet integration relies on dynamic typing in a few legacy components.
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // The API is a separate TypeScript project with its own tsconfig.
    "api/**",
  ]),
]);

export default eslintConfig;
