// src/tools/calculator.test.ts
import { describe, expect, it } from "vitest";
import { parseRaceTime } from "./calculator.js";

describe("parseRaceTime", () => {
  it("parses MM:SS format", () => {
    expect(parseRaceTime("45:00")).toBe(2700);
  });

  it("parses HH:MM:SS format", () => {
    expect(parseRaceTime("1:30:00")).toBe(5400);
  });

  it("parses 20:30", () => {
    expect(parseRaceTime("20:30")).toBe(1230);
  });

  it("throws on invalid format", () => {
    expect(() => parseRaceTime("invalid")).toThrow();
  });

  it("throws on empty string", () => {
    expect(() => parseRaceTime("")).toThrow();
  });
});
