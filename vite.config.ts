import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Relative asset URLs work both at a custom domain root and under a GitHub Pages repository path.
  base: './',
  server: {
    host: '127.0.0.1',
    port: 4173,
  },
})
