import { defineConfig } from "vitest/config";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@shared": fileURLToPath(new URL("../shared", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    globals: true,
    // Deliberately west of UTC: date handling that leaks the server's local
    // timezone shifts month and day boundaries, which a UTC runner hides.
    env: { TZ: "America/New_York" },
    include: ["src/**/*.test.ts"],
    setupFiles: ["src/test/setup.ts"],
    // Each suite owns the shared in-memory database, so they cannot overlap.
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 60000,
  },
});
