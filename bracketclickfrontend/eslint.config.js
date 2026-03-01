/**
 * ESLint Configuration
 *
 * This file configures ESLint for code quality and consistency checks.
 * It includes rules for JavaScript, TypeScript, React, and React Hooks.
 */

import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // Ignore the dist directory (build output)
  { ignores: ['dist'] },

  // Main configuration for TypeScript and React files
  {
    // Extend recommended configurations for JavaScript and TypeScript
    extends: [js.configs.recommended, ...tseslint.configs.recommended],

    // Apply this config to all TypeScript and TSX files
    files: ['**/*.{ts,tsx}'],

    // Language settings
    languageOptions: {
      // Use ECMAScript 2020 features
      ecmaVersion: 2020,

      // Define browser global variables (window, document, etc.)
      globals: globals.browser,
    },

    // ESLint plugins for React-specific linting
    plugins: {
      // Enforce React Hooks rules
      'react-hooks': reactHooks,

      // Ensure Fast Refresh compatibility in development
      'react-refresh': reactRefresh,
    },

    // Linting rules
    rules: {
      // Apply all recommended React Hooks rules
      ...reactHooks.configs.recommended.rules,

      // Warn if components aren't properly exported for Fast Refresh
      // Allow constant exports for flexibility
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  }
);
