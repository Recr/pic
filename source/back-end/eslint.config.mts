import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    extends: [js.configs.recommended, ...tseslint.configs.strict, tseslint.configs.stylistic],
    languageOptions: {
      globals: { ...globals.node, ...globals.es2026 },
    },
  },
]);
