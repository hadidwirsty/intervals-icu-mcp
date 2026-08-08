// src/tools/athlete.test.ts
import { describe, expect, it } from "vitest";
import { athleteProfileSchema } from "./athlete.js";

describe("athleteProfileSchema", () => {
  it("should parse a valid athlete profile", () => {
    const raw = {
      id: "i12345",
      name: "Test Runner",
      email: "test@example.com",
      ftp: 280,
      lthr: 172,
      thresholdPace: "4:30",
      sportSettings: [],
    };
    expect(() => athleteProfileSchema.parse(raw)).not.toThrow();
  });

  it("should accept profile without optional fields", () => {
    const raw = { id: "i12345", name: "Test Runner" };
    expect(() => athleteProfileSchema.parse(raw)).not.toThrow();
  });
});
