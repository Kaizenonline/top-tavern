import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react({ jsxRuntime: 'automatic' })],
  build: {
    outDir: 'dist',
    minify: false,
    target: 'es2020',
    chunkSizeWarningLimit: 10000,
  }
})
