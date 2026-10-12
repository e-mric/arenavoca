import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60000,
  workers: 1,
  expect: { timeout: 15000 },
  use: {
    baseURL: "http://127.0.0.1:4173",
    viewport: { width: 1440, height: 1000 },
    headless: true,
    launchOptions: { args: ["--autoplay-policy=no-user-gesture-required"] },
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run preview",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: true,
  },
  reporter: [["list"], ["html", { open: "never" }]],
});
