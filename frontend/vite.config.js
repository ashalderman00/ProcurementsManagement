// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite dev server config
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,        // lock frontend port
    strictPort: true,  // fail if 5173 is taken (no auto-hopping)
    proxy: {
      // forward /api calls to the backend on port 4000
      '/api': 'http://localhost:4000'
    }
  },
  test: {
    globals: true,
    environment: 'jsdom'
  }
})
