import { defineConfig } from "vitest/config";

export default defineConfig({
  // Configure Vitest (https://vitest.dev/config/)
  test: {
    setupFiles: ["./tests/mocks/setup.ts"],
  },
});
