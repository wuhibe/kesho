import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  // Component conventions (CLAUDE.md → Components).
  {
    files: ["**/*.tsx"],
    rules: {
      "react/no-multi-comp": "error",
      "react/function-component-definition": [
        "error",
        { namedComponents: "arrow-function", unnamedComponents: "arrow-function" },
      ],
      "import/no-default-export": "error",
      "no-restricted-syntax": [
        "error",
        {
          selector: "TSQualifiedName[left.name='React']",
          message: "Import the type by name from 'react' (import type { ReactNode } from 'react').",
        },
      ],
    },
  },
  // Next.js requires a default export from these file conventions.
  { files: ["app/**/page.tsx", "app/**/layout.tsx", "app/**/not-found.tsx", "app/**/error.tsx"], rules: { "import/no-default-export": "off" } },
  globalIgnores([".next/**", "next-env.d.ts", "lib/generated/**", ".claude/**", "givingli-design/**"]),
]);
