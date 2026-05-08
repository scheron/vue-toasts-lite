import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ command }) => ({
  plugins: [vue()],
  base: command === 'build' ? '/vue-toasts-lite/' : '/',
  resolve: {
    alias: [
      {
        find: 'vue-toasts-lite/style.css',
        replacement: fileURLToPath(new URL('../src/styles/index.css', import.meta.url)),
      },
      {
        find: 'vue-toasts-lite',
        replacement: fileURLToPath(new URL('../src/index.ts', import.meta.url)),
      },
    ],
  },
  server: {
    fs: {
      allow: [fileURLToPath(new URL('..', import.meta.url))],
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    minify: 'esbuild',
    sourcemap: false,
  },
})) 