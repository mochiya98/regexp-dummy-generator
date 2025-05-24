import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    alias: {
      "@": path.resolve("./src/"),
    },
    isolate: false,
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    coverage: {
      include: ["src/**/*"],
      provider: "v8",
      reporter: ["text", "html"],
      reportOnFailure: true,
    },
  },
});
