import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["node_modules/**"],
    env: {
      // Dummy value so importing lib/db/client.ts doesn't throw when a test
      // only needs pure helpers from a module that re-exports DB queries too.
      // Never actually connected to — no test in this suite hits the network.
      DATABASE_URL: "postgresql://test:test@localhost:5432/test",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
