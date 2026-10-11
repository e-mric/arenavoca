import { defineConfig } from "vite";
// Production preview on loopback. USB port reversal preserves a secure localhost origin on Quest.
export default defineConfig({
  preview: { host: "127.0.0.1", port: 4173, strictPort: true },
  build: { outDir: "dist" },
});
