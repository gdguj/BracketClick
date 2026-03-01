/**
 * PostCSS Configuration
 *
 * PostCSS is a tool for transforming CSS with JavaScript plugins.
 * This configuration enables Tailwind CSS processing and automatic
 * vendor prefixing for cross-browser compatibility.
 */
export default {
  plugins: {
    // Process Tailwind CSS directives and generate utility classes
    tailwindcss: {},

    // Automatically add vendor prefixes to CSS rules for browser compatibility
    autoprefixer: {},
  },
};
