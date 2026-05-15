import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  server: {
    host: true,           // Listen on all interfaces (needed for Docker)
    watch: {
      usePolling: true,   // Detect file changes via Docker volume mounts
    },
  },
})
