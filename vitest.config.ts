import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    exclude: ["dist/**", "node_modules/**"],
    env: {
      INTERVALS_API_KEY: "test_dummy_key",
    },
  },
});
