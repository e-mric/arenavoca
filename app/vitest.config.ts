import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/features/**/*.ts"],
      exclude: ["src/features/session/desktop.ts", "src/features/xr/scene.ts"],
      reporter: ["text", "html"],
    },
  },
});
