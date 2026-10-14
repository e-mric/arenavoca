import { defineConfig } from "vite";
// Production preview on loopback. USB port reversal preserves a secure localhost origin on Quest.
export default defineConfig({
  preview: {
    host: "127.0.0.1",
    port: 4173,
    strictPort: true,
    proxy: {
      "/api/recognition": {
        target: "http://127.0.0.1:8788",
        changeOrigin: false,
        timeout: 180000,
      },
    },
  },
  build: { outDir: "dist" },
});
