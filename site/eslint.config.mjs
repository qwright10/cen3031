// import { dirname } from 'node:path';
// import { fileURLToPath } from "node:url";
//
// import { FlatCompat } from "@eslint/eslintrc";
import stylisticTs from '@stylistic/eslint-plugin-ts';
import parserTs from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import js from '@eslint/js';
import tsEslint from 'typescript-eslint';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const compat = new FlatCompat({
//   baseDirectory: __dirname,
// });

const eslintConfig = tsEslint.config(
    js.configs.recommended,
    tsEslint.configs.strictTypeChecked,
    {
      languageOptions: {
        parserOptions: {
          projectService: true,
          tsconfigRootDir: import.meta.dirname,
        },
      },
    },
    {
      settings: {
        'import/resolvers': {
          typescript: {
            alwaysTryTypes: true,
          },
        },
      },
    },
    {
      plugins: {
        '@stylistic/ts': stylisticTs,
      },
      settings: {
        'import/resolver': 'typescript',
      },
      languageOptions: {
        parser: parserTs,
      },
      extends: [
        importPlugin.flatConfigs.recommended,
        importPlugin.flatConfigs.typescript],
      rules: {
        "@stylistic/ts/comma-dangle": ["error", "always-multiline"],
        "@/eol-last": "error",
        "@stylistic/ts/indent": ["error", 2],
        "@stylistic/ts/quotes": ["error", "single"],
        "@stylistic/ts/semi": ["error", "always"],

        // replaced by import/no-duplicates
        "@/no-duplicate-imports": "off",
        "import/no-duplicates": "error",
        "import/no-named-as-default-member": "off",

        "@typescript-eslint/only-throw-error": "off",
        "@typescript-eslint/prefer-promise-reject-errors": "off",
        "@typescript-eslint/no-unsafe-assignment": "off"
      },
    }
);

export default eslintConfig;
