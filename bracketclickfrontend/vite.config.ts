/**
 * Vite Configuration
 *
 * This file configures Vite, the build tool and development server.
 * It sets up plugins, optimization settings, and other build options.
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration documentation: https://vitejs.dev/config/
export default defineConfig({
  // Enable React plugin for JSX transformation and Fast Refresh
  plugins: [react()],

  // Dependency optimization configuration
  optimizeDeps: {
    // Exclude lucide-react from pre-bundling to prevent build issues
    exclude: ['lucide-react'],
  },
});
