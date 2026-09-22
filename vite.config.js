import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      '@tiptap/react',
      '@tiptap/react/menus',
      '@tiptap/pm/model',
      '@tiptap/pm/state',
      '@tiptap/starter-kit',
      '@tiptap/extension-table',
    ],
  },
  server: {
    host: true,
    allowedHosts: true,
    proxy: {
      '/academics': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/authentication': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/media': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
