import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./src/selection",
  testMatch: /selection\.e2e\.ts$/,
  use: {
    headless: true,
  },
});
