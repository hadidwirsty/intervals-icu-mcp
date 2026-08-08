// src/utils/dsl.test.ts
import { describe, expect, it } from "vitest";
import { validateWorkoutDsl } from "./dsl.js";

describe("validateWorkoutDsl", () => {
  it("validates valid workout DSL string", () => {
    const dsl = `Warmup\n- 12m 70-80% power, 70-80% pace\n\nMain Set 3x\n- 5m 87-90% power, 87-90% pace\n- 2m 50-65% power, 50-65% pace\n\nCooldown\n- 12m 70-80% power, 70-80% pace`;
    const result = validateWorkoutDsl(dsl);
    expect(result).toContain("- 12m 70-80% power");
  });

  it("throws error if no hyphen interval lines present", () => {
    expect(() => validateWorkoutDsl("Just plain text without steps")).toThrow(Error);
  });

  it("throws error for empty string", () => {
    expect(() => validateWorkoutDsl("  ")).toThrow(Error);
  });
});
