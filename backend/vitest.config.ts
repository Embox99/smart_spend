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
    include: ["src/**/*.test.ts"],
    setupFiles: ["src/test/setup.ts"],
    // Each suite owns the shared in-memory database, so they cannot overlap.
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 60000,
  },
});
