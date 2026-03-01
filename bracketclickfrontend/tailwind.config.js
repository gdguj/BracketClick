/**
 * Tailwind CSS Configuration
 *
 * This file configures Tailwind CSS utility classes, theme settings,
 * and defines which files should be scanned for class names.
 *
 * @type {import('tailwindcss').Config}
 */
export default {
  // Specify files to scan for Tailwind class names
  // This includes the main HTML file and all JS/TS/JSX/TSX files in src
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],

  // Theme configuration
  theme: {
    // Extend default Tailwind theme with custom values
    // Currently using default theme without extensions
    extend: {},
  },

  // Additional Tailwind plugins
  // None currently installed
  plugins: [],
};
