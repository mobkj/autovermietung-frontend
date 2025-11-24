import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],

  // 👇 HIER rein: top-level config
  server: {
    proxy: {
      '/api': 'http://localhost:8080',
      '/uploads': 'http://localhost:8080',
      '/auth': 'http://localhost:8080',
    },
    host: true,
    port: 5173,
    allowedHosts: [
      'ngan-unsettled-uninceptively.ngrok-free.dev',
      'all', // dein aktueller ngrok-host
      // optional: falls sich der host ständig ändert, nimm stattdessen:
      // '.ngrok-free.dev',
    ],
  },

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
