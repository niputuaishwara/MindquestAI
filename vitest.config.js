import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  },
  test: {
    environment: 'node',
    globals: true,
    include: [
      'src/**/*.test.js',
      'src/**/*.test.jsx',
      'functions/src/**/*.test.js'
    ],
    setupFiles: []
  }
})
