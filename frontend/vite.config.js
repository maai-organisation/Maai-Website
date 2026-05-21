import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    visualizer({
      filename: 'dist/bundle-stats.html',
      open: true,
    }),
  ],
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('recharts')) return 'charts'
          if (id.includes('react-rnd')) return 'editor'
          if (id.includes('framer-motion')) return 'animation'
          if (
            id.includes('react-dom') ||
            id.includes('react-router-dom') ||
            id.includes('react/')
          ) {
            return 'react'
          }
          if (id.includes('node_modules')) return 'vendor'
        },
      },
    },
  },
})
