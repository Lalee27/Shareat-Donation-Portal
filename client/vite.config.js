import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const target = process.env.VITE_API_TARGET || 'http://localhost:5000';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  server: {
    host: true,           // Listen on all interfaces (needed for Docker)
    proxy: {
      '/api': {
        target: target,
        changeOrigin: true,
      },
      '/uploads': {
        target: target,
        changeOrigin: true,
      }
    }
  },
})
