import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,          // <- active describe, it, expect sans import
    environment: 'node'    // ou 'jsdom' si tu fais des tests DOM
  }
})
