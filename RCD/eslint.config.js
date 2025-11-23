import path from "node:path"
import { fileURLToPath } from "node:url"
import js from "@eslint/js"
import tseslint from "typescript-eslint"
import nextPlugin from "@next/eslint-plugin-next"
import reactPlugin from "eslint-plugin-react"
import reactHooksPlugin from "eslint-plugin-react-hooks"
import jsxA11yPlugin from "eslint-plugin-jsx-a11y"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const nextCoreWebVitalsRules = nextPlugin.configs["core-web-vitals"].rules || {}

const tsTypeCheckedConfigs = tseslint.configs.recommendedTypeChecked.map((config) => ({
  ...config,
  files: ["**/*.{ts,tsx}"],
  languageOptions: {
    ...config.languageOptions,
    parserOptions: {
      ...config.languageOptions?.parserOptions,
      project: ["./tsconfig.json"],
      tsconfigRootDir: __dirname,
      ecmaVersion: "latest",
    },
  },
}))

export default tseslint.config(
  {
    ignores: [
      "node_modules",
      ".next",
      "dist",
      "coverage",
      "**/*.d.ts",
      "js/**",
      "rcd-app/**",
      "rcd-auth-server/**",
      "InternalSystem/**",
      "rcd-auth-server",
      "rcd-app",
    ],
  },
  js.configs.recommended,
  ...tsTypeCheckedConfigs,
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    plugins: {
      "@next/next": nextPlugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "jsx-a11y": jsxA11yPlugin,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...nextCoreWebVitalsRules,
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  }
)
