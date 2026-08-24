import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginAstro from 'eslint-plugin-astro';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: ['dist/**', '.astro/**', '.vercel/**', 'node_modules/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      // Sanity/GROQ results and Rule callbacks are untyped at this boundary
      // without generated types — `any` is the honest type here, not
      // laziness. Warn instead of block so new code still gets nudged.
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    // Astro component frontmatter/script blocks type-check against tsconfig,
    // but this rule needs type info we don't wire up here — keep it off for
    // .astro files to avoid false positives on Astro.props destructuring.
    files: ['**/*.astro'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  {
    // env.d.ts's triple-slash references are the Astro-mandated pattern
    // (see https://docs.astro.build/en/guides/typescript/), not a style slip.
    files: ['src/env.d.ts'],
    rules: {
      '@typescript-eslint/triple-slash-reference': 'off',
    },
  },
);
