import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react({ jsxRuntime: 'automatic', babel: { babelrc: false, configFile: false } })],
  build: { outDir: 'dist', chunkSizeWarningLimit: 5000, target: 'es2020' },
  optimizeDeps: { include: ['react', 'react-dom'] }
})
