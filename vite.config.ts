import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: './',
  plugins: [
    // plugin de inspeção só no modo de desenvolvimento
    command === 'serve' && inspectAttr(),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/icon-512.png"],
      manifest: {
        name: "FORJA — Seu treino, sua evolução",
        short_name: "FORJA",
        description:
          "Treinos inteligentes de segunda a sexta, nutrição com ciência, coach motivacional e evolução em fotos.",
        lang: "pt-BR",
        theme_color: "#0a0b0d",
        background_color: "#0a0b0d",
        display: "standalone",
        orientation: "portrait",
        icons: [
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // HTML e navegação: sempre rede primeiro (novas versões entram imediatamente)
        navigateFallback: null,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkOnly",
          },
          {
            urlPattern: /\/assets\/.*\.(js|css|png|jpg|woff2?)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "forja-assets",
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 3000,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three"],
          charts: ["recharts"],
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}))
