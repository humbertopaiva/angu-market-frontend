import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({ autoCodeSplitting: true }),
    viteReact(),
    tailwindcss(),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  preview: {
    port: parseInt(process.env.PORT || '3000', 10),
    host: true,
    // Adicionar seu domínio específico e também 'all' para permitir quaisquer hosts
    allowedHosts: [
      'cbc-frontend.limei.app',
      'localhost',
      'teste-movies-testeteste-fllkkj-ef64e3-82-29-57-246.traefik.me',
      '.limei.app', // Permite qualquer subdomínio de limei.app
      'all', // Permite todos os hosts
    ],
  },
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    host: true,
    // Adicionar as mesmas configurações para o servidor de desenvolvimento
    allowedHosts: [
      'cbc-frontend.limei.app',
      'localhost',
      'teste-movies-testeteste-fllkkj-ef64e3-82-29-57-246.traefik.me',
      '.limei.app',
      'all',
    ],
  },
})
